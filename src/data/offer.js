/*
  Fuente única de la oferta y del reto de lanzamiento.
  La usan la landing, la Sales Page, el checkout simulado y el seguimiento
  de eventos (Lead, ViewContent, InitiateCheckout, Purchase).

  El nombre, la propuesta y lo que incluye el producto son textos de prueba
  aprobados por el equipo para validar el embudo. Si cambian por los
  definitivos de la fase 1, basta con editar este archivo. Con
  `provisional: true` la app muestra un aviso en la consola en desarrollo.
*/

export const PRODUCT = {
  provisional: false,
  id: "ruta-academica-plus",
  name: "Ruta Académica Plus",
  headline: "Pasa de tener tareas sueltas a un semestre con plan",
  tagline:
    "La versión completa para organizar tus asignaturas, entregas y prioridades en un solo archivo de Excel.",
  price: 15000,
  currency: "COP",
  includes: [
    "La plantilla de Excel con todas las hojas: Actividades, Semana, Carga y Progreso.",
    "Una guía paso a paso para armar tu semestre.",
    "Los materiales de los 3 días del reto en un solo lugar."
  ]
};

export const CHALLENGE = {
  name: "Reto de 3 días: organiza tu semestre",
  // `date` en formato "AAAA-MM-DD". Si falta o es inválida, no se muestra.
  days: [
    {
      date: "2026-12-12",
      title: "Día 1: reúne tus entregas",
      text: "Escribe en la hoja Actividades todas las entregas que tienes en el semestre."
    },
    {
      date: "2026-12-13",
      title: "Día 2: define prioridades",
      text: "Asigna prioridad y estado a cada actividad y verifica las fechas dudosas."
    },
    {
      date: "2026-12-14",
      title: "Día 3: mira tu semana",
      text: "Revisa las hojas Semana y Carga para ver qué toca primero y dónde se cruzan tus entregas."
    }
  ]
};

/* Clave de sessionStorage con el pedido del checkout simulado. */
export const ORDER_KEY = "ra_order";

/* Datos de la encuesta propia (9 respuestas, muestra por conveniencia). */
export const SURVEY_STATS = [
  {
    figure: "7 de 9",
    text: "entregaron tarde o perdieron una actividad el semestre pasado"
  },
  {
    figure: "2",
    text: "herramientas en promedio para organizarse (agenda, calendario, plataforma de la universidad…)"
  },
  {
    figure: "8 de 9",
    text: "dedican 15 minutos o más a la semana solo a planificar"
  }
];

export const SURVEY_NOTE =
  "Encuesta propia a 9 estudiantes, muestra por conveniencia. Es un dato de orientación, no una estadística representativa.";

const formatoPrecio = new Intl.NumberFormat("es-CO", {
  style: "currency",
  currency: "COP",
  maximumFractionDigits: 0
});

export function formatearPrecio(valor) {
  return formatoPrecio.format(valor);
}

/* Parámetros estándar de Meta para eventos del producto. */
export function parametrosProducto() {
  return {
    content_ids: [PRODUCT.id],
    content_name: PRODUCT.name,
    content_type: "product",
    value: PRODUCT.price,
    currency: PRODUCT.currency
  };
}

function leerFecha(iso) {
  if (!iso) return null;

  const fecha = new Date(`${iso}T00:00:00`);

  return Number.isNaN(fecha.getTime()) ? null : fecha;
}

/* "Sábado, 12 de diciembre", o "" si la fecha falta o es inválida. */
export function etiquetaDia(dia) {
  const fecha = leerFecha(dia?.date);

  if (!fecha) return "";

  const texto = new Intl.DateTimeFormat("es-CO", {
    weekday: "long",
    day: "numeric",
    month: "long"
  }).format(fecha);

  return texto.charAt(0).toUpperCase() + texto.slice(1);
}

/*
  "12, 13 y 14 de diciembre" (o "12 de diciembre" si es un solo día).
  Si los días caen en meses distintos, los lista completos separados por " · ".
  Devuelve null si ningún día tiene fecha válida.
*/
export function fechasReto() {
  const fechas = CHALLENGE.days
    .map((dia) => leerFecha(dia.date))
    .filter(Boolean);

  if (fechas.length === 0) return null;

  const mes = (fecha) =>
    new Intl.DateTimeFormat("es-CO", { month: "long" }).format(fecha);
  const mismoMes = fechas.every(
    (fecha) =>
      fecha.getMonth() === fechas[0].getMonth() &&
      fecha.getFullYear() === fechas[0].getFullYear()
  );

  if (!mismoMes) {
    return fechas.map((fecha) => `${fecha.getDate()} de ${mes(fecha)}`).join(" · ");
  }

  const dias = fechas.map((fecha) => fecha.getDate());

  if (dias.length === 1) return `${dias[0]} de ${mes(fechas[0])}`;

  return `${dias.slice(0, -1).join(", ")} y ${dias.at(-1)} de ${mes(fechas[0])}`;
}

if (PRODUCT.provisional && import.meta.env.DEV) {
  console.warn(
    "offer.js: PRODUCT es provisional. Completa los datos reales del producto antes de publicar la Sales Page."
  );
}
