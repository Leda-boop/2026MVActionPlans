(function () {
  // Field labels for the detail view (kept in sync with schema.js)
  var LABELS = {
    name: ["Name", "Nombre"], campus: ["Campus", "Sede"], date: ["Date", "Fecha"],
    vision: ["My vision", "Mi visión"],
    prac1: ["Priority practice 1", "Práctica 1"], look1: ["Looks like 1", "Cómo se ve 1"],
    prac2: ["Priority practice 2", "Práctica 2"], look2: ["Looks like 2", "Cómo se ve 2"],
    prac3: ["Priority practice 3", "Práctica 3"], look3: ["Looks like 3", "Cómo se ve 3"],
    supports: ["Supports and resources", "Apoyos y recursos"],
    overall: ["Overall commitment", "Compromiso general"],
    move1: ["First move 1", "Primer paso 1"], move2: ["First move 2", "Primer paso 2"], move3: ["First move 3", "Primer paso 3"],
    sig_name: ["Signature name", "Nombre (firma)"], sig_date: ["Signature date", "Fecha (firma)"]
  };
  var COMPONENTS = [
    ["comp_expectations", "Clear expectations and the 3 R's", "Expectativas claras y las 3 R"],
    ["comp_language", "Positive teacher language", "Lenguaje positivo del maestro"],
    ["comp_choice", "Student choice", "Opciones para los estudiantes"],
    ["comp_modeling", "Interactive modeling", "Modelado interactivo"]
  ];
  var ROLLOUT = [1, 2, 3, 4, 5];
  var EVIDENCE = [1, 2, 3];
  var WEEKS = [1, 2, 3, 4];

  var TOKEN_KEY = "rcap_admin_token";
  var token = "";
  var all = [];

  var $ = function (id) { return document.getElementById(id); };
  function esc(s) { return String(s == null ? "" : s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;"); }

  function api(pathname) {
    return fetch(pathname, { headers: { "x-admin-token": token } });
  }

  function showDash() { $("gate").hidden = true; $("dash").hidden = false; }
  function showGate() { $("dash").hidden = true; $("gate").hidden = false; }

  function enter() {
    var t = $("tokenInput").value.trim();
    if (!t) return;
    token = t;
    api("api/submissions").then(function (r) {
      if (r.status === 401) { $("gateErr").textContent = "Incorrect token. / Token incorrecto."; return; }
      return r.json().then(function (j) {
        localStorage.setItem(TOKEN_KEY, token);
        showDash();
        render(j.submissions || []);
      });
    }).catch(function () { $("gateErr").textContent = "Could not reach the server."; });
  }

  function load() {
    api("api/submissions").then(function (r) {
      if (r.status === 401) { showGate(); return; }
      return r.json().then(function (j) { render(j.submissions || []); });
    });
  }

  function fmt(iso) {
    if (!iso) return "";
    var d = new Date(iso);
    if (isNaN(d)) return iso;
    return d.toLocaleString();
  }

  function render(list) {
    all = list;
    applyFilter();
  }

  function applyFilter() {
    var q = $("filter").value.trim().toLowerCase();
    var list = all.filter(function (s) {
      return !q || (s.name || "").toLowerCase().indexOf(q) >= 0 || (s.campus || "").toLowerCase().indexOf(q) >= 0;
    });
    $("countPill").textContent = all.length;
    var tbody = $("rows"); tbody.innerHTML = "";
    $("emptyState").hidden = list.length !== 0;
    list.forEach(function (s, i) {
      var tr = document.createElement("tr");
      tr.innerHTML =
        "<td>" + (i + 1) + "</td>" +
        "<td>" + esc(s.name) + "</td>" +
        "<td>" + esc(s.campus) + "</td>" +
        "<td>" + esc(s.date) + "</td>" +
        "<td>" + esc(fmt(s.submitted_at)) + "</td>" +
        "<td><span class='badge'>Submitted / Enviado</span></td>" +
        "<td><button class='link-btn' data-id='" + esc(s.id) + "'>View / Ver</button></td>";
      tbody.appendChild(tr);
    });
    tbody.querySelectorAll("button[data-id]").forEach(function (b) {
      b.addEventListener("click", function () { openDetail(b.getAttribute("data-id")); });
    });
  }

  function kv(label, es, value) {
    if (!value) return "";
    return "<div class='kv'><div class='k'>" + esc(label) + " <span class='es'>" + esc(es) + "</span></div><div class='v'>" + esc(value) + "</div></div>";
  }

  function openDetail(id) {
    api("api/submissions/" + encodeURIComponent(id)).then(function (r) { return r.json(); }).then(function (j) {
      if (!j.ok) return;
      var d = j.submission.data;
      var html = "<h3>" + esc(d.name || "(no name)") + "</h3>";
      html += "<p class='series'>" + esc(d.campus || "") + (d.date ? " &middot; " + esc(d.date) : "") + " &middot; Submitted " + esc(fmt(j.submission.submitted_at)) + "</p>";

      html += kv("My vision", "Mi visión", d.vision);

      // Components
      var chosen = COMPONENTS.filter(function (c) { return d[c[0]] === "1"; });
      if (chosen.length) {
        html += "<div class='kv'><div class='k'>Priority components <span class='es'>Componentes prioritarios</span></div><div class='comps'>" +
          chosen.map(function (c) { return "<span class='badge'>" + esc(c[1]) + "</span>"; }).join("") + "</div></div>";
      }
      [1, 2, 3].forEach(function (n) {
        if (d["prac" + n] || d["look" + n]) html += kv("Practice " + n, "Práctica " + n, (d["prac" + n] || "") + (d["look" + n] ? "  —  " + d["look" + n] : ""));
      });

      ROLLOUT.forEach(function (n) {
        var parts = [d["r" + n + "_when"], d["r" + n + "_routine"], d["r" + n + "_how"], d["r" + n + "_lead"]].filter(Boolean);
        if (parts.length) html += kv("Rollout " + n, "Plan " + n, [d["r" + n + "_when"], d["r" + n + "_routine"], d["r" + n + "_how"], d["r" + n + "_lead"] ? "Leads: " + d["r" + n + "_lead"] : ""].filter(Boolean).join("  |  "));
      });

      html += kv("Supports and resources", "Apoyos y recursos", d.supports);

      EVIDENCE.forEach(function (n) {
        var parts = [d["e" + n + "_look"], d["e" + n + "_gather"], d["e" + n + "_when"]].filter(Boolean);
        if (parts.length) html += kv("Evidence " + n, "Evidencia " + n, parts.join("  |  "));
      });

      [1, 2, 3].forEach(function (n) { html += kv("First move " + n, "Primer paso " + n, d["move" + n]); });
      html += kv("Overall commitment", "Compromiso general", d.overall);

      WEEKS.forEach(function (n) {
        var parts = [d["w" + n + "_action"], d["w" + n + "_owner"], d["w" + n + "_when"]].filter(Boolean);
        if (parts.length) html += kv("Action " + n, "Acción " + n, parts.join("  |  "));
      });

      html += kv("Signed", "Firmado", [d.sig_name, d.sig_date].filter(Boolean).join(" — "));
      html += "<div style='margin-top:14px'><button class='btn ghost' id='closeDetail'>Close / Cerrar</button></div>";

      var det = $("detail");
      det.innerHTML = html; det.hidden = false;
      det.scrollIntoView({ behavior: "smooth", block: "start" });
      $("closeDetail").addEventListener("click", function () { det.hidden = true; });
    });
  }

  function exportCsv() {
    api("api/export.csv").then(function (r) { return r.blob(); }).then(function (blob) {
      var url = URL.createObjectURL(blob);
      var a = document.createElement("a");
      a.href = url; a.download = "action-plan-responses.csv";
      document.body.appendChild(a); a.click(); a.remove();
      URL.revokeObjectURL(url);
    });
  }

  // Wire up
  $("enterBtn").addEventListener("click", enter);
  $("tokenInput").addEventListener("keydown", function (e) { if (e.key === "Enter") enter(); });
  $("refreshBtn").addEventListener("click", load);
  $("filter").addEventListener("input", applyFilter);
  $("csvBtn").addEventListener("click", exportCsv);
  $("logoutBtn").addEventListener("click", function () { localStorage.removeItem(TOKEN_KEY); token = ""; showGate(); });

  // Auto-login if token remembered
  var saved = localStorage.getItem(TOKEN_KEY);
  if (saved) { token = saved; api("api/submissions").then(function (r) {
    if (r.ok) return r.json().then(function (j) { showDash(); render(j.submissions || []); });
    else showGate();
  }).catch(showGate); }
})();
