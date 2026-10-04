# Brief para Claude Code: rediseño de la landing de Ruta Académica

## 0. Cómo trabajar con este brief

1. **Lee todo el brief antes de tocar código.**
2. **Explora el repo y corre el proyecto** (`npm install`, `npm run dev`) para ver cómo se ve hoy la landing. Los archivos que me pasaron para preparar este brief eran una copia parcial, así que no asumas que son el estado completo. Las rutas de abajo se infirieron de los `import` y puede que haya que ajustarlas.
3. **Antes de escribir código, resume en pocas líneas qué vas a cambiar** y qué decisiones te faltan (sección 12).
4. **No hagas push a main ni despliegues.**
5. Si algo del brief choca con lo que ves en el repo, prioriza el repo y dime la diferencia.

---

## 1. Contexto

**Ruta Académica** ayuda a estudiantes universitarios que **estudian a distancia o de forma virtual y además trabajan** a organizar sus asignaturas, fechas de entrega y prioridades. Es un proyecto de la asignatura *Comercio Electrónico* (Universidad Militar Nueva Granada, Facultad de Estudios a Distancia).

El producto tiene **dos formas de uso**:

1. **Plantilla de Excel gratuita (oferta principal).** Se entrega a quien deja su correo en un formulario de Google. Es el "regalo de captación" de la landing.
2. **Versión web (oferta secundaria).** Una aplicación con registro e inicio de sesión: asignaturas, actividades con fecha, prioridad y estado, calendario y progreso. Hoy es un desarrollo de prueba.

La landing debe llevar **primero a descargar la plantilla** y, en segundo lugar, a probar la versión web.

**Stack de la app (según los archivos recibidos):** React + Vite, `react-router-dom`, `axios`. Backend en Express + PostgreSQL desplegado en Railway. **No toques el backend en esta tarea.**

**Público:** estudiantes de 20 a 40 años que trabajan, con poco tiempo, que probablemente abren el enlace **desde el celular**. Diseña primero para móvil (360 px).

**Tono:** cercano, claro y directo, en español de Colombia, tuteando ("tú"). Sin tecnicismos, sin exageraciones.

---

## 2. Estado actual (hallazgos)

- La "landing" actual es el componente `Inicio()` dentro de `src/App.jsx`: una tarjeta con el título, una frase genérica ("Organiza tus actividades. Prioriza tus tareas. Avanza hacia tus objetivos académicos.") y dos enlaces (`/login` y `/registro`). Usa las clases `inicio`, `inicio-card` e `inicio-buttons`.
- **Esas tres clases no están definidas** en `index.css` ni en `App.css` (las versiones que recibí). Puede que la landing hoy esté casi sin estilos; verifícalo corriendo la app.
- `index.css` contiene estilos para una landing más elaborada (`.navbar`, `.hero`, `.badge`, `.dashboard-preview`, `.features`, `footer`) que **ningún JSX usa**. Parece un borrador anterior. Son estilos **globales** y pueden chocar con nombres nuevos, así que no los reutilices ni los modifiques. Úsalos solo como referencia de paleta.
- `App.css` y los archivos `hero.png`, `react.svg` y `vite.svg` son **restos de la plantilla de Vite** y no se usan. `App.css` ni siquiera se importa.
- `index.html` tiene `lang="en"`, el título `ruta-academica`, sin meta descripción, y apunta a `/favicon.svg`, que puede no existir.
- La paleta que ya usa el proyecto es: azul `#2563eb` (hover `#1d4ed8`), azul marino `#172033`, fondo `#f5f7fb`, bordes `#e7eaf0` y texto secundario `#667085`. **Mantén esa identidad**; no cambies de marca.

---

## 3. Objetivo y alcance

**Objetivo:** que la landing se vea profesional y comunique en pocos segundos qué es Ruta Académica, para quién es y por qué le sirve a alguien que estudia y trabaja, con un camino claro a **descargar la plantilla** (principal) o probar la versión web (secundario).

