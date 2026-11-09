/* =========================================================
   LOAIZA · Estratega Hotelero — comportamiento del sitio
   ========================================================= */

/* PENDIENTE (Kata confirma): número de WhatsApp con código de país, solo dígitos.
   Ejemplo México: "5215512345678". Mientras esté vacío, los botones abren WhatsApp
   con el mensaje listo y el usuario elige el contacto. */
const WHATSAPP_NUMERO = "";

/* PENDIENTE (Kata confirma): URL exacta del perfil de LinkedIn. */
const LINKEDIN_URL = "https://www.linkedin.com/";

const MENSAJES_WA = {
  general: "Hola Sr. Loaiza, quiero agendar una conversación.",
  consultoria: "Hola Sr. Loaiza, me interesa hablar de una consultoría.",
  servicio1: "Hola Sr. Loaiza, quiero cotizar el servicio El Costo Oculto.",
  servicio2: "Hola Sr. Loaiza, quiero cotizar el servicio Análisis de Ingresos y Rentabilidad.",
  servicio3: "Hola Sr. Loaiza, quiero cotizar el servicio Diagnóstico del Ciclo Completo.",
  formacion: "Hola Sr. Loaiza, me interesa la formación de directivos.",
  conferencias: "Hola Sr. Loaiza, quiero solicitar una propuesta para mi evento."
};

