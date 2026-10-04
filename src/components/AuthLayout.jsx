import { Link } from "react-router-dom";

import "../styles/app-tokens.css";
import "../pages/Auth.css";

const BENEFICIOS = [
  "Registra tus asignaturas y actividades en un solo lugar.",
  "Ordena tus entregas por fecha y prioridad.",
  "Mira tu avance sin perder tiempo."
];

function AuthLayout({ titulo, subtitulo, children, pie }) {
  return (
    <div className="app-auth">
      <aside className="app-auth-brand">
        <Link to="/" className="app-auth-logo">
          <svg viewBox="0 0 32 32" width="32" height="32" aria-hidden="true" focusable="false">
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

        <div className="app-auth-pitch">
          <p className="app-auth-pitch-title">
            Tu semana de estudio, clara y en un solo lugar
          </p>
          <ul>
            {BENEFICIOS.map((beneficio) => (
              <li key={beneficio}>{beneficio}</li>
            ))}
          </ul>
        </div>

        <p className="app-auth-note">Versión de prueba · Proyecto académico</p>
      </aside>

      <main className="app-auth-main">
        <div className="app-auth-card">
          <h1>{titulo}</h1>
          {subtitulo && <p className="app-auth-sub">{subtitulo}</p>}

          {children}

          <div className="app-auth-foot">
            {pie}
            <Link to="/">Volver al inicio</Link>
          </div>
        </div>
      </main>
    </div>
  );
}

export default AuthLayout;
