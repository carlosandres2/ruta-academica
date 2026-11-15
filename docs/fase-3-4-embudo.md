# Fases 3 y 4: embudo, campaña y medición

Guía del equipo para configurar lo que **no** está en el código (Meta, MailerLite, Netlify), con los textos listos para pegar y las reglas para medir y ajustar.

Lo que sí está en el código:

| Pieza | Dónde |
|---|---|
| Landing de captura + modal de descarga + sección del reto | `src/pages/Landing.jsx`, `src/components/TemplateDownloadModal.jsx` |
| Sales Page, checkout simulado, compra exitosa | `src/pages/Sales.jsx`, `Checkout.jsx`, `PurchaseSuccess.jsx` |
| Pixel de Meta + GA4 + API de Conversiones | `src/services/tracking.js`, `netlify/functions/capi.js` |
| Correo del modal → MailerLite | `src/services/leadService.js`, `netlify/functions/subscribe.js` |
| Producto, precio y datos del reto (editar aquí) | `src/data/offer.js` |
| Hoja de métricas | `docs/Panel_Metricas.xlsx` |

## 1. El embudo

```
Anuncio (Meta) ──► Landing "/" ──► Modal: correo + consentimiento ──► Lead
                                        │
                                        ├─► descarga de la plantilla
                                        └─► MailerLite: grupo "Reto 3 días" ──► 5 correos
                                                                                   │
                         ViewContent ◄── "/ventas" ◄───────────────────────────────┘
                                 │
                  InitiateCheckout ──► "/checkout" (simulado) ──► "/compra-exitosa" = Purchase
```

Eventos y dónde se disparan:

| Evento Meta | Evento GA4 | Cuándo | Archivo |
|---|---|---|---|
| `PageView` | (automático) | Al cargar y en cada cambio de ruta | `tracking.js`, `App.jsx` (`RouteTracker`) |
| `Lead` | `generate_lead` | Al enviar el modal con correo válido y consentimiento | `TemplateDownloadModal.jsx` |
| `ViewContent` | `view_item` | Al abrir `/ventas` | `Sales.jsx` |
| `InitiateCheckout` | `begin_checkout` | Al hacer clic en "Comprar" | `Sales.jsx` |
| `Purchase` | `purchase` | Al llegar a `/compra-exitosa`, una sola vez por pedido | `PurchaseSuccess.jsx` |

Cada evento lleva un `event_id`. El navegador y el servidor (API de Conversiones) envían el mismo, y Meta los cuenta una vez. En `Purchase`, el `event_id` es el número de pedido.

**La compra es una simulación.** No hay cobro ni datos de pago, y las páginas lo dicen de forma visible. Las campañas optimizan por `Lead`, no por `Purchase`, así que las compras simuladas no entrenan al algoritmo. En los reportes, `Purchase` es solo evidencia del flujo técnico, no ingresos.

## 2. Checklist de configuración

### 2.1 Datos del producto y del reto
Ya cargados en `src/data/offer.js`:
- Producto **Ruta Académica Plus**, a **$15.000 COP** (nombre, propuesta y contenido son textos de prueba aprobados por el equipo).
- Reto de 3 días: **12, 13 y 14 de diciembre de 2026** (sábado, domingo y lunes).

- [ ] Si más adelante cambian por los datos definitivos de la fase 1, editar solo ese archivo (`PRODUCT` y `CHALLENGE`).

### 2.2 Meta
- [ ] Crear la Página de Facebook del proyecto y el portafolio comercial (Business Manager).
- [ ] Crear la cuenta publicitaria (moneda COP, zona horaria de Bogotá) y agregar un método de pago.
- [ ] Events Manager → crear el Pixel / conjunto de datos y copiar el **ID**.
- [ ] Events Manager → Configuración → API de Conversiones → **generar token de acceso** (es secreto).
- [ ] Verificar el dominio del sitio (Configuración de marca → Dominios).
- [ ] Events Manager → "Probar eventos": copiar el **código de prueba** (`TEST12345`).

