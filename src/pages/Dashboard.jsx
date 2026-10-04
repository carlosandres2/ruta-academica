import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";

import AppLayout from "../components/AppLayout";
import api from "../services/api";

import "./Dashboard.css";

const MESES = [
  "ENE", "FEB", "MAR", "ABR", "MAY", "JUN",
  "JUL", "AGO", "SEP", "OCT", "NOV", "DIC"
];

function fechaISO(valor) {
  return typeof valor === "string" ? valor.substring(0, 10) : "";
}

function hoyISO() {
  const hoy = new Date();
  const mes = String(hoy.getMonth() + 1).padStart(2, "0");
  const dia = String(hoy.getDate()).padStart(2, "0");

  return `${hoy.getFullYear()}-${mes}-${dia}`;
}

function textoHoy() {
  const texto = new Date().toLocaleDateString("es-CO", {
    weekday: "long",
    day: "numeric",
    month: "long"
  });

  return texto.charAt(0).toUpperCase() + texto.slice(1);
}

function leerSesion() {
  try {
    const sesion = localStorage.getItem("rutaAcademicaSesion");

    return sesion ? JSON.parse(sesion) : null;
  } catch {
    return null;
  }
}

function Icon({ children }) {
  return (
    <svg
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

function Dashboard() {

  const navigate = useNavigate();

  const [usuario] = useState(leerSesion);

  const [actividades, setActividades] = useState([]);
  const [asignaturas, setAsignaturas] = useState([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [hoy] = useState(hoyISO);
  const [fechaHoy] = useState(textoHoy);


  useEffect(() => {

    if (!usuario) {

      navigate("/login");

      return;

    }

    const usuarioGuardado = usuario;


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

  }, [navigate, usuario]);


  const estadoDe = (actividad) =>
    String(actividad.estado || "").toLowerCase();

  const estaCompletada = (actividad) =>
    estadoDe(actividad) === "completada" ||
    estadoDe(actividad) === "terminada";


  const totalActividades =
    actividades.length;

  const completadas =
    actividades.filter(estaCompletada).length;

  const pendientes =
    actividades.filter(
      (actividad) =>
        estadoDe(actividad) === "pendiente"
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


  const fechaDe = (actividad) =>
    fechaISO(actividad.fecha_entrega || actividad.fechaEntrega || actividad.fecha);

  const actividadesProximas =
    actividades
      .filter((actividad) => !estaCompletada(actividad))
      .sort((a, b) =>
        (fechaDe(a) || "9999-12-31")
          .localeCompare(fechaDe(b) || "9999-12-31")
      )
      .slice(0, 5);


  const claseFecha = (iso) =>
    iso && iso < hoy ? "is-late" : "";

  const partesFecha = (iso) => {
    const [, mes, dia] = iso.split("-");

    return {
      dia: dia || "--",
      mes: MESES[Number(mes) - 1] || "---"
    };
  };

  const tarjetas = [
    {
      etiqueta: "Pendientes",
      valor: pendientes,
      tono: "warning",
      icono: (
        <>
          <circle cx="12" cy="12" r="9" />
          <path d="M12 7v5l3 2" />
        </>
      )
    },
    {
      etiqueta: "Alta prioridad",
      valor: altaPrioridad,
      tono: "danger",
      icono: (
        <>
          <path d="M12 3l10 18H2L12 3z" />
          <path d="M12 10v5M12 18h.01" />
        </>
      )
    },
    {
      etiqueta: "Completadas",
      valor: completadas,
      tono: "success",
      icono: <path d="M5 12l5 5L20 7" />
    },
    {
      etiqueta: "Progreso",
      valor: `${progreso}%`,
      tono: "info",
      icono: <path d="M4 20V10M10 20V4M16 20v-8M22 20H2" />
    }
  ];


  return (

    <AppLayout pageClass="dashboard-page">

      <header className="dash-header">

        <div>

          <p className="dash-date">
            {fechaHoy}
          </p>

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

        <Link
          to="/actividades"
          className="btn-primary"
        >
          Nueva actividad
        </Link>

      </header>


      {error && (

        <div className="error-message" role="alert">

          {error}

        </div>

      )}


      {loading ? (

        <div
          className="dash-skeleton"
          role="status"
          aria-label="Cargando información académica"
        >

          <div className="dash-skeleton-row">
            <span /><span /><span /><span />
          </div>

          <div className="dash-skeleton-block" />

        </div>

      ) : (

        <>

          <section
            className="dash-stats"
            aria-label="Resumen"
          >

            {tarjetas.map((tarjeta) => (

              <div
                className={`dash-stat tone-${tarjeta.tono}`}
                key={tarjeta.etiqueta}
              >

                <span className="dash-stat-icon">
                  <Icon>{tarjeta.icono}</Icon>
                </span>

                <div>

                  <strong>
                    {tarjeta.valor}
                  </strong>

                  <span>
                    {tarjeta.etiqueta}
                  </span>

                </div>

              </div>

            ))}

          </section>


          <section className="dash-grid">

            <div className="dash-panel">

              <div className="dash-panel-head">

                <h2>
                  Próximas actividades
                </h2>

                <Link to="/actividades">
                  Ver todas
                </Link>

              </div>


              {actividadesProximas.length === 0 ? (

                <div className="dash-empty">

                  <p>
                    {totalActividades === 0
                      ? "Aún no tienes actividades registradas."
                      : "¡Estás al día! No tienes actividades pendientes."}
                  </p>

                  {totalActividades === 0 && (

                    <Link
                      to="/actividades"
                      className="btn-secondary"
                    >
                      Registrar actividad
                    </Link>

                  )}

                </div>

              ) : (

                <ul className="dash-list">

                  {actividadesProximas.map(
                    (actividad) => {

                      const iso = fechaDe(actividad);
                      const { dia, mes } = partesFecha(iso);
                      const prioridad = String(
                        actividad.prioridad || ""
                      ).toLowerCase();

                      return (

                        <li
                          className="dash-item"
                          key={
                            actividad.id ||
                            actividad._id
                          }
                        >

                          <span
                            className={`dash-date-chip ${claseFecha(iso)}`}
                          >
                            <strong>{iso ? dia : "--"}</strong>
                            <small>{iso ? mes : "---"}</small>
                          </span>

                          <div className="dash-item-info">

                            <h3>
                              {actividad.nombre ||
                                actividad.titulo ||
                                "Actividad"}
                            </h3>

                            <p>

                              {actividad.asignatura_nombre ||
                                actividad.asignatura ||
                                "Sin asignatura"}

                              {iso && iso < hoy && (
                                <span className="dash-late">
                                  {" · Vencida"}
                                </span>
                              )}

                            </p>

                          </div>

                          <span
                            className={`priority ${prioridad}`}
                          >

                            {actividad.prioridad ||
                              "Sin prioridad"}

                          </span>

                        </li>

                      );
                    }
                  )}

                </ul>

              )}

            </div>


            <div className="dash-panel">

              <div className="dash-panel-head">

                <h2>
                  Progreso académico
                </h2>

                <Link to="/progreso">
                  Ver progreso
                </Link>

              </div>


              <div
                className="dash-ring"
                style={{ "--pct": progreso }}
                role="img"
                aria-label={`${progreso}% completado`}
              >

                <strong>
                  {progreso}%
                </strong>

                <span>Completado</span>

              </div>


              <p className="dash-ring-text">

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


          <section className="dash-panel">

            <div className="dash-panel-head">

              <h2>
                Mis asignaturas
              </h2>

              <Link to="/asignaturas">
                Ver asignaturas
              </Link>

            </div>


            {asignaturas.length === 0 ? (

              <div className="dash-empty">

                <p>
                  Aún no tienes asignaturas registradas.
                </p>

                <Link
                  to="/asignaturas"
                  className="btn-secondary"
                >
                  Registrar asignatura
                </Link>

              </div>

            ) : (

              <ul className="dash-subjects">

                {asignaturas
                  .slice(0, 4)
                  .map(
                    (asignatura) => {

                      const avance = Math.min(
                        100,
                        Math.max(
                          0,
                          Number(
                            asignatura.porcentaje_progreso
                          ) || 0
                        )
                      );

                      return (

                        <li
                          className="dash-subject"
                          key={
                            asignatura.id ||
                            asignatura._id
                          }
                        >

                          <h3>
                            {asignatura.nombre ||
                              asignatura.name ||
                              "Asignatura"}
                          </h3>

                          <div
                            className="dash-bar"
                            role="progressbar"
                            aria-valuenow={avance}
                            aria-valuemin={0}
                            aria-valuemax={100}
                            aria-label={`Progreso de ${asignatura.nombre || "la asignatura"}`}
                          >
                            <span style={{ width: `${avance}%` }} />
                          </div>

                          <small>
                            {avance}% de avance
                          </small>

                        </li>

                      );
                    }
                  )}

              </ul>

            )}

          </section>

        </>

      )}

    </AppLayout>

  );

}

export default Dashboard;
