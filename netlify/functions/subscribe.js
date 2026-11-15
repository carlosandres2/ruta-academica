/*
  POST /.netlify/functions/subscribe
  Cuerpo: { email, utm?: { utm_source, utm_medium, utm_campaign, ... } }

  Crea o actualiza al suscriptor en MailerLite y lo agrega al grupo del reto.
  La automatización de MailerLite "al unirse al grupo" envía la secuencia.

  Variables de entorno (panel de Netlify, nunca en el repo):
    MAILERLITE_API_TOKEN   token de la API de MailerLite
    MAILERLITE_GROUP_ID    id del grupo "Reto 3 días"
*/
import {
  EMAIL_REGEX,
  leerJson,
  mismoOrigen,
  responder
} from "../lib/http.js";

const MAILERLITE_URL = "https://connect.mailerlite.com/api/subscribers";

// Campos personalizados de MailerLite (clave = clave del campo). MailerLite
// ignora las claves que no existan, así que no falla si aún no se crean.
const CAMPOS_UTM = ["utm_source", "utm_medium", "utm_campaign", "utm_content"];

function camposDesdeUtm(utm) {
  const campos = {};

  if (!utm || typeof utm !== "object") return campos;

  CAMPOS_UTM.forEach((clave) => {
    const valor = utm[clave];

    if (typeof valor === "string" && valor) {
      campos[clave] = valor.slice(0, 100);
    }
  });

  return campos;
}

export default async (req) => {
  if (req.method !== "POST") {
    return responder({ ok: false, error: "method_not_allowed" }, 405);
  }

  if (!mismoOrigen(req)) {
    return responder({ ok: false, error: "forbidden" }, 403);
  }

  const token = process.env.MAILERLITE_API_TOKEN;
  const grupo = process.env.MAILERLITE_GROUP_ID;

  if (!token || !grupo) {
    console.error("subscribe: faltan MAILERLITE_API_TOKEN o MAILERLITE_GROUP_ID");
    return responder({ ok: false, error: "not_configured" }, 503);
  }

  const cuerpo = await leerJson(req);
  const email = String(cuerpo?.email ?? "")
    .trim()
    .toLowerCase();

  if (email.length > 254 || !EMAIL_REGEX.test(email)) {
    return responder({ ok: false, error: "invalid_email" }, 400);
  }

  const datos = { email, groups: [String(grupo)] };
  const fields = camposDesdeUtm(cuerpo.utm);

  if (Object.keys(fields).length > 0) datos.fields = fields;

  try {
    const respuesta = await fetch(MAILERLITE_URL, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
        Accept: "application/json"
      },
      body: JSON.stringify(datos)
    });

    // 201 = suscriptor nuevo, 200 = ya existía y se actualizó.
    if (respuesta.status === 200 || respuesta.status === 201) {
      return responder({ ok: true });
    }

    // No se registra el correo, solo el código de estado.
    console.error("subscribe: MailerLite respondió", respuesta.status);
    return responder({ ok: false, error: "upstream_error" }, 502);
  } catch {
    console.error("subscribe: no se pudo contactar a MailerLite");
    return responder({ ok: false, error: "upstream_unreachable" }, 502);
  }
};
