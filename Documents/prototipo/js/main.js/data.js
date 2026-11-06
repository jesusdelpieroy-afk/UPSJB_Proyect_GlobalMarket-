/* Global Market — datos compartidos entre la tienda y el panel del encargado.
   Se guardan en el navegador (localStorage). Para que todos los clientes vean
   lo mismo desde sus celulares, luego se conecta una base de datos en línea. */
const GM = (() => {
  const KEY = "gm_data_v1";
  const CART_KEY = "gm_cart_v1";

  const defaults = {
    config: {
      name: "Global Market",
      tagline: "Hogar, organizadores y accesorios",
      whatsapp: "51999999999", // código de país + número, sin + ni espacios
      currency: "S/",
      email: "admin@globalmarket.com",
      password: "123456",
      passwordSet: false, // pasa a true cuando el encargado crea su propia contraseña
      heroTitle: "Todo para tu hogar en un solo lugar",
      heroText: "Elige lo que necesitas del catálogo y haz tu pedido por WhatsApp. Confirmamos la disponibilidad y coordinamos el pago y la entrega contigo.",
      heroImage1: "", // vacío = foto original del local
      heroImage2: "",
      address: "",   // opcional: lo muestra el pie de página y el asistente
      hours: "",     // opcional: horario de atención
      faqs: [
        { q: "¿Cómo hago mi pedido?", a: "Agrega los productos al carrito y presiona «Enviar pedido por WhatsApp». Te confirmamos la disponibilidad y coordinamos contigo el pago y la entrega." },
        { q: "¿Qué medios de pago aceptan?", a: "El pago se coordina por WhatsApp una vez confirmado tu pedido. Escríbenos y te indicamos las opciones disponibles." },
        { q: "¿Hacen envíos?", a: "La entrega se coordina contigo por WhatsApp según tu zona." },
        { q: "¿Los productos tienen stock?", a: "El catálogo muestra el stock disponible de cada producto. Si algo aparece agotado, escríbenos y te avisamos cuando vuelva a haber." }
      ]
    },
    categories: ["Hogar", "Organizadores", "Accesorios de cabello", "Cocina"],
    products: [
      { id: "p1", name: "Canasta organizadora con tapa", price: 24.9, category: "Organizadores", desc: "Ideal para ordenar ropa, juguetes o utensilios.", image: "", stock: 12 },
      { id: "p2", name: "Cesto de ropa tejido", price: 39.9, category: "Hogar", desc: "Cesto ventilado, resistente y fácil de limpiar.", image: "", stock: 8 },
      { id: "p3", name: "Set de scrunchies de colores", price: 9.9, category: "Accesorios de cabello", desc: "Pack de colores variados, suaves con el cabello.", image: "", stock: 30 },
      { id: "p4", name: "Diadema de spa", price: 7.5, category: "Accesorios de cabello", desc: "Para el cuidado facial y el maquillaje.", image: "", stock: 4 }
    ],
    promos: [
      { id: "pr1", title: "Oferta de bienvenida", desc: "10% de descuento en todos los productos de la tienda.", percent: 10, all: true, productIds: [], until: "", image: "", active: true }
    ]
  };

  function clone(o) { return JSON.parse(JSON.stringify(o)); }

  function normalize(d) {
    d.config = Object.assign({}, defaults.config, d.config || {});
    delete d.config.pin;
    d.categories = Array.isArray(d.categories) ? d.categories : [];
    d.promos = Array.isArray(d.promos) ? d.promos : [];
    d.products = (d.products || []).map(p => {
      if (typeof p.stock !== "number") p.stock = p.available === false ? 0 : 10;
      delete p.available;
      return p;
    });
    return d;
  }

  // Si el navegador bloquea localStorage, se usa la memoria mientras la página esté abierta
  let memory = null;
  function load() {
    try {
      const d = JSON.parse(localStorage.getItem(KEY));
      if (d && Array.isArray(d.products)) return normalize(d);
    } catch (e) {}
    if (memory) return normalize(clone(memory));
    return clone(defaults);
  }
  function save(data) {
    memory = clone(data);
    try { localStorage.setItem(KEY, JSON.stringify(data)); return true; }
    catch (e) { return e && e.name === "QuotaExceededError" ? false : true; }
  }
  function loadCart() {
    try { return JSON.parse(localStorage.getItem(CART_KEY)) || {}; } catch (e) { return {}; }
  }
  function saveCart(cart) {
    try { localStorage.setItem(CART_KEY, JSON.stringify(cart)); } catch (e) {}
  }

  function money(n, cfg) { return (cfg ? cfg.currency : "S/") + " " + Number(n).toFixed(2); }
  function esc(s) {
    return String(s == null ? "" : s).replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
  }
  function uid() { return "p" + Date.now().toString(36) + Math.random().toString(36).slice(2, 6); }
  function initials(name) {
    return String(name || "GM").trim().split(/\s+/).slice(0, 2).map(w => w[0]).join("").toUpperCase() || "GM";
  }

  function today() {
    const d = new Date();
    return d.getFullYear() + "-" + String(d.getMonth() + 1).padStart(2, "0") + "-" + String(d.getDate()).padStart(2, "0");
  }
  function formatDate(iso) {
    if (!iso) return "";
    const [y, m, d] = iso.split("-");
    return d + "/" + m + "/" + y;
  }

  // Promociones vigentes: activas y que no hayan vencido
  function activePromos(data) {
    const t = today();
    return data.promos.filter(x => x.active && (!x.until || x.until >= t));
  }
  // Precio final de un producto con la mejor promoción que le corresponda
  function priceOf(p, data) {
    let best = 0;
    activePromos(data).forEach(x => {
      if (x.all || (x.productIds || []).includes(p.id)) best = Math.max(best, Number(x.percent) || 0);
    });
    return { percent: best, original: p.price, final: Math.round(p.price * (100 - best)) / 100 };
  }

  // Foto de portada: la que subió el encargado o la original del local
  function heroImg(data, n) {
    return data.config["heroImage" + n] || (n === 1 ? "img/local-1.jpg" : "img/local-2.jpg");
  }

  return { load, save, loadCart, saveCart, money, esc, uid, initials, defaults, today, formatDate, activePromos, priceOf, heroImg };
})();
