import { useState } from "react";
import { Link } from "react-router-dom";

function Activities() {
  const [actividades, setActividades] = useState([
    {
      id: 1,
      nombre: "Taller de Bases de Datos",
      descripcion: "Desarrollar el taller de consultas SQL.",
      asignatura: "Bases de Datos",
      fecha: "2026-09-30",
      prioridad: "Alta",
      estado: "Pendiente",
      observaciones: "",
    },
    {
      id: 2,
      nombre: "Proyecto Desarrollo Web",
      descripcion: "Continuar con el desarrollo del proyecto web.",
      asignatura: "Desarrollo Web",
      fecha: "2026-10-02",
      prioridad: "Media",
      estado: "En proceso",
      observaciones: "",
    },
    {
      id: 3,
      nombre: "Trabajo de Auditoría",
      descripcion: "Preparar el trabajo de auditoría informática.",
      asignatura: "Auditoría Informática",
      fecha: "2026-10-05",
      prioridad: "Baja",
      estado: "Pendiente",
      observaciones: "",
    },
  ]);

  const [mostrarFormulario, setMostrarFormulario] = useState(false);
  const [modoEdicion, setModoEdicion] = useState(false);
  const [actividadEditando, setActividadEditando] = useState(null);

  const [formulario, setFormulario] = useState({
    nombre: "",
    descripcion: "",
    asignatura: "",
    fecha: "",
    prioridad: "Media",
    estado: "Pendiente",
    observaciones: "",
  });

  // Manejar cambios del formulario
  const manejarCambio = (e) => {
    const { name, value } = e.target;

    setFormulario({
      ...formulario,
      [name]: value,
    });
  };

  // Abrir formulario para crear
  const nuevaActividad = () => {
    setModoEdicion(false);
    setActividadEditando(null);

    setFormulario({
      nombre: "",
      descripcion: "",
      asignatura: "",
      fecha: "",
      prioridad: "Media",
      estado: "Pendiente",
      observaciones: "",
    });

    setMostrarFormulario(true);
  };

  // Crear actividad
  const crearActividad = (e) => {
    e.preventDefault();

    if (
      !formulario.nombre ||
      !formulario.asignatura ||
      !formulario.fecha
    ) {
      alert("Por favor completa los campos obligatorios.");
      return;
    }

    const nueva = {
      id: Date.now(),
      ...formulario,
    };

    setActividades([...actividades, nueva]);

    setFormulario({
      nombre: "",
      descripcion: "",
      asignatura: "",
      fecha: "",
      prioridad: "Media",
      estado: "Pendiente",
      observaciones: "",
    });

    setMostrarFormulario(false);

    alert("Actividad creada correctamente.");
  };

  // Abrir formulario para editar
  const editarActividad = (actividad) => {
    setModoEdicion(true);
    setActividadEditando(actividad);

    setFormulario({
      nombre: actividad.nombre,
      descripcion: actividad.descripcion,
      asignatura: actividad.asignatura,
      fecha: actividad.fecha,
      prioridad: actividad.prioridad,
      estado: actividad.estado,
      observaciones: actividad.observaciones,
    });

    setMostrarFormulario(true);
  };

  // Actualizar actividad
  const actualizarActividad = (e) => {
    e.preventDefault();

    if (
      !formulario.nombre ||
      !formulario.asignatura ||
      !formulario.fecha
    ) {
      alert("Por favor completa los campos obligatorios.");
      return;
    }

    const actividadesActualizadas = actividades.map((actividad) =>
      actividad.id === actividadEditando.id
        ? {
            ...actividad,
            ...formulario,
          }
        : actividad
    );

    setActividades(actividadesActualizadas);

    setMostrarFormulario(false);
    setModoEdicion(false);
    setActividadEditando(null);

    alert("Actividad actualizada correctamente.");
  };

  // Eliminar actividad
  const eliminarActividad = (id) => {
    const confirmar = window.confirm(
      "¿Está seguro de que desea eliminar esta actividad?"
    );

    if (!confirmar) {
      return;
    }

    const actividadesActualizadas = actividades.filter(
      (actividad) => actividad.id !== id
    );

    setActividades(actividadesActualizadas);
  };

  // Cancelar formulario
  const cancelarFormulario = () => {
    setMostrarFormulario(false);
    setModoEdicion(false);
    setActividadEditando(null);
  };

  // Formatear fecha
  const formatearFecha = (fecha) => {
    const [anio, mes, dia] = fecha.split("-");

    return `${dia}/${mes}/${anio}`;
  };

  // Clase para prioridad
  const clasePrioridad = (prioridad) => {
    if (prioridad === "Alta") return "priority high";
    if (prioridad === "Media") return "priority medium";
    return "priority low";
  };

  // Clase para estado
  const claseEstado = (estado) => {
    if (estado === "Completada") return "status completed";
    if (estado === "En proceso") return "status progress";

    return "status pending";
  };

  return (
    <div className="dashboard">
      {/* MENÚ LATERAL */}
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

          <Link to="/actividades" className="active">
            ✅ Actividades
          </Link>

          <Link to="/dashboard">
            📅 Calendario
          </Link>

          <Link to="/dashboard">
            📈 Progreso
          </Link>
        </nav>

        <Link to="/" className="logout">
          🚪 Salir
        </Link>
      </aside>

      {/* CONTENIDO */}
      <main className="dashboard-content">

        {/* ENCABEZADO */}
        <header className="dashboard-header">
          <div>
            <h1>Actividades académicas 📚</h1>

            <p>
              Administra tus actividades, fechas de entrega y prioridades.
            </p>
          </div>

          <div className="user-avatar">
            CP
          </div>
        </header>

        {/* BOTÓN NUEVA ACTIVIDAD */}
        <div className="activities-toolbar">
          <div>
            <h2>Mis actividades</h2>

            <p>
              Total de actividades: <strong>{actividades.length}</strong>
            </p>
          </div>

          <button
            className="btn-primary"
            onClick={nuevaActividad}
          >
            + Nueva actividad
          </button>
        </div>

        {/* FORMULARIO */}
        {mostrarFormulario && (
          <section className="activity-form-panel">

            <h2>
              {modoEdicion
                ? "Editar actividad"
                : "Nueva actividad"}
            </h2>

            <form
              onSubmit={
                modoEdicion
                  ? actualizarActividad
                  : crearActividad
              }
              className="activity-form"
            >

              {/* NOMBRE */}
              <div className="form-group">
                <label>
                  Nombre de la actividad *
                </label>

                <input
                  type="text"
                  name="nombre"
                  value={formulario.nombre}
                  onChange={manejarCambio}
                  placeholder="Ej. Taller de Bases de Datos"
                  required
                />
              </div>

              {/* DESCRIPCIÓN */}
              <div className="form-group">
                <label>
                  Descripción
                </label>

                <textarea
                  name="descripcion"
                  value={formulario.descripcion}
                  onChange={manejarCambio}
                  placeholder="Describe la actividad..."
                  rows="3"
                />
              </div>

              {/* ASIGNATURA */}
              <div className="form-group">
                <label>
                  Asignatura *
                </label>

                <input
                  type="text"
                  name="asignatura"
                  value={formulario.asignatura}
                  onChange={manejarCambio}
                  placeholder="Ej. Ingeniería de Software"
                  required
                />
              </div>

              {/* FECHA */}
              <div className="form-group">
                <label>
                  Fecha de entrega *
                </label>

                <input
                  type="date"
                  name="fecha"
                  value={formulario.fecha}
                  onChange={manejarCambio}
                  required
                />
              </div>

              {/* PRIORIDAD */}
              <div className="form-group">
                <label>
                  Prioridad
                </label>

                <select
                  name="prioridad"
                  value={formulario.prioridad}
                  onChange={manejarCambio}
                >
                  <option value="Alta">
                    Alta
                  </option>

                  <option value="Media">
                    Media
                  </option>

                  <option value="Baja">
                    Baja
                  </option>
                </select>
              </div>

              {/* ESTADO */}
              <div className="form-group">
                <label>
                  Estado
                </label>

                <select
                  name="estado"
                  value={formulario.estado}
                  onChange={manejarCambio}
                >
                  <option value="Pendiente">
                    Pendiente
                  </option>

                  <option value="En proceso">
                    En proceso
                  </option>

                  <option value="Completada">
                    Completada
                  </option>
                </select>
              </div>

              {/* OBSERVACIONES */}
              <div className="form-group">
                <label>
                  Observaciones
                </label>

                <textarea
                  name="observaciones"
                  value={formulario.observaciones}
                  onChange={manejarCambio}
                  placeholder="Agrega alguna observación..."
                  rows="3"
                />
              </div>

              {/* BOTONES */}
              <div className="form-buttons">

                <button
                  type="button"
                  className="btn-secondary"
                  onClick={cancelarFormulario}
                >
                  Cancelar
                </button>

                <button
                  type="submit"
                  className="btn-primary"
                >
                  {modoEdicion
                    ? "Actualizar actividad"
                    : "Guardar actividad"}
                </button>

              </div>

            </form>
          </section>
        )}

        {/* LISTA DE ACTIVIDADES */}
        <section className="activities-list">

          {actividades.length === 0 ? (
            <div className="empty-state">
              <div>📚</div>

              <h2>
                No tienes actividades registradas
              </h2>

              <p>
                Comienza agregando tu primera actividad académica.
              </p>

              <button
                className="btn-primary"
                onClick={nuevaActividad}
              >
                + Crear actividad
              </button>
            </div>
          ) : (
            actividades.map((actividad) => (
              <article
                className="activity-card"
                key={actividad.id}
              >

                <div className="activity-card-content">

                  <div className="activity-card-header">

                    <div>
                      <h3>
                        {actividad.nombre}
                      </h3>

                      <p className="activity-subject">
                        📚 {actividad.asignatura}
                      </p>
                    </div>

                    <span
                      className={clasePrioridad(
                        actividad.prioridad
                      )}
                    >
                      {actividad.prioridad}
                    </span>

                  </div>

                  {actividad.descripcion && (
                    <p className="activity-description">
                      {actividad.descripcion}
                    </p>
                  )}

                  <div className="activity-information">

                    <span>
                      📅 Entrega:{" "}
                      <strong>
                        {formatearFecha(
                          actividad.fecha
                        )}
                      </strong>
                    </span>

                    <span
                      className={claseEstado(
                        actividad.estado
                      )}
                    >
                      {actividad.estado}
                    </span>

                  </div>

                  {actividad.observaciones && (
                    <div className="activity-observations">
                      <strong>
                        📝 Observaciones:
                      </strong>

                      <p>
                        {actividad.observaciones}
                      </p>
                    </div>
                  )}

                </div>

                {/* ACCIONES */}
                <div className="activity-actions">

                  <button
                    className="btn-edit"
                    onClick={() =>
                      editarActividad(actividad)
                    }
                  >
                    ✏️ Editar
                  </button>

                  <button
                    className="btn-delete"
                    onClick={() =>
                      eliminarActividad(
                        actividad.id
                      )
                    }
                  >
                    🗑️ Eliminar
                  </button>

                </div>

              </article>
            ))
          )}

        </section>

      </main>
    </div>
  );
}

export default Activities;