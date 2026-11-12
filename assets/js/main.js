/* Estatus Digital — interacción de la landing */
(() => {
  "use strict";
  const CFG = window.ED_CONFIG || {};
  const $ = (s, c = document) => c.querySelector(s);
  const $$ = (s, c = document) => [...c.querySelectorAll(s)];
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const esc = (t) => String(t ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));

  /* ---------- Medición (GA4 y Meta Pixel, solo si hay ID en config.js) ---------- */
  window.dataLayer = window.dataLayer || [];
  if (CFG.ga4) {
    const s = document.createElement("script");
    s.async = true;
    s.src = "https://www.googletagmanager.com/gtag/js?id=" + encodeURIComponent(CFG.ga4);
    document.head.appendChild(s);
    window.gtag = function () { window.dataLayer.push(arguments); };
    window.gtag("js", new Date());
    window.gtag("config", CFG.ga4);
  }
  if (CFG.metaPixel) {
    /* eslint-disable */
    !function (f, b, e, v, n, t, s) { if (f.fbq) return; n = f.fbq = function () { n.callMethod ? n.callMethod.apply(n, arguments) : n.queue.push(arguments); }; if (!f._fbq) f._fbq = n; n.push = n; n.loaded = !0; n.version = "2.0"; n.queue = []; t = b.createElement(e); t.async = !0; t.src = v; s = b.getElementsByTagName(e)[0]; s.parentNode.insertBefore(t, s); }(window, document, "script", "https://connect.facebook.net/en_US/fbevents.js");
    /* eslint-enable */
    window.fbq("init", CFG.metaPixel);
    window.fbq("track", "PageView");
  }
  function track(evento, datos = {}) {
    window.dataLayer.push({ event: evento, ...datos });
    if (window.gtag) window.gtag("event", evento, datos);
    if (window.fbq) {
      if (evento.startsWith("lead_")) window.fbq("track", "Lead", datos);
      else if (evento.includes("whatsapp")) window.fbq("track", "Contact", datos);
      else window.fbq("trackCustom", evento, datos);
    }
  }
  document.addEventListener("click", (e) => {
    const el = e.target.closest("[data-ev]");
    if (el) track(el.dataset.ev);
  });

  /* ---------- Datos de contacto desde config.js ---------- */
  const waUrl = (msg) => `https://wa.me/${CFG.whatsapp}?text=${encodeURIComponent(msg)}`;
  function conectarWa(raiz = document) {
    $$("[data-wa]", raiz).forEach((a) => {
      if (!CFG.whatsapp) return;
      a.href = waUrl(a.dataset.wa);
      a.target = "_blank";
      a.rel = "noopener";
    });
  }
  conectarWa();
  $$("[data-cfg]").forEach((el) => {
    const v = CFG[el.dataset.cfg];
    if (v && v !== "Por definir") el.textContent = v;
    else if (el.dataset.cfg === "whatsappVisible") el.textContent = "";
  });
  $$("[data-mail]").forEach((a) => { if (CFG.email) a.href = "mailto:" + CFG.email; });
  const y = $("#year");
  if (y) y.textContent = new Date().getFullYear();

  /* ---------- Navegación ---------- */
  const nav = $("#nav");
  const burger = $("#burger");
  if (nav) {
    const alScroll = () => nav.classList.toggle("is-stuck", scrollY > 12);
    alScroll();
    addEventListener("scroll", alScroll, { passive: true });
    const cerrar = () => {
      nav.classList.remove("is-open");
      burger?.setAttribute("aria-expanded", "false");
      burger?.setAttribute("aria-label", "Abrir menú");
      document.body.style.overflow = "";
    };
    burger?.addEventListener("click", () => {
      const abierto = nav.classList.toggle("is-open");
      burger.setAttribute("aria-expanded", String(abierto));
      burger.setAttribute("aria-label", abierto ? "Cerrar menú" : "Abrir menú");
      document.body.style.overflow = abierto ? "hidden" : "";
    });
    $$("#menu a").forEach((a) => a.addEventListener("click", cerrar));
    addEventListener("keydown", (e) => e.key === "Escape" && cerrar());
  }

  /* ---------- Portafolio: casos de ejemplo con antes y después ---------- */
  const CASOS = [
    { nombre: "Inocua", marca: "Perú", viejo: "INOCUA PERU S.A.C.", rubro: "Consultora de inocuidad alimentaria", plan: "Landing Estándar", mc: "#5eead4", mbg: "#051110",
      mini: "● HACCP · BRCGS · BPM", titulo: "Implementa HACCP con un equipo que conoce tu planta", sub: "Diagnóstico, implementación y auditoría interna.", cta: "Agendar diagnóstico",
      desc: "De una página sin mensaje claro a una landing con servicios, casos y botón de WhatsApp." },
    { nombre: "Andina", marca: "QHSE", viejo: "ANDINA QHSE CONSULTORES", rubro: "Consultora QHSE", plan: "Web Premium con IA", mc: "#f59e0b", mbg: "#0b101c",
      mini: "● ISO 9001 · 14001 · 45001", titulo: "Certifica tu planta sin detener tu operación", sub: "Calculadora con IA de plazos y alcance.", cta: "Calcular mi proyecto",
      desc: "Web con calculadora de alcance y asistente que deja los contactos listos para el equipo comercial." },
    { nombre: "Lab", marca: "Ambiental", viejo: "LABORATORIO AMBIENTAL DEL SUR", rubro: "Laboratorio de monitoreo ambiental", plan: "Web Corporativa", mc: "#8ab4ff", mbg: "#070a12",
      mini: "● Monitoreo de agua, aire y suelo", titulo: "Resultados confiables para tus informes ambientales", sub: "Una página por cada línea de servicio.", cta: "Solicitar cotización",
      desc: "Sitio de varias páginas con cada servicio explicado y una estructura SEO más amplia." },
    { nombre: "Raíz", marca: "Natural", viejo: "PRODUCTOS NATURALES RAIZ", rubro: "Marca de productos naturales", plan: "Web Premium con IA", mc: "#d9480f", mbg: "#f5f1e8", claro: true,
      mini: "● Superfoods peruanos", titulo: "Lo mejor de los Andes, directo a tu mesa", sub: "Recomendador con IA y pedido por WhatsApp.", cta: "Armar mi pedido",
      desc: "De vender solo por Instagram a una web propia con recomendador y pedidos ordenados por WhatsApp." },
  ];
  const cont = $("#cases");
  if (cont) {
    cont.innerHTML = CASOS.map((c, i) => `
      <article class="case rv">
        <div class="ba" style="--pos:62%">
          <div class="ms${c.claro ? " ms--light" : ""}" style="--mc:${c.mc};--mbg:${c.mbg}" aria-hidden="true">
            <div class="ms__nav"><b>${c.nombre}<em>${c.marca}</em></b><u>Servicios</u><u>Casos</u><u>Nosotros</u><span>Contacto</span></div>
            <div class="ms__hero">
              <div><small>${c.mini}</small><strong>${c.titulo}</strong><p>${c.sub}</p><div class="ms__cta"><span>${c.cta}</span><span>WhatsApp</span></div></div>
              <div class="ms__panel"><div class="ms__ring"><svg viewBox="0 0 40 40"><circle cx="20" cy="20" r="16"/><circle cx="20" cy="20" r="16"/></svg><b>IA</b></div><i></i><i></i><i></i></div>
            </div>
            <div class="ms__cards"><i></i><i></i><i></i></div>
          </div>
          <div class="ba__before" aria-hidden="true">
            <div class="old">
              <div class="old__top">${c.viejo}</div>
              <div class="old__menu">Inicio | Quienes Somos | Servicios | Contactenos</div>
              <div class="old__body"><div class="old__img"></div><div class="old__txt"><b>Bienvenidos a nuestra pagina web</b><i></i><i></i><i></i><i></i><em>Sitio en construccion</em></div></div>
              <div class="old__foot">Copyright 2011 · Todos los derechos reservados · Visitas: 001284</div>
            </div>
          </div>
          <span class="ba__lbl ba__lbl--b">Antes</span><span class="ba__lbl ba__lbl--a">Después</span>
          <span class="ba__handle"></span>
          <input class="ba__range" type="range" min="0" max="100" value="62" aria-label="Comparar antes y después: ${c.rubro}">
        </div>
        <div class="case__meta">
          <span class="tag">Proyecto de ejemplo</span><span class="tag tag--lime">${c.plan}</span>
          <h3>${c.rubro}</h3><p>${c.desc}</p>
        </div>
      </article>`).join("");
    $$(".ba__range", cont).forEach((r) => {
      const ba = r.closest(".ba");
      r.addEventListener("input", () => ba.style.setProperty("--pos", r.value + "%"));
    });
  }

  /* ---------- Aparición al hacer scroll ---------- */
  const rvs = $$(".rv");
  rvs.forEach((el) => {
    const hermanos = [...el.parentElement.children].filter((n) => n.classList.contains("rv"));
    el.style.setProperty("--d", Math.min(hermanos.indexOf(el), 5) * 0.08 + "s");
  });
  if ("IntersectionObserver" in window && !reduce) {
    const io = new IntersectionObserver((es) => es.forEach((e) => {
      if (e.isIntersecting) { e.target.classList.add("in"); io.unobserve(e.target); }
    }), { rootMargin: "0px 0px -8% 0px", threshold: 0.08 });
    rvs.forEach((el) => io.observe(el));
  } else rvs.forEach((el) => el.classList.add("in"));

  /* ---------- Hero: profundidad con el puntero ---------- */
  const stage = $("#stage");
  if (stage && !reduce && matchMedia("(pointer: fine)").matches) {
    const capas = $$("[data-depth]", stage);
    const laptop = $(".laptop", stage);
    let raf = 0;
    $(".hero").addEventListener("pointermove", (e) => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => {
        const r = stage.getBoundingClientRect();
        const x = (e.clientX - r.left - r.width / 2) / r.width;
        const yv = (e.clientY - r.top - r.height / 2) / r.height;
        laptop.style.setProperty("--ry", x * 7 + "deg");
        laptop.style.setProperty("--rx", -yv * 5 + "deg");
        capas.forEach((c) => {
          if (c === laptop) return;
          const d = Number(c.dataset.depth) / 4;
          c.style.translate = `${x * d}px ${yv * d}px`;
        });
      });
    });
  }

  /* ---------- Brillo que sigue al puntero en las tarjetas ---------- */
  $$(".b").forEach((b) => b.addEventListener("pointermove", (e) => {
    const r = b.getBoundingClientRect();
    b.style.setProperty("--px", e.clientX - r.left + "px");
    b.style.setProperty("--py", e.clientY - r.top + "px");
  }));

  /* ---------- Proceso: línea de avance ---------- */
  const steps = $("#steps");
  if (steps) {
    const fill = $("#stepsFill");
    const items = $$(".step", steps);
    const avance = () => {
      const r = steps.getBoundingClientRect();
      const corte = innerHeight * 0.62;
      const p = Math.max(0, Math.min(1, (corte - r.top - 24) / (r.height - 48)));
      fill.style.setProperty("--p", p.toFixed(3));
      items.forEach((it) => {
        const n = it.firstElementChild.getBoundingClientRect();
        it.classList.toggle("is-done", n.top + n.height / 2 < corte);
      });
    };
    avance();
    addEventListener("scroll", avance, { passive: true });
    addEventListener("resize", avance);
  }

  /* ---------- Utilidad: POST JSON ---------- */
  async function post(ruta, datos) {
    const r = await fetch(ruta, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(datos) });
    const j = await r.json().catch(() => ({}));
    if (!r.ok) throw Object.assign(new Error(j.error || "Error"), { estado: r.status });
    return j;
  }
  const telOk = (v) => { const d = v.replace(/\D/g, ""); return d.length >= 9 && d.length <= 13; };
  const mailOk = (v) => /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v);

  /* ---------- Diagnóstico digital express ---------- */
  const dxForm = $("#dxForm");
  if (dxForm) {
    const pasos = $$(".dx__step", dxForm);
    const bar = $("#dxBar"), err = $("#dxErr"), back = $("#dxBack"), next = $("#dxNext");
    const load = $("#dxLoad"), res = $("#dxRes"), card = $("#dxCard");
    const file = $("#dxFile"), prev = $("#dxPrev"), drop = $("#dxDrop");
    let paso = 1, imagen = null, iniciado = false;
    const val = (n) => dxForm.elements[n];
    const marcado = (n) => $(`input[name="${n}"]:checked`, dxForm)?.value || "";

    const mostrar = (n, foco = true) => {
      paso = n;
      pasos.forEach((p) => p.classList.toggle("is-on", Number(p.dataset.step) === n));
      bar.style.width = (n / pasos.length) * 100 + "%";
      back.hidden = n === 1;
      err.textContent = "";
      next.innerHTML = n === pasos.length
        ? 'Ver mi diagnóstico <svg><use href="#i-spark"/></svg>'
        : n === 5 && !imagen ? 'Omitir este paso <svg><use href="#i-arrow"/></svg>' : 'Continuar <svg><use href="#i-arrow"/></svg>';
      if (foco) pasos[n - 1].querySelector("input:not([type=file]), select")?.focus({ preventScroll: true });
    };

    const validar = () => {
      if (paso === 1 && !marcado("rubro")) return "Elige el rubro de tu negocio.";
      if (paso === 2 && !marcado("web")) return "Indícanos si tienes página web.";
      if (paso === 3 && !$$('input[name="canales"]:checked', dxForm).length) return "Marca al menos un canal.";
      if (paso === 4 && !marcado("objetivo")) return "Elige tu objetivo principal.";
      if (paso === 6) {
        if (!val("nombre").value.trim()) return "Escribe tu nombre.";
        if (!mailOk(val("email").value.trim())) return "Revisa tu correo.";
        if (!telOk(val("whatsapp").value)) return "Revisa tu número de WhatsApp.";
        if (!val("consentimiento").checked) return "Necesitamos tu autorización para tratar tus datos.";
      }
      return "";
    };

    // En las preguntas de una sola opción se avanza solo al elegir.
    dxForm.addEventListener("change", (e) => {
      if (!iniciado) { iniciado = true; track("diagnostico_inicio"); }
      if (e.target.name === "web") $("#dxUrlWrap").hidden = e.target.value !== "si";
      if (e.target.type === "radio" && !(e.target.name === "web" && e.target.value === "si")) {
        setTimeout(() => { if (!validar()) mostrar(paso + 1, false); }, 260);
      }
    });
    back.addEventListener("click", () => mostrar(paso - 1));
    next.addEventListener("click", () => {
      const m = validar();
      if (m) { err.textContent = m; return; }
      if (paso < pasos.length) mostrar(paso + 1);
      else enviar();
    });
    dxForm.addEventListener("submit", (e) => { e.preventDefault(); next.click(); });

    // Captura opcional: se reduce en el navegador antes de enviarla.
    file.addEventListener("change", async () => {
      const f = file.files[0];
      imagen = null; prev.hidden = true; drop.classList.remove("is-on");
      if (!f) return mostrar(5, false);
      if (!/^image\/(png|jpeg|webp)$/.test(f.type) || f.size > 15 * 1024 * 1024) {
        err.textContent = "Usa una imagen JPG, PNG o WEBP de hasta 15 MB.";
        file.value = "";
        return;
      }
      try {
        const bmp = await createImageBitmap(f);
        const k = Math.min(1, 1280 / Math.max(bmp.width, bmp.height));
        const c = document.createElement("canvas");
        c.width = Math.round(bmp.width * k); c.height = Math.round(bmp.height * k);
        c.getContext("2d").drawImage(bmp, 0, 0, c.width, c.height);
        imagen = c.toDataURL("image/jpeg", 0.82);
        prev.src = imagen; prev.hidden = false; drop.classList.add("is-on");
        $("#dxDropTxt").textContent = "Captura lista. Toca para cambiarla";
        mostrar(5, false);
      } catch {
        err.textContent = "No pudimos leer esa imagen. Prueba con otra.";
        file.value = "";
      }
    });

    const MENSAJES = ["Analizando tus respuestas…", "Revisando tus canales…", "Priorizando mejoras…", "Eligiendo el plan que te conviene…"];
    async function enviar() {
      dxForm.hidden = true; load.hidden = false;
      let i = 0;
      const txt = $("#dxLoadTxt");
      const reloj = setInterval(() => { txt.textContent = MENSAJES[++i % MENSAJES.length]; }, 1700);
      const datos = {
        rubro: marcado("rubro"), web: marcado("web"), url: val("url").value.trim(),
        canales: $$('input[name="canales"]:checked', dxForm).map((c) => c.value),
        objetivo: marcado("objetivo"), imagen,
        nombre: val("nombre").value.trim(), email: val("email").value.trim(), whatsapp: val("whatsapp").value.trim(),
        consentimiento: val("consentimiento").checked, sitio: val("sitio").value,
      };
      try {
        const [r] = await Promise.all([post("/api/diagnostico", datos), new Promise((ok) => setTimeout(ok, 1800))]);
        track("lead_diagnostico", { plan: r.planNombre, puntaje: r.puntaje });
        pintar(r, datos);
      } catch (e) {
        dxForm.hidden = false;
        err.textContent = e.estado === 400 || e.estado === 429 ? e.message : "No pudimos generar tu diagnóstico en este momento. Inténtalo de nuevo o escríbenos por WhatsApp.";
      } finally {
        clearInterval(reloj); load.hidden = true;
      }
    }

    function pintar(r, d) {
      const nivel = r.puntaje >= 70 ? "Presencia sólida" : r.puntaje >= 45 ? "Presencia en desarrollo" : "Presencia por construir";
      const msg = `Hola Estatus Digital, soy ${d.nombre}. Hice el diagnóstico digital express: puntaje ${r.puntaje}/100, plan recomendado ${r.planNombre}. Quiero mi auditoría completa y una cotización.`;
      res.innerHTML = `
        <div class="res">
          <div class="res__top">
            <div class="gauge">
              <svg viewBox="0 0 180 100" aria-hidden="true"><path class="gauge__bg" d="M10 92a80 80 0 0 1 160 0"/><path class="gauge__val" d="M10 92a80 80 0 0 1 160 0"/></svg>
              <div class="gauge__num"><span id="gNum">0</span><small>/100</small></div>
            </div>
            <p class="res__lvl">${nivel}</p>
            <p class="res__sum">${esc(r.resumen)}</p>
          </div>
          <h4>Mejoras prioritarias</h4>
          <ol class="res__list">${r.mejoras.map((m) => `<li><b>${esc(m.titulo)}<span data-p="${esc(m.prioridad)}">${esc(m.prioridad)}</span></b><p>${esc(m.detalle)}</p></li>`).join("")}</ol>
          <div class="res__plan">
            <small>Plan recomendado</small>
            <strong>${esc(r.planNombre)}</strong>
            <p>${esc(r.motivo)}</p>
            <dl><div><dt>Inversión referencial</dt><dd>${esc(r.inversion)}</dd></div><div><dt>Plazo de entrega</dt><dd>${esc(r.plazo)}</dd></div></dl>
            <a class="btn btn--wa btn--block" href="#contacto" data-wa="${esc(msg)}" data-ev="cta_diagnostico_whatsapp"><svg><use href="#i-wa"/></svg>Quiero mi auditoría completa</a>
          </div>
          <p class="fine">Estimación orientativa generada ${r.fuente === "ia" ? "con inteligencia artificial" : "de forma automática"} a partir de tus respuestas${r.conCaptura ? " y de tu captura" : ""}. No hemos medido tu sitio. La auditoría completa y la cotización final las realiza una persona de nuestro equipo.</p>
        </div>`;
      res.hidden = false;
      conectarWa(res);
      card.scrollIntoView({ behavior: reduce ? "auto" : "smooth", block: "start" });
      requestAnimationFrame(() => {
        $(".gauge__val", res).style.strokeDashoffset = String(251.3 * (1 - r.puntaje / 100));
        const num = $("#gNum"), t0 = performance.now(), dur = reduce ? 1 : 1500;
        const paso = (t) => {
          const k = Math.min(1, (t - t0) / dur);
          num.textContent = Math.round(r.puntaje * (1 - Math.pow(1 - k, 3)));
          if (k < 1) requestAnimationFrame(paso);
        };
        requestAnimationFrame(paso);
      });
    }
  }

  /* ---------- Formulario de contacto ---------- */
  const cForm = $("#cForm");
  if (cForm) {
    const err = $("#cErr");
    cForm.addEventListener("submit", async (e) => {
      e.preventDefault();
      const f = cForm.elements;
      err.textContent = "";
      if (!f.nombre.value.trim()) return (err.textContent = "Escribe tu nombre.");
      if (!telOk(f.whatsapp.value)) return (err.textContent = "Revisa tu número de WhatsApp.");
      if (!f.consentimiento.checked) return (err.textContent = "Necesitamos tu autorización para tratar tus datos.");
      const btn = $("button[type=submit]", cForm);
      btn.disabled = true;
      try {
        await post("/api/lead", {
          nombre: f.nombre.value.trim(), empresa: f.empresa.value.trim(), whatsapp: f.whatsapp.value.trim(),
          necesidad: f.necesidad.value, consentimiento: true, sitio: f.sitio.value,
        });
        track("lead_contacto", { necesidad: f.necesidad.value });
        $("#cOk").hidden = false;
      } catch (e2) {
        err.textContent = e2.estado === 400 || e2.estado === 429 ? e2.message : "No pudimos enviar tus datos. Escríbenos directamente por WhatsApp.";
      } finally {
        btn.disabled = false;
      }
    });
  }

  /* ---------- Asistente de chat ---------- */
  const chat = $("#chat");
  if (chat) {
    const btn = $("#chatBtn"), log = $("#chatLog"), form = $("#chatForm"), input = $("#chatIn"), sugs = $("#chatSugs");
    const historial = [];
    let ocupado = false, saludado = false;

    // Respuestas de respaldo si la IA no está disponible.
    const LOCAL = [
      [/(precio|cuesta|costo|cuánto|cuanto|tarifa|inversi)/i, "Nuestros precios referenciales: Landing Express desde S/ 500, Landing Estándar desde S/ 1,000, Web Premium con IA desde S/ 2,500, Web Corporativa desde S/ 3,500 y Auditoría Digital 360 desde S/ 300. El monto final depende del alcance. ¿Te cotizamos por WhatsApp?"],
      [/(tiempo|plazo|demora|entrega|días|dias|cuándo|cuando)/i, "Los plazos van de 2 a 3 días para una Landing Express, 4 a 5 para una Landing Estándar, 7 a 10 para una Web Premium con IA y 10 a 15 para una Web Corporativa, desde que recibimos tu información."],
      [/(auditor|diagn)/i, "La Auditoría Digital 360 revisa SEO técnico, contenidos, experiencia de usuario y conversión de tu web, con un plan de acción priorizado. El primer diagnóstico es gratis: puedes hacerlo ahora en la sección Diagnóstico IA o pedirlo por WhatsApp."],
      [/(plan|conviene|recom|cuál|cual)/i, "Si recién empiezas, una Landing Express o Estándar suele bastar. Si quieres diferenciarte de tu competencia, la Web Premium con IA. Si tienes varias líneas de servicio, la Web Corporativa. El diagnóstico express de esta página te da una recomendación en 2 minutos."],
      [/(dominio|hosting|manten)/i, "Te ayudamos a registrar el dominio a tu nombre y a publicar la web. El mantenimiento mensual es opcional, de S/ 100 a S/ 250, e incluye hosting, cambios menores y SEO local."],
      [/(pago|factura|boleta|yape|transfer)/i, "Emitimos comprobante de pago. La forma de pago se acuerda en la propuesta, antes de empezar. El equipo te lo confirma por WhatsApp."],
    ];
    const respuestaLocal = (t) => (LOCAL.find(([re]) => re.test(t)) || [0, "En este momento no puedo responder con detalle. Escríbenos por WhatsApp y una persona del equipo te atiende, o prueba el diagnóstico digital express de esta página."])[1];

    const burbuja = (texto, quien) => {
      const d = document.createElement("div");
      d.className = "msg msg--" + quien;
      d.textContent = texto;
      log.appendChild(d);
      log.scrollTop = log.scrollHeight;
      return d;
    };

    const abrir = () => {
      chat.hidden = false;
      document.body.classList.add("chat-open");
      btn.setAttribute("aria-expanded", "true");
      if (!saludado) {
        saludado = true;
        burbuja("¡Hola! Soy el asistente de Estatus Digital. Puedo ayudarte a elegir un plan, contarte precios y plazos, o explicarte qué incluye cada servicio. ¿Qué necesitas saber?", "a");
      }
      if (matchMedia("(min-width: 640px)").matches) input.focus();
    };
    const cerrar = () => {
      chat.hidden = true;
      document.body.classList.remove("chat-open");
      btn.setAttribute("aria-expanded", "false");
      btn.focus();
    };
    btn.addEventListener("click", abrir);
    $("#chatClose").addEventListener("click", cerrar);
    $$("[data-open-chat]").forEach((b) => b.addEventListener("click", abrir));
    addEventListener("keydown", (e) => e.key === "Escape" && !chat.hidden && cerrar());

    async function preguntar(texto) {
      texto = texto.trim();
      if (!texto || ocupado) return;
      ocupado = true;
      sugs.hidden = true;
      burbuja(texto, "u");
      historial.push({ rol: "usuario", texto });
      track("chat_mensaje");
      const espera = burbuja("", "a");
      espera.innerHTML = '<span class="dots"><i></i><i></i><i></i></span>';
      let respuesta;
      try {
        respuesta = (await post("/api/chat", { mensajes: historial })).respuesta;
      } catch (e) {
        respuesta = e.estado === 429 ? e.message : respuestaLocal(texto);
      }
      espera.textContent = respuesta;
      historial.push({ rol: "asistente", texto: respuesta });
      log.scrollTop = log.scrollHeight;
      ocupado = false;
    }
    form.addEventListener("submit", (e) => { e.preventDefault(); const t = input.value; input.value = ""; preguntar(t); });
    sugs.addEventListener("click", (e) => { if (e.target.tagName === "BUTTON") preguntar(e.target.textContent); });
  }
})();
