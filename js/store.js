/* Global Market — tienda (cliente) */
(() => {
  const $ = id => document.getElementById(id);
  const { esc, money } = GM;
  let data = GM.load();
  let cart = GM.loadCart();
  let activeCat = "Todo";
  let query = "";
  const FALLBACK = "img/logo.png";
  const LOW_STOCK = 5;
  const canHover = window.matchMedia("(hover: hover)").matches;
  const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  function toast(msg) {
    const t = $("toast");
    t.textContent = msg;
    t.classList.add("show");
    clearTimeout(toast._t);
    toast._t = setTimeout(() => t.classList.remove("show"), 2200);
  }

  /* ---------- Marca, portada y datos de la tienda ---------- */
  function waLink(text) {
    const num = String(data.config.whatsapp).replace(/\D/g, "");
    return `https://wa.me/${num}` + (text ? `?text=${encodeURIComponent(text)}` : "");
  }
  function renderBrand() {
    const c = data.config;
    document.title = `${c.name} | Catálogo`;
    $("brandName").textContent = c.name;
    $("brandTag").textContent = c.tagline || "";
    $("userName").textContent = c.name;
    $("menuName").textContent = c.name;
    $("welcome").textContent = `Bienvenido a ${c.name}`;
    $("heroTitle").textContent = c.heroTitle;
    $("heroText").textContent = c.heroText;
    $("heroImg1").src = GM.heroImg(data, 1);
    $("heroImg2").src = GM.heroImg(data, 2);
    $("footName").textContent = `© ${new Date().getFullYear()} ${c.name}. Todos los derechos reservados.`;
    $("footBrand").textContent = c.name; $("footTag").textContent = c.tagline || "";
    $("footWa").href = waLink(`Hola ${c.name}, quiero hacer una consulta.`);
    $("footAddr").hidden = !c.address; $("footAddr").innerHTML = `<i class="bi bi-geo-alt"></i> ${esc(c.address)}`;
    $("footHours").hidden = !c.hours; $("footHours").innerHTML = `<i class="bi bi-clock"></i> ${esc(c.hours)}`;
    $("botName").textContent = `Asistente ${c.name}`;
    $("menuWa").href = waLink(`Hola ${c.name}, quiero hacer una consulta.`);
  }

  /* ---------- Promociones ---------- */
  function renderPromos() {
    const list = GM.activePromos(data);
    $("promos").hidden = !list.length;
    $("navPromos").hidden = !list.length;
    $("promoGrid").innerHTML = list.map(x => `
      <article class="promo reveal">
        <div class="off"><b>-${esc(x.percent)}%</b><span>dscto.</span></div>
        <div style="position:relative;z-index:1">
          <h3>${esc(x.title)}</h3>
          ${x.desc ? `<p>${esc(x.desc)}</p>` : ""}
          <small>${x.until ? "Válida hasta el " + esc(GM.formatDate(x.until)) : "Por tiempo limitado"}</small>
        </div>
        ${x.image ? `<img src="${esc(x.image)}" alt="" loading="lazy">` : ""}
      </article>`).join("");
  }

  /* ---------- Categorías ---------- */
  function countOf(c) { return data.products.filter(p => p.category === c).length; }
  let spyKey = "inicio";
  function markNav() {
    document.querySelectorAll("#sideNav .gm-link").forEach(a => a.classList.remove("active"));
    let target;
    if (activeCat !== "Todo") target = [...document.querySelectorAll("#catNav [data-cat]")].find(a => a.dataset.cat === activeCat);
    else if (spyKey === "catalogo") target = document.querySelector('#catNav [data-cat="Todo"]');
    else target = document.querySelector(`#sideNav a[data-nav="${spyKey}"]`);
    if (target) target.classList.add("active");
  }
  function renderNav() {
    $("catNav").innerHTML = [`<button class="gm-link" type="button" data-cat="Todo"><i class="bi bi-grid"></i> Todos los productos<span class="count">${data.products.length}</span></button>`]
      .concat(data.categories.map(c => `<button class="gm-link" type="button" data-cat="${esc(c)}"><i class="bi bi-tag"></i> ${esc(c)}<span class="count">${countOf(c)}</span></button>`)).join("");
    markNav();
  }
  function renderChips() {
    $("chips").innerHTML = ["Todo", ...data.categories].map(c =>
      `<button class="cat-chip" type="button" data-cat="${esc(c)}" aria-pressed="${c === activeCat}">${esc(c)}</button>`).join("");
  }
  function setCat(c, scroll) {
    activeCat = c;
    renderNav(); renderChips(); renderCatalog(); renderCrumbs();
    if (scroll) $("catalogo").scrollIntoView({ behavior: "smooth", block: "start" });
  }
  function renderCrumbs() {
    const parts = [`<li class="breadcrumb-item"><a href="#inicio">Inicio</a></li>`];
    if (activeCat === "Todo") parts.push(`<li class="breadcrumb-item active" aria-current="page">Catálogo</li>`);
    else {
      parts.push(`<li class="breadcrumb-item"><a href="#catalogo" data-cat="Todo">Catálogo</a></li>`);
      parts.push(`<li class="breadcrumb-item active" aria-current="page">${esc(activeCat)}</li>`);
    }
    $("crumbs").innerHTML = parts.join("");
    $("pageTitle").textContent = activeCat === "Todo" ? "Inicio" : activeCat;
  }

  /* ---------- Catálogo ---------- */
  function cardHTML(p) {
    const img = p.image || FALLBACK;
    const pr = GM.priceOf(p, data);
    const out = p.stock <= 0;
    const badge = out ? ["Agotado", "out"] : pr.percent ? [`-${pr.percent}%`, "promo"] : (p.stock <= LOW_STOCK ? [`Quedan ${p.stock}`, ""] : null);
    return `
    <div class="pcard reveal">
      <article class="pcard-in" data-open="${esc(p.id)}" tabindex="0" role="button" aria-label="Ver ${esc(p.name)} en 3D">
        <div class="pimg">
          <img src="${esc(img)}" alt="${esc(p.name)}" loading="lazy" class="${p.image ? "" : "is-logo"}">
          ${badge ? `<span class="badge-pill ${badge[1]}">${esc(badge[0])}</span>` : ""}
        </div>
        <div class="pbody">
          <span class="pcat">${esc(p.category)}</span>
          <h4>${esc(p.name)}</h4>
          ${p.desc ? `<p class="pdesc">${esc(p.desc)}</p>` : ""}
          <div class="pfoot">
            <span class="price">${money(pr.final, data.config)}${pr.percent ? `<s>${money(pr.original, data.config)}</s>` : ""}</span>
            <button class="btn btn-primary btn-add" type="button" data-add="${esc(p.id)}" aria-label="Agregar ${esc(p.name)}" ${out ? "disabled" : ""}><i class="bi bi-plus-lg"></i></button>
          </div>
        </div>
      </article>
    </div>`;
  }

  function renderCatalog() { renderCatalogRaw(); observeReveal(); }
  function renderCatalogRaw() {
    const q = query.trim().toLowerCase();
    const match = p => !q || (p.name + " " + p.desc + " " + p.category).toLowerCase().includes(q);
    const box = $("catalog");

    if (!data.products.length) {
      box.innerHTML = `<div class="prod-grid"><div class="empty-state"><i class="bi bi-box-seam"></i><h3>Aún no hay productos publicados</h3><p>Vuelve pronto para ver las novedades.</p></div></div>`;
      return;
    }
    if (activeCat === "Todo" && !q) {
      // Agrupado por categoría
      const blocks = data.categories.map(c => {
        const list = data.products.filter(p => p.category === c);
        return list.length ? `<div class="cat-block"><h3>${esc(c)} <small>${list.length} producto${list.length > 1 ? "s" : ""}</small></h3><div class="prod-grid">${list.map(cardHTML).join("")}</div></div>` : "";
      }).join("");
      const orphans = data.products.filter(p => !data.categories.includes(p.category));
      const extra = orphans.length ? `<div class="cat-block"><h3>Otros</h3><div class="prod-grid">${orphans.map(cardHTML).join("")}</div></div>` : "";
      box.innerHTML = blocks + extra;
      $("catSub").textContent = "Toca un producto para verlo en 3D.";
      return;
    }
    const list = data.products.filter(p => (activeCat === "Todo" || p.category === activeCat) && match(p));
    $("catSub").textContent = q ? `${list.length} resultado(s) para “${query.trim()}”` : `${list.length} producto(s) en ${activeCat}`;
    box.innerHTML = `<div class="prod-grid">${list.length ? list.map(cardHTML).join("")
      : `<div class="empty-state"><i class="bi bi-search"></i><h3>No encontramos productos</h3><p>Prueba con otra búsqueda o categoría.</p></div>`}</div>`;
  }

  /* ---------- Efecto 3D: inclinación con el mouse ---------- */
  function tilt(el, e, max) {
    const r = el.getBoundingClientRect();
    const x = (e.clientX - r.left) / r.width, y = (e.clientY - r.top) / r.height;
    el.style.setProperty("--ry", ((x - .5) * 2 * max).toFixed(2) + "deg");
    el.style.setProperty("--rx", ((.5 - y) * 2 * max).toFixed(2) + "deg");
    el.style.setProperty("--mx", (x * 100).toFixed(1) + "%");
    el.style.setProperty("--my", (y * 100).toFixed(1) + "%");
  }
  function untilt(el) { el.style.setProperty("--rx", "0deg"); el.style.setProperty("--ry", "0deg"); }

  if (canHover && !reduce) {
    $("catalog").addEventListener("mousemove", e => { const c = e.target.closest(".pcard-in"); if (c) tilt(c, e, 9); });
    $("catalog").addEventListener("mouseout", e => { const c = e.target.closest(".pcard-in"); if (c && !c.contains(e.relatedTarget)) untilt(c); });
    const stage = $("heroStage"), scene = stage.firstElementChild;
    stage.addEventListener("mousemove", e => tilt(scene, e, 14));
    stage.addEventListener("mouseleave", () => untilt(scene));
    scene.style.setProperty("--ry", "-6deg");
  }

  /* ---------- Visor 3D del producto ---------- */
  const modalEl = $("prodModal");
  const modal = new bootstrap.Modal(modalEl);
  let current = null;
  const view = { x: -8, y: 24, drag: false, sx: 0, sy: 0, auto: true, raf: 0 };

  function buildPlate(p) {
    const plate = $("plate");
    const isLogo = !p.image;
    // La ruta debe ser absoluta: una url() dentro de una variable CSS se resuelve desde la hoja de estilos
    const abs = new URL(p.image || FALLBACK, document.baseURI).href;
    plate.style.setProperty("--img", `url("${abs.replace(/"/g, "%22")}")`);
    const T = 16, n = 9; // espesor y número de capas
    let html = "";
    for (let i = 0; i < n; i++) {
      const z = -T / 2 + (T / (n - 1)) * i;
      html += `<div class="layer edge ${isLogo ? "logo" : ""}" style="transform:translateZ(${z.toFixed(1)}px)"></div>`;
    }
    html += `<div class="layer front ${isLogo ? "logo" : ""}" style="transform:translateZ(${T / 2 + .5}px)"></div>`;
    html += `<div class="layer edge back ${isLogo ? "logo" : ""}" style="transform:translateZ(${-T / 2 - .5}px) rotateY(180deg);filter:brightness(.7)"></div>`;
    plate.innerHTML = html;
    // La imagen se adapta a la proporción real de la foto
    if (p.image) {
      const im = new Image();
      im.onload = () => {
        const k = im.width / im.height, base = 270;
        const w = k >= 1 ? base : base * k, h = k >= 1 ? base / k : base;
        plate.style.width = w + "px"; plate.style.height = h + "px";
      };
      im.src = p.image;
    } else { plate.style.width = plate.style.height = "230px"; }
  }
  function applyView() { $("plate").style.setProperty("--vx", view.x.toFixed(1) + "deg"); $("plate").style.setProperty("--vy", view.y.toFixed(1) + "deg"); }
  function loop() {
    if (view.auto && !view.drag && !reduce) { view.y += .35; applyView(); }
    view.raf = requestAnimationFrame(loop);
  }
  const viewer = $("viewer");
  viewer.addEventListener("pointerdown", e => {
    view.drag = true; view.auto = false; view.sx = e.clientX; view.sy = e.clientY;
    viewer.classList.add("drag"); viewer.setPointerCapture(e.pointerId);
  });
  viewer.addEventListener("pointermove", e => {
    if (!view.drag) return;
    view.y += (e.clientX - view.sx) * .6;
    view.x = Math.max(-45, Math.min(45, view.x - (e.clientY - view.sy) * .4));
    view.sx = e.clientX; view.sy = e.clientY; applyView();
  });
  const endDrag = () => { view.drag = false; viewer.classList.remove("drag"); clearTimeout(view.t); view.t = setTimeout(() => { view.auto = true; }, 2500); };
  viewer.addEventListener("pointerup", endDrag);
  viewer.addEventListener("pointercancel", endDrag);

  function openProduct(id) {
    const p = data.products.find(x => x.id === id);
    if (!p) return;
    current = p;
    const pr = GM.priceOf(p, data);
    const out = p.stock <= 0;
    buildPlate(p);
    view.x = -8; view.y = 24; view.auto = true; applyView();
    $("pmCat").textContent = p.category;
    $("pmName").textContent = p.name;
    $("pmDesc").textContent = p.desc || "";
    $("pmPrice").textContent = money(pr.final, data.config);
    $("pmOld").textContent = pr.percent ? money(pr.original, data.config) : "";
    $("pmOff").textContent = pr.percent ? `-${pr.percent}%` : "";
    $("pmOff").hidden = !pr.percent;
    $("pmStock").textContent = out ? "Agotado por el momento." : p.stock <= LOW_STOCK ? `¡Últimas ${p.stock} unidades!` : "Disponible.";
    $("pmAdd").disabled = out;
    $("pmWa").href = waLink(`Hola ${data.config.name}, quiero consultar por: ${p.name}`);
    modal.show();
  }
  modalEl.addEventListener("shown.bs.modal", () => { cancelAnimationFrame(view.raf); loop(); });
  modalEl.addEventListener("hidden.bs.modal", () => cancelAnimationFrame(view.raf));
  $("pmAdd").addEventListener("click", () => { if (current) { addToCart(current.id); modal.hide(); } });

  /* ---------- Carrito ---------- */
  function cartLines() {
    return Object.entries(cart).map(([id, qty]) => {
      const p = data.products.find(x => x.id === id);
      return p && p.stock > 0 ? { p, qty: Math.min(qty, p.stock), pr: GM.priceOf(p, data) } : null;
    }).filter(Boolean);
  }
  function renderCart() {
    const lines = cartLines();
    const count = lines.reduce((s, l) => s + l.qty, 0);
    const total = lines.reduce((s, l) => s + l.qty * l.pr.final, 0);
    const badge = $("cartCount");
    badge.textContent = count || ""; badge.dataset.n = count;
    $("cartTotal").textContent = money(total, data.config);
    $("sendWa").disabled = !lines.length;
    $("clearCart").style.display = lines.length ? "" : "none";
    $("cartBody").innerHTML = lines.length ? lines.map(({ p, qty, pr }) => `
      <div class="cart-line">
        <img src="${esc(p.image || FALLBACK)}" alt="">
        <div><b>${esc(p.name)}</b><small>${money(pr.final, data.config)} c/u${pr.percent ? " (promo -" + pr.percent + "%)" : ""}</small></div>
        <div class="qty">
          <button type="button" data-dec="${esc(p.id)}" aria-label="Quitar uno">−</button>
          <span>${qty}</span>
          <button type="button" data-inc="${esc(p.id)}" aria-label="Agregar uno">+</button>
        </div>
      </div>`).join("")
      : `<div class="empty-state shadow-none bg-transparent"><i class="bi bi-bag"></i><h3>Tu carrito está vacío</h3><p>Agrega productos del catálogo para hacer tu pedido.</p></div>`;
  }
  function setQty(id, qty) {
    const p = data.products.find(x => x.id === id);
    if (!p) return;
    if (qty > p.stock) { toast("No hay más unidades disponibles."); qty = p.stock; }
    if (qty <= 0) delete cart[id]; else cart[id] = qty;
    GM.saveCart(cart);
    renderCart();
  }
  function addToCart(id) {
    const before = cart[id] || 0;
    setQty(id, before + 1);
    if ((cart[id] || 0) > before) toast("Agregado al carrito");
  }
  function sendWhatsApp() {
    const lines = cartLines();
    if (!lines.length) return;
    const total = lines.reduce((s, l) => s + l.qty * l.pr.final, 0);
    const name = $("custName").value.trim();
    let msg = `Hola ${data.config.name}, quiero hacer este pedido:\n\n`;
    lines.forEach(({ p, qty, pr }) => {
      msg += `• ${qty} x ${p.name} — ${money(pr.final * qty, data.config)}${pr.percent ? ` (promo -${pr.percent}%)` : ""}\n`;
    });
    msg += `\nTotal: ${money(total, data.config)}`;
    if (name) msg += `\nNombre: ${name}`;
    window.open(waLink(msg), "_blank", "noopener");
  }

  /* ---------- Eventos ---------- */
  document.addEventListener("click", e => {
    const add = e.target.closest("[data-add]");
    if (add) { e.stopPropagation(); addToCart(add.dataset.add); return; }
    const open = e.target.closest("[data-open]");
    if (open) { openProduct(open.dataset.open); return; }
    const cat = e.target.closest("[data-cat]");
    if (cat) { e.preventDefault(); setCat(cat.dataset.cat, true); closeSidebar(); return; }
    const inc = e.target.closest("[data-inc]"), dec = e.target.closest("[data-dec]");
    if (inc) setQty(inc.dataset.inc, (cart[inc.dataset.inc] || 0) + 1);
    if (dec) setQty(dec.dataset.dec, (cart[dec.dataset.dec] || 0) - 1);
    if (!e.target.closest(".gm-user-wrap")) setUserMenu(false);
  });
  document.addEventListener("keydown", e => {
    if (e.key === "Escape") { setUserMenu(false); closeSidebar(); }
    if ((e.key === "Enter" || e.key === " ") && e.target.matches("[data-open]")) { e.preventDefault(); openProduct(e.target.dataset.open); }
  });
  function onSearch(v) {
    query = v; $("q").value = v; $("q2").value = v;
    if (v && activeCat !== "Todo") { activeCat = "Todo"; renderNav(); renderChips(); renderCrumbs(); }
    renderCatalog();
  }
  $("q").addEventListener("input", e => onSearch(e.target.value));
  $("q2").addEventListener("input", e => onSearch(e.target.value));
  $("sendWa").addEventListener("click", sendWhatsApp);
  $("clearCart").addEventListener("click", () => { cart = {}; GM.saveCart(cart); renderCart(); });

  // Menú lateral
  const mobile = () => window.matchMedia("(max-width: 991.98px)").matches;
  function closeSidebar() { document.body.classList.remove("sb-open"); }
  $("burger").addEventListener("click", () => document.body.classList.toggle(mobile() ? "sb-open" : "sb-collapsed"));
  $("sbOverlay").addEventListener("click", closeSidebar);
  $("sideNav").addEventListener("click", e => { if (e.target.closest("a[href^='#']")) closeSidebar(); });

  // Tarjeta de contacto (abajo del menú)
  function setUserMenu(open) { $("userMenu").classList.toggle("open", open); $("userBtn").setAttribute("aria-expanded", String(open)); }
  $("userBtn").addEventListener("click", e => { e.stopPropagation(); setUserMenu(!$("userMenu").classList.contains("open")); });
  $("userMenu").addEventListener("click", e => { if (e.target.closest("a")) { setUserMenu(false); closeSidebar(); } });

  // Resaltar opción del menú según la sección visible
  const spy = [["inicio", "inicio"], ["promos", "promos"], ["catalogo", "catalogo"], ["como-comprar", "como"], ["faq", "faq"]];
  if ("IntersectionObserver" in window) {
    const io = new IntersectionObserver(entries => {
      entries.forEach(en => {
        if (!en.isIntersecting) return;
        spyKey = (spy.find(s => s[0] === en.target.id) || [])[1] || spyKey;
        markNav();
      });
    }, { rootMargin: "-40% 0px -50% 0px" });
    spy.forEach(([id]) => { const el = $(id); if (el) io.observe(el); });
  }

  /* ---------- Efectos de aparición y cifras ---------- */
  const rio = "IntersectionObserver" in window ? new IntersectionObserver(es => es.forEach(e => {
    if (e.isIntersecting) { e.target.classList.add("in"); rio.unobserve(e.target); if (e.target.id === "band") countUp(); }
  }), { threshold: .1 }) : null;
  function observeReveal() { document.querySelectorAll(".reveal:not(.in)").forEach(el => rio ? rio.observe(el) : el.classList.add("in")); }
  function countUp() {
    document.querySelectorAll("[data-count]").forEach(el => {
      const to = +el.dataset.to || 0, t0 = performance.now();
      const tick = t => { const k = Math.min(1, (t - t0) / 900); el.textContent = Math.round(to * (1 - Math.pow(1 - k, 3))); if (k < 1) requestAnimationFrame(tick); };
      reduce ? (el.textContent = to) : requestAnimationFrame(tick);
    });
  }
  function renderBand() {
    const v = [data.products.length, data.categories.length, GM.activePromos(data).length];
    document.querySelectorAll("[data-count]").forEach((el, i) => { el.dataset.to = v[i]; el.textContent = v[i]; });
    if ($("band").classList.contains("in")) countUp();
  }
  function renderFaq() {
    const f = data.config.faqs || [];
    $("faq").hidden = !f.length; $("navFaq").hidden = !f.length;
    $("faqList").innerHTML = f.map((x, i) => `
      <div class="accordion-item"><h3 class="accordion-header"><button class="accordion-button collapsed" type="button" data-bs-toggle="collapse" data-bs-target="#fq${i}" aria-expanded="false" aria-controls="fq${i}">${esc(x.q)}</button></h3>
      <div id="fq${i}" class="accordion-collapse collapse" data-bs-parent="#faqList"><div class="accordion-body">${esc(x.a)}</div></div></div>`).join("");
  }

  /* ---------- Asistente virtual (consultor de dudas) ---------- */
  const STOP = new Set("cuanto cuesta cuestan precio precios tiene tienen quiero quisiera hay para con los las una unos unas del que por como donde cual cuales ustedes tienda favor necesito busco saber info informacion algo mas muy esta estan son sus tus venden vende".split(" "));
  const norm = s => String(s || "").toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9\s]/g, " ");
  const stem = w => w.length > 4 ? w.replace(/(es|s)$/, "") : w;
  const msgs = $("botMsgs");
  let botStarted = false;

  function botAdd(who, html) {
    const d = document.createElement("div");
    d.className = "msg " + who; d.innerHTML = html;
    msgs.appendChild(d); msgs.scrollTop = msgs.scrollHeight;
    return d;
  }
  function waBtn(text) { return `<a class="btn btn-wa btn-sm mt-2" href="${esc(waLink(text))}" target="_blank" rel="noopener"><i class="bi bi-whatsapp me-1"></i>Hablar con un asesor</a>`; }
  function prodMini(p) {
    const pr = GM.priceOf(p, data), out = p.stock <= 0;
    return `<div class="bm-prod"><img src="${esc(p.image || FALLBACK)}" alt=""><div><b>${esc(p.name)}</b>
      <small>${money(pr.final, data.config)}${pr.percent ? ` (-${pr.percent}%)` : ""} · ${out ? "Agotado" : p.stock <= LOW_STOCK ? "Quedan " + p.stock : "Disponible"}</small>
      <div class="bm-acts"><button type="button" data-open="${esc(p.id)}">Ver en 3D</button>${out ? "" : `<button type="button" data-add="${esc(p.id)}">Agregar</button>`}</div></div></div>`;
  }
  function botReply(q) {
    const t = norm(q), c = data.config;
    const words = t.split(/\s+/).filter(w => w.length > 2 && !STOP.has(w));
    const has = (...k) => k.some(x => t.includes(x));
    const handoff = waBtn(`Hola ${c.name}, tengo una consulta: ${q}`);
    if (/^(hola|buenas|buenos|hey)\b/.test(t) && t.split(/\s+/).length <= 3) return `¡Hola! 👋 Soy el asistente de ${esc(c.name)}. Te ayudo con productos, precios, promociones y cómo comprar. ¿Qué estás buscando?`;
    if (has("gracias", "genial", "perfecto", "excelente")) return "¡Con gusto! Si necesitas algo más, aquí estoy. 😊";
    if (has("promo", "oferta", "descuento", "dscto", "rebaja")) {
      const l = GM.activePromos(data);
      return l.length ? `Estas son las promociones vigentes:<ul>${l.map(x => `<li><b>${esc(x.title)}</b> · -${esc(x.percent)}%${x.until ? ` (hasta el ${esc(GM.formatDate(x.until))})` : ""}</li>`).join("")}</ul>El descuento se aplica solo en tu carrito.`
        : "Por ahora no hay promociones activas, pero publicamos nuevas con frecuencia. 😉";
    }
    if (has("horario", "a que hora", "abren", "cierran")) return c.hours ? `Nuestro horario: <b>${esc(c.hours)}</b>.` : `No tengo el horario publicado. Un asesor te lo confirma enseguida.${handoff}`;
    if (has("direccion", "ubicacion", "donde estan", "donde queda", "como llego")) return c.address ? `Nos encuentras en: <b>${esc(c.address)}</b>.` : `Aún no tengo la dirección publicada. Un asesor te la comparte.${handoff}`;
    if (has("whatsapp", "asesor", "humano", "persona", "contacto", "telefono", "llamar")) return `Claro, te conecto con el equipo de ${esc(c.name)}:${handoff}`;
    if (has("categoria", "que venden", "que tienen", "catalogo", "que productos", "que hay")) {
      return data.categories.length ? `Tenemos estas categorías:<ul>${data.categories.map(x => `<li><a href="#catalogo" data-cat="${esc(x)}">${esc(x)}</a> (${countOf(x)})</li>`).join("")}</ul>Toca una para verla.` : "Estamos preparando el catálogo. ¡Vuelve pronto!";
    }
    const prods = data.products.map(p => { const n = norm(p.name + " " + p.category + " " + p.desc); return { p, s: words.filter(w => n.includes(stem(w))).length }; })
      .filter(x => x.s > 0).sort((a, b) => b.s - a.s);
    const faq = (c.faqs || []).map(f => { const n = norm(f.q + " " + f.a); return { f, s: words.filter(w => n.includes(stem(w))).length }; }).sort((a, b) => b.s - a.s)[0];
    if (prods.length && (!faq || prods[0].s >= faq.s)) {
      const top = prods.filter(x => x.s === prods[0].s).slice(0, 3);
      return `Encontré ${top.length > 1 ? "estas opciones" : "esto"} para ti:${top.map(x => prodMini(x.p)).join("")}`;
    }
    if (faq && faq.s > 0) return `${esc(faq.f.a)}`;
    if (has("como compro", "como comprar", "como pido", "pedido", "comprar")) return "Es muy fácil: 1) elige tus productos y agrégalos al carrito, 2) envía el pedido por WhatsApp y 3) coordinamos pago y entrega contigo.";
    return `No estoy seguro de haberte entendido 🤔. Prueba con el nombre de un producto, «promociones» o «¿cómo compro?». También puedo derivarte con un asesor.${handoff}`;
  }
  function botSend(text) {
    text = text.trim(); if (!text) return;
    botAdd("me", esc(text));
    const typing = botAdd("from-bot typing", "<i></i><i></i><i></i>");
    setTimeout(() => { typing.remove(); botAdd("from-bot", botReply(text)); }, reduce ? 0 : 550);
  }
  function setBot(open) {
    $("bot").classList.toggle("open", open); $("botFab").setAttribute("aria-expanded", String(open));
    $("botFab").classList.toggle("is-open", open); $("botTip").classList.remove("show");
    if (open && !botStarted) {
      botStarted = true;
      botAdd("from-bot", `¡Hola! 👋 Soy el asistente de ${esc(data.config.name)}. Pregúntame por <b>productos, precios, promociones</b> o cómo comprar.`);
      $("botChips").innerHTML = ["Promociones", "Ver categorías", "¿Cómo compro?", "Hablar con un asesor"].map(x => `<button type="button" data-bq="${x}">${x}</button>`).join("");
    }
    if (open) setTimeout(() => $("botInput").focus(), 200);
  }
  $("botFab").addEventListener("click", () => setBot(!$("bot").classList.contains("open")));
  $("botClose").addEventListener("click", () => setBot(false));
  $("botChips").addEventListener("click", e => { const b = e.target.closest("[data-bq]"); if (b) botSend(b.dataset.bq); });
  $("botForm").addEventListener("submit", e => { e.preventDefault(); botSend($("botInput").value); $("botInput").value = ""; });
  setTimeout(() => { if (!$("bot").classList.contains("open")) $("botTip").classList.add("show"); }, 3500);
  setTimeout(() => $("botTip").classList.remove("show"), 11000);

  // Si el encargado cambia algo en otra pestaña, se actualiza aquí.
  window.addEventListener("storage", () => { data = GM.load(); cart = GM.loadCart(); renderAll(); });

  function renderAll() {
    if (activeCat !== "Todo" && !data.categories.includes(activeCat)) activeCat = "Todo";
    renderBrand(); renderPromos(); renderNav(); renderChips(); renderCatalog(); renderCrumbs(); renderCart(); renderBand(); renderFaq(); observeReveal();
  }
  renderAll();
})();
