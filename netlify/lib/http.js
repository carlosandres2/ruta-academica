/* Utilidades compartidas por las funciones de Netlify. */

export function responder(cuerpo, estado = 200) {
  return new Response(JSON.stringify(cuerpo), {
    status: estado,
    headers: {
      "Content-Type": "application/json; charset=utf-8",
      "Cache-Control": "no-store"
    }
  });
}

/*
  Los navegadores envían Origin en los POST. Si viene y no coincide con el
  host de la función, se rechaza. Es una barrera ligera contra el uso desde
  otros sitios, no una autenticación.
*/
export function mismoOrigen(req) {
  const origen = req.headers.get("origin");

  if (!origen) return true;

  try {
    return new URL(origen).host === new URL(req.url).host;
  } catch {
    return false;
  }
}

export async function leerJson(req) {
  try {
    const cuerpo = await req.json();

    return cuerpo && typeof cuerpo === "object" ? cuerpo : null;
  } catch {
    return null;
  }
}

export const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
