// Shared schema for the Responsive Classroom Individual Action Plan.
// Used by the server (validation + CSV export) and the form generator.

// Text fields: tag, English label, Spanish label, multiline?
const FIELDS = [
  { tag: "name", en: "Name", es: "Nombre", multi: false },
  { tag: "campus", en: "Campus", es: "Sede", multi: false },
  { tag: "date", en: "Date", es: "Fecha", multi: false },
  { tag: "vision", en: "My vision", es: "Mi visión", multi: true },
  { tag: "prac1", en: "Priority practice 1", es: "Práctica prioritaria 1", multi: false },
  { tag: "look1", en: "What it looks like 1", es: "Cómo se ve 1", multi: true },
  { tag: "prac2", en: "Priority practice 2", es: "Práctica prioritaria 2", multi: false },
  { tag: "look2", en: "What it looks like 2", es: "Cómo se ve 2", multi: true },
  { tag: "prac3", en: "Priority practice 3", es: "Práctica prioritaria 3", multi: false },
  { tag: "look3", en: "What it looks like 3", es: "Cómo se ve 3", multi: true },
  { tag: "r1_when", en: "Rollout 1 When", es: "Cuándo 1", multi: false },
  { tag: "r1_routine", en: "Rollout 1 Routine", es: "Rutina 1", multi: true },
  { tag: "r1_how", en: "Rollout 1 How", es: "Cómo 1", multi: true },
  { tag: "r1_lead", en: "Rollout 1 Who leads", es: "Quién dirige 1", multi: false },
  { tag: "r2_when", en: "Rollout 2 When", es: "Cuándo 2", multi: false },
  { tag: "r2_routine", en: "Rollout 2 Routine", es: "Rutina 2", multi: true },
  { tag: "r2_how", en: "Rollout 2 How", es: "Cómo 2", multi: true },
  { tag: "r2_lead", en: "Rollout 2 Who leads", es: "Quién dirige 2", multi: false },
  { tag: "r3_when", en: "Rollout 3 When", es: "Cuándo 3", multi: false },
  { tag: "r3_routine", en: "Rollout 3 Routine", es: "Rutina 3", multi: true },
  { tag: "r3_how", en: "Rollout 3 How", es: "Cómo 3", multi: true },
  { tag: "r3_lead", en: "Rollout 3 Who leads", es: "Quién dirige 3", multi: false },
  { tag: "r4_when", en: "Rollout 4 When", es: "Cuándo 4", multi: false },
  { tag: "r4_routine", en: "Rollout 4 Routine", es: "Rutina 4", multi: true },
  { tag: "r4_how", en: "Rollout 4 How", es: "Cómo 4", multi: true },
  { tag: "r4_lead", en: "Rollout 4 Who leads", es: "Quién dirige 4", multi: false },
  { tag: "r5_when", en: "Rollout 5 When", es: "Cuándo 5", multi: false },
  { tag: "r5_routine", en: "Rollout 5 Routine", es: "Rutina 5", multi: true },
  { tag: "r5_how", en: "Rollout 5 How", es: "Cómo 5", multi: true },
  { tag: "r5_lead", en: "Rollout 5 Who leads", es: "Quién dirige 5", multi: false },
  { tag: "supports", en: "Supports and resources", es: "Apoyos y recursos", multi: true },
  { tag: "e1_look", en: "Evidence 1 Look for", es: "Observaré 1", multi: true },
  { tag: "e1_gather", en: "Evidence 1 Gather", es: "Recogeré 1", multi: true },
  { tag: "e1_when", en: "Evidence 1 Check-in", es: "Revisaré 1", multi: false },
  { tag: "e2_look", en: "Evidence 2 Look for", es: "Observaré 2", multi: true },
  { tag: "e2_gather", en: "Evidence 2 Gather", es: "Recogeré 2", multi: true },
  { tag: "e2_when", en: "Evidence 2 Check-in", es: "Revisaré 2", multi: false },
  { tag: "e3_look", en: "Evidence 3 Look for", es: "Observaré 3", multi: true },
  { tag: "e3_gather", en: "Evidence 3 Gather", es: "Recogeré 3", multi: true },
  { tag: "e3_when", en: "Evidence 3 Check-in", es: "Revisaré 3", multi: false },
  { tag: "move1", en: "First move 1", es: "Primer paso 1", multi: true },
  { tag: "move2", en: "First move 2", es: "Primer paso 2", multi: true },
  { tag: "move3", en: "First move 3", es: "Primer paso 3", multi: true },
  { tag: "overall", en: "Overall commitment", es: "Compromiso general", multi: true },
  { tag: "w1_action", en: "Week-1 Action 1", es: "Acción 1", multi: true },
  { tag: "w1_owner", en: "Action 1 Owner", es: "Responsable 1", multi: false },
  { tag: "w1_when", en: "Action 1 By when", es: "Para cuándo 1", multi: false },
  { tag: "w2_action", en: "Week-1 Action 2", es: "Acción 2", multi: true },
  { tag: "w2_owner", en: "Action 2 Owner", es: "Responsable 2", multi: false },
  { tag: "w2_when", en: "Action 2 By when", es: "Para cuándo 2", multi: false },
  { tag: "w3_action", en: "Week-2 Action 3", es: "Acción 3", multi: true },
  { tag: "w3_owner", en: "Action 3 Owner", es: "Responsable 3", multi: false },
  { tag: "w3_when", en: "Action 3 By when", es: "Para cuándo 3", multi: false },
  { tag: "w4_action", en: "Week-2 Action 4", es: "Acción 4", multi: true },
  { tag: "w4_owner", en: "Action 4 Owner", es: "Responsable 4", multi: false },
  { tag: "w4_when", en: "Action 4 By when", es: "Para cuándo 4", multi: false },
  { tag: "sig_name", en: "Signature name", es: "Nombre (firma)", multi: false },
  { tag: "sig_date", en: "Signature date", es: "Fecha (firma)", multi: false },
];

// Component checkboxes (boolean) captured in Section 2.
const COMPONENTS = [
  { tag: "comp_expectations", en: "Clear expectations and the 3 R's", es: "Expectativas claras y las 3 R" },
  { tag: "comp_language", en: "Positive teacher language", es: "Lenguaje positivo del maestro" },
  { tag: "comp_choice", en: "Student choice", es: "Opciones para los estudiantes" },
  { tag: "comp_modeling", en: "Interactive modeling", es: "Modelado interactivo" },
];

const FIELD_MAP = Object.fromEntries(FIELDS.map(f => [f.tag, f]));

// Ordered list of every column for the CSV export.
const CSV_COLUMNS = [
  { tag: "submitted_at", en: "Submitted at", es: "Enviado el" },
  ...FIELDS.slice(0, 3), // name, campus, date first
  ...COMPONENTS,
  ...FIELDS.slice(3),
];

module.exports = { FIELDS, COMPONENTS, FIELD_MAP, CSV_COLUMNS };
