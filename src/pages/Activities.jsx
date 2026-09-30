import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

import {
  obtenerActividades,
  crearActividad,
  actualizarActividad,
  eliminarActividad
} from "../services/actividadService";

import { obtenerAsignaturas } from "../services/asignaturaService";


function Activities() {

  const [actividades, setActividades] = useState([]);

  const [asignaturas, setAsignaturas] = useState([]);

  const [usuario, setUsuario] = useState(null);

  const [cargando, setCargando] = useState(true);

  const [error, setError] = useState("");

  const [mensaje, setMensaje] = useState("");

  const [mostrarFormulario, setMostrarFormulario] =
    useState(false);

  const [modoEdicion, setModoEdicion] =
    useState(false);

  const [actividadEditando, setActividadEditando] =
    useState(null);


  const [formulario, setFormulario] = useState({

    nombre: "",

    descripcion: "",

    asignatura_id: "",

    fecha_entrega: "",

    prioridad: "Media",

    estado: "Pendiente",

    observaciones: ""

  });


  /* =========================================================
     CARGAR INFORMACIÓN
  ========================================================= */

  useEffect(() => {

    cargarInformacion();

  }, []);


  const cargarInformacion = async () => {

    try {

      setCargando(true);

      setError("");

      const sesionGuardada =
        localStorage.getItem(
          "rutaAcademicaSesion"
        );


      if (!sesionGuardada) {

        setError(
          "No hay una sesión activa."
        );

        setCargando(false);

        return;

      }


      const usuarioActual =
        JSON.parse(sesionGuardada);


      const usuarioId =
        usuarioActual.id ??
        usuarioActual.usuario_id ??
        null;


      if (!usuarioId) {

        setError(
          "No fue posible identificar al usuario."
        );

        setCargando(false);

        return;

      }


      setUsuario({

        ...usuarioActual,

        id: usuarioId

      });


      console.log(
        "Activities - Usuario actual:",
        usuarioId
      );


      const [
        actividadesData,
        asignaturasData
      ] = await Promise.all([

        obtenerActividades(usuarioId),

        obtenerAsignaturas(usuarioId)

      ]);


      setActividades(

        Array.isArray(actividadesData)
          ? actividadesData
          : []

      );


      setAsignaturas(

        Array.isArray(asignaturasData)
          ? asignaturasData
          : []

      );


    } catch (error) {

      console.error(
        "Error al cargar información:",
        error
      );


      setError(

        error?.response?.data?.mensaje ||

        "No fue posible cargar la información académica."

      );

    } finally {

      setCargando(false);

    }

  };


  /* =========================================================
     CAMBIAR FORMULARIO
  ========================================================= */

  const manejarCambio = (e) => {

    const {
      name,
      value
    } = e.target;


    setFormulario((anterior) => ({

      ...anterior,

      [name]: value

    }));

  };


  /* =========================================================
     NUEVA ACTIVIDAD
  ========================================================= */

  const nuevaActividad = () => {

    setError("");

    setMensaje("");

    setModoEdicion(false);

    setActividadEditando(null);


    setFormulario({

      nombre: "",

      descripcion: "",

      asignatura_id:
        asignaturas.length > 0
          ? String(asignaturas[0].id)
          : "",

      fecha_entrega: "",

      prioridad: "Media",

      estado: "Pendiente",

      observaciones: ""

    });


    setMostrarFormulario(true);

  };


  /* =========================================================
     GUARDAR ACTIVIDAD
  ========================================================= */

  const manejarGuardar = async (e) => {

    e.preventDefault();

    setError("");

    setMensaje("");


    if (!usuario?.id) {

      setError(
        "No fue posible identificar al usuario."
      );

      return;

    }


    if (!formulario.nombre.trim()) {

      setError(
        "El nombre de la actividad es obligatorio."
      );

      return;

    }


    if (!formulario.asignatura_id) {

      setError(
        "Debes seleccionar una asignatura."
      );

      return;

    }


    if (!formulario.fecha_entrega) {

      setError(
        "La fecha de entrega es obligatoria."
      );

      return;

    }


    try {

      const datosActividad = {

        nombre:
          formulario.nombre.trim(),

        descripcion:
          formulario.descripcion.trim(),

        asignatura_id:
          Number(formulario.asignatura_id),

        fecha_entrega:
          formulario.fecha_entrega,

        prioridad:
          formulario.prioridad,

        estado:
          formulario.estado,

        observaciones:
          formulario.observaciones.trim(),

        usuario_id:
          usuario.id

      };


      if (modoEdicion) {

        await actualizarActividad(

          actividadEditando.id,

          datosActividad

        );


        setMensaje(
          "Actividad actualizada correctamente."
        );


      } else {

        await crearActividad(
          datosActividad
        );


        setMensaje(
          "Actividad creada correctamente."
        );

      }


      cancelarFormulario();

      await cargarInformacion();


    } catch (error) {

      console.error(
        "Error al guardar actividad:",
        error
      );


      setError(

        error?.response?.data?.mensaje ||

        "No fue posible guardar la actividad."

      );

    }

  };


  /* =========================================================
     EDITAR ACTIVIDAD
  ========================================================= */

  const editarActividad = (actividad) => {

    setError("");

    setMensaje("");

    setModoEdicion(true);

    setActividadEditando(actividad);


    setFormulario({

      nombre:
        actividad.nombre || "",

      descripcion:
        actividad.descripcion || "",

      asignatura_id:
        String(
          actividad.asignatura_id ||
          actividad.asignaturaId ||
          ""
        ),

      fecha_entrega:
        actividad.fecha_entrega ||
        actividad.fechaEntrega ||
        actividad.fecha ||
        "",

      prioridad:
        actividad.prioridad || "Media",

      estado:
        actividad.estado || "Pendiente",

      observaciones:
        actividad.observaciones || ""

    });


    setMostrarFormulario(true);


    window.scrollTo({

      top: 0,

      behavior: "smooth"

    });

  };


  /* =========================================================
     ELIMINAR ACTIVIDAD
  ========================================================= */

  const manejarEliminar = async (id) => {

    const confirmar =
      window.confirm(

        "¿Está seguro de que desea eliminar esta actividad?"

      );


    if (!confirmar) {

      return;

    }


    try {

      setError("");

      setMensaje("");


      await eliminarActividad(

        id,

        usuario.id

      );


      setMensaje(
        "Actividad eliminada correctamente."
      );


      await cargarInformacion();


    } catch (error) {

      console.error(
        "Error al eliminar actividad:",
        error
      );


      setError(

        error?.response?.data?.mensaje ||

        "No fue posible eliminar la actividad."

      );

    }

  };


  /* =========================================================
     CANCELAR
  ========================================================= */

  const cancelarFormulario = () => {

    setMostrarFormulario(false);

    setModoEdicion(false);

    setActividadEditando(null);


    setFormulario({

      nombre: "",

      descripcion: "",

      asignatura_id: "",

      fecha_entrega: "",

      prioridad: "Media",

      estado: "Pendiente",

      observaciones: ""

    });

  };


  /* =========================================================
     FECHA
  ========================================================= */

  const formatearFecha = (fecha) => {

    if (!fecha) {

      return "Sin fecha";

    }


    const fechaTexto =
      String(fecha).substring(0, 10);


    const partes =
      fechaTexto.split("-");


    if (partes.length !== 3) {

      return fechaTexto;

    }


    const [
      anio,
      mes,
      dia
    ] = partes;


    return `${dia}/${mes}/${anio}`;

  };


  /* =========================================================
     NOMBRE ASIGNATURA
  ========================================================= */

  const obtenerNombreAsignatura = (
    actividad
  ) => {

    if (
      actividad.asignatura_nombre
    ) {

      return actividad.asignatura_nombre;

    }


    if (
      actividad.asignatura
    ) {

      return actividad.asignatura;

    }


    const asignatura =
      asignaturas.find(

        (item) =>

          Number(item.id) ===
          Number(
            actividad.asignatura_id
          )

      );


    return (

      asignatura?.nombre ||

      "Sin asignatura"

    );

  };


  /* =========================================================
     CLASE PRIORIDAD
  ========================================================= */

  const clasePrioridad = (
    prioridad
  ) => {

    if (prioridad === "Alta") {

      return "priority high";

    }


    if (prioridad === "Media") {

      return "priority medium";

    }


    return "priority low";

  };


  /* =========================================================
     CLASE ESTADO
  ========================================================= */

  const claseEstado = (
    estado
  ) => {

    if (estado === "Completada") {

      return "status completed";

    }


    if (estado === "En proceso") {

      return "status progress";

    }


    return "status pending";

  };


  /* =========================================================
     INTERFAZ
  ========================================================= */

  return (

    <div className="dashboard">


      {/* =====================================================
          MENÚ LATERAL
      ===================================================== */}

      <aside className="sidebar">

        <div className="sidebar-logo">

          📚 Ruta Académica

        </div>


        <nav>

          <Link to="/dashboard">
            🏠 Inicio
          </Link>

          <Link to="/asignaturas">
            📚 Asignaturas
          </Link>

          <Link
            to="/actividades"
            className="active"
          >
            ✅ Actividades
          </Link>

          <Link to="/calendario">
            📅 Calendario
          </Link>

          <Link to="/progreso">
            📈 Progreso
          </Link>

        </nav>


        <Link
          to="/login"
          className="logout"
        >
          🚪 Salir
        </Link>

      </aside>


      {/* =====================================================
          CONTENIDO
      ===================================================== */}

      <main className="dashboard-content">


        {/* ===================================================
            ENCABEZADO
        =================================================== */}

        <header className="dashboard-header">

          <div>

            <h1>
              Actividades académicas 📚
            </h1>

            <p>

              Organiza tus actividades,
              fechas de entrega y prioridades académicas.

            </p>

            {usuario && (

              <p>

                Usuario:{" "}

                <strong>
                  {usuario.nombre}
                </strong>

              </p>

            )}

          </div>


          <div className="user-avatar">

            {usuario?.nombre
              ? usuario.nombre
                  .split(" ")
                  .map(
                    (nombre) =>
                      nombre[0]
                  )
                  .slice(0, 2)
                  .join("")
                  .toUpperCase()
              : "US"}

          </div>

        </header>


        {/* ===================================================
            MENSAJES
        =================================================== */}

        {error && (

          <div
            className="error-message"
            style={{
              marginBottom: "20px"
            }}
          >

            {error}

          </div>

        )}


        {mensaje && (

          <div
            className="success-message"
            style={{
              marginBottom: "20px"
            }}
          >

            {mensaje}

          </div>

        )}


        {/* ===================================================
            BARRA
        =================================================== */}

        <div className="activities-toolbar">

          <div>

            <h2>
              Mis actividades
            </h2>

            <p>

              Total de actividades:{" "}

              <strong>
                {actividades.length}
              </strong>

            </p>

          </div>


          <button

            className="btn-primary"

            onClick={nuevaActividad}

            disabled={
              asignaturas.length === 0
            }

          >

            + Nueva actividad

          </button>

        </div>


        {/* ===================================================
            FORMULARIO
        =================================================== */}

        {mostrarFormulario && (

          <section className="activity-form-panel">

            <h2>

              {modoEdicion
                ? "Editar actividad"
                : "Nueva actividad"}

            </h2>


            {asignaturas.length === 0 ? (

              <p>

                No se encontraron asignaturas
                para este usuario.

              </p>

            ) : (

              <form

                onSubmit={
                  manejarGuardar
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

                    value={
                      formulario.nombre
                    }

                    onChange={
                      manejarCambio
                    }

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

                    value={
                      formulario.descripcion
                    }

                    onChange={
                      manejarCambio
                    }

                    placeholder="Describe la actividad..."

                    rows="3"

                  />

                </div>


                {/* ASIGNATURA */}

                <div className="form-group">

                  <label>
                    Asignatura *
                  </label>

                  <select

                    name="asignatura_id"

                    value={
                      formulario.asignatura_id
                    }

                    onChange={
                      manejarCambio
                    }

                    required

                  >

                    <option value="">
                      Selecciona una asignatura
                    </option>


                    {asignaturas.map(
                      (asignatura) => (

                        <option

                          key={
                            asignatura.id
                          }

                          value={
                            asignatura.id
                          }

                        >

                          {asignatura.nombre}

                        </option>

                      )
                    )}

                  </select>

                </div>


                {/* FECHA */}

                <div className="form-group">

                  <label>
                    Fecha de entrega *
                  </label>

                  <input

                    type="date"

                    name="fecha_entrega"

                    value={
                      formulario.fecha_entrega
                    }

                    onChange={
                      manejarCambio
                    }

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

                    value={
                      formulario.prioridad
                    }

                    onChange={
                      manejarCambio
                    }

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

                    value={
                      formulario.estado
                    }

                    onChange={
                      manejarCambio
                    }

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

                    value={
                      formulario.observaciones
                    }

                    onChange={
                      manejarCambio
                    }

                    placeholder="Agrega alguna observación..."

                    rows="3"

                  />

                </div>


                {/* BOTONES */}

                <div className="form-buttons">

                  <button

                    type="button"

                    className="btn-secondary"

                    onClick={
                      cancelarFormulario
                    }

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

            )}

          </section>

        )}


        {/* ===================================================
            CARGANDO
        =================================================== */}

        {cargando ? (

          <section className="activities-list">

            <div className="empty-state">

              <p>
                Cargando actividades...
              </p>

            </div>

          </section>

        ) : actividades.length === 0 ? (

          /* =================================================
             SIN ACTIVIDADES
          ================================================= */

          <section className="activities-list">

            <div className="empty-state">

              <div>
                📚
              </div>

              <h2>
                No tienes actividades registradas
              </h2>

              <p>

                Comienza agregando tu primera
                actividad académica.

              </p>


              {asignaturas.length > 0 && (

                <button

                  className="btn-primary"

                  onClick={
                    nuevaActividad
                  }

                >

                  + Crear actividad

                </button>

              )}

            </div>

          </section>

        ) : (

          /* =================================================
             LISTA
          ================================================= */

          <section className="activities-list">

            {actividades.map(
              (actividad) => (

                <article

                  className="activity-card"

                  key={
                    actividad.id
                  }

                >

                  <div className="activity-card-content">


                    <div className="activity-card-header">

                      <div>

                        <h3>
                          {actividad.nombre}
                        </h3>


                        <p className="activity-subject">

                          📚{" "}

                          {obtenerNombreAsignatura(
                            actividad
                          )}

                        </p>

                      </div>


                      <span

                        className={
                          clasePrioridad(
                            actividad.prioridad
                          )
                        }

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

                            actividad.fecha_entrega ||

                            actividad.fechaEntrega ||

                            actividad.fecha

                          )}

                        </strong>

                      </span>


                      <span

                        className={
                          claseEstado(
                            actividad.estado
                          )
                        }

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
                        editarActividad(
                          actividad
                        )
                      }

                    >

                      ✏️ Editar

                    </button>


                    <button

                      className="btn-delete"

                      onClick={() =>
                        manejarEliminar(
                          actividad.id
                        )
                      }

                    >

                      🗑️ Eliminar

                    </button>


                  </div>


                </article>

              )
            )}

          </section>

        )}


      </main>

    </div>

  );

}


export default Activities;

