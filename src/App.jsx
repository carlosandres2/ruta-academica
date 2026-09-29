import { useState } from "react";
import { BrowserRouter, Routes, Route, Link, useNavigate } from "react-router-dom";
import "./index.css";
import Activities from "./pages/Activities";

/* =========================================================
   INICIO
========================================================= */

function Inicio() {
  return (
    <div className="landing">
      <nav className="navbar">
        <div className="logo">
          📚 Ruta Académica
        </div>

        <div className="nav-links">
          <Link to="/">Inicio</Link>
          <Link to="/login">Iniciar sesión</Link>

          <Link to="/registro" className="btn-primary">
            Registrarse
          </Link>
        </div>
      </nav>

      <main className="hero">
        <section className="hero-text">
          <span className="badge">
            🎓 Organización académica
          </span>

          <h1>
            Organiza tus actividades.
            <br />
            <span>Prioriza tus tareas.</span>
          </h1>

          <p>
            Ruta Académica es una plataforma diseñada para ayudarte a
            organizar tus asignaturas, actividades, fechas de entrega
            y prioridades en un solo lugar.
          </p>

          <div className="hero-buttons">
            <Link
              to="/registro"
              className="btn-primary btn-large"
            >
              Comenzar ahora
            </Link>

            <Link
              to="/login"
              className="btn-secondary"
            >
              Iniciar sesión
            </Link>
          </div>
        </section>

        <section className="hero-card">
          <div className="dashboard-preview">

            <div className="preview-header">
              <strong>📊 Mi Ruta Académica</strong>
              <span>👤 Carlos</span>
            </div>

            <div className="stats">

              <div className="stat-card">
                <strong>12</strong>
                <span>Pendientes</span>
              </div>

              <div className="stat-card urgent">
                <strong>5</strong>
                <span>Urgentes</span>
              </div>

              <div className="stat-card completed">
                <strong>8</strong>
                <span>Completadas</span>
              </div>

            </div>

            <div className="activity-preview">

              <h3>Actividades próximas</h3>

              <div className="activity">
                <div>
                  <strong>Taller de Bases de Datos</strong>
                  <small>📅 30/09/2026</small>
                </div>

                <span className="priority high">
                  Alta
                </span>
              </div>

              <div className="activity">
                <div>
                  <strong>Proyecto Desarrollo Web</strong>
                  <small>📅 02/10/2026</small>
                </div>

                <span className="priority medium">
                  Media
                </span>
              </div>

              <div className="activity">
                <div>
                  <strong>Auditoría Informática</strong>
                  <small>📅 05/10/2026</small>
                </div>

                <span className="priority low">
                  Baja
                </span>
              </div>

            </div>
          </div>
        </section>
      </main>

      <section className="features">

        <div className="feature">
          <div className="feature-icon">📚</div>

          <h3>Organiza</h3>

          <p>
            Administra tus asignaturas y actividades académicas.
          </p>
        </div>

        <div className="feature">
          <div className="feature-icon">🎯</div>

          <h3>Prioriza</h3>

          <p>
            Identifica las tareas que requieren mayor atención.
          </p>
        </div>

        <div className="feature">
          <div className="feature-icon">📈</div>

          <h3>Haz seguimiento</h3>

          <p>
            Consulta el progreso de tus responsabilidades académicas.
          </p>
        </div>

      </section>

      <footer>
        <p>
          © 2026 Ruta Académica — Organización académica inteligente.
        </p>
      </footer>
    </div>
  );
}

/* =========================================================
   LOGIN
========================================================= */

function Login() {
  const navigate = useNavigate();

  const [correo, setCorreo] = useState("");
  const [contrasena, setContrasena] = useState("");
  const [error, setError] = useState("");

  const manejarLogin = (e) => {
    e.preventDefault();

    setError("");

    if (!correo || !contrasena) {
      setError("Por favor completa todos los campos.");
      return;
    }

    const usuarioGuardado = localStorage.getItem(
      "rutaAcademicaUsuario"
    );

    if (!usuarioGuardado) {
      setError(
        "No existe una cuenta registrada. Primero debes registrarte."
      );
      return;
    }

    const usuario = JSON.parse(usuarioGuardado);

    if (
      usuario.correo !== correo ||
      usuario.contrasena !== contrasena
    ) {
      setError(
        "El correo o la contraseña son incorrectos."
      );
      return;
    }

    localStorage.setItem(
      "rutaAcademicaSesion",
      JSON.stringify(usuario)
    );

    navigate("/dashboard");
  };

  return (
    <div className="auth-page">

      <div className="auth-card">

        <div className="logo">
          📚 Ruta Académica
        </div>

        <h1>Iniciar sesión</h1>

        <p>
          Ingresa para continuar con tu ruta académica.
        </p>

        {error && (
          <div className="auth-error">
            {error}
          </div>
        )}

        <form onSubmit={manejarLogin}>

          <label>
            Correo electrónico
          </label>

          <input
            type="email"
            placeholder="correo@ejemplo.com"
            value={correo}
            onChange={(e) => setCorreo(e.target.value)}
          />

          <label>
            Contraseña
          </label>

          <input
            type="password"
            placeholder="Contraseña"
            value={contrasena}
            onChange={(e) => setContrasena(e.target.value)}
          />

          <button
            type="submit"
            className="btn-primary"
          >
            Iniciar sesión
          </button>

        </form>

        <p className="auth-link">
          ¿No tienes una cuenta?

          <Link to="/registro">
            {" "}Registrarse
          </Link>
        </p>

        <Link to="/">
          ← Volver al inicio
        </Link>

      </div>
    </div>
  );
}