### 2.3 Netlify (Site configuration → Environment variables)
- [ ] `VITE_META_PIXEL_ID` = ID del Pixel (público; se incrusta al compilar, así que hay que volver a desplegar).
- [ ] `META_PIXEL_ID` = el mismo ID.
- [ ] `META_CAPI_TOKEN` = token de la API de Conversiones.
- [ ] `META_TEST_EVENT_CODE` = código de prueba **solo mientras se prueba**. Quitarlo antes de lanzar: con él, los eventos del servidor no cuentan como reales.
- [ ] `MAILERLITE_API_TOKEN` y `MAILERLITE_GROUP_ID` (ver 2.4).
- [ ] Volver a desplegar y comprobar que `https://musical-meringue-a15eb9.netlify.app/.netlify/functions/subscribe` responde JSON (un 405 en GET es lo esperado) y no la página principal.

### 2.4 MailerLite
- [ ] Crear el grupo **"Reto 3 días"** y copiar su ID.
- [ ] Integraciones → API → generar token.
- [ ] (Opcional) Crear campos personalizados con las claves `utm_source`, `utm_medium`, `utm_campaign`, `utm_content` para guardar de qué anuncio vino cada suscriptor. Si no existen, MailerLite los ignora.
- [ ] Crear la automatización **"al unirse al grupo Reto 3 días"** con los correos de la sección 4.
- [ ] Revisar la configuración de doble confirmación (*double opt-in*): si está activa, el suscriptor queda "sin confirmar" hasta que haga clic en el correo de confirmación, y la automatización puede tardar en dispararse.

### 2.5 Pruebas antes de gastar un peso
- [ ] Instalar la extensión **Meta Pixel Helper** en Chrome.
- [ ] Con `META_TEST_EVENT_CODE` puesto, recorrer el embudo en el sitio publicado: modal → `/ventas` → comprar → confirmar.
- [ ] Events Manager → "Probar eventos": deben aparecer `PageView`, `Lead`, `ViewContent`, `InitiateCheckout` y `Purchase` como **Navegador** y **Servidor**, y en Lead/Purchase marcados como deduplicados.
- [ ] Recargar `/compra-exitosa`: no debe aparecer un segundo `Purchase`.
- [ ] Confirmar que el correo de prueba aparece en el grupo de MailerLite y que llega el primer correo.
- [ ] Quitar `META_TEST_EVENT_CODE`, volver a desplegar.

## 3. Estructura de campañas en Meta

Un solo objetivo de negocio: **conseguir inscripciones al reto (Lead)**.

| Nivel | Configuración |
|---|---|
| **Campaña 1: "Tráfico – Reto"** | Objetivo: Tráfico. Optimización: visitas a la página de destino. Un conjunto, para llenar el Pixel y las audiencias personalizadas. |
| **Campaña 2: "Conversión – Leads"** | Objetivo: Clientes potenciales (sitio web). Evento de conversión: `Lead`. |
| Conjunto 2A | Colombia, 20–40 años, intereses de educación a distancia, educación superior y productividad. |
| Conjunto 2B | Colombia, 20–40 años, público amplio (sin intereses). |
| Anuncios | 3 variantes de la sección 5 en cada conjunto. Mismo destino: la landing `/`. |
| Retargeting (opcional) | Audiencia personalizada de quienes vieron `/ventas` en 14 días. Solo si la audiencia alcanza el mínimo que pide Meta. |

- **Parámetros de URL de los anuncios** (campo "Parámetros de URL" al crear el anuncio):
  `utm_source=meta&utm_medium=paid_social&utm_campaign={{campaign.name}}&utm_content={{ad.name}}&utm_term={{adset.name}}`
- **Presupuesto y duración**: lo decide el equipo. Un monto diario pequeño durante 7 días basta para tener datos para la rúbrica; con poco presupuesto los resultados serán ruidosos y las conclusiones, orientativas.
- **No promocionar `/registro`** (la versión web). Los anuncios van a la landing para captar el correo.
- **Un cambio a la vez** durante la campaña (un creativo, una audiencia), para saber qué causó el efecto.

