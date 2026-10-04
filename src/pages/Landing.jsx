import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

import TemplateDownloadModal from "../components/TemplateDownloadModal";
import {
  descargarPlantilla,
  leadFormConfigurado
} from "../services/leadService";

import "./Landing.css";

const CURRENT_YEAR = new Date().getFullYear();

const NAV_LINKS = [
  { href: "#como-funciona", label: "Cómo funciona" },
  { href: "#que-incluye", label: "Qué incluye" },
  { href: "#version-web", label: "Versión web" },
  { href: "#lo-que-vimos", label: "Lo que vimos" }
];

const PREVIEW_ROWS = [
  {
    fecha: "28/09",
    actividad: "Lectura y resumen",
    asignatura: "Inglés",
    prioridad: "Baja",
    estado: "En proceso",
    alerta: "Vencida"
  },
  {
    fecha: "30/09",
    actividad: "Quiz de normalización",
    asignatura: "Bases de datos",
    prioridad: "Alta",
    estado: "Pendiente",
    alerta: "Verificar fecha"
  },
  {
    fecha: "02/10",
    actividad: "Taller 3: límites",
    asignatura: "Cálculo diferencial",
    prioridad: "Alta",
    estado: "En proceso",
    alerta: "Urgente"
  }
];

const PRIORITY_CLASS = {
  Alta: "lp-prio-alta",
  Media: "lp-prio-media",
  Baja: "lp-prio-baja"
};

const ALERT_CLASS = {
  Vencida: "lp-alert-vencida",
  Urgente: "lp-alert-urgente",
  "Verificar fecha": "lp-alert-verificar"
};

