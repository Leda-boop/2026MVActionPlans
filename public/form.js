(function () {
  var form = document.getElementById("planForm");
  var statusMsg = document.getElementById("statusMsg");

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