## 4. Secuencia de correos del reto (MailerLite)

Automatización disparada al unirse al grupo "Reto 3 días". Reemplaza `[…]` antes de activar. Los enlaces a `/ventas` llevan UTM para medir cuántos llegan desde el correo. MailerLite agrega el enlace de baja automáticamente.

| # | Cuándo | Asunto |
|---|---|---|
| 1 | Al unirse | Tu plantilla de Ruta Académica y cómo funciona el reto |
| 2 | Sáb. 12 de dic., en la mañana | Día 1 del reto: reúne tus entregas |
| 3 | Dom. 13 de dic., en la mañana | Día 2 del reto: define prioridades |
| 4 | Lun. 14 de dic., en la mañana | Día 3 del reto: mira tu semana |
| 5 | Mié. 16 de dic. | ¿Te quedó alguna duda sobre Ruta Académica? |

> El reto tiene fechas fijas, así que en MailerLite usa la espera **"hasta una fecha"** (no "esperar X días") entre el correo 1 y los siguientes. Quien se inscriba después del 12 de diciembre recibiría los correos pasados de golpe o ninguno, según cómo configures la espera: lo más simple es **pausar los anuncios el 11 de diciembre** y cerrar las inscripciones ese día.

### Correo 1: bienvenida (Atención + Interés)
**Preheader:** Descarga tu plantilla y mira qué haremos en 3 días.

> Hola [Nombre]:
>
> Ya estás dentro. Aquí tienes tu plantilla de Excel: **[enlace de descarga de la plantilla]**.
>
> El **12, 13 y 14 de diciembre** recibirás un correo con una tarea corta por día para dejar tu semestre ordenado:
>
> - **Día 1 (sábado 12):** reúnes tus entregas en la hoja Actividades.
> - **Día 2 (domingo 13):** defines prioridad y estado, y verificas las fechas dudosas.
> - **Día 3 (lunes 14):** revisas las hojas Semana y Carga para ver qué toca primero.
>
> Si quieres ir adelantando, abre la plantilla y escribe tus asignaturas.
>
> [Firma del equipo]
> *Proyecto académico de Comercio Electrónico, Universidad Militar Nueva Granada.*

### Correo 2: Día 1 (Interés)
**Preheader:** Una sola tarea: escribir todas tus entregas.

> Hola [Nombre]:
>
> Hoy el reto es sencillo: abre la hoja **Actividades** y escribe cada entrega que tengas en el semestre, con su fecha, hora, prioridad y estado.
>
> No tiene que quedar perfecto. Lo importante es que todo esté en un solo lugar.
>
> En nuestra encuesta a 9 estudiantes (muestra por conveniencia, un dato de orientación), 7 contaron que entregaron tarde o perdieron una actividad el semestre pasado. Tenerlo todo escrito es el primer paso para evitarlo.
>
> Mañana (domingo 13): prioridades.

### Correo 3: Día 2 (Interés + Deseo)
**Preheader:** Marca qué es urgente y qué fechas debes confirmar.

> Hola [Nombre]:
>
> Hoy toca poner orden: en la hoja **Actividades**, asigna **prioridad** (Alta, Media o Baja) y **estado** (Pendiente, En proceso o Completada) a cada entrega.
>
> Si dudas de una fecha, márcala como por verificar: la plantilla te lo recuerda con una alerta.
>
> Mañana vas a ver el resultado de todo esto en una sola vista.

### Correo 4: Día 3 + oferta (Deseo + Acción)
**Preheader:** Tu semana, a la vista. Y la versión completa, si la quieres.

