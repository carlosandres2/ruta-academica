import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../services/api";

function Calendar() {
  const navigate = useNavigate();

  const [actividades, setActividades] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const cargarActividades = async () => {
      try {
        setCargando(true);
        setError("");

        const sesion = localStorage.getItem("rutaAcademicaSesion");

        if (!sesion) {
          navigate("/login");
          return;
        }

        const usuario = JSON.parse(sesion);
        const usuarioId = usuario.id ?? usuario.usuario_id;

        if (!usuarioId) {
          setError("No se encontró el usuario de la sesión.");
          setActividades([]);
          return;
        }

        const respuesta = await api.get("/actividades", {
          params: {
            usuario_id: usuarioId,
          },
        });

        const datos = Array.isArray(respuesta.data)
          ? respuesta.data
          : [];

        setActividades(datos);
      } catch (err) {
        console.error("Error al cargar calendario:", err);
        setError("No fue posible cargar las actividades.");
        setActividades([]);
      } finally {
        setCargando(false);
      }
    };

    cargarActividades();
  }, [navigate]);

  const cerrarSesion = () => {
    localStorage.removeItem("rutaAcademicaSesion");
    navigate("/login");
  };

  const obtenerFecha = (actividad) => {
    return actividad.fecha_entrega || actividad.fecha || "";
  };

  const obtenerNombreAsignatura = (actividad) => {
    return (
      actividad.asignatura_nombre ||
      actividad.asignatura ||
      "Sin asignatura"
    );
  };

  const limpiarFecha = (fecha) => {
    if (!fecha) return "";

    if (typeof fecha === "string") {
      return fecha.substring(0, 10);
    }

    return fecha;
  };

  const formatearFecha = (fecha) => {
    const fechaLimpia = limpiarFecha(fecha);

    if (!fechaLimpia) {
      return "Sin fecha";
    }

    const partes = fechaLimpia.split("-");

    if (partes.length === 3) {
      const [anio, mes, dia] = partes;

      return `${dia}/${mes}/${anio}`;
    }

    const fechaObj = new Date(fechaLimpia);

    if (Number.isNaN(fechaObj.getTime())) {
      return fechaLimpia;
    }

    return fechaObj.toLocaleDateString("es-CO");
  };

  const obtenerDia = (fecha) => {
    const fechaLimpia = limpiarFecha(fecha);

    if (!fechaLimpia) {
      return "--";
    }

    const partes = fechaLimpia.split("-");

    if (partes.length === 3) {
      return partes[2];
    }

    return "--";
  };

  const obtenerMes = (fecha) => {
    const fechaLimpia = limpiarFecha(fecha);

    if (!fechaLimpia) {
      return "---";
    }

    const partes = fechaLimpia.split("-");

    if (partes.length === 3) {
      const numeroMes = Number(partes[1]);

      const meses = [
        "ENE",
        "FEB",
        "MAR",
        "ABR",
        "MAY",
        "JUN",
        "JUL",
        "AGO",
        "SEP",
        "OCT",
        "NOV",
        "DIC",
      ];

      return meses[numeroMes - 1] || "---";
    }

    return "---";
  };

  const ordenarActividades = [...actividades].sort((a, b) => {
    const fechaA = limpiarFecha(obtenerFecha(a)) || "9999-12-31";
    const fechaB = limpiarFecha(obtenerFecha(b)) || "9999-12-31";

    return fechaA.localeCompare(fechaB);
  });

  return (
    <div className="dashboard-layout">

      <aside className="sidebar">

        <div className="sidebar-header">
          <h2>📚 Ruta Académica</h2>
        </div>

        <nav className="sidebar-nav">

          <Link to="/dashboard">
            🏠 Inicio
          </Link>

          <Link to="/asignaturas">
            📚 Asignaturas
          </Link>

          <Link to="/actividades">
            📝 Actividades
          </Link>

          <Link to="/calendario">
            📅 Calendario
          </Link>

          <Link to="/progreso">
            📈 Progreso
          </Link>

          <button
            type="button"
            onClick={cerrarSesion}
            className="logout-button"
          >
            🚪 Salir
          </button>

        </nav>

      </aside>

      <main className="main-content">

        <header className="page-header">

          <div>
            <h1>Calendario académico</h1>

            <p>
              Consulta las fechas de entrega de tus actividades.
            </p>
          </div>

        </header>

        {cargando && (
          <div className="empty-state">
            <p>Cargando actividades...</p>
          </div>
        )}

        {!cargando && error && (
          <div className="error-message">
            {error}
          </div>
        )}

        {!cargando && !error && ordenarActividades.length === 0 && (
          <div className="empty-state">

            <div className="empty-icon">
              📅
            </div>

            <h2>No tienes actividades registradas</h2>

            <p>
              Cuando registres actividades, sus fechas de entrega
              aparecerán aquí.
            </p>

            <Link
              to="/actividades"
              className="primary-button"
            >
              Registrar actividad
            </Link>

          </div>
        )}

        {!cargando && !error && ordenarActividades.length > 0 && (

          <div className="calendar-list">

            {ordenarActividades.map((actividad) => {

              const fecha = obtenerFecha(actividad);

              return (
                <article
                  className="calendar-card"
                  key={actividad.id}
                >

                  <div className="calendar-date">

                    <strong>
                      {obtenerDia(fecha)}
                    </strong>

                    <span>
                      {obtenerMes(fecha)}
                    </span>

                  </div>

                  <div className="calendar-info">

                    <h2>
                      {actividad.nombre}
                    </h2>

                    <p className="calendar-subject">
                      📚 {obtenerNombreAsignatura(actividad)}
                    </p>

                    <p>
                      <strong>Entrega:</strong>{" "}
                      {formatearFecha(fecha)}
                    </p>

                    <div className="calendar-status">

                      <span>
                        Prioridad:{" "}
                        <strong>
                          {actividad.prioridad || "Media"}
                        </strong>
                      </span>

                      <span>
                        Estado:{" "}
                        <strong>
                          {actividad.estado || "Pendiente"}
                        </strong>
                      </span>

                    </div>

                  </div>

                </article>
              );
            })}

          </div>

        )}

      </main>

    </div>
  );
}

export default Calendar;
