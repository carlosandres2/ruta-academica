import { useEffect, useState } from "react";

import {
  BrowserRouter,
  Routes,
  Route,
  Link,
  useNavigate
} from "react-router-dom";

import "./index.css";

import Activities from "./pages/Activities";
import Subjects from "./pages/Subjects";
import Calendar from "./pages/Calendar";
import Progress from "./pages/Progress";
import Landing from "./pages/Landing";

import {
  crearUsuario,
  iniciarSesion
} from "./services/usuarioService";

import api from "./services/api";


/* =========================================================
   LOGIN
========================================================= */

function Login() {

  const navigate = useNavigate();

  const [correo, setCorreo] = useState("");
  const [password, setPassword] = useState("");

  const [mensaje, setMensaje] = useState("");
  const [error, setError] = useState("");


  const manejarLogin = async (e) => {

    e.preventDefault();

    setMensaje("");
    setError("");

    if (!correo || !password) {

      setError(
        "Por favor completa todos los campos."
      );

      return;
    }

    try {

      const usuario = await iniciarSesion(
        correo,
        password
      );

      localStorage.setItem(
        "rutaAcademicaSesion",
        JSON.stringify(usuario)
      );

      setMensaje(
        "Inicio de sesión exitoso."
      );

      setTimeout(() => {

        navigate("/dashboard");

      }, 500);

    } catch (err) {

      console.error(err);

      setError(
        err?.response?.data?.mensaje ||
        "No fue posible iniciar sesión."
      );

    }

  };


  return (
    <div className="auth-page">

      <div className="auth-card">

        <h1>Ruta Académica</h1>

        <h2>Iniciar sesión</h2>

        <form onSubmit={manejarLogin}>

          <label>
            Correo electrónico
          </label>

          <input
            type="email"
            placeholder="correo@ejemplo.com"
            value={correo}
            onChange={(e) =>
              setCorreo(e.target.value)
            }
          />

          <label>
            Contraseña
          </label>

          <input
            type="password"
            placeholder="Contraseña"
            value={password}
            onChange={(e) =>
              setPassword(e.target.value)
            }
          />

          {error && (
            <p className="error-message">
              {error}
            </p>
          )}

          {mensaje && (
            <p className="success-message">
              {mensaje}
            </p>
          )}

          <button type="submit">
            Ingresar
          </button>

        </form>

        <p>

          ¿No tienes una cuenta?

          <Link to="/registro">
            {" "}Registrarse
          </Link>

        </p>

        <Link to="/">
          Volver al inicio
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
  const [password, setPassword] = useState("");
  const [confirmarPassword, setConfirmarPassword] = useState("");
  const [programa, setPrograma] = useState("");
  const [institucion, setInstitucion] = useState("");

  const [mensaje, setMensaje] = useState("");
  const [error, setError] = useState("");


  const manejarRegistro = async (e) => {

    e.preventDefault();

    setMensaje("");
    setError("");

    if (
      !nombre ||
      !correo ||
      !password ||
      !confirmarPassword ||
      !programa ||
      !institucion
    ) {

      setError(
        "Por favor completa todos los campos."
      );

      return;
    }

    if (password !== confirmarPassword) {

      setError(
        "Las contraseñas no coinciden."
      );

      return;
    }

    try {

      await crearUsuario({

        nombre,
        correo,
        password,
        programa,
        institucion

      });

      setMensaje(
        "Registro exitoso. Ahora puedes iniciar sesión."
      );

      setTimeout(() => {

        navigate("/login");

      }, 1200);

    } catch (err) {

      console.error(err);

      setError(
        err?.response?.data?.mensaje ||
        "No fue posible crear la cuenta."
      );

    }

  };


  return (
    <div className="auth-page">

      <div className="auth-card">

        <h1>Ruta Académica</h1>

        <h2>Crear cuenta</h2>

        <form onSubmit={manejarRegistro}>

          <label>
            Nombre completo
          </label>

          <input
            type="text"
            placeholder="Carlos Andrés Pérez"
            value={nombre}
            onChange={(e) =>
              setNombre(e.target.value)
            }
          />

          <label>
            Correo electrónico
          </label>

          <input
            type="email"
            placeholder="correo@ejemplo.com"
            value={correo}
            onChange={(e) =>
              setCorreo(e.target.value)
            }
          />

          <label>
            Contraseña
          </label>

          <input
            type="password"
            placeholder="Contraseña"
            value={password}
            onChange={(e) =>
              setPassword(e.target.value)
            }
          />

          <label>
            Confirmar contraseña
          </label>

          <input
            type="password"
            placeholder="Repite la contraseña"
            value={confirmarPassword}
            onChange={(e) =>
              setConfirmarPassword(e.target.value)
            }
          />

          <label>
            Programa académico
          </label>

          <input
            type="text"
            placeholder="Ingeniería Informática"
            value={programa}
            onChange={(e) =>
              setPrograma(e.target.value)
            }
          />

          <label>
            Institución
          </label>

          <input
            type="text"
            placeholder="Universidad Militar Nueva Granada"
            value={institucion}
            onChange={(e) =>
              setInstitucion(e.target.value)
            }
          />

          {error && (
            <p className="error-message">
              {error}
            </p>
          )}

          {mensaje && (
            <p className="success-message">
              {mensaje}
            </p>
          )}

          <button type="submit">
            Registrarse
          </button>

        </form>

        <p>

          ¿Ya tienes una cuenta?

          <Link to="/login">
            {" "}Iniciar sesión
          </Link>

        </p>

        <Link to="/">
          Volver al inicio
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

  const [usuario, setUsuario] = useState(null);

  const [actividades, setActividades] = useState([]);
  const [asignaturas, setAsignaturas] = useState([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");


  useEffect(() => {

    const sesion =
      localStorage.getItem(
        "rutaAcademicaSesion"
      );

    if (!sesion) {

      navigate("/login");

      return;

    }

    let usuarioGuardado;

    try {

      usuarioGuardado =
        JSON.parse(sesion);

      setUsuario(usuarioGuardado);

    } catch (err) {

      console.error(err);

      localStorage.removeItem(
        "rutaAcademicaSesion"
      );

      navigate("/login");

      return;

    }


    const cargarDatos = async () => {

      try {

        setLoading(true);
        setError("");

        const usuarioId =
          usuarioGuardado.id ??
          usuarioGuardado.usuario_id ??
          null;


        if (!usuarioId) {

          setError(
            "No fue posible identificar al usuario."
          );

          setLoading(false);

          return;

        }


        console.log(
          "Dashboard - Usuario actual:",
          usuarioId
        );


        const [
          actividadesResponse,
          asignaturasResponse
        ] = await Promise.all([

          api.get("/actividades", {
            params: {
              usuario_id: usuarioId
            }
          }),

          api.get("/asignaturas", {
            params: {
              usuario_id: usuarioId
            }
          })

        ]);


        setActividades(
          Array.isArray(
            actividadesResponse.data
          )
            ? actividadesResponse.data
            : []
        );


        setAsignaturas(
          Array.isArray(
            asignaturasResponse.data
          )
            ? asignaturasResponse.data
            : []
        );


      } catch (err) {

        console.error(err);

        setError(
          "No fue posible cargar la información académica."
        );

      } finally {

        setLoading(false);

      }

    };


    cargarDatos();

  }, [navigate]);


  const cerrarSesion = () => {

    localStorage.removeItem(
      "rutaAcademicaSesion"
    );

    navigate("/login");

  };


  const totalActividades =
    actividades.length;


  const completadas =
    actividades.filter(
      (actividad) =>
        String(actividad.estado || "")
          .toLowerCase() === "completada" ||
        String(actividad.estado || "")
          .toLowerCase() === "terminada"
    ).length;


  const pendientes =
    actividades.filter(
      (actividad) =>
        String(actividad.estado || "")
          .toLowerCase() === "pendiente"
    ).length;


  const altaPrioridad =
    actividades.filter(
      (actividad) =>
        String(actividad.prioridad || "")
          .toLowerCase() === "alta"
    ).length;


  const progreso =
    totalActividades > 0
      ? Math.round(
          (completadas / totalActividades) * 100
        )
      : 0;


  const actividadesProximas =
    [...actividades]
      .sort((a, b) => {

        const fechaA =
          new Date(
            a.fechaEntrega ||
            a.fecha
          );

        const fechaB =
          new Date(
            b.fechaEntrega ||
            b.fecha
          );

        return fechaA - fechaB;

      })
      .slice(0, 5);


  return (

    <div className="dashboard">


      {/* =====================================================
          SIDEBAR
      ===================================================== */}

      <aside className="sidebar">

        <div className="sidebar-logo">

          <h2>
            Ruta Académica
          </h2>

        </div>


        <nav>

          <Link to="/dashboard">
            Inicio
          </Link>

          <Link to="/asignaturas">
            Asignaturas
          </Link>

          <Link to="/actividades">
            Actividades
          </Link>

          <Link to="/calendario">
            Calendario
          </Link>

          <Link to="/progreso">
            Progreso
          </Link>

        </nav>


        <button
          className="logout"
          onClick={cerrarSesion}
        >
          Salir
        </button>

      </aside>


      {/* =====================================================
          CONTENIDO
      ===================================================== */}

      <main className="dashboard-content">


        <header className="dashboard-header">

          <div>

            <h1>

              Hola,{" "}

              {usuario?.nombre ||
                "Estudiante"}

            </h1>

            <p>
              Aquí tienes un resumen de tu
              actividad académica.
            </p>

          </div>

        </header>


        {error && (

          <div className="error-message">

            {error}

          </div>

        )}


        {loading ? (

          <p>
            Cargando información académica...
          </p>

        ) : (

          <>


            {/* =================================================
                ESTADÍSTICAS
            ================================================= */}

            <section className="dashboard-stats">


              <div className="dashboard-stat">

                <span>
                  Actividades pendientes
                </span>

                <strong>
                  {pendientes}
                </strong>

              </div>


              <div className="dashboard-stat">

                <span>
                  Alta prioridad
                </span>

                <strong>
                  {altaPrioridad}
                </strong>

              </div>


              <div className="dashboard-stat">

                <span>
                  Completadas
                </span>

                <strong>
                  {completadas}
                </strong>

              </div>


              <div className="dashboard-stat">

                <span>
                  Progreso académico
                </span>

                <strong>
                  {progreso}%
                </strong>

              </div>


            </section>


            {/* =================================================
                GRID PRINCIPAL
            ================================================= */}

            <section className="dashboard-grid">


              {/* ===============================================
                  PRÓXIMAS ACTIVIDADES
              =============================================== */}

              <div className="panel">

                <div className="panel-header">

                  <h2>
                    Próximas actividades
                  </h2>

                  <Link to="/actividades">
                    Ver todas
                  </Link>

                </div>


                {actividadesProximas.length === 0 ? (

                  <p>
                    No tienes actividades registradas.
                  </p>

                ) : (

                  actividadesProximas.map(
                    (actividad) => (

                      <div
                        className="dashboard-activity"
                        key={
                          actividad.id ||
                          actividad._id
                        }
                      >

                        <div>

                          <h3>
                            {actividad.nombre ||
                              actividad.titulo ||
                              "Actividad"}
                          </h3>

                          <p>

                            {actividad.asignatura ||
                              actividad.asignaturaNombre ||
                              "Sin asignatura"}

                            {" · "}

                            {actividad.fechaEntrega ||
                              actividad.fecha ||
                              "Sin fecha"}

                          </p>

                        </div>


                        <span
                          className={`priority ${
                            String(
                              actividad.prioridad ||
                              ""
                            ).toLowerCase()
                          }`}
                        >

                          {actividad.prioridad ||
                            "Sin prioridad"}

                        </span>

                      </div>

                    )
                  )

                )}

              </div>


              {/* ===============================================
                  PROGRESO
              =============================================== */}

              <div className="panel">

                <div className="panel-header">

                  <h2>
                    Progreso académico
                  </h2>

                  <Link to="/progreso">
                    Ver progreso
                  </Link>

                </div>


                <div className="progress-circle">

                  <strong>
                    {progreso}%
                  </strong>

                </div>


                <p className="progress-text">

                  Has completado{" "}

                  <strong>
                    {completadas}
                  </strong>

                  {" "}de{" "}

                  <strong>
                    {totalActividades}
                  </strong>

                  {" "}actividades.

                </p>

              </div>


            </section>


            {/* =================================================
                ASIGNATURAS
            ================================================= */}

            <section className="panel">

              <div className="panel-header">

                <h2>
                  Mis asignaturas
                </h2>

                <Link to="/asignaturas">
                  Ver asignaturas
                </Link>

              </div>


              {asignaturas.length === 0 ? (

                <p>
                  No tienes asignaturas registradas.
                </p>

              ) : (

                <div>

                  {asignaturas
                    .slice(0, 4)
                    .map(
                      (asignatura) => (

                        <div
                          className="dashboard-activity"
                          key={
                            asignatura.id ||
                            asignatura._id
                          }
                        >

                          <div>

                            <h3>
                              {asignatura.nombre ||
                                asignatura.name ||
                                "Asignatura"}
                            </h3>

                          </div>

                        </div>

                      )
                    )}

                </div>

              )}

            </section>


          </>

        )}


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
          element={<Landing />}
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

        <Route
          path="/asignaturas"
          element={<Subjects />}
        />

        <Route
          path="/calendario"
          element={<Calendar />}
        />

        <Route
          path="/progreso"
          element={<Progress />}
        />

      </Routes>

    </BrowserRouter>

  );

}


export default App;