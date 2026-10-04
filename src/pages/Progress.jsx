import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../services/api";
import AppLayout from "../components/AppLayout";

import "./Progress.css";

function Progress() {
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
        console.error("Error al cargar progreso:", err);
        setError("No fue posible calcular el progreso.");
        setActividades([]);
      } finally {
        setCargando(false);
      }
    };

    cargarActividades();
  }, [navigate]);

  const estaCompletada = (actividad) => {
    const estado = String(actividad.estado || "")
      .trim()
      .toLowerCase();

    return (
      estado === "completada" ||
      estado === "completado"
    );
  };

  const total = actividades.length;

  const completadas = actividades.filter(
    estaCompletada
  ).length;

  const pendientes = actividades.filter(
    (actividad) => !estaCompletada(actividad)
  ).length;

  const porcentaje =
    total > 0
      ? Math.round((completadas / total) * 100)
      : 0;

  return (
    <AppLayout pageClass="progress-page">

        <header className="page-header">

          <div>
            <h1>Progreso académico</h1>

            <p>
              Consulta el avance de tus actividades académicas.
            </p>
          </div>

        </header>

        {cargando && (
          <div className="empty-state">
            <p>Calculando progreso...</p>
          </div>
        )}

        {!cargando && error && (
          <div className="error-message">
            {error}
          </div>
        )}

        {!cargando && !error && (
          <>
            <section className="progress-summary">

              <div className="progress-main-card">

                <div
                  className="progress-circle"
                  style={{ "--pct": porcentaje }}
                >
                  <strong>{porcentaje}%</strong>
                  <span>Completado</span>
                </div>

                <div className="progress-description">

                  <h2>Tu progreso académico</h2>

                  <p>
                    Has completado{" "}
                    <strong>{completadas}</strong> de{" "}
                    <strong>{total}</strong> actividades.
                  </p>

                </div>

              </div>

              <div className="progress-stats">

                <div className="progress-stat-card">

                  <span className="progress-stat-icon">
                    📚
                  </span>

                  <strong>{total}</strong>

                  <p>Total de actividades</p>

                </div>

                <div className="progress-stat-card">

                  <span className="progress-stat-icon">
                    ✅
                  </span>

                  <strong>{completadas}</strong>

                  <p>Completadas</p>

                </div>

                <div className="progress-stat-card">

                  <span className="progress-stat-icon">
                    ⏳
                  </span>

                  <strong>{pendientes}</strong>

                  <p>Pendientes</p>

                </div>

              </div>

            </section>

            <div className="dashboard-card">

              <h2>Resumen</h2>

              <p>
                Mantén actualizadas tus actividades para
                visualizar correctamente tu avance académico.
              </p>

              <Link
                to="/actividades"
                className="dashboard-action"
              >
                Ver mis actividades
              </Link>

            </div>
          </>
        )}

    </AppLayout>
  );
}

export default Progress;

