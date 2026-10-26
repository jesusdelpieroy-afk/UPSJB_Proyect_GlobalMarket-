// Configuración de PurgeCSS: lee tus HTML y JS y deja solo las clases que usas.
// Las clases que Bootstrap agrega con JavaScript (modal, offcanvas, etc.) van en "safelist".
module.exports = {
  content: ["index.html", "admin.html", "js/data.js", "js/store.js", "js/admin.js"],
  css: ["css/custom.css"],
  output: "css/reducido.css",
  safelist: {
    standard: ["show", "fade", "collapsing", "modal-open", "offcanvas-backdrop"],
    greedy: [/^modal/, /^offcanvas/, /^dropdown/, /^fade/, /^show/, /^collapse/, /^btn-close/, /^is-/, /^was-/, /^bi-/, /^bi$/]
  }
};