> Hola [Nombre]:
>
> Último día. Abre las hojas **Semana** y **Carga**: ahí ves tus entregas vencidas y las de los próximos 7 días, y las semanas en que se te cruzan varias.
>
> Si quieres ir más allá, preparamos **Ruta Académica Plus** ($15.000 COP): la versión completa para organizar tus asignaturas, entregas y prioridades en un solo archivo de Excel, con una guía paso a paso y los materiales del reto en un solo lugar.
>
> **[Ver la versión completa]** → `https://musical-meringue-a15eb9.netlify.app/ventas?utm_source=email&utm_medium=email&utm_campaign=reto-3-dias&utm_content=correo-4`
>
> *Proyecto académico: la compra en esa página es una simulación; no se cobra ni se pide ningún dato de pago.*

### Correo 5: seguimiento (Acción)
**Preheader:** Si algo no quedó claro, respóndenos.

> Hola [Nombre]:
>
> Gracias por hacer el reto. Si algo no quedó claro, responde este correo y te ayudamos.
>
> Si todavía no la viste, aquí está la versión completa: **[Ver la versión completa]** → `https://musical-meringue-a15eb9.netlify.app/ventas?utm_source=email&utm_medium=email&utm_campaign=reto-3-dias&utm_content=correo-5`
>
> *Proyecto académico: la compra es una simulación; no se cobra.*

**Qué no hacer:** no inventar fechas límite ni cupos limitados (no son reales, y los anuncios y correos no deben prometer resultados). Tampoco mencionar precios de la versión web, que no tiene.

## 5. Copys de los anuncios (AIDA)

Se redactan en tercera persona o de forma general: las políticas de Meta restringen los anuncios que sugieren conocer atributos personales de quien los ve (por ejemplo "¿Estudias y trabajas?"). Revisa la política vigente al crear el anuncio.

### Variante A: el problema
- **Atención (titular):** Tu semestre, en una sola hoja
- **Interés (texto principal):** Entre la plataforma de la universidad, el calendario y las notas del celular, las entregas se pierden de vista. En nuestra encuesta a 9 estudiantes, 7 entregaron tarde o perdieron una actividad el semestre pasado.
- **Deseo:** Una plantilla de Excel con desplegables y alertas, hecha para quienes estudian a distancia y trabajan.
- **Acción (botón):** Descargar · **Descripción:** Plantilla + reto de 3 días por correo.

### Variante B: el reto
- **Atención:** Reto de 3 días: ordena tu semestre
- **Interés:** El 12, 13 y 14 de diciembre, un correo por día con una tarea corta. Día 1: reúnes tus entregas. Día 2: defines prioridades. Día 3: ves tu semana.
- **Deseo:** Termina con tu semestre ordenado en un archivo que se actualiza solo.
- **Acción:** Inscríbete y recibe la plantilla. · **Descripción:** Proyecto académico de la UMNG.

### Variante C: el tiempo
- **Atención:** 15 minutos a la semana solo para planificar
- **Interés:** 8 de 9 estudiantes encuestados dedican 15 minutos o más a la semana solo a planificar (muestra pequeña, dato de orientación).
- **Deseo:** Con las hojas Semana y Carga ves qué toca primero sin reorganizar todo cada vez.
- **Acción:** Descarga la plantilla. · **Descripción:** Gratis para la plantilla.

Revisa que los anuncios cumplan los límites de caracteres de Meta (titular ~40, texto principal visible ~125 antes del "ver más") y que cada creativo tenga una imagen o video generado con IA según la fase 2 (Canva Magic, Midjourney, HeyGen).

## 6. Fase 4: lanzamiento y medición

### 6.1 Calendario sugerido
El reto es el 12, 13 y 14 de diciembre, así que las inscripciones tienen que llegar **antes del 12**. Las fechas de campaña son una propuesta: muévelas según el presupuesto, pero mantén los hitos.