**Dentro del alcance**
- Crear la landing nueva y reemplazar el uso de `Inicio` en la ruta `/`.
- Estilos propios de la landing.
- Enlazar el botón principal al formulario de Google (solo un enlace; ver 4.6).
- Ajustes en `index.html` (idioma, título, meta descripción, favicon).
- Agregar la variable de entorno del formulario a `.env.example`.
- Opcional, si queda tiempo: dar a `Login` y `Registro` un aspecto coherente con la landing, sin cambiar su lógica.

**Fuera del alcance (no lo modifiques)**
- Backend (`server.js`, `db.js`), servicios y llamadas a la API.
- Lógica y estilos del dashboard, asignaturas, actividades, calendario y progreso.
- **Captura de correos en nuestro propio sistema.** El correo lo recoge el formulario de Google; no crees endpoints ni tablas.
- Los hallazgos de la sección 11: **documéntalos, no los arregles** sin confirmación.

---

## 4. Reglas técnicas

1. **Archivos nuevos:** `src/pages/Landing.jsx` y `src/pages/Landing.css`. En `App.jsx`, importa `Landing` y úsalo en la ruta `/`. Cuando funcione, elimina la función `Inicio` de `App.jsx`.
2. **CSS aislado:** prefija **todas** las clases nuevas con `lp-` (por ejemplo `lp-hero`, `lp-btn`). No dependas de las clases globales de `index.css` ni las edites. Define variables CSS (`--lp-...`) en un contenedor `.lp`.
3. **Sin dependencias nuevas** de npm. Todo con React, CSS y SVG en línea. Iconos como SVG en línea, no emojis ni librerías.
4. **Tipografía:** pila del sistema (`system-ui, -apple-system, "Segoe UI", Roboto, Arial, sans-serif`). No cargues fuentes externas.
5. **Navegación interna:** usa `Link` de `react-router-dom` para `/login`, `/registro` y `/dashboard`. Para anclas dentro de la página usa `<a href="#...">`.
6. **Enlace al formulario (CTA principal):**
   - Lee la URL de `import.meta.env.VITE_LEAD_FORM_URL` y agrégala vacía a `.env.example` con un comentario. **No inventes ni dejes una URL falsa.**
   - Los botones de descarga son `<a href={LEAD_FORM_URL} target="_blank" rel="noopener noreferrer">`.
   - **Si la variable no está definida**, no renderices los botones de descarga: muestra solo la versión web como CTA y deja un `console.warn` que explique qué falta. Así nunca se publica un botón roto.
7. **Sesión existente:** si existe `localStorage.getItem("rutaAcademicaSesion")`, muestra "Ir a mi panel" (`/dashboard`) **en lugar** de "Probar la versión web" y de "Iniciar sesión". El botón de descargar la plantilla se mantiene. Lee la sesión dentro de un `try/catch`.
8. **No uses** `hero.png`, `react.svg` ni `vite.svg`.
9. Respeta `prefers-reduced-motion`: las animaciones y el desplazamiento suave solo se activan si el usuario no pidió reducir el movimiento.
10. Código legible: componentes pequeños dentro de `Landing.jsx` (o subcomponentes en el mismo archivo), datos de las secciones en arreglos constantes, sin `dangerouslySetInnerHTML`.

---

## 5. Dirección visual

