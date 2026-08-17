/*
 * Responsive Classroom Individual Action Plan
 * Zero-dependency Node server (Node 18+). No `npm install` required.
 *
 *   node server.js
 *
 * Environment variables (all optional):
 *   PORT          default 3000
 *   ADMIN_TOKEN   password for the Response Collection dashboard (default "changeme")
 *   DATA_DIR      where submissions are stored (default ./data/submissions)
 */
const http = require("http");
const fs = require("fs");
const path = require("path");
const crypto = require("crypto");
const { FIELDS, COMPONENTS, CSV_COLUMNS } = require("./schema");

const PORT = process.env.PORT || 3000;
const ADMIN_TOKEN = process.env.ADMIN_TOKEN || "changeme";
const DATA_DIR = process.env.DATA_DIR || path.join(__dirname, "data", "submissions");
const PUBLIC_DIR = path.join(__dirname, "public");

fs.mkdirSync(DATA_DIR, { recursive: true });

const ALLOWED = new Set([...FIELDS.map(f => f.tag), ...COMPONENTS.map(c => c.tag)]);
const MIME = { ".html": "text/html; charset=utf-8", ".css": "text/css; charset=utf-8", ".js": "application/javascript; charset=utf-8", ".json": "application/json; charset=utf-8", ".ico": "image/x-icon" };

function send(res, code, body, headers) {
  res.writeHead(code, Object.assign({ "Cache-Control": "no-store" }, headers || {}));
  res.end(body);
}
function json(res, code, obj) { send(res, code, JSON.stringify(obj), { "Content-Type": "application/json; charset=utf-8" }); }

function authed(req) {
  const t = req.headers["x-admin-token"];
  return typeof t === "string" && t.length > 0 &&
    crypto.timingSafeEqual(Buffer.from(hash(t)), Buffer.from(hash(ADMIN_TOKEN)));
}
function hash(s) { return crypto.createHash("sha256").update(String(s)).digest("hex"); }

function serveStatic(req, res, urlPath) {
  let rel = urlPath === "/" ? "/index.html" : urlPath;
  if (rel === "/admin" || rel === "/admin/") rel = "/admin.html";
  const filePath = path.normalize(path.join(PUBLIC_DIR, rel));
  if (!filePath.startsWith(PUBLIC_DIR)) return send(res, 403, "Forbidden");
  fs.readFile(filePath, (err, data) => {
    if (err) return send(res, 404, "Not found");
    send(res, 200, data, { "Content-Type": MIME[path.extname(filePath)] || "application/octet-stream" });
  });
}

function readBody(req) {
  return new Promise((resolve, reject) => {
    let size = 0; const chunks = [];
    req.on("data", c => { size += c.length; if (size > 1e6) { reject(new Error("payload too large")); req.destroy(); } chunks.push(c); });
    req.on("end", () => resolve(Buffer.concat(chunks).toString("utf8")));
    req.on("error", reject);
  });
}

function sanitize(raw) {
  const out = {};
  for (const key of Object.keys(raw || {})) {
    if (!ALLOWED.has(key)) continue;
    let v = raw[key];
    if (typeof v !== "string") v = v == null ? "" : String(v);
    out[key] = v.slice(0, 5000); // per-field cap
  }
  return out;
}

function listSubmissions() {
  const files = fs.readdirSync(DATA_DIR).filter(f => f.endsWith(".json"));
  const rows = files.map(f => {
    try {
      const s = JSON.parse(fs.readFileSync(path.join(DATA_DIR, f), "utf8"));
      return { id: s.id, submitted_at: s.submitted_at, name: s.data.name || "", campus: s.data.campus || "", date: s.data.date || "" };
    } catch (e) { return null; }
  }).filter(Boolean);
  rows.sort((a, b) => (a.submitted_at < b.submitted_at ? 1 : -1)); // newest first
  return rows;
}

function csvCell(v) {
  v = v == null ? "" : String(v);
  if (/[",\n\r]/.test(v)) return '"' + v.replace(/"/g, '""') + '"';
  return v;
}
function buildCsv() {
  const files = fs.readdirSync(DATA_DIR).filter(f => f.endsWith(".json"));
  const subs = files.map(f => { try { return JSON.parse(fs.readFileSync(path.join(DATA_DIR, f), "utf8")); } catch (e) { return null; } }).filter(Boolean);
  subs.sort((a, b) => (a.submitted_at < b.submitted_at ? 1 : -1));
  const headerEn = CSV_COLUMNS.map(c => csvCell(c.en)).join(",");
  const headerEs = CSV_COLUMNS.map(c => csvCell(c.es)).join(",");
  const lines = subs.map(s => CSV_COLUMNS.map(c => {
    if (c.tag === "submitted_at") return csvCell(s.submitted_at);
    return csvCell(s.data[c.tag]);
  }).join(","));
  return "\uFEFF" + [headerEn, headerEs].concat(lines).join("\r\n"); // BOM for Excel
}

const server = http.createServer(async (req, res) => {
  const u = new URL(req.url, "http://localhost");
  const p = u.pathname;

  // ---- Submit (public) ----
  if (req.method === "POST" && p === "/api/submit") {
    try {
      const body = await readBody(req);
      const data = sanitize(JSON.parse(body || "{}"));
      if (!data.name || !data.name.trim()) return json(res, 400, { ok: false, error: "Name is required" });
      const id = new Date().toISOString().replace(/[:.]/g, "-") + "-" + crypto.randomBytes(3).toString("hex");
      const record = { id, submitted_at: new Date().toISOString(), data };
      fs.writeFileSync(path.join(DATA_DIR, id + ".json"), JSON.stringify(record, null, 2));
      return json(res, 200, { ok: true, id });
    } catch (e) {
      return json(res, 400, { ok: false, error: "Invalid submission" });
    }
  }

  // ---- Admin API (protected) ----
  if (p.startsWith("/api/submissions") || p === "/api/export.csv") {
    if (!authed(req)) return json(res, 401, { ok: false, error: "Unauthorized" });

    if (req.method === "GET" && p === "/api/submissions") {
      return json(res, 200, { ok: true, submissions: listSubmissions() });
    }
    const m = p.match(/^\/api\/submissions\/([\w:\-]+)$/);
    if (req.method === "GET" && m) {
      const file = path.join(DATA_DIR, m[1] + ".json");
      if (!file.startsWith(DATA_DIR) || !fs.existsSync(file)) return json(res, 404, { ok: false, error: "Not found" });
      return json(res, 200, { ok: true, submission: JSON.parse(fs.readFileSync(file, "utf8")) });
    }
    if (req.method === "GET" && p === "/api/export.csv") {
      return send(res, 200, buildCsv(), { "Content-Type": "text/csv; charset=utf-8", "Content-Disposition": 'attachment; filename="action-plan-responses.csv"' });
    }
    return json(res, 404, { ok: false, error: "Not found" });
  }

  // ---- Static (form + dashboard) ----
  if (req.method === "GET") return serveStatic(req, res, p);
  return send(res, 405, "Method not allowed");
});

server.listen(PORT, () => {
  console.log("Responsive Classroom Action Plan running on http://localhost:" + PORT);
  console.log("  Form:      http://localhost:" + PORT + "/");
  console.log("  Dashboard: http://localhost:" + PORT + "/admin   (token: " + (process.env.ADMIN_TOKEN ? "set via ADMIN_TOKEN" : '"changeme" - change this!') + ")");
  console.log("  Storing submissions in: " + DATA_DIR);
});