document.addEventListener("DOMContentLoaded", () => {
  // Enlaces de WhatsApp: <a data-wa="consultoria">
  document.querySelectorAll("[data-wa]").forEach((a) => {
    const texto = MENSAJES_WA[a.dataset.wa] || MENSAJES_WA.general;
    a.href = `https://wa.me/${WHATSAPP_NUMERO}?text=${encodeURIComponent(texto)}`;
    a.target = "_blank";
    a.rel = "noopener";
  });

  document.querySelectorAll("[data-linkedin]").forEach((a) => {
    a.href = LINKEDIN_URL;
    a.target = "_blank";
    a.rel = "noopener";
  });

  document.querySelectorAll("[data-wa-numero]").forEach((el) => {
    if (WHATSAPP_NUMERO) el.textContent = "+" + WHATSAPP_NUMERO;
  });

  // Header: se esconde al bajar y reaparece al subir
  const header = document.querySelector(".header");
  let yPrevia = window.scrollY;
  const alScroll = () => {
    const y = Math.max(window.scrollY, 0);
    const delta = y - yPrevia;
    if (Math.abs(delta) < 6) return; // ignora micro-movimientos
    const bajando = delta > 0 && y > header.offsetHeight;
    header.classList.toggle("escondido", bajando);
    yPrevia = y;
  };
  window.addEventListener("scroll", alScroll, { passive: true });
  // Si el foco del teclado entra al header, se muestra
  header.addEventListener("focusin", () => header.classList.remove("escondido"));

  // Menú móvil
  const toggle = document.querySelector(".menu-toggle");
  toggle.addEventListener("click", () => {
    const abierto = document.body.classList.toggle("menu-abierto");
    toggle.setAttribute("aria-expanded", abierto);
    document.body.style.overflow = abierto ? "hidden" : "";
  });
  document.querySelectorAll(".nav a").forEach((a) =>
    a.addEventListener("click", () => {
      document.body.classList.remove("menu-abierto");
      document.body.style.overflow = "";
    })
  );

  // Revelado al entrar en pantalla
  const observador = new IntersectionObserver(
    (entradas) => {
      entradas.forEach((e) => {
        if (!e.isIntersecting) return;
        e.target.classList.add("visible");
        if (e.target.matches("[data-contar]")) contar(e.target);
        observador.unobserve(e.target);
      });
    },
    { threshold: 0.18, rootMargin: "0px 0px -40px 0px" }
  );
  document.querySelectorAll(".revelar, [data-contar]").forEach((el) => observador.observe(el));

  // Contador animado para las cifras
  function contar(el) {
    const fin = parseInt(el.dataset.contar, 10);
    const salida = el.querySelector(".valor");
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      salida.textContent = fin;
      return;
    }
    const duracion = 1600;
    const inicio = performance.now();
    const paso = (t) => {
      const p = Math.min((t - inicio) / duracion, 1);
      salida.textContent = Math.round(fin * (1 - Math.pow(1 - p, 3)));
      if (p < 1) requestAnimationFrame(paso);
    };
    requestAnimationFrame(paso);
  }

  // Carrusel de fotos (Sobre mí): avanza solo cada 3.5 s, con flechas y puntos.
  // Muestra 3 fotos por vista en escritorio y 1 en móvil (lo define el CSS).
  const carrusel = document.querySelector(".carrusel-fotos");
  if (carrusel) {
    const pista = carrusel.querySelector(".carrusel-pista");
    const slides = [...pista.children];
    const contPuntos = document.querySelector(".carrusel-puntos");
    let actual = 0;
    let temporizador;
    const porVista = () => Math.max(1, Math.round(pista.clientWidth / slides[0].getBoundingClientRect().width));
    const paginas = () => Math.ceil(slides.length / porVista());

    const pintarPuntos = () => {
      contPuntos.innerHTML = "";
      for (let i = 0; i < paginas(); i++) {
        const b = document.createElement("button");
        b.type = "button";
        b.setAttribute("aria-label", `Ir al grupo de fotos ${i + 1}`);
        b.addEventListener("click", () => { mostrar(i); reiniciar(); });
        contPuntos.appendChild(b);
      }
    };
    const mostrar = (i) => {
      const total = paginas();
      actual = (i + total) % total;
      const primera = Math.min(actual * porVista(), slides.length - porVista());
      pista.style.transform = `translateX(${-slides[primera].offsetLeft}px)`;
      [...contPuntos.children].forEach((p, j) => p.setAttribute("aria-current", j === actual));
    };
    const reiniciar = () => {
      clearInterval(temporizador);
      if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
      temporizador = setInterval(() => mostrar(actual + 1), 3500);
    };

    carrusel.querySelector(".anterior").addEventListener("click", () => { mostrar(actual - 1); reiniciar(); });
    carrusel.querySelector(".siguiente").addEventListener("click", () => { mostrar(actual + 1); reiniciar(); });
    carrusel.addEventListener("mouseenter", () => clearInterval(temporizador));
    carrusel.addEventListener("mouseleave", reiniciar);

    // Deslizar con el dedo en móvil
    let x0 = null;
    pista.addEventListener("touchstart", (e) => { x0 = e.touches[0].clientX; }, { passive: true });
    pista.addEventListener("touchend", (e) => {
      if (x0 === null) return;
      const dx = e.changedTouches[0].clientX - x0;
      if (Math.abs(dx) > 40) { mostrar(actual + (dx < 0 ? 1 : -1)); reiniciar(); }
      x0 = null;
    });

    let ancho = window.innerWidth;
    window.addEventListener("resize", () => {
      if (window.innerWidth === ancho) return;
      ancho = window.innerWidth;
      pintarPuntos();
      mostrar(Math.min(actual, paginas() - 1));
    });

    pintarPuntos();
    mostrar(0);
    reiniciar();
  }

  // Subnavegación de Servicios: resalta la sección visible
  const subnav = document.querySelectorAll(".subnav a");
  if (subnav.length) {
    const secciones = [...subnav].map((a) => document.querySelector(a.getAttribute("href")));
    const marcar = () => {
      const y = window.scrollY + 200;
      let activa = 0;
      secciones.forEach((s, i) => { if (s.offsetTop <= y) activa = i; });
      subnav.forEach((a, i) => a.classList.toggle("activo", i === activa));
    };
    marcar();
    window.addEventListener("scroll", marcar, { passive: true });
  }

  // Formulario "Conversemos": valida y abre WhatsApp con los datos escritos
  const form = document.querySelector("[data-form-contacto]");
  if (form) {
    const aviso = form.querySelector(".form-error");
    form.addEventListener("submit", (ev) => {
      ev.preventDefault();
      let valido = true;
      form.querySelectorAll("input, textarea, select").forEach((campo) => {
        if (campo.matches("input:not([type=checkbox]), textarea")) campo.value = campo.value.trim();
        const ok = campo.checkValidity();
        campo.setAttribute("aria-invalid", ok ? "false" : "true");
        if (!ok && valido) { campo.focus(); valido = false; }
      });
      aviso.hidden = valido;
      if (!valido) return;
      const d = Object.fromEntries(new FormData(form));
      const texto =
        `Hola Sr. Loaiza, conversemos.\n\n` +
        `Nombre: ${d.nombre}\nCorreo: ${d.correo}\nCargo: ${d.cargo}\nHotel / empresa: ${d.hotel}\n` +
        `País o región: ${d.pais}\n` +
        (d.habitaciones ? `Habitaciones: ${d.habitaciones}\n` : "") +
        `Servicio de interés: ${d.servicio}\n` +
        (d.inicio ? `¿Cuándo empezar?: ${d.inicio}\n` : "") +
        `\n¿Qué situación me preocupa más?\n${d.mensaje}`;
      window.open(`https://wa.me/${WHATSAPP_NUMERO}?text=${encodeURIComponent(texto)}`, "_blank", "noopener");
    });
  }

  const anio = document.querySelector("[data-anio]");
  if (anio) anio.textContent = new Date().getFullYear();
});
