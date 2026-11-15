import { obtenerUtm } from "./tracking";

const FORM_ACTION = (import.meta.env.VITE_LEAD_FORM_ACTION || "").trim();
const EMAIL_ENTRY = (import.meta.env.VITE_LEAD_FORM_EMAIL_ENTRY || "").trim();
const CONSENT_ENTRY = (import.meta.env.VITE_LEAD_FORM_CONSENT_ENTRY || "").trim();
// Debe coincidir exactamente con la respuesta/opción del formulario de Google.
const CONSENT_VALUE = (import.meta.env.VITE_LEAD_FORM_CONSENT_VALUE || "Sí").trim();

const TIMEOUT_MS = 5000;
const SUBSCRIBE_URL = "/.netlify/functions/subscribe";
const SUBSCRIBE_TIMEOUT_MS = 8000;

export const TEMPLATE_URL = encodeURI(
  `${import.meta.env.BASE_URL}Ruta_Academica_plantilla.xlsx`
);
export const TEMPLATE_FILENAME = "Ruta_Academica_plantilla.xlsx";

export const leadFormConfigurado = Boolean(FORM_ACTION && EMAIL_ENTRY);

export function descargarPlantilla() {
  const enlace = document.createElement("a");
  enlace.href = TEMPLATE_URL;
  enlace.download = TEMPLATE_FILENAME;
  document.body.appendChild(enlace);
  enlace.click();
  enlace.remove();
}

/*
  Envía el correo al formulario de Google en segundo plano.
  Con mode "no-cors" la respuesta es opaca: no se puede saber si
  el envío tuvo éxito. Nunca lanza errores ni registra el correo.
*/
/*
  Suscribe el correo en MailerLite (grupo del reto) a través de la función
  de Netlify, que guarda el token en el servidor. Los UTM de la visita viajan
  para guardarlos en campos personalizados de MailerLite, si existen.
  Devuelve true/false y nunca lanza errores: la descarga no depende de esto.
*/
export async function suscribirCorreo(correo) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), SUBSCRIBE_TIMEOUT_MS);

  try {
    const respuesta = await fetch(SUBSCRIBE_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: correo, utm: obtenerUtm() }),
      signal: controller.signal
    });

    return respuesta.ok;
  } catch {
    console.warn(
      "No se pudo suscribir el correo en MailerLite. La descarga no se ve afectada."
    );
    return false;
  } finally {
    clearTimeout(timer);
  }
}

export async function enviarCorreoPlantilla(correo) {
  if (!leadFormConfigurado) return;

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);

  try {
    const datos = new URLSearchParams({ [EMAIL_ENTRY]: correo });

    if (CONSENT_ENTRY) {
      datos.set(CONSENT_ENTRY, CONSENT_VALUE);
    }

    await fetch(FORM_ACTION, {
      method: "POST",
      mode: "no-cors",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: datos,
      signal: controller.signal
    });
  } catch {
    console.warn(
      "No se pudo enviar el correo al formulario. La descarga no se ve afectada."
    );
  } finally {
    clearTimeout(timer);
  }
}
