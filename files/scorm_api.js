var api = null;
function findAPI(win) {
  var tries = 0;
  while (!win.API && win.parent && win.parent !== win && tries < 10) { win = win.parent; tries++; }
  return win.API || null;
}
function getAPI() {
  if (api) return api;
  api = findAPI(window);
  if (!api && window.opener) api = findAPI(window.opener);
  return api;
}
function iniciarCurso() {
  var a = getAPI();
  if (!a) { console.warn("API SCORM no encontrada"); return false; }
  a.LMSInitialize("");
  var estado = a.LMSGetValue("cmi.core.lesson_status");
  if (!estado || estado === "not attempted") a.LMSSetValue("cmi.core.lesson_status", "incomplete");
  a.LMSCommit("");
  return true;
}
function enviarCalificacion(correctas, total) {
  var a = getAPI();
  var nota = Math.round((correctas / total) * 100);
  if (!a) return nota;
  a.LMSSetValue("cmi.core.score.min", "0");
  a.LMSSetValue("cmi.core.score.max", "100");
  a.LMSSetValue("cmi.core.score.raw", String(nota));
  a.LMSSetValue("cmi.core.lesson_status", nota >= 70 ? "passed" : "failed");
  a.LMSCommit("");
  return nota;
}
function finalizarCurso() {
  var a = getAPI();
  if (!a) return;
  a.LMSSetValue("cmi.core.exit", "");
  a.LMSCommit("");
  a.LMSFinish("");
}
window.addEventListener("load", iniciarCurso);
window.addEventListener("beforeunload", finalizarCurso);