- **Sensación:** limpia, confiable, un poco "producto SaaS" pero amable. Mucho espacio en blanco, tarjetas con bordes suaves y sombras discretas.
- **Héroe:** fondo con un degradado muy suave (azul muy claro hacia `#f5f7fb`) y formas decorativas hechas con CSS. Nada de imágenes externas.
- **Vista previa de la plantilla** en el héroe: una maqueta hecha con HTML y CSS que imite la hoja **"Semana"** de la plantilla de Excel. Debe llevar una etiqueta visible **"Vista de ejemplo"**.
  - Título: "Esta semana: vencidas y próximos 7 días".
  - Encabezado de tabla en azul marino con texto blanco. Columnas: Fecha · Actividad · Asignatura · Prioridad · Estado · Alerta.
  - Tres filas de ejemplo, coherentes entre sí:

    | Fecha | Actividad | Asignatura | Prioridad | Estado | Alerta |
    |---|---|---|---|---|---|
    | 28/09 | Lectura y resumen | Inglés | Baja | En proceso | Vencida |
    | 30/09 | Quiz de normalización | Bases de datos | Alta | Pendiente | Verificar fecha |
    | 02/10 | Taller 3: límites | Cálculo diferencial | Alta | En proceso | Urgente |

  - Colores: prioridad Alta `#dc2626`, Media `#d97706`, Baja `#16a34a`; alerta "Vencida" en rojo suave, "Urgente" en amarillo suave, "Verificar fecha" en azul suave.
  - En móvil, la maqueta no puede provocar desplazamiento horizontal de la página: reduce columnas (por ejemplo, oculta Asignatura) o presenta cada fila como tarjeta.
- **Tipografía fluida** con `clamp()`: el H1 de unos 2.1 rem en móvil a unos 3.4 rem en escritorio. Ancho máximo del contenido: 1120 px.
- **Botones:** primario relleno en azul, secundario con borde. Altura mínima táctil de 44 px, con estados `hover` y `focus-visible` visibles.
- **Microinteracciones:** elevación leve de las tarjetas al pasar el cursor y una aparición suave al cargar. Nada pesado.

---

## 6. Estructura de la página y texto

Usa este texto como **valor por defecto**. Puedes mejorar la redacción manteniendo el sentido y el tono, pero respeta la sección 8 (qué no afirmar).

### 6.1 Barra superior (sticky)
- Logo: **Ruta Académica** (texto con un pequeño ícono SVG).
- Enlaces ancla: *Cómo funciona* · *Qué incluye* · *Versión web* · *Lo que vimos*.
- Botón primario: *Descargar plantilla* (al formulario). Botón secundario: *Iniciar sesión*. En móvil, ocultar los enlaces y el botón secundario; dejar solo el logo y el botón primario.

### 6.2 Héroe
- **Insignia:** "Para quienes estudian a distancia y trabajan"
- **H1:** "Tu semana de estudio, clara y en un solo lugar"
- **Subtítulo:** "Una plantilla gratuita en Excel para organizar tus asignaturas, fechas de entrega y prioridades, hecha para quienes no tienen tiempo que perder."
- **Botón primario:** "Descargar la plantilla gratis" → formulario (4.6)
- **Botón secundario:** "Probar la versión web" → `/registro`
- **Texto de apoyo** bajo los botones, en pequeño: "Solo te pedimos tu correo." *(esta frase solo se muestra si el equipo confirma que el formulario pide únicamente el correo; ver sección 12)*
- **Línea de contexto:** "Proyecto académico de Comercio Electrónico, Universidad Militar Nueva Granada."
- A la derecha (debajo en móvil): la vista previa de la plantilla.

### 6.3 Franja de problema: "Lo que vimos en nuestra encuesta"
Tres tarjetas con cifra grande y texto corto. **Usa exactamente estos datos** (ver sección 7):

| Cifra | Texto |
|---|---|
| **7 de 9** | entregaron tarde o perdieron una actividad el semestre pasado |
| **2** | herramientas en promedio para organizarse (agenda, calendario, plataforma de la universidad…) |
| **8 de 9** | dedican 15 minutos o más a la semana solo a planificar |

Nota al pie, visible y legible: *"Encuesta propia a 9 estudiantes, muestra por conveniencia. Es un dato de orientación, no una estadística representativa."*

### 6.4 Cómo funciona (`id="como-funciona"`)
Tres pasos numerados:
1. **Descarga la plantilla.** "Deja tu correo y recibe el enlace al archivo."
2. **Escribe tus asignaturas y entregas.** "Con listas desplegables para la asignatura, la prioridad y el estado."
3. **Mira qué toca esta semana.** "Las hojas de semana, carga y progreso se actualizan solas."

