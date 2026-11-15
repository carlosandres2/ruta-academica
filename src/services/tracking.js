/*
  Seguimiento de eventos del embudo: Pixel de Meta (navegador), GA4 y la
  API de Conversiones (servidor, vía función de Netlify).

  - Sin VITE_META_PIXEL_ID no se carga el Pixel ni se llama a la API de
    Conversiones; GA4 sigue funcionando.
  - Nunca lanza errores: el seguimiento no puede romper la página.
  - Cada evento lleva un event_id que comparten el navegador y el servidor
    para que Meta los deduplique.
*/

const PIXEL_ID = (import.meta.env.VITE_META_PIXEL_ID || "").trim();

export const pixelConfigurado = Boolean(PIXEL_ID);

const CAPI_URL = "/.netlify/functions/capi";
const UTM_KEY = "ra_utm";
const CORREO_KEY = "ra_lead_email";
const CLAVES_UTM = [
  "utm_source",
  "utm_medium",
  "utm_campaign",
  "utm_content",
  "utm_term",
  "fbclid"
];

// Evento de Meta -> evento equivalente de GA4.
const EVENTOS_GA4 = {
  Lead: "generate_lead",
  ViewContent: "view_item",
  InitiateCheckout: "begin_checkout",
  Purchase: "purchase"
};

// Eventos que se reenvían a la API de Conversiones.
const EVENTOS_CAPI = new Set(Object.keys(EVENTOS_GA4));

// Eventos en los que tiene sentido enviar el correo (hasheado en el servidor).
const EVENTOS_CON_CORREO = new Set(["Lead", "InitiateCheckout", "Purchase"]);

function leerStorage(clave) {
  try {
    return sessionStorage.getItem(clave);
  } catch {
    return null;
  }
}

function escribirStorage(clave, valor) {
  try {
    sessionStorage.setItem(clave, valor);
  } catch {
    // Sin almacenamiento disponible: se sigue sin guardar.
  }
}

function leerCookie(nombre) {
  try {
    const coincidencia = document.cookie.match(
      new RegExp(`(?:^|; )${nombre}=([^;]*)`)
    );

    return coincidencia ? decodeURIComponent(coincidencia[1]) : "";
  } catch {
    return "";
  }
}

function cargarPixel() {
  if (typeof window.fbq === "function") return;

  const fbq = function (...args) {
    if (fbq.callMethod) {
      fbq.callMethod(...args);
    } else {
      fbq.queue.push(args);
    }
  };

  window.fbq = fbq;
  window._fbq = fbq;
  fbq.push = fbq;
  fbq.loaded = true;
  fbq.version = "2.0";
  fbq.queue = [];

  const script = document.createElement("script");
  script.async = true;
  script.src = "https://connect.facebook.net/en_US/fbevents.js";
  document.head.appendChild(script);
}

/* Guarda los UTM y el fbclid de la visita (los de la URL pisan los anteriores). */
function guardarUtm() {
  try {
    const params = new URLSearchParams(window.location.search);
    const actuales = obtenerUtm();
    let cambio = false;

    CLAVES_UTM.forEach((clave) => {
      const valor = params.get(clave);

      if (valor) {
        actuales[clave] = valor.slice(0, 200);
        cambio = true;
      }
    });

    if (cambio) escribirStorage(UTM_KEY, JSON.stringify(actuales));
  } catch {
    // Sin parámetros que guardar.
  }
}

export function obtenerUtm() {
  try {
    const guardado = JSON.parse(leerStorage(UTM_KEY) || "{}");

    return guardado && typeof guardado === "object" ? guardado : {};
  } catch {
    return {};
  }
}

/* Cookie _fbc de Meta; si aún no existe y hay fbclid, se arma con su formato. */
function obtenerFbc() {
  const cookie = leerCookie("_fbc");

  if (cookie) return cookie;

  const { fbclid } = obtenerUtm();

  return fbclid ? `fb.1.${Date.now()}.${fbclid}` : "";
}

export function crearEventId() {
  if (typeof crypto !== "undefined" && crypto.randomUUID) {
    return crypto.randomUUID();
  }

  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`;
}

export function initTracking() {
  guardarUtm();

  if (!pixelConfigurado) {
    console.warn(
      "tracking: falta VITE_META_PIXEL_ID. No se carga el Pixel de Meta ni se envían eventos a la API de Conversiones."
    );
    return;
  }

  cargarPixel();
  window.fbq("init", PIXEL_ID);
  window.fbq("track", "PageView");
}

/* PageView en cambios de ruta (la primera carga ya lo envía initTracking). */
export function trackPageView() {
  try {
    if (pixelConfigurado && typeof window.fbq === "function") {
      window.fbq("track", "PageView");
    }
  } catch {
    // El seguimiento nunca debe romper la página.
  }
}

function parametrosGa4(evento, params, eventId) {
  const ga4 = {};

  if (params.value !== undefined) ga4.value = params.value;
  if (params.currency) ga4.currency = params.currency;

  if (params.content_name || params.content_ids) {
    ga4.items = [
      {
        item_id: params.content_ids?.[0],
        item_name: params.content_name
      }
    ];
  }

  if (evento === "Purchase") ga4.transaction_id = eventId;

  return ga4;
}

function enviarACapi(evento, params, eventId, correo) {
  if (!pixelConfigurado || !EVENTOS_CAPI.has(evento)) return;

  const cuerpo = {
    event_name: evento,
    event_id: eventId,
    event_source_url: window.location.href,
    fbp: leerCookie("_fbp"),
    fbc: obtenerFbc(),
    custom_data: params
  };

  if (correo) cuerpo.email = correo;

  fetch(CAPI_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(cuerpo),
    keepalive: true
  }).catch(() => {
    // Si la API de Conversiones falla, el evento del navegador ya se envió.
  });
}

export function guardarCorreoLead(correo) {
  escribirStorage(CORREO_KEY, correo);
}

function leerCorreoLead() {
  return leerStorage(CORREO_KEY) || "";
}

/*
  Registra un evento en Pixel, GA4 y API de Conversiones.
  opciones.eventId: id propio (p. ej. el número de pedido en Purchase).
  opciones.email: correo de la persona; si falta, se usa el del último Lead.
  Devuelve el event_id usado.
*/
export function track(evento, params = {}, opciones = {}) {
  const eventId = opciones.eventId || crearEventId();

  try {
    const correo = EVENTOS_CON_CORREO.has(evento)
      ? opciones.email || leerCorreoLead()
      : "";

    if (pixelConfigurado && typeof window.fbq === "function") {
      window.fbq("track", evento, params, { eventID: eventId });
    }

    if (typeof window.gtag === "function" && EVENTOS_GA4[evento]) {
      window.gtag(
        "event",
        EVENTOS_GA4[evento],
        parametrosGa4(evento, params, eventId)
      );
    }

    enviarACapi(evento, params, eventId, correo);
  } catch {
    // El seguimiento nunca debe romper la página.
  }

  return eventId;
}
