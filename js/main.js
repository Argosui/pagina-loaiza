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

  // Header sólido al hacer scroll
  const header = document.querySelector(".header");
  const alScroll = () => header.classList.toggle("solido", window.scrollY > 40);
  alScroll();
  window.addEventListener("scroll", alScroll, { passive: true });

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

  // Carrusel de frases
  const carrusel = document.querySelector(".carrusel");
  if (carrusel) {
    const frases = [...carrusel.querySelectorAll(".frase")];
    const puntos = [...document.querySelectorAll(".puntos button")];
    let actual = 0;
    let temporizador;
    const mostrar = (i) => {
      actual = (i + frases.length) % frases.length;
      frases.forEach((f, j) => f.classList.toggle("activa", j === actual));
      puntos.forEach((p, j) => p.setAttribute("aria-selected", j === actual));
    };
    const reiniciar = () => {
      clearInterval(temporizador);
      temporizador = setInterval(() => mostrar(actual + 1), 7000);
    };
    puntos.forEach((p, j) => p.addEventListener("click", () => { mostrar(j); reiniciar(); }));
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
      form.querySelectorAll("input, textarea").forEach((campo) => {
        campo.value = campo.value.trim();
        const ok = campo.checkValidity();
        campo.setAttribute("aria-invalid", ok ? "false" : "true");
        if (!ok && valido) { campo.focus(); valido = false; }
      });
      aviso.hidden = valido;
      if (!valido) return;
      const d = Object.fromEntries(new FormData(form));
      const texto =
        `Hola Sr. Loaiza, conversemos.\n\n` +
        `Nombre: ${d.nombre}\nCorreo: ${d.correo}\nCelular: ${d.celular}\n\n` +
        `¿Qué deseo resolver en mi hotel?\n${d.mensaje}`;
      window.open(`https://wa.me/${WHATSAPP_NUMERO}?text=${encodeURIComponent(texto)}`, "_blank", "noopener");
    });
  }

  const anio = document.querySelector("[data-anio]");
  if (anio) anio.textContent = new Date().getFullYear();
});