/* =========================================================
   REGISTRO
========================================================= */

function Registro() {
  const navigate = useNavigate();

  const [nombre, setNombre] = useState("");
  const [correo, setCorreo] = useState("");
  const [programa, setPrograma] = useState("");
  const [contrasena, setContrasena] = useState("");
  const [confirmarContrasena, setConfirmarContrasena] =
    useState("");

  const [error, setError] = useState("");
  const [mensaje, setMensaje] = useState("");

  const manejarRegistro = (e) => {
    e.preventDefault();

    setError("");
    setMensaje("");

    if (
      !nombre ||
      !correo ||
      !programa ||
      !contrasena ||
      !confirmarContrasena
    ) {
      setError(
        "Por favor completa todos los campos."
      );
      return;
    }

    if (contrasena.length < 6) {
      setError(
        "La contraseña debe tener mínimo 6 caracteres."
      );
      return;
    }

    if (contrasena !== confirmarContrasena) {
      setError(
        "Las contraseñas no coinciden."
      );
      return;
    }

    const usuarioExistente =
      localStorage.getItem(
        "rutaAcademicaUsuario"
      );

    if (usuarioExistente) {
      const usuario = JSON.parse(usuarioExistente);

      if (
        usuario.correo.toLowerCase() ===
        correo.toLowerCase()
      ) {
        setError(
          "Ya existe una cuenta con este correo."
        );
        return;
      }
    }

    const nuevoUsuario = {
      nombre,
      correo,
      programa,
      contrasena,
    };

    localStorage.setItem(
      "rutaAcademicaUsuario",
      JSON.stringify(nuevoUsuario)
    );

    setMensaje(
      "Cuenta creada correctamente. Redirigiendo al inicio de sesión..."
    );

    setTimeout(() => {
      navigate("/login");
    }, 1500);
  };

  return (
    <div className="auth-page">

      <div className="auth-card">

        <div className="logo">
          📚 Ruta Académica
        </div>

        <h1>Crear cuenta</h1>

        <p>
          Comienza a organizar tus actividades académicas.
        </p>

        {error && (
          <div className="auth-error">
            {error}
          </div>
        )}

        {mensaje && (
          <div className="auth-success">
            {mensaje}
          </div>
        )}

        <form onSubmit={manejarRegistro}>

          <label>
            Nombre completo
          </label>

          <input
            type="text"
            placeholder="Carlos Andrés Pérez"
            value={nombre}
            onChange={(e) => setNombre(e.target.value)}
          />

          <label>
            Correo electrónico
          </label>

          <input
            type="email"
            placeholder="correo@ejemplo.com"
            value={correo}
            onChange={(e) => setCorreo(e.target.value)}
          />

          <label>
            Programa académico
          </label>

          <input
            type="text"
            placeholder="Ingeniería Informática"
            value={programa}
            onChange={(e) => setPrograma(e.target.value)}
          />

          <label>
            Contraseña
          </label>

          <input
            type="password"
            placeholder="Mínimo 6 caracteres"
            value={contrasena}
            onChange={(e) => setContrasena(e.target.value)}
          />

          <label>
            Confirmar contraseña
          </label>

          <input
            type="password"
            placeholder="Confirmar contraseña"
            value={confirmarContrasena}
            onChange={(e) =>
              setConfirmarContrasena(e.target.value)
            }
          />

          <button
            type="submit"
            className="btn-primary"
          >
            Crear cuenta
          </button>

        </form>

        <p className="auth-link">
          ¿Ya tienes una cuenta?

          <Link to="/login">
            {" "}Iniciar sesión
          </Link>
        </p>

        <Link to="/">
          ← Volver al inicio
        </Link>

      </div>
    </div>
  );
}