const SURVEY_STATS = [
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

const STEPS = [
  {
    title: "Descarga la plantilla.",
    text: "Deja tu correo y la descarga empieza al instante."
  },
  {
    title: "Escribe tus asignaturas y entregas.",
    text: "Con listas desplegables para la asignatura, la prioridad y el estado."
  },
  {
    title: "Mira qué toca esta semana.",
    text: "Las hojas de semana, carga y progreso se actualizan solas."
  }
];

const FEATURES = [
  {
    title: "Actividades",
    text: "Registra cada entrega con fecha, hora, prioridad y estado. Marca si ya verificaste la fecha y recibe alertas de vencida, urgente o por verificar.",
    icon: (
      <path d="M9 11l3 3 8-8M20 12v7a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V7a2 2 0 0 1 2-2h9" />
    )
  },
  {
    title: "Semana",
    text: "Tus entregas vencidas y las de los próximos 7 días, ordenadas por fecha.",
    icon: (
      <>
        <rect x="3" y="4" width="18" height="17" rx="2" />
        <path d="M16 2v4M8 2v4M3 10h18" />
      </>
    )
  },
  {
    title: "Carga",
    text: "Detecta las semanas en las que se te cruzan varias entregas.",
    icon: <path d="M4 20V10M10 20V4M16 20v-8M22 20H2" />
  },
  {
    title: "Progreso",
    text: "El porcentaje de actividades que ya terminaste en cada asignatura.",
    icon: (
      <>
        <circle cx="12" cy="12" r="9" />
        <path d="M12 7v5l3 2" />
      </>
    )
  }
];

const QUOTES = [
  "Un buen cronograma para que me alcance el tiempo",
  "El tiempo que se gasta en reorganizar nuevos items o editar"
];

function hasSession() {
  try {
    return Boolean(localStorage.getItem("rutaAcademicaSesion"));
  } catch {
    return false;
  }
}

function Icon({ children }) {
  return (
    <svg
      className="lp-icon"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      focusable="false"
    >
      {children}
    </svg>
  );
}

function Logo() {
  return (
    <Link to="/" className="lp-logo">
      <svg
        viewBox="0 0 32 32"
        width="28"
        height="28"
        aria-hidden="true"
        focusable="false"
      >
        <rect width="32" height="32" rx="8" fill="#2563eb" />
        <path
          d="M9 22c0-5 3-6 7-6s7-1 7-6M9 22h.01M23 10h.01"
          stroke="#fff"
          strokeWidth="2.6"
          strokeLinecap="round"
          fill="none"
        />
      </svg>
      <span>Ruta Académica</span>
    </Link>
  );
}

function DownloadButton({ className, onClick, children }) {
  return (
    <button type="button" className={className} onClick={onClick}>
      {children}
    </button>
  );
}

function TemplatePreview() {
  return (
    <div className="lp-preview" aria-hidden="true">
      <span className="lp-preview-tag">Vista de ejemplo</span>
      <p className="lp-preview-title">
        Esta semana: vencidas y próximos 7 días
      </p>
      <div className="lp-table">
        <div className="lp-row lp-row-head">
          <span>Fecha</span>
          <span>Actividad</span>
          <span className="lp-col-subject">Asignatura</span>
          <span>Prioridad</span>
          <span className="lp-col-status">Estado</span>
          <span>Alerta</span>
        </div>
        {PREVIEW_ROWS.map((row) => (
          <div className="lp-row" key={row.actividad}>
            <span>{row.fecha}</span>
            <span className="lp-cell-main">{row.actividad}</span>
            <span className="lp-col-subject">{row.asignatura}</span>
            <span className={`lp-prio ${PRIORITY_CLASS[row.prioridad]}`}>
              {row.prioridad}
            </span>
            <span className="lp-col-status">{row.estado}</span>
            <span>
              <span className={`lp-alert ${ALERT_CLASS[row.alerta]}`}>
                {row.alerta}
              </span>
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

function Landing() {
  const logged = hasSession();
  const [modalAbierto, setModalAbierto] = useState(false);
  const cerrarModal = () => setModalAbierto(false);

  useEffect(() => {
    if (!leadFormConfigurado) {
      console.warn(
        "Landing: falta VITE_LEAD_FORM_ACTION o VITE_LEAD_FORM_EMAIL_ENTRY. Los botones descargan la plantilla directo, sin pedir el correo."
      );
    }
  }, []);

  function pedirDescarga() {
    if (leadFormConfigurado) {
      setModalAbierto(true);
    } else {
      descargarPlantilla();
    }
  }

  return (
    <div className="lp">
      <a className="lp-skip" href="#contenido">
        Saltar al contenido
      </a>

      <header className="lp-header">
        <div className="lp-container lp-header-inner">
          <Logo />

          <nav className="lp-nav" aria-label="Secciones">
            {NAV_LINKS.map((item) => (
              <a key={item.href} href={item.href}>
                {item.label}
              </a>
            ))}
          </nav>

          <div className="lp-header-actions">
            <Link
              className="lp-btn lp-btn-ghost lp-hide-mobile"
              to={logged ? "/dashboard" : "/login"}
            >
              {logged ? "Ir a mi panel" : "Iniciar sesión"}
            </Link>
            <DownloadButton
              className="lp-btn lp-btn-primary"
              onClick={pedirDescarga}
            >
              Descargar plantilla
            </DownloadButton>
          </div>
        </div>
      </header>

      <main id="contenido">
        <section className="lp-hero" aria-labelledby="lp-hero-title">
          <div className="lp-container lp-hero-grid">
            <div className="lp-hero-copy">
              <span className="lp-badge">
                Para quienes estudian a distancia y trabajan
              </span>
              <h1 id="lp-hero-title">
                Tu semana de estudio, clara y en un solo lugar
              </h1>
              <p className="lp-lead">
                Una plantilla gratuita en Excel para organizar tus asignaturas,
                fechas de entrega y prioridades, hecha para quienes no tienen
                tiempo que perder.
              </p>

              <div className="lp-actions">
                <DownloadButton
                  className="lp-btn lp-btn-primary lp-btn-lg"
                  onClick={pedirDescarga}
                >
                  Descargar la plantilla gratis
                </DownloadButton>
                <Link
                  className="lp-btn lp-btn-outline lp-btn-lg"
                  to={logged ? "/dashboard" : "/registro"}
                >
                  {logged ? "Ir a mi panel" : "Probar la versión web"}
                </Link>
              </div>

              {leadFormConfigurado && (
                <p className="lp-context">Solo te pedimos tu correo.</p>
              )}

              <p className="lp-context">
                Proyecto académico de Comercio Electrónico, Universidad Militar
                Nueva Granada.
              </p>
            </div>

            <TemplatePreview />
          </div>
        </section>

        <section className="lp-section lp-survey" aria-labelledby="lp-survey-title">
          <div className="lp-container">
            <h2 id="lp-survey-title">Lo que vimos en nuestra encuesta</h2>
            <div className="lp-grid lp-grid-3">
              {SURVEY_STATS.map((stat) => (
                <div className="lp-card lp-stat" key={stat.figure}>
                  <strong>{stat.figure}</strong>
                  <p>{stat.text}</p>
                </div>
              ))}
            </div>
            <p className="lp-footnote">
              Encuesta propia a 9 estudiantes, muestra por conveniencia. Es un
              dato de orientación, no una estadística representativa.
            </p>
          </div>
        </section>

        <section
          id="como-funciona"
          className="lp-section"
          aria-labelledby="lp-steps-title"
        >
          <div className="lp-container">
            <h2 id="lp-steps-title">Cómo funciona</h2>
            <ol className="lp-grid lp-grid-3 lp-steps">
              {STEPS.map((step, index) => (
                <li className="lp-card lp-step" key={step.title}>
                  <span className="lp-step-num" aria-hidden="true">
                    {index + 1}
                  </span>
                  <h3>{step.title}</h3>
                  <p>{step.text}</p>
                </li>
              ))}
            </ol>
          </div>
        </section>

        <section
          id="que-incluye"
          className="lp-section lp-section-alt"
          aria-labelledby="lp-features-title"
        >
          <div className="lp-container">
            <h2 id="lp-features-title">Qué incluye la plantilla</h2>
            <div className="lp-grid lp-grid-4">
              {FEATURES.map((feature) => (
                <article className="lp-card lp-feature" key={feature.title}>
                  <span className="lp-feature-icon">
                    <Icon>{feature.icon}</Icon>
                  </span>
                  <h3>{feature.title}</h3>
                  <p>{feature.text}</p>
                </article>
              ))}
            </div>
            <p className="lp-note">
              La plantilla llega armada, con desplegables y cálculos
              automáticos: tú solo escribes tus materias y tus entregas.
            </p>
          </div>
        </section>

        <section
          id="version-web"
          className="lp-section"
          aria-labelledby="lp-web-title"
        >
          <div className="lp-container">
            <div className="lp-web">
              <span className="lp-badge lp-badge-light">Versión de prueba</span>
              <h2 id="lp-web-title">¿Prefieres usarla en línea?</h2>
              <p>
                Prueba la versión web de Ruta Académica: registra tus
                asignaturas y actividades, consulta tu calendario y mira tu
                progreso.
              </p>
              <div className="lp-actions">
                {logged ? (
                  <Link className="lp-btn lp-btn-primary lp-btn-lg" to="/dashboard">
                    Ir a mi panel
                  </Link>
                ) : (
                  <>
                    <Link className="lp-btn lp-btn-primary lp-btn-lg" to="/registro">
                      Crear cuenta
                    </Link>
                    <Link className="lp-btn lp-btn-outline lp-btn-lg" to="/login">
                      Iniciar sesión
                    </Link>
                  </>
                )}
              </div>
            </div>
          </div>
        </section>

        <section
          id="lo-que-vimos"
          className="lp-section lp-section-alt"
          aria-labelledby="lp-quotes-title"
        >
          <div className="lp-container">
            <h2 id="lp-quotes-title">Lo que dijeron los estudiantes</h2>
            <div className="lp-grid lp-grid-2">
              {QUOTES.map((quote) => (
                <figure className="lp-card lp-quote" key={quote}>
                  <blockquote>“{quote}”</blockquote>
                  <figcaption>Estudiante encuestado</figcaption>
                </figure>
              ))}
            </div>
          </div>
        </section>

        <section className="lp-cta" aria-labelledby="lp-cta-title">
          <div className="lp-container">
            <h2 id="lp-cta-title">Empieza a organizar tu semestre</h2>
            <div className="lp-actions lp-actions-center">
              <DownloadButton
                className="lp-btn lp-btn-light lp-btn-lg"
                onClick={pedirDescarga}
              >
                Descargar la plantilla gratis
              </DownloadButton>
              <Link
                className="lp-btn lp-btn-outline-light lp-btn-lg"
                to={logged ? "/dashboard" : "/registro"}
              >
                {logged ? "Ir a mi panel" : "Probar la versión web"}
              </Link>
            </div>
          </div>
        </section>
      </main>

      <footer className="lp-footer">
        <div className="lp-container">
          <strong>Ruta Académica</strong>
          <p>
            Proyecto académico · Comercio Electrónico · Universidad Militar
            Nueva Granada
          </p>
          <p>© {CURRENT_YEAR}</p>
        </div>
      </footer>

      <TemplateDownloadModal
        open={modalAbierto}
        logged={logged}
        onClose={cerrarModal}
      />
    </div>
  );
}

export default Landing;
