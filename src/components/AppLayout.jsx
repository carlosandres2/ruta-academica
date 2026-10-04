import { useEffect, useRef, useState } from "react";
import { Navigate, NavLink, useNavigate } from "react-router-dom";

import "../styles/app-tokens.css";
import "./AppLayout.css";
import "./ui.css";

const SESSION_KEY = "rutaAcademicaSesion";

const NAV_ITEMS = [
  {
    to: "/dashboard",
    label: "Inicio",
    icon: <path d="M3 11l9-8 9 8M5 10v10h5v-6h4v6h5V10" />
  },
  {
    to: "/asignaturas",
    label: "Asignaturas",
    icon: <path d="M4 5a2 2 0 0 1 2-2h13v16H6a2 2 0 0 0-2 2V5zM4 19a2 2 0 0 1 2-2h13" />
  },
  {
    to: "/actividades",
    label: "Actividades",
    icon: <path d="M9 11l3 3 8-8M20 12v7a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V7a2 2 0 0 1 2-2h9" />
  },
  {
    to: "/calendario",
    label: "Calendario",
    icon: (
      <>
        <rect x="3" y="4" width="18" height="17" rx="2" />
        <path d="M16 2v4M8 2v4M3 10h18" />
      </>
    )
  },
  {
    to: "/progreso",
    label: "Progreso",
    icon: <path d="M4 20V10M10 20V4M16 20v-8M22 20H2" />
  }
];

function leerSesion() {
  try {
    const sesion = localStorage.getItem(SESSION_KEY);

    if (!sesion) return null;

    const usuario = JSON.parse(sesion);

    return usuario && typeof usuario === "object" ? usuario : null;
  } catch {
    return null;
  }
}

function iniciales(nombre) {
  if (!nombre) return "US";

  return String(nombre)
    .split(" ")
    .filter(Boolean)
    .map((parte) => parte[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

function NavIcon({ children }) {
  return (
    <svg
      className="app-icon"
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

function Brand() {
  return (
    <span className="app-brand">
      <svg viewBox="0 0 32 32" width="30" height="30" aria-hidden="true" focusable="false">
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
    </span>
  );
}

function AppLayout({ pageClass = "", children }) {
  const navigate = useNavigate();
  const [usuario] = useState(leerSesion);
  const [abierto, setAbierto] = useState(false);

  const menuRef = useRef(null);
  const sidebarRef = useRef(null);
  const estabaAbierto = useRef(false);

  useEffect(() => {
    if (abierto) {
      estabaAbierto.current = true;
      sidebarRef.current?.querySelector("a")?.focus();

      const cerrarConEscape = (evento) => {
        if (evento.key === "Escape") setAbierto(false);
      };

      const overflowPrevio = document.body.style.overflow;
      document.body.style.overflow = "hidden";
      document.addEventListener("keydown", cerrarConEscape);

      return () => {
        document.body.style.overflow = overflowPrevio;
        document.removeEventListener("keydown", cerrarConEscape);
      };
    }

    if (estabaAbierto.current) {
      estabaAbierto.current = false;
      menuRef.current?.focus();
    }

    return undefined;
  }, [abierto]);

  if (!usuario) {
    return <Navigate to="/login" replace />;
  }

  const cerrarSesion = () => {
    try {
      localStorage.removeItem(SESSION_KEY);
    } catch {
      // sin almacenamiento disponible: se continúa con la redirección
    }

    navigate("/login");
  };

  return (
    <div className="app-shell">
      <a className="app-skip" href="#app-main">
        Saltar al contenido
      </a>

      <header className="app-topbar">
        <Brand />
        <button
          ref={menuRef}
          type="button"
          className="app-menu-btn"
          aria-label="Abrir menú"
          aria-expanded={abierto}
          aria-controls="app-sidebar"
          onClick={() => setAbierto(true)}
        >
          <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
            <path
              d="M4 7h16M4 12h16M4 17h16"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
            />
          </svg>
        </button>
      </header>

      <div
        className={`app-overlay ${abierto ? "is-open" : ""}`}
        onClick={() => setAbierto(false)}
        aria-hidden="true"
      />

      <aside
        id="app-sidebar"
        ref={sidebarRef}
        className={`app-sidebar ${abierto ? "is-open" : ""}`}
      >
        <div className="app-sidebar-head">
          <Brand />
          <button
            type="button"
            className="app-close-btn"
            aria-label="Cerrar menú"
            onClick={() => setAbierto(false)}
          >
            <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
              <path
                d="M6 6l12 12M18 6L6 18"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
              />
            </svg>
          </button>
        </div>

        <nav className="app-nav" aria-label="Principal">
          {NAV_ITEMS.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className="app-nav-link"
              onClick={() => setAbierto(false)}
            >
              <NavIcon>{item.icon}</NavIcon>
              <span>{item.label}</span>
            </NavLink>
          ))}
        </nav>

        <div className="app-user">
          <span className="app-avatar" aria-hidden="true">
            {iniciales(usuario.nombre)}
          </span>
          <span className="app-user-info">
            <strong>{usuario.nombre || "Estudiante"}</strong>
            {usuario.correo && <small>{usuario.correo}</small>}
          </span>
        </div>

        <button type="button" className="app-logout" onClick={cerrarSesion}>
          <NavIcon>
            <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4M16 17l5-5-5-5M21 12H9" />
          </NavIcon>
          <span>Salir</span>
        </button>
      </aside>

      <main id="app-main" className={`app-main ${pageClass}`.trim()}>
        {children}
      </main>
    </div>
  );
}

export default AppLayout;