### 6.5 Qué incluye (`id="que-incluye"`)
Cuatro tarjetas con ícono SVG, tomadas de las hojas de la plantilla:
- **Actividades:** "Registra cada entrega con fecha, hora, prioridad y estado. Marca si ya verificaste la fecha y recibe alertas de vencida, urgente o por verificar."
- **Semana:** "Tus entregas vencidas y las de los próximos 7 días, ordenadas por fecha."
- **Carga:** "Detecta las semanas en las que se te cruzan varias entregas."
- **Progreso:** "El porcentaje de actividades que ya terminaste en cada asignatura."

Una línea debajo: "La plantilla llega armada, con desplegables y cálculos automáticos: tú solo escribes tus materias y tus entregas."

### 6.6 Versión web (`id="version-web"`)
Bloque con un fondo distinto, con la etiqueta **"Versión de prueba"**:
- **Título:** "¿Prefieres usarla en línea?"
- **Texto:** "Prueba la versión web de Ruta Académica: registra tus asignaturas y actividades, consulta tu calendario y mira tu progreso."
- **Botones:** *Crear cuenta* (`/registro`) e *Iniciar sesión* (`/login`). Con sesión iniciada: un solo botón "Ir a mi panel".

Antes de publicar este texto, **verifica en el código** (`Subjects.jsx`, `Activities.jsx`, `Calendar.jsx`, `Progress.jsx`) que cada función mencionada existe. Si algo no coincide, ajusta el texto, no la app.

### 6.7 Lo que dijeron los estudiantes (`id="lo-que-vimos"`)
Dos citas textuales de la pregunta abierta de la encuesta, con la etiqueta "Estudiante encuestado" (sin nombres):
- "Un buen cronograma para que me alcance el tiempo"
- "El tiempo que se gasta en reorganizar nuevos items o editar"

### 6.8 Cierre
Banda azul oscura con: "Empieza a organizar tu semestre" y los botones *Descargar la plantilla gratis* (primario) y *Probar la versión web* (secundario, sobre fondo oscuro).

### 6.9 Pie de página
Nombre del proyecto, "Proyecto académico · Comercio Electrónico · Universidad Militar Nueva Granada" y el año actual calculado con `new Date().getFullYear()`.

---

## 7. Datos de la encuesta que se pueden usar

Fuente: Google Forms, 9 respuestas, muestra por conveniencia (amigos, compañeros y grupos de estudiantes a distancia). 7 de 9 estudian a distancia o virtual y trabajan.

- Entregaron tarde o perdieron una actividad el último semestre: **7 de 9** (4 una vez, 3 entre dos y tres veces, 2 nunca).
- Herramientas para organizarse: **18 selecciones entre 9 personas, es decir 2 por persona**. Las más usadas: calendario del celular o Google Calendar (5), agenda o cuaderno (4), plataforma de la universidad (4), notas del celular (3), WhatsApp o grupos (2). Ninguno usa Notion, Trello ni apps similares.
- Tiempo semanal dedicado a planificar: 6 entre 15 y 30 minutos, 2 más de 30 y 1 menos de 15. Es decir, **8 de 9 dedican 15 minutos o más**.

**Reglas al mostrarlos:** usa siempre conteos ("7 de 9") y no porcentajes, no los redondees a "la mayoría de los estudiantes" sin la nota de la muestra, y no inventes ni extrapoles ninguna cifra.

---

## 8. Qué NO afirmar en la landing

