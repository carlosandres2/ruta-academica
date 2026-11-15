/*
  POST /.netlify/functions/capi
  Cuerpo: { event_name, event_id, event_source_url, email?, fbp?, fbc?,
            custom_data?: { value, currency, content_name, content_ids,
                            content_type, num_items } }

  Reenvía un evento a la API de Conversiones de Meta. Comparte event_id con
  el Pixel del navegador para que Meta deduplique los dos envíos.

  Variables de entorno (panel de Netlify, nunca en el repo):
    META_PIXEL_ID           id del Pixel / conjunto de datos
    META_CAPI_TOKEN         token de acceso de la API de Conversiones
    META_TEST_EVENT_CODE    (opcional) código de "Probar eventos"; mientras
                            exista, los eventos NO cuentan como reales
    META_GRAPH_VERSION      (opcional) versión de la Graph API, p. ej. v25.0
*/
import { createHash } from "node:crypto";

import {
  EMAIL_REGEX,
  leerJson,
  mismoOrigen,
  responder
} from "../lib/http.js";

const EVENTOS_PERMITIDOS = new Set([
  "PageView",
  "ViewContent",
  "Lead",
  "InitiateCheckout",
  "Purchase"
]);

const VERSION_POR_DEFECTO = "v25.0";
const FORMATO_FB = /^fb\.\d\.\d+\.[\w-]+$/;

function sha256(texto) {
  return createHash("sha256").update(texto).digest("hex");
}

function cadena(valor, max) {
  return typeof valor === "string" ? valor.slice(0, max) : undefined;
}

/* Deja pasar solo los campos de custom_data que el embudo usa. */
function limpiarCustomData(datos) {
  const limpio = {};

  if (!datos || typeof datos !== "object") return limpio;

  if (typeof datos.value === "number" && Number.isFinite(datos.value) && datos.value >= 0) {
    limpio.value = datos.value;
  }

  if (typeof datos.currency === "string" && /^[A-Za-z]{3}$/.test(datos.currency)) {
    limpio.currency = datos.currency.toUpperCase();
  }

  const nombre = cadena(datos.content_name, 150);
  if (nombre) limpio.content_name = nombre;

  const tipo = cadena(datos.content_type, 50);
  if (tipo) limpio.content_type = tipo;

  if (Array.isArray(datos.content_ids)) {
    limpio.content_ids = datos.content_ids
      .filter((id) => typeof id === "string")
      .slice(0, 10)
      .map((id) => id.slice(0, 100));
  }

  if (Number.isInteger(datos.num_items) && datos.num_items > 0) {
    limpio.num_items = Math.min(datos.num_items, 100);
  }

  return limpio;
}

export default async (req, context) => {
  if (req.method !== "POST") {
    return responder({ ok: false, error: "method_not_allowed" }, 405);
  }

  if (!mismoOrigen(req)) {
    return responder({ ok: false, error: "forbidden" }, 403);
  }

  const pixelId = process.env.META_PIXEL_ID || process.env.VITE_META_PIXEL_ID;
  const token = process.env.META_CAPI_TOKEN;

  if (!pixelId || !token) {
    return responder({ ok: false, error: "not_configured" }, 503);
  }

  const cuerpo = await leerJson(req);

  if (!cuerpo || !EVENTOS_PERMITIDOS.has(cuerpo.event_name)) {
    return responder({ ok: false, error: "invalid_event" }, 400);
  }

  const eventId = cadena(cuerpo.event_id, 128);
  const url = cadena(cuerpo.event_source_url, 2000);

  if (!eventId || !url || !/^https?:\/\//.test(url)) {
    return responder({ ok: false, error: "invalid_payload" }, 400);
  }

  const userData = {
    client_ip_address:
      context?.ip || req.headers.get("x-nf-client-connection-ip") || undefined,
    client_user_agent: cadena(req.headers.get("user-agent"), 500)
  };

  if (typeof cuerpo.fbp === "string" && FORMATO_FB.test(cuerpo.fbp)) {
    userData.fbp = cuerpo.fbp;
  }

  if (typeof cuerpo.fbc === "string" && FORMATO_FB.test(cuerpo.fbc)) {
    userData.fbc = cuerpo.fbc;
  }

  const email = String(cuerpo.email ?? "")
    .trim()
    .toLowerCase();

  if (email && email.length <= 254 && EMAIL_REGEX.test(email)) {
    userData.em = [sha256(email)];
  }

  const evento = {
    event_name: cuerpo.event_name,
    event_time: Math.floor(Date.now() / 1000),
    event_id: eventId,
    event_source_url: url,
    action_source: "website",
    user_data: userData
  };

  const customData = limpiarCustomData(cuerpo.custom_data);

  if (Object.keys(customData).length > 0) evento.custom_data = customData;

  const payload = { data: [evento] };

  if (process.env.META_TEST_EVENT_CODE) {
    payload.test_event_code = process.env.META_TEST_EVENT_CODE;
  }

  const version = process.env.META_GRAPH_VERSION || VERSION_POR_DEFECTO;
  const destino = `https://graph.facebook.com/${version}/${encodeURIComponent(
    pixelId
  )}/events?access_token=${encodeURIComponent(token)}`;

  try {
    const respuesta = await fetch(destino, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });

    if (respuesta.ok) {
      return responder({ ok: true });
    }

    // Se registra el mensaje de error de Meta, nunca la URL (lleva el token).
    const error = await respuesta.json().catch(() => null);

    console.error(
      "capi: Meta respondió",
      respuesta.status,
      error?.error?.message ?? ""
    );
    return responder({ ok: false, error: "upstream_error" }, 502);
  } catch {
    console.error("capi: no se pudo contactar a Meta");
    return responder({ ok: false, error: "upstream_unreachable" }, 502);
  }
};