/* =========================================================
   DASHBOARD
========================================================= */

function Dashboard() {
  const navigate = useNavigate();

  const usuarioGuardado =
    localStorage.getItem("rutaAcademicaSesion");

  const usuario = usuarioGuardado
    ? JSON.parse(usuarioGuardado)
    : null;

  const cerrarSesion = () => {
    localStorage.removeItem(
      "rutaAcademicaSesion"
    );

    navigate("/login");
  };

  if (!usuario) {
    return (
      <div className="auth-page">
        <div className="auth-card">

          <h1>Sesión no iniciada</h1>

          <p>
            Debes iniciar sesión para acceder al Dashboard.
          </p>

          <Link
            to="/login"
            className="btn-primary"
          >
            Iniciar sesión
          </Link>

        </div>
      </div>
    );
  }

  return (
    <div className="dashboard">

      <aside className="sidebar">

        <div className="sidebar-logo">
          📚 Ruta Académica
        </div>

        <nav>

          <Link to="/dashboard">
            🏠 Inicio
          </Link>

          <Link to="/dashboard">
            📚 Asignaturas
          </Link>

          <Link to="/actividades">
            ✅ Actividades
          </Link>

          <Link to="/dashboard">
            📅 Calendario
          </Link>

          <Link to="/dashboard">
            📈 Progreso
          </Link>

        </nav>

        <button
          onClick={cerrarSesion}
          className="logout"
        >
          🚪 Salir
        </button>

      </aside>

      <main className="dashboard-content">

        <header className="dashboard-header">

          <div>

            <h1>
              Hola, {usuario.nombre} 👋
            </h1>

            <p>
              Aquí tienes un resumen de tu actividad académica.
            </p>

          </div>

          <div className="user-avatar">
            {usuario.nombre
              .split(" ")
              .map((parte) => parte[0])
              .slice(0, 2)
              .join("")
              .toUpperCase()}
          </div>

        </header>

        <section className="dashboard-stats">

          <div className="dashboard-stat">
            <span>📋</span>
            <strong>12</strong>
            <p>Actividades pendientes</p>
          </div>

          <div className="dashboard-stat">
            <span>🔴</span>
            <strong>5</strong>
            <p>Alta prioridad</p>
          </div>

          <div className="dashboard-stat">
            <span>🟢</span>
            <strong>8</strong>
            <p>Completadas</p>
          </div>

          <div className="dashboard-stat">
            <span>📊</span>
            <strong>60%</strong>
            <p>Progreso académico</p>
          </div>

        </section>

        <section className="dashboard-grid">

          <div className="panel">

            <div className="panel-header">

              <h2>
                Actividades próximas
              </h2>

              <Link to="/actividades">
                Ver todas
              </Link>

            </div>

            <div className="dashboard-activity">

              <div>
                <strong>
                  Taller de Bases de Datos
                </strong>

                <p>
                  📚 Bases de Datos · 📅 30/09/2026
                </p>
              </div>

              <span className="priority high">
                Alta
              </span>

            </div>

            <div className="dashboard-activity">

              <div>
                <strong>
                  Proyecto Desarrollo Web
                </strong>

                <p>
                  📚 Desarrollo Web · 📅 02/10/2026
                </p>
              </div>

              <span className="priority medium">
                Media
              </span>

            </div>

            <div className="dashboard-activity">

              <div>
                <strong>
                  Trabajo de Auditoría
                </strong>

                <p>
                  📚 Auditoría Informática · 📅 05/10/2026
                </p>
              </div>

              <span className="priority low">
                Baja
              </span>

            </div>

          </div>

          <div className="panel">

            <h2>
              Progreso
            </h2>

            <div className="progress-circle">
              <strong>60%</strong>
            </div>

            <p className="progress-text">
              Has completado 18 de 30 actividades.
            </p>

            <Link
              to="/dashboard"
              className="btn-primary"
            >
              Ver progreso
            </Link>

          </div>

        </section>

      </main>

    </div>
  );
}

/* =========================================================
   APP
========================================================= */

function App() {
  return (
    <BrowserRouter>

      <Routes>

        <Route
          path="/"
          element={<Inicio />}
        />

        <Route
          path="/login"
          element={<Login />}
        />

        <Route
          path="/registro"
          element={<Registro />}
        />

        <Route
          path="/dashboard"
          element={<Dashboard />}
        />

        <Route
          path="/actividades"
          element={<Activities />}
        />

      </Routes>

    </BrowserRouter>
  );
}

export default App;