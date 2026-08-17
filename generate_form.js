const fs = require("fs");
const { FIELD_MAP, COMPONENTS } = require("./schema");

function esc(s) { return String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;"); }

// Render one field control by tag
function control(tag) {
  const f = FIELD_MAP[tag];
  if (!f) throw new Error("unknown field " + tag);
  const ph = "Type here / Escriba aquí";
  if (f.multi) {
    return `<textarea name="${tag}" rows="3" placeholder="${ph}" aria-label="${esc(f.en)} / ${esc(f.es)}"></textarea>`;
  }
  return `<input type="text" name="${tag}" placeholder="${ph}" aria-label="${esc(f.en)} / ${esc(f.es)}">`;
}

// Labeled field (info block / signature)
function field(tag) {
  const f = FIELD_MAP[tag];
  return `<div class="field">
      <label for="${tag}"><span class="en">${esc(f.en)}</span> <span class="es">${esc(f.es)}</span></label>
      ${control(tag)}
    </div>`;
}

function phaseBar(en, es) {
  return `<div class="phase-bar"><span class="en">${esc(en)}</span> <span class="sep">|</span> <span class="es">${esc(es)}</span></div>`;
}
function sectionBar(num, en, es) {
  return `<div class="section-bar"><span class="num">${num}.</span> <span class="en">${esc(en)}</span> <span class="sep">|</span> <span class="es">${esc(es)}</span></div>`;
}
function guide(en, es) {
  return `<p class="guide"><span class="en">${esc(en)}</span><br><span class="es">${esc(es)}</span></p>`;
}
function box(tag) { return `<div class="box">${control(tag)}</div>`; }

// grid: headers [[en,es],...], rows of tag arrays
function grid(headers, rows) {
  const th = headers.map(h => `<th><span class="en">${esc(h[0])}</span><br><span class="es">${esc(h[1])}</span></th>`).join("");
  const trs = rows.map(r => `<tr>${r.map(tag => `<td>${control(tag)}</td>`).join("")}</tr>`).join("\n");
  return `<table class="grid"><thead><tr>${th}</tr></thead><tbody>${trs}</tbody></table>`;
}

function checks() {
  return `<div class="checks">` + COMPONENTS.map(c =>
    `<label class="check"><input type="checkbox" name="${c.tag}" value="1"> <span class="en">${esc(c.en)}</span> <span class="sep">/</span> <span class="es">${esc(c.es)}</span></label>`
  ).join("") + `</div>`;
}

const body = `
<form id="planForm" novalidate>

  <div class="info">
    ${field("name")}
    <div class="row2">
      ${field("campus")}
      ${field("date")}
    </div>
  </div>

  ${phaseBar("Phase 1: Vision and Priorities", "Fase 1: Visión y prioridades")}

  ${sectionBar(1, "My Vision", "Mi visión")}
  ${guide("What do I want my classroom to look, sound, and feel like for my students this year?", "¿Cómo quiero que se vea, se escuche y se sienta mi salón este año para mis estudiantes?")}
  ${box("vision")}

  ${sectionBar(2, "My Priority Practices (Non-Negotiables)", "Mis prácticas prioritarias (no negociables)")}
  ${guide("Check the components you are prioritizing, then name the two or three practices you will commit to in your classroom this year.", "Marque los componentes que priorizará y luego nombre las dos o tres prácticas con las que se compromete en su salón este año.")}
  ${checks()}
  ${grid(
    [["Priority practice I commit to", "Práctica prioritaria con la que me comprometo"], ["What it looks like in my classroom", "Cómo se ve en mi salón"]],
    [["prac1", "look1"], ["prac2", "look2"], ["prac3", "look3"]]
  )}

  ${phaseBar("Phase 2: First Six Weeks Rollout", "Fase 2: Plan para las primeras seis semanas")}

  ${sectionBar(3, "My First Six Weeks Rollout", "Mi plan para las primeras seis semanas")}
  ${guide("For each priority practice, name the ritual, routine, or procedure you will teach, how you will teach it using interactive modeling, and who leads.", "Para cada práctica prioritaria, nombre el ritual, la rutina o el procedimiento que enseñará, cómo lo enseñará con modelado interactivo y quién lo dirige.")}
  ${grid(
    [["When", "Cuándo"], ["Ritual, routine, or procedure", "Ritual, rutina o procedimiento"], ["How I will teach it (interactive modeling)", "Cómo lo enseñaré (modelado interactivo)"], ["Who leads", "Quién dirige"]],
    [
      ["r1_when", "r1_routine", "r1_how", "r1_lead"],
      ["r2_when", "r2_routine", "r2_how", "r2_lead"],
      ["r3_when", "r3_routine", "r3_how", "r3_lead"],
      ["r4_when", "r4_routine", "r4_how", "r4_lead"],
      ["r5_when", "r5_routine", "r5_how", "r5_lead"],
    ]
  )}

  ${phaseBar("Phase 3: Supports and Evidence", "Fase 3: Apoyos y evidencia")}

  ${sectionBar(4, "Supports and Resources I Need", "Apoyos y recursos que necesito")}
  ${guide("What do you need to make this plan work? Consider time, materials, coaching, family communication, and follow-up.", "¿Qué necesita para que este plan funcione? Considere el tiempo, los materiales, el acompañamiento, la comunicación con las familias y el seguimiento.")}
  ${box("supports")}

  ${sectionBar(5, "How I Will Know It Is Working", "Cómo sabré que está funcionando")}
  ${guide("Name what you will look for, how you will gather it, and when you will check in.", "Nombre qué observará, cómo lo recogerá y cuándo lo revisará.")}
  ${grid(
    [["What I will look for", "Qué observaré"], ["How I will gather it", "Cómo lo recogeré"], ["When I will check in", "Cuándo lo revisaré"]],
    [
      ["e1_look", "e1_gather", "e1_when"],
      ["e2_look", "e2_gather", "e2_when"],
      ["e3_look", "e3_gather", "e3_when"],
    ]
  )}

  ${phaseBar("Phase 4: Commitments and First Steps", "Fase 4: Compromisos y primeros pasos")}

  ${sectionBar(6, "My Commitments", "Mis compromisos")}
  ${guide("Name two or three first moves you will make in your own classroom, then your overall commitment for the year.", "Nombre dos o tres primeros pasos que dará en su propio salón y luego su compromiso general para el año.")}
  ${grid([["My first moves this year", "Mis primeros pasos este año"]], [["move1"], ["move2"], ["move3"]])}
  <p class="sublabel"><span class="en">My overall commitment:</span> <span class="es">Mi compromiso general:</span></p>
  ${box("overall")}

  ${sectionBar(7, "My First Two Weeks (Immediate Next Steps)", "Mis primeras dos semanas (próximos pasos inmediatos)")}
  ${guide("List the concrete steps you will take right away. Give every action an owner and a date.", "Enumere los pasos concretos que tomará de inmediato. Asigne a cada acción un responsable y una fecha.")}
  ${grid(
    [["Action step", "Paso a seguir"], ["Owner", "Responsable"], ["By when", "Para cuándo"]],
    [
      ["w1_action", "w1_owner", "w1_when"],
      ["w2_action", "w2_owner", "w2_when"],
      ["w3_action", "w3_owner", "w3_when"],
      ["w4_action", "w4_owner", "w4_when"],
    ]
  )}

  <div class="commit-line"><span class="en">I commit to this plan.</span> <span class="es">Me comprometo con este plan.</span></div>
  <div class="info sign">
    <div class="row2">
      ${field("sig_name")}
      ${field("sig_date")}
    </div>
  </div>

  <div class="actions">
    <button type="button" id="saveBtn" class="btn ghost">Save draft / Guardar borrador</button>
    <button type="submit" id="submitBtn" class="btn">Submit plan / Enviar plan</button>
  </div>
  <p id="statusMsg" class="status" role="status" aria-live="polite"></p>
</form>`;

const html = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>Responsive Classroom Individual Action Plan</title>
<link rel="stylesheet" href="styles.css">
</head>
<body>
<div class="wrap">
  <header class="doc-head">
    <h1><span class="brand">Responsive Classroom</span> Individual Action Plan</h1>
    <p class="subtitle es">Plan de acción individual&nbsp;&nbsp;|&nbsp;&nbsp;Responsive Classroom</p>
    <p class="series">Name It, See It, Do It Series&nbsp;&nbsp;|&nbsp;&nbsp;Mundo Verde Bilingual Public Charter School</p>
    <p class="intro">Complete every section to build your own plan for the first weeks of school. Be specific: name the practice, the timeline, and how you will know it is working.</p>
    <p class="intro es">Complete cada sección para crear su propio plan para las primeras semanas de clases. Sea específico: nombre la práctica, el cronograma y cómo sabrá que está funcionando.</p>
    <p class="note"><span class="en">You may complete this plan in English or Spanish.</span> <span class="es">Puede completar este plan en inglés o español.</span></p>
  </header>

  ${body}

  <footer class="doc-foot">Responsive Classroom: Name It, See It, Do It&nbsp;&nbsp;|&nbsp;&nbsp;Mundo Verde Bilingual Public Charter School</footer>
</div>

<!-- Success overlay -->
<div id="doneOverlay" class="overlay" hidden>
  <div class="overlay-card">
    <div class="check-mark">&#10003;</div>
    <h2>Your plan has been submitted.</h2>
    <p class="es">Su plan ha sido enviado.</p>
    <p id="doneRef" class="ref"></p>
    <button type="button" class="btn" onclick="location.reload()">Submit another / Enviar otro</button>
  </div>
</div>

<script src="form.js"></script>
</body>
</html>`;

fs.writeFileSync(__dirname + "/public/index.html", html);
console.log("index.html generated (" + html.length + " bytes)");
