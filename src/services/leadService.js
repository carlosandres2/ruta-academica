const FORM_ACTION = (import.meta.env.VITE_LEAD_FORM_ACTION || "").trim();
const EMAIL_ENTRY = (import.meta.env.VITE_LEAD_FORM_EMAIL_ENTRY || "").trim();
const CONSENT_ENTRY = (import.meta.env.VITE_LEAD_FORM_CONSENT_ENTRY || "").trim();
// Debe coincidir exactamente con la respuesta/opción del formulario de Google.
const CONSENT_VALUE = (import.meta.env.VITE_LEAD_FORM_CONSENT_VALUE || "Sí").trim();

const TIMEOUT_MS = 5000;

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