| Cuándo | Qué |
|---|---|
| Hasta el jue. 3 de dic. | Checklist 2.5 completo (pruebas con el código de prueba de Meta). Anuncios enviados a revisión (pueden tardar 24–48 h). |
| Vie. 4 de dic. (día 0) | Quitar `META_TEST_EVENT_CODE`, volver a desplegar y activar las campañas. Primera revisión a las 24 h (¿se entrega el gasto? ¿llegan visitas? ¿se registra `Lead`?). |
| 4–11 de dic. | Registrar las métricas **cada día** en `Panel_Metricas.xlsx`. Un cambio a la vez. |
| Lun. 7 de dic. | Primera decisión de optimización (ver 6.3). |
| Vie. 11 de dic. | Pausar los anuncios y cerrar inscripciones. |
| 12, 13 y 14 de dic. | Se envían los correos del reto (correos 2, 3 y 4). |
| 14–16 de dic. | Cierre: medir visitas a `/ventas`, `InitiateCheckout` y compras simuladas; capturas de Ads Manager y GA4; conclusiones. |

### 6.2 Métricas

| Métrica | Fórmula | De dónde sale |
|---|---|---|
| **CTR** (enlace) | clics en el enlace ÷ impresiones | Ads Manager ("CTR (porcentaje de clics en el enlace)") |
| **CPL** | gasto ÷ leads | Ads Manager (gasto) + eventos `Lead` |
| **Conversión de la landing** | leads ÷ visitas a la landing | Ads Manager ("Visitas a la página de destino") o GA4 (sesiones de `/`) |
| CPC | gasto ÷ clics en el enlace | Ads Manager |
| CPM | gasto ÷ impresiones × 1000 | Ads Manager |
| Costo por `InitiateCheckout` | gasto ÷ `InitiateCheckout` | Ads Manager |
| Lead → `InitiateCheckout` | `InitiateCheckout` ÷ leads | Ads Manager / GA4 |

Usa **visitas a la página de destino** y no clics en el enlace como denominador de la conversión de la landing: no todos los clics llegan a cargar la página.

Cuidado con las **métricas de vanidad**: impresiones, alcance y "me gusta" no dicen si el embudo funciona. Las que importan son CTR, CPL y la conversión de la landing.

### 6.3 Reglas de decisión

Los umbrales son puntos de partida orientativos, no promesas: con pocos datos, ajústalos a lo que muestren tus campañas.

| Síntoma | Diagnóstico probable | Qué cambiar |
|---|---|---|
| CTR bajo (menos de ~1 %) | El anuncio no llama la atención | Probar otro gancho (titular, imagen o video) |
| CTR bueno, conversión de la landing baja (menos de ~20 %) | El problema está en la landing o el modal | Revisar el titular, la velocidad en móvil y la fricción del modal |
| CPL alto con CTR y conversión aceptables | Audiencia cara o poco afín | Cambiar o ampliar la audiencia, probar ubicaciones |
| Muchos `Lead` pero pocas visitas a `/ventas` | Los correos no están llevando a la oferta | Revisar asuntos y botón de los correos 4 y 5 |
| Gasto sin visitas | Anuncios sin entregar o rechazados | Revisar estado y aprobación en Ads Manager |

Cada decisión debe quedar escrita con: **fecha, métrica que falló, valor, cambio hecho, resultado después**. Esa tabla es la evidencia del criterio "decisiones de optimización fundamentadas en datos".

## 7. Evidencias para la rúbrica

| Criterio | Qué mostrar |
|---|---|
| Infoproducto con IA (20 %) | Producto, lead magnet y copys AIDA con los prompts usados. |
| Embudo No-Code y captación (25 %) | Landing y Sales Page publicadas, capturas a 360 px, correo de bienvenida llegando, automatización activa en MailerLite. |
| Administrador de anuncios y eventos (25 %) | Cuenta publicitaria, estructura de campañas, Events Manager con los 5 eventos recibidos por navegador y servidor (deduplicados). |
| Estrategia de redes y lanzamiento (20 %) | Elección de plataformas y reto de 3 días (fase 2), parrilla de contenidos y piezas con IA. |
| Métricas y ajustes (10 %) | `Panel_Metricas.xlsx` con datos reales y la tabla de decisiones de la sección 6.3. |
