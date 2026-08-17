(function () {
  var form = document.getElementById("planForm");
  var statusMsg = document.getElementById("statusMsg");
  var saveBtn = document.getElementById("saveBtn");
  var DRAFT_KEY = "rcap_draft_v1";

  function collect() {
    var data = {};
    form.querySelectorAll("input[type=text], textarea").forEach(function (el) {
      data[el.name] = el.value;
    });
    form.querySelectorAll("input[type=checkbox]").forEach(function (el) {
      data[el.name] = el.checked ? "1" : "";
    });
    return data;
  }

  function apply(data) {
    if (!data) return;
    Object.keys(data).forEach(function (k) {
      var el = form.elements[k];
      if (!el) return;
      if (el.type === "checkbox") el.checked = data[k] === "1" || data[k] === true;
      else el.value = data[k];
    });
  }

  // Restore draft
  try {
    var saved = localStorage.getItem(DRAFT_KEY);
    if (saved) apply(JSON.parse(saved));
  } catch (e) {}

  // Autosave (debounced)
  var t;
  function autosave() {
    clearTimeout(t);
    t = setTimeout(function () {
      try {
        localStorage.setItem(DRAFT_KEY, JSON.stringify(collect()));
        setStatus("Draft saved on this device. / Borrador guardado en este dispositivo.", "saved");
      } catch (e) {}
    }, 700);
  }
  form.addEventListener("input", autosave);

  saveBtn.addEventListener("click", function () {
    try {
      localStorage.setItem(DRAFT_KEY, JSON.stringify(collect()));
      setStatus("Draft saved. / Borrador guardado.", "saved");
    } catch (e) {
      setStatus("Could not save draft. / No se pudo guardar el borrador.", "err");
    }
  });

  function setStatus(msg, cls) {
    statusMsg.textContent = msg;
    statusMsg.className = "status " + (cls || "");
  }

  form.addEventListener("submit", function (e) {
    e.preventDefault();
    var data = collect();
    if (!data.name || !data.name.trim()) {
      setStatus("Please enter your name before submitting. / Escriba su nombre antes de enviar.", "err");
      form.elements["name"].focus();
      return;
    }
    var btn = document.getElementById("submitBtn");
    btn.disabled = true;
    setStatus("Submitting... / Enviando...", "");

    fetch("api/submit", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    })
      .then(function (r) { return r.json().then(function (j) { return { ok: r.ok, j: j }; }); })
      .then(function (res) {
        if (!res.ok || !res.j.ok) throw new Error(res.j && res.j.error ? res.j.error : "Submit failed");
        try { localStorage.removeItem(DRAFT_KEY); } catch (e) {}
        var ref = document.getElementById("doneRef");
        ref.textContent = "Reference / Referencia: " + res.j.id;
        document.getElementById("doneOverlay").hidden = false;
      })
      .catch(function (err) {
        btn.disabled = false;
        setStatus("Something went wrong. Please try again. / Algo salió mal. Intente de nuevo. (" + err.message + ")", "err");
      });
  });
})();