La landing no debe prometer nada que el producto no haga o que no esté confirmado:
- **"Gratis" solo aplica a la plantilla.** No digas que la versión web es gratuita ni menciones precios de ningún tipo.
- **No hables de seguridad, privacidad ni protección de datos de la versión web** (ver sección 11).
- **No afirmes compatibilidad con Google Sheets ni con celular** para la plantilla. Di solo "Excel", salvo que el equipo lo confirme (sección 12).
- **No mezcles funciones entre productos.** "Fecha verificada", alertas y la hoja de carga son de la plantilla; calendario, progreso por asignatura y registro de usuarios son de la versión web. No atribuyas a uno lo que hace el otro.
- **No** inventes testimonios con nombre, cifras de usuarios o descargas, logos de universidades ni calificaciones.
- **No** prometas recordatorios, notificaciones, app móvil, sincronización con Google Calendar ni integración con la plataforma de la universidad.
- **No** garantices resultados ("nunca más perderás una entrega"). Se puede hablar de claridad y orden.

---

## 9. Accesibilidad, responsive y rendimiento

- **Semántica:** `header`, `nav`, `main`, `section` con títulos, `footer`. Un solo `h1`; jerarquía de títulos sin saltos.
- **Contraste:** mínimo AA (4.5:1 en texto normal). Revisa especialmente el gris `#667085` y los textos sobre la banda oscura.
- **Foco visible** en todos los elementos interactivos; navegación completa con teclado; enlace "Saltar al contenido" al inicio.
- **Enlaces externos:** los que abren el formulario en una pestaña nueva llevan una indicación para lectores de pantalla (por ejemplo, texto oculto "se abre en una pestaña nueva").
- **Vista previa decorativa:** `aria-hidden="true"` en la maqueta y un texto alternativo breve fuera de ella si hace falta. Los SVG decorativos también con `aria-hidden`.
- **Responsive:** probar a 360, 390, 768, 1024 y 1280 px. Sin desplazamiento horizontal en ningún ancho. En móvil, las cuadrículas pasan a una columna y los botones del héroe ocupan el ancho completo.
- **Rendimiento:** sin imágenes externas, sin fuentes externas, sin librerías de animación. Evita desplazamientos de diseño al cargar.

---

## 10. Criterios de aceptación

Antes de dar por terminado, verifica y reporta:

- [ ] `npm run build` termina sin errores (y `npm run lint`, si existe, sin errores nuevos).
- [ ] La ruta `/` muestra la landing nueva; `/login`, `/registro` y `/dashboard` siguen funcionando igual.
- [ ] Los botones de descarga apuntan a `VITE_LEAD_FORM_URL`, se abren en pestaña nueva con `rel="noopener noreferrer"` y **desaparecen** (con `console.warn`) si la variable no está definida.
- [ ] `.env.example` incluye `VITE_LEAD_FORM_URL=`; no se subió ningún `.env` real.
- [ ] Con sesión iniciada, la landing muestra "Ir a mi panel" en lugar de "Probar la versión web" e "Iniciar sesión"; sin sesión, los botones normales.
- [ ] Las clases nuevas empiezan por `lp-` y no se modificó ningún estilo global de `index.css`.
- [ ] No se agregaron dependencias al `package.json` ni se creó ningún endpoint o tabla.
- [ ] Las cifras de la sección 6.3 coinciden con la sección 7 y la nota de la muestra es visible.
- [ ] Ningún texto incumple la sección 8.
- [ ] Sin desplazamiento horizontal a 360 px; foco visible; contraste AA.
- [ ] `index.html` con `lang="es"`, título y meta descripción útiles, y un favicon que realmente exista.
- [ ] Capturas (o descripción detallada) de la landing a 360 px y a 1280 px.

---

## 11. Hallazgos fuera de alcance (documentar, no corregir)

Al revisar el código encontré problemas que **no forman parte de esta tarea**, pero que conviene que el equipo conozca. No los modifiques sin confirmación; inclúyelos en tu resumen final.

