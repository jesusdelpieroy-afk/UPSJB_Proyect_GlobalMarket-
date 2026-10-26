/* Global Market — panel del encargado */
(() => {
  const $ = id => document.getElementById(id);
  const { esc, money } = GM;
  let data = GM.load();
  let prodImage = "";   // foto del producto en edición (dataURL)
  let promoImage = "";  // imagen de la promoción en edición (dataURL)
  const heroNew = { 1: null, 2: null }; // null = sin cambios, "" = volver a la original
  const FALLBACK = "img/logo.png";
  const LOW = 5;

  const ROUTES = {
    dashboard: { title: "Dashboard", sub: "Bienvenido al dashboard", crumb: "Principal" },
    productos: { title: "Productos y stock", sub: "Administra el catálogo que ven tus clientes", crumb: "Gestión" },
    promos: { title: "Promociones", sub: "Crea y pausa descuentos", crumb: "Gestión" },
    categorias: { title: "Categorías", sub: "Organiza tus productos", crumb: "Gestión" },
    portada: { title: "Portada", sub: "Personaliza el inicio de tu tienda", crumb: "Configuraciones" },
    ajustes: { title: "Ajustes", sub: "Datos de la tienda, cuenta y copia de seguridad", crumb: "Configuraciones" }
  };

  function toast(msg) {
    const t = $("toast");
    t.textContent = msg;
    t.classList.add("show");
    clearTimeout(toast._t);
    toast._t = setTimeout(() => t.classList.remove("show"), 2400);
  }
  function persist(okMsg) {
    if (GM.save(data)) { if (okMsg) toast(okMsg); return true; }
    toast("No hay espacio. Usa fotos más pequeñas o borra productos.");
    return false;
  }

  /* ---------- Ingreso ---------- */
  let sessionOk = false; // respaldo si el navegador bloquea sessionStorage
  function getSession() { try { return sessionStorage.getItem("gm_admin") === "1"; } catch (e) { return sessionOk; } }
  function setSession(on) { sessionOk = on; try { on ? sessionStorage.setItem("gm_admin", "1") : sessionStorage.removeItem("gm_admin"); } catch (e) {} }

  // Mientras el encargado no cree su propia contraseña, el acceso se rellena solo
  function autofill() {
    data = GM.load();
    const auto = !data.config.passwordSet;
    $("email").value = auto ? data.config.email : "";
    $("pass").value = auto ? data.config.password : "";
    $("autoHint").hidden = !auto;
  }
  function showApp(on) {
    $("login").hidden = on;
    $("app").hidden = !on;
    document.body.style.background = on ? "" : "#fff";
    if (on) { renderAll(); route(); } else autofill();
  }
  $("showPass").addEventListener("change", e => { $("pass").type = e.target.checked ? "text" : "password"; });
  $("loginForm").addEventListener("submit", e => {
    e.preventDefault();
    data = GM.load();
    const okMail = $("email").value.trim().toLowerCase() === String(data.config.email).toLowerCase();
    const okPass = $("pass").value.trim() === String(data.config.password);
    // Mientras no se haya creado una contraseña propia, el botón entra directo
    if (!data.config.passwordSet || (okMail && okPass)) {
      setSession(true);
      $("pass").value = ""; $("loginError").textContent = "";
      showApp(true);
    } else {
      $("loginError").textContent = "Correo o contraseña incorrectos. Inténtalo de nuevo.";
    }
  });
  $("resetAccess").addEventListener("click", () => {
    if (!confirm("Se restablecerán el correo y la contraseña iniciales. Tus productos y promociones no se borran. ¿Continuar?")) return;
    data = GM.load();
    data.config.email = GM.defaults.config.email;
    data.config.password = GM.defaults.config.password;
    data.config.passwordSet = false;
    GM.save(data);
    $("loginError").textContent = "";
    autofill();
    toast("Acceso restablecido. Presiona Iniciar sesión.");
  });
  $("logout").addEventListener("click", () => { setSession(false); setUserMenu(false); showApp(false); });

  // Efecto 3D en la pantalla de ingreso
  (() => {
    const stage = $("loginStage"), scene = stage.firstElementChild;
    if (!window.matchMedia("(hover: hover)").matches) return;
    stage.addEventListener("mousemove", e => {
      const r = stage.getBoundingClientRect();
      scene.style.setProperty("--ry", (((e.clientX - r.left) / r.width - .5) * 28).toFixed(1) + "deg");
      scene.style.setProperty("--rx", ((.5 - (e.clientY - r.top) / r.height) * 28).toFixed(1) + "deg");
    });
    stage.addEventListener("mouseleave", () => { scene.style.setProperty("--rx", "0deg"); scene.style.setProperty("--ry", "-6deg"); });
    scene.style.setProperty("--ry", "-6deg");
  })();

  /* ---------- Navegación (hash) ---------- */
  function currentRoute() {
    const h = location.hash.replace("#", "");
    return ROUTES[h] ? h : "dashboard";
  }
  function route() {
    if ($("app").hidden) return;
    const r = currentRoute(), info = ROUTES[r];
    document.querySelectorAll("[data-view]").forEach(s => { s.hidden = s.dataset.view !== r; });
    document.querySelectorAll("#sideNav [data-route]").forEach(a => a.classList.toggle("active", a.dataset.route === r));
    $("pageTitle").textContent = info.title;
    $("subText").textContent = info.sub;
    document.title = `${info.title} | ${data.config.name}`;
    $("crumbs").innerHTML = `<li class="breadcrumb-item"><a href="#dashboard">Inicio</a></li><li class="breadcrumb-item">${esc(info.crumb)}</li><li class="breadcrumb-item active" aria-current="page">${esc(info.title)}</li>`;
    closeSidebar();
    window.scrollTo({ top: 0 });
  }
  window.addEventListener("hashchange", route);

  const mobile = () => window.matchMedia("(max-width: 991.98px)").matches;
  function closeSidebar() { document.body.classList.remove("sb-open"); }
  $("burger").addEventListener("click", () => document.body.classList.toggle(mobile() ? "sb-open" : "sb-collapsed"));
  $("sbOverlay").addEventListener("click", closeSidebar);

  // Tarjeta de usuario (menú que se despliega hacia arriba)
  function setUserMenu(open) { $("userMenu").classList.toggle("open", open); $("userBtn").setAttribute("aria-expanded", String(open)); }
  $("userBtn").addEventListener("click", e => { e.stopPropagation(); setBell(false); setUserMenu(!$("userMenu").classList.contains("open")); });
  $("userMenu").addEventListener("click", e => {
    const a = e.target.closest("[data-focus]");
    if (a) setTimeout(() => $(a.dataset.focus).focus(), 60);
    if (e.target.closest("a")) setUserMenu(false);
  });

  // Campana de notificaciones (stock bajo)
  function setBell(open) { $("bellMenu").classList.toggle("open", open); $("bellBtn").setAttribute("aria-expanded", String(open)); }
  $("bellBtn").addEventListener("click", e => { e.stopPropagation(); setUserMenu(false); setBell(!$("bellMenu").classList.contains("open")); });
  document.addEventListener("click", e => {
    if (!e.target.closest(".gm-user-wrap")) setUserMenu(false);
    if (!e.target.closest("#bellMenu")) setBell(false);
  });
  document.addEventListener("keydown", e => { if (e.key === "Escape") { setUserMenu(false); setBell(false); closeSidebar(); } });

  function lowItems() { return data.products.filter(p => p.stock <= LOW).sort((a, b) => a.stock - b.stock); }
  function renderBell() {
    const low = lowItems();
    $("bellCount").textContent = low.length || ""; $("bellCount").dataset.n = low.length;
    $("bellMenu").innerHTML = `<h6>Notificaciones</h6>` + (low.length
      ? low.slice(0, 6).map(p => `<div class="it"><i class="bi bi-exclamation-triangle-fill"></i><div><b>${esc(p.name)}</b><small>${p.stock <= 0 ? "Agotado" : "Quedan " + p.stock + " unidades"}</small></div></div>`).join("")
      : `<div class="it"><i class="bi bi-check-circle-fill" style="color:#1f8a4c"></i><div><b>Todo en orden</b><small>No hay productos con poco stock.</small></div></div>`);
  }

  $("pwGo").addEventListener("click", () => { location.hash = "ajustes"; setTimeout(() => $("aPass").focus(), 80); });

  /* ---------- Dashboard ---------- */
  function renderStats() {
    const total = data.products.length;
    const out = data.products.filter(p => p.stock <= 0).length;
    const value = data.products.reduce((s, p) => s + p.price * p.stock, 0);
    $("stats").innerHTML = `
      <div class="stat"><div class="ico"><i class="bi bi-box-seam"></i></div><div><b>${total}</b><span>Productos</span></div></div>
      <div class="stat"><div class="ico g"><i class="bi bi-check2-circle"></i></div><div><b>${total - out}</b><span>Con stock</span></div></div>
      <div class="stat"><div class="ico d"><i class="bi bi-slash-circle"></i></div><div><b>${out}</b><span>Agotados</span></div></div>
      <div class="stat"><div class="ico y"><i class="bi bi-lightning-charge"></i></div><div><b>${GM.activePromos(data).length}</b><span>Promociones activas</span></div></div>
      <div class="stat"><div class="ico"><i class="bi bi-tags"></i></div><div><b>${data.categories.length}</b><span>Categorías</span></div></div>
      <div class="stat"><div class="ico g"><i class="bi bi-cash-stack"></i></div><div><b style="font-size:1.15rem">${money(value, data.config)}</b><span>Valor del inventario</span></div></div>`;
    $("recentRows").innerHTML = data.products.slice(0, 5).map(p => `
      <tr><td style="width:60px"><img class="thumb ${p.image ? "" : "is-logo"}" src="${esc(p.image || FALLBACK)}" alt=""></td>
      <td><b>${esc(p.name)}</b><br><small class="text-secondary">${esc(p.category)}</small></td>
      <td class="text-end fw-bold">${money(p.price, data.config)}</td></tr>`).join("")
      || `<tr><td class="text-secondary">Aún no hay productos.</td></tr>`;
    const low = lowItems();
    $("lowList").innerHTML = low.length ? low.map(p => `
      <div class="cat-row"><img class="thumb rounded-3" style="width:40px;height:40px;object-fit:cover" src="${esc(p.image || FALLBACK)}" alt="">
      <span class="name">${esc(p.name)}</span>${p.stock <= 0 ? `<span class="tag off">Agotado</span>` : `<span class="tag low">Quedan ${p.stock}</span>`}</div>`).join("")
      : `<p class="text-secondary mb-0"><i class="bi bi-check-circle text-success me-1"></i>Todo el stock está en orden.</p>`;
  }

  /* ---------- Imágenes ---------- */
  function shrink(file, max = 900, quality = 0.8) {
    return new Promise((resolve, reject) => {
      const r = new FileReader();
      r.onerror = reject;
      r.onload = () => {
        const img = new Image();
        img.onerror = reject;
        img.onload = () => {
          const k = Math.min(1, max / Math.max(img.width, img.height));
          const c = document.createElement("canvas");
          c.width = Math.round(img.width * k); c.height = Math.round(img.height * k);
          c.getContext("2d").drawImage(img, 0, 0, c.width, c.height);
          // PNG conserva la transparencia (queda mejor en 3D)
          resolve(file.type === "image/png" ? c.toDataURL("image/png") : c.toDataURL("image/jpeg", quality));
        };
        img.src = r.result;
      };
      r.readAsDataURL(file);
    });
  }
  function bindImage(inputId, previewId, max, setter) {
    $(inputId).addEventListener("change", async e => {
      const f = e.target.files[0];
      if (!f) return;
      try { const url = await shrink(f, max); setter(url); const p = $(previewId); p.src = url; p.classList.remove("is-logo"); }
      catch (err) { toast("No se pudo leer la imagen."); }
    });
  }
  bindImage("pImg", "preview", 900, u => { prodImage = u; });
  bindImage("prImg", "prPreview", 700, u => { promoImage = u; });

  /* ---------- Productos ---------- */
  const prodModal = new bootstrap.Modal($("prodModal"));
  function renderCatSelect(selected) {
    $("pCat").innerHTML = data.categories.map(c => `<option value="${esc(c)}" ${c === selected ? "selected" : ""}>${esc(c)}</option>`).join("");
  }
  function renderFilter() {
    const cur = $("pFilter").value || "Todas";
    $("pFilter").innerHTML = ["Todas", ...data.categories].map(c => `<option ${c === cur ? "selected" : ""}>${esc(c)}</option>`).join("");
  }
  function renderRows() {
    const q = $("pSearch").value.trim().toLowerCase(), f = $("pFilter").value || "Todas";
    const list = data.products.filter(p => (f === "Todas" || p.category === f) && (!q || (p.name + " " + p.category).toLowerCase().includes(q)));
    $("prodRows").innerHTML = list.length ? list.map(p => {
      const pr = GM.priceOf(p, data);
      return `
      <tr>
        <td style="width:62px"><img class="thumb ${p.image ? "" : "is-logo"}" src="${esc(p.image || FALLBACK)}" alt=""></td>
        <td><b>${esc(p.name)}</b>${p.desc ? `<br><small class="text-secondary">${esc(p.desc)}</small>` : ""}</td>
        <td>${esc(p.category)}</td>
        <td>${pr.percent ? `<s class="text-secondary">${money(p.price, data.config)}</s><br><b>${money(pr.final, data.config)}</b> <span class="tag ok">-${pr.percent}%</span>` : `<b>${money(p.price, data.config)}</b>`}</td>
        <td>
          <label class="sr-only" for="st-${esc(p.id)}">Stock de ${esc(p.name)}</label>
          <input class="form-control stock-in d-inline-block" id="st-${esc(p.id)}" type="number" min="0" step="1" value="${p.stock}" data-stock="${esc(p.id)}">
          ${p.stock <= 0 ? `<span class="tag off ms-1">Agotado</span>` : p.stock <= LOW ? `<span class="tag low ms-1">Poco stock</span>` : ""}
        </td>
        <td class="text-nowrap text-end">
          <button class="btn btn-light btn-sm" data-edit="${esc(p.id)}" type="button" aria-label="Editar"><i class="bi bi-pencil"></i></button>
          <button class="btn btn-light btn-sm text-primary" data-del="${esc(p.id)}" type="button" aria-label="Eliminar"><i class="bi bi-trash"></i></button>
        </td>
      </tr>`;
    }).join("") : `<tr><td colspan="6" class="text-center text-secondary py-4">${data.products.length ? "No hay productos con ese filtro." : "Aún no hay productos. Agrega el primero."}</td></tr>`;
  }
  function openProduct(p) {
    if (!data.categories.length) { toast("Primero crea una categoría."); location.hash = "categorias"; return; }
    $("prodForm").reset();
    renderCatSelect(p ? p.category : $("pFilter").value !== "Todas" ? $("pFilter").value : undefined);
    prodImage = "";
    $("pId").value = p ? p.id : "";
    $("pName").value = p ? p.name : ""; $("pPrice").value = p ? p.price : "";
    $("pDesc").value = p ? p.desc || "" : ""; $("pStock").value = p ? p.stock : 10;
    const prev = $("preview"); prev.src = (p && p.image) || FALLBACK; prev.classList.toggle("is-logo", !(p && p.image));
    $("formTitle").textContent = p ? "Editar producto" : "Agregar producto";
    $("saveBtn").textContent = p ? "Guardar cambios" : "Guardar producto";
    prodModal.show();
  }
  $("prodForm").addEventListener("submit", e => {
    e.preventDefault();
    const id = $("pId").value;
    const item = {
      id: id || GM.uid(),
      name: $("pName").value.trim(),
      price: parseFloat($("pPrice").value) || 0,
      category: $("pCat").value,
      desc: $("pDesc").value.trim(),
      stock: Math.max(0, parseInt($("pStock").value, 10) || 0),
      image: prodImage
    };
    if (id) {
      const i = data.products.findIndex(p => p.id === id);
      if (i > -1) { if (!item.image) item.image = data.products[i].image; data.products[i] = item; }
    } else data.products.unshift(item);
    if (persist(id ? "Producto actualizado" : "Producto agregado")) { prodModal.hide(); renderAll(); }
  });
  $("prodRows").addEventListener("change", e => {
    const inp = e.target.closest("[data-stock]");
    if (!inp) return;
    const p = data.products.find(x => x.id === inp.dataset.stock);
    if (!p) return;
    p.stock = Math.max(0, parseInt(inp.value, 10) || 0);
    persist("Stock actualizado"); renderAll();
  });
  $("prodRows").addEventListener("click", e => {
    const ed = e.target.closest("[data-edit]"), dl = e.target.closest("[data-del]");
    if (ed) openProduct(data.products.find(x => x.id === ed.dataset.edit));
    if (dl) {
      const p = data.products.find(x => x.id === dl.dataset.del);
      if (p && confirm(`¿Eliminar "${p.name}"?`)) {
        data.products = data.products.filter(x => x.id !== p.id);
        data.promos.forEach(x => { x.productIds = (x.productIds || []).filter(i => i !== p.id); });
        persist("Producto eliminado"); renderAll();
      }
    }
  });
  $("pSearch").addEventListener("input", renderRows);
  $("pFilter").addEventListener("change", renderRows);

  /* ---------- Promociones ---------- */
  const promoModal = new bootstrap.Modal($("promoModal"));
  function renderProductChecks(selected) {
    selected = selected || [];
    $("prProducts").innerHTML = data.products.length ? data.products.map(p => `
      <label class="form-check"><input class="form-check-input" type="checkbox" value="${esc(p.id)}" ${selected.includes(p.id) ? "checked" : ""}> <span class="form-check-label">${esc(p.name)}</span></label>`).join("")
      : `<small class="text-secondary">Primero agrega productos.</small>`;
  }
  $("prScope").addEventListener("change", () => { $("prProductsBox").hidden = $("prScope").value !== "some"; });
  function promoStatus(x) {
    if (!x.active) return `<span class="tag off">Pausada</span>`;
    if (x.until && x.until < GM.today()) return `<span class="tag off">Vencida</span>`;
    return `<span class="tag ok">Activa</span>`;
  }
  function renderPromoRows() {
    $("promoRows").innerHTML = data.promos.length ? data.promos.map(x => `
      <tr>
        <td><b>${esc(x.title)}</b>${x.desc ? `<br><small class="text-secondary">${esc(x.desc)}</small>` : ""}</td>
        <td><b>-${esc(x.percent)}%</b></td>
        <td>${x.all ? "Todos los productos" : (x.productIds || []).length + " producto(s)"}</td>
        <td>${x.until ? esc(GM.formatDate(x.until)) : "Sin fecha"}</td>
        <td>${promoStatus(x)}</td>
        <td class="text-nowrap text-end">
          <button class="btn btn-light btn-sm" data-pedit="${esc(x.id)}" type="button" aria-label="Editar"><i class="bi bi-pencil"></i></button>
          <button class="btn btn-light btn-sm" data-ptoggle="${esc(x.id)}" type="button">${x.active ? "Pausar" : "Activar"}</button>
          <button class="btn btn-light btn-sm text-primary" data-pdel="${esc(x.id)}" type="button" aria-label="Eliminar"><i class="bi bi-trash"></i></button>
        </td>
      </tr>`).join("") : `<tr><td colspan="6" class="text-center text-secondary py-4">Aún no hay promociones. Crea la primera.</td></tr>`;
  }
  function openPromo(x) {
    $("promoForm").reset();
    promoImage = "";
    $("prId").value = x ? x.id : "";
    $("prTitle").value = x ? x.title : ""; $("prDesc").value = x ? x.desc || "" : "";
    $("prPercent").value = x ? x.percent : ""; $("prUntil").value = x ? x.until || "" : "";
    $("prActive").value = !x || x.active ? "1" : "0";
    $("prScope").value = !x || x.all ? "all" : "some";
    $("prProductsBox").hidden = !x || x.all;
    renderProductChecks(x ? x.productIds : []);
    const prev = $("prPreview"); prev.src = (x && x.image) || FALLBACK;
    $("promoFormTitle").textContent = x ? "Editar promoción" : "Nueva promoción";
    $("promoSave").textContent = x ? "Guardar cambios" : "Guardar promoción";
    promoModal.show();
  }
  $("promoForm").addEventListener("submit", e => {
    e.preventDefault();
    const id = $("prId").value;
    const some = $("prScope").value === "some";
    const ids = [...$("prProducts").querySelectorAll("input:checked")].map(i => i.value);
    if (some && !ids.length) { toast("Elige al menos un producto para la promoción."); return; }
    const item = {
      id: id || GM.uid(),
      title: $("prTitle").value.trim(),
      desc: $("prDesc").value.trim(),
      percent: Math.min(90, Math.max(1, parseInt($("prPercent").value, 10) || 1)),
      all: !some, productIds: some ? ids : [],
      until: $("prUntil").value,
      active: $("prActive").value === "1",
      image: promoImage
    };
    if (id) {
      const i = data.promos.findIndex(x => x.id === id);
      if (i > -1) { if (!item.image) item.image = data.promos[i].image; data.promos[i] = item; }
    } else data.promos.unshift(item);
    if (persist(id ? "Promoción actualizada" : "Promoción creada")) { promoModal.hide(); renderAll(); }
  });
  $("promoRows").addEventListener("click", e => {
    const ed = e.target.closest("[data-pedit]"), tg = e.target.closest("[data-ptoggle]"), dl = e.target.closest("[data-pdel]");
    if (ed) openPromo(data.promos.find(i => i.id === ed.dataset.pedit));
    if (tg) {
      const x = data.promos.find(i => i.id === tg.dataset.ptoggle);
      if (x) { x.active = !x.active; persist(x.active ? "Promoción activada" : "Promoción pausada"); renderAll(); }
    }
    if (dl) {
      const x = data.promos.find(i => i.id === dl.dataset.pdel);
      if (x && confirm(`¿Eliminar la promoción "${x.title}"?`)) {
        data.promos = data.promos.filter(i => i.id !== x.id);
        persist("Promoción eliminada"); renderAll();
      }
    }
  });

  /* ---------- Categorías ---------- */
  function renderCats() {
    $("catList").innerHTML = data.categories.length ? data.categories.map((c, i) => {
      const n = data.products.filter(p => p.category === c).length;
      return `<div class="cat-row"><i class="bi bi-tag text-primary"></i><span class="name">${esc(c)} <small>(${n})</small></span>
        <button class="btn btn-light btn-sm" data-rencat="${i}" type="button"><i class="bi bi-pencil me-1"></i>Renombrar</button>
        <button class="btn btn-light btn-sm text-primary" data-delcat="${i}" type="button" aria-label="Eliminar"><i class="bi bi-trash"></i></button></div>`;
    }).join("") : `<p class="text-secondary mb-0">Aún no hay categorías.</p>`;
  }
  $("catForm").addEventListener("submit", e => {
    e.preventDefault();
    const name = $("catName").value.trim();
    if (!name) return;
    if (data.categories.some(c => c.toLowerCase() === name.toLowerCase())) { toast("Esa categoría ya existe."); return; }
    data.categories.push(name);
    $("catName").value = "";
    persist("Categoría agregada"); renderAll();
  });
  $("catList").addEventListener("click", e => {
    const del = e.target.closest("[data-delcat]"), ren = e.target.closest("[data-rencat]");
    if (ren) {
      const old = data.categories[+ren.dataset.rencat];
      const name = (prompt("Nuevo nombre de la categoría:", old) || "").trim();
      if (!name || name === old) return;
      if (data.categories.some(c => c.toLowerCase() === name.toLowerCase())) { toast("Esa categoría ya existe."); return; }
      data.categories[+ren.dataset.rencat] = name;
      data.products.forEach(p => { if (p.category === old) p.category = name; });
      persist("Categoría renombrada"); renderAll();
    }
    if (del) {
      const c = data.categories[+del.dataset.delcat];
      if (data.products.some(p => p.category === c)) { toast("Mueve o elimina primero los productos de esta categoría."); return; }
      if (confirm(`¿Eliminar la categoría "${c}"?`)) {
        data.categories.splice(+del.dataset.delcat, 1);
        persist("Categoría eliminada"); renderAll();
      }
    }
  });

  /* ---------- Portada ---------- */
  function renderHero() {
    $("hTitle").value = data.config.heroTitle; $("hText").value = data.config.heroText;
    $("hPrev1").src = GM.heroImg(data, 1); $("hPrev2").src = GM.heroImg(data, 2);
    heroNew[1] = heroNew[2] = null;
  }
  [1, 2].forEach(n => {
    $("hImg" + n).addEventListener("change", async e => {
      const f = e.target.files[0];
      if (!f) return;
      try { heroNew[n] = await shrink(f, 1100, 0.82); $("hPrev" + n).src = heroNew[n]; }
      catch (err) { toast("No se pudo leer la imagen."); }
    });
  });
  document.addEventListener("click", e => {
    const b = e.target.closest("[data-resethero]");
    if (!b) return;
    const n = b.dataset.resethero;
    heroNew[n] = ""; $("hImg" + n).value = ""; $("hPrev" + n).src = n === "1" ? "img/local-1.jpg" : "img/local-2.jpg";
  });
  $("heroForm").addEventListener("submit", e => {
    e.preventDefault();
    data.config.heroTitle = $("hTitle").value.trim();
    data.config.heroText = $("hText").value.trim();
    [1, 2].forEach(n => { if (heroNew[n] !== null) data.config["heroImage" + n] = heroNew[n]; });
    if (persist("Portada guardada")) renderHero();
  });

  /* ---------- Ajustes ---------- */
  function renderCfg() {
    const c = data.config;
    $("cAddr").value = c.address || ""; $("cHours").value = c.hours || "";
    $("cFaq").value = (c.faqs || []).map(f => f.q + " | " + f.a).join("\n");
    $("cName").value = c.name; $("cTag").value = c.tagline || ""; $("cWa").value = c.whatsapp; $("cCur").value = c.currency;
    $("aEmail").value = c.email; $("aPass").value = ""; $("aPass2").value = ""; $("accError").textContent = "";
    $("brandName").textContent = c.name;
    const ini = GM.initials(c.name);
    $("userAvatar").textContent = ini; $("menuAvatar").textContent = ini;
    $("userMail").textContent = c.email; $("menuMail").textContent = c.email;
  }
  $("cfgForm").addEventListener("submit", e => {
    e.preventDefault();
    data.config.name = $("cName").value.trim();
    data.config.tagline = $("cTag").value.trim();
    data.config.whatsapp = $("cWa").value.replace(/\D/g, "");
    data.config.currency = $("cCur").value.trim();
    data.config.address = $("cAddr").value.trim();
    data.config.hours = $("cHours").value.trim();
    data.config.faqs = $("cFaq").value.split("\n").map(l => l.split("|")).filter(p => p.length > 1 && p[0].trim() && p.slice(1).join("|").trim())
      .map(p => ({ q: p[0].trim(), a: p.slice(1).join("|").trim() }));
    if (persist("Datos de la tienda guardados")) renderAll();
  });
  $("accForm").addEventListener("submit", e => {
    e.preventDefault();
    const p1 = $("aPass").value, p2 = $("aPass2").value;
    if (p1 || p2) {
      if (p1.length < 6) { $("accError").textContent = "La contraseña debe tener al menos 6 caracteres."; return; }
      if (p1 !== p2) { $("accError").textContent = "Las contraseñas no coinciden."; return; }
      data.config.password = p1;
      data.config.passwordSet = true;
    }
    data.config.email = $("aEmail").value.trim();
    $("accError").textContent = "";
    if (persist("Cuenta actualizada")) { renderCfg(); $("pwBanner").hidden = !!data.config.passwordSet; }
  });

  /* ---------- Copia de seguridad ---------- */
  $("exportBtn").addEventListener("click", () => {
    const copy = JSON.parse(JSON.stringify(data));
    delete copy.config.password; // la contraseña no se incluye en la copia
    const blob = new Blob([JSON.stringify(copy, null, 2)], { type: "application/json" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = "global-market-copia.json";
    a.click();
    URL.revokeObjectURL(a.href);
  });
  $("importFile").addEventListener("change", e => {
    const f = e.target.files[0];
    if (!f) return;
    const r = new FileReader();
    r.onload = () => {
      try {
        const d = JSON.parse(r.result);
        if (!d || !Array.isArray(d.products) || !Array.isArray(d.categories)) throw new Error();
        const keep = { email: data.config.email, password: data.config.password, passwordSet: data.config.passwordSet };
        data = { config: Object.assign({}, GM.defaults.config, d.config, keep), categories: d.categories, products: d.products, promos: d.promos || [] };
        if (persist("Copia restaurada")) { data = GM.load(); renderAll(); }
      } catch (err) { toast("El archivo no es una copia válida."); }
    };
    r.readAsText(f);
    e.target.value = "";
  });

  /* ---------- Atajos ---------- */
  document.addEventListener("click", e => {
    const q = e.target.closest("[data-quick]");
    if (!q) return;
    const k = q.dataset.quick;
    if (k === "newProduct") openProduct();
    else if (k === "newPromo") openPromo();
    else location.hash = k;
  });

  function renderAll() {
    renderCfg(); renderStats(); renderBell(); renderFilter(); renderRows(); renderPromoRows(); renderCats(); renderHero();
    $("pwBanner").hidden = !!data.config.passwordSet;
  }

  // Si se cambia algo desde otra pestaña, se refresca
  window.addEventListener("storage", () => { if (!$("app").hidden) { data = GM.load(); renderAll(); } });

  showApp(getSession());
})();