**Seguridad (los más importantes)**
1. **Las contraseñas se guardan y se comparan en texto plano** (`usuario.password !== password` en el login; el registro las inserta tal cual). Deberían guardarse con hash (bcrypt o argon2).
2. **`GET /api/usuarios` es público** y devuelve nombre, correo, programa e institución de **todos** los usuarios.
3. **`DELETE /api/usuarios/:id` no exige autenticación**: cualquiera con un id puede borrar un usuario. Lo mismo ocurre con las rutas `PUT`/`DELETE` de usuarios, asignaturas y actividades.
4. **No hay autenticación real**: el cliente envía `usuario_id` por la URL o el cuerpo y el servidor lo acepta. Cambiando el número se pueden ver y modificar los datos de otra persona. `GET /api/actividades` sin `usuario_id` devuelve las actividades de todos.
5. **CORS abierto** (`app.use(cors())`) y los errores devuelven `error.message` al cliente.

**Funcionales**
6. En el panel (`Dashboard` en `App.jsx`) se lee `fechaEntrega || fecha`, pero la API devuelve **`fecha_entrega`**. Es probable que las fechas salgan como "Sin fecha" y el orden de "Próximas actividades" no sea el correcto. `Calendar.jsx` sí usa `fecha_entrega`.
7. Varias clases CSS usadas por las páginas internas (`dashboard-layout`, `main-content`, `page-header`, `calendar-card`, `subjects-grid`, entre otras) **no aparecen en los CSS que recibí**. Comprueba si existen en el repo real; si no, esas pantallas tienen poco estilo.
8. Restos de la plantilla de Vite sin uso: `App.css`, `hero.png`, `react.svg`, `vite.svg`.

**Recomendación:** aunque la versión web ahora es la opción secundaria, la landing sigue invitando a registrarse con correos reales. Conviene resolver al menos los puntos 1 a 4 **antes de promocionar ese enlace** entre más estudiantes.

---

## 12. Decisiones y preparación del equipo

**Lo que debe hacer el equipo (no Claude Code) antes de publicar**

1. **Crear el formulario de Google** con **una sola pregunta (correo electrónico)** y una casilla de consentimiento obligatoria. Texto sugerido: *"Autorizo el uso de mi correo electrónico para enviarme la plantilla y novedades del proyecto académico Ruta Académica."* Es recomendable confirmar con el docente qué se espera sobre tratamiento de datos personales en un proyecto académico.
2. **Configurar el mensaje de confirmación del formulario** con el enlace de descarga de la plantilla (por ejemplo, un enlace de Drive a `Ruta_Academica_plantilla.xlsx`).
3. **Poner la URL del formulario** en la variable `VITE_LEAD_FORM_URL` (en `.env` local y en el servicio donde se despliegue el frontend).
4. **Probar la plantilla en Excel** (y en Google Sheets, si se quiere mencionar).

**Valores por defecto de esta tarea**

| Decisión | Valor por defecto |
|---|---|
| ¿La plantilla se describe como gratuita? | **Sí.** Es el regalo de captación. |
| ¿La versión web se describe como gratuita o con precio? | **No se menciona nada.** |
| ¿Se muestra "Solo te pedimos tu correo."? | **Solo si el formulario realmente pide únicamente el correo.** Si no, se omite esa frase. |
| ¿Se menciona compatibilidad con Google Sheets o celular? | **No.** Solo "Excel". |
| ¿La versión web se etiqueta como "Versión de prueba"? | **Sí.** |
| ¿Se captura el correo en nuestro backend? | **No.** Lo recoge el formulario de Google. |
| ¿Se reemplaza la maqueta del héroe por una captura real de la plantilla? | No. Se usa la maqueta en HTML y CSS con la etiqueta "Vista de ejemplo". Se puede cambiar después. |
| ¿Se muestran los nombres del equipo en el pie? | No. Solo el nombre del proyecto y la universidad. |

---

## 13. Entrega esperada

Al terminar, responde con:
1. Lista de archivos creados y modificados.
2. Capturas o descripción de la landing en móvil y escritorio.
3. Resultado de `npm run build` (y `lint`, si existe).
4. Cualquier diferencia entre este brief y el estado real del repo.
5. Los hallazgos de la sección 11 que confirmaste en el código real.
6. Las decisiones de la sección 12 que dejaste con valor por defecto.
