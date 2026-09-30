import React, { useEffect, useState } from "react";

import {
  obtenerAsignaturas,
  crearAsignatura,
  actualizarAsignatura,
  eliminarAsignatura
} from "../services/asignaturaService";


function Subjects() {

  const [asignaturas, setAsignaturas] = useState([]);

  const [cargando, setCargando] = useState(true);

  const [error, setError] = useState("");

  const [mensaje, setMensaje] = useState("");

  const [usuarioId, setUsuarioId] = useState(null);

  const [mostrarFormulario, setMostrarFormulario] =
    useState(false);

  const [editandoId, setEditandoId] =
    useState(null);


  const [formulario, setFormulario] = useState({

    nombre: "",

    descripcion: "",

    porcentaje_progreso: 0

  });


  /* =========================================================
     CARGAR ASIGNATURAS
  ========================================================= */

  useEffect(() => {

    cargarAsignaturas();

  }, []);


  const cargarAsignaturas = async () => {

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


      const usuario =
        JSON.parse(sesionGuardada);


      const idUsuario =
        usuario.id ??
        usuario.usuario_id ??
        null;


      if (!idUsuario) {

        setError(
          "No fue posible identificar al usuario de la sesión."
        );

        setCargando(false);

        return;

      }


      setUsuarioId(idUsuario);


      console.log(
        "Asignaturas - Usuario actual:",
        idUsuario
      );


      const datos =
        await obtenerAsignaturas(idUsuario);


      setAsignaturas(
        Array.isArray(datos)
          ? datos
          : []
      );


    } catch (error) {

      console.error(
        "Error al cargar asignaturas:",
        error
      );


      setError(
        "No fue posible cargar las asignaturas."
      );

    } finally {

      setCargando(false);

    }

  };


  /* =========================================================
     MANEJAR CAMPOS
  ========================================================= */

  const manejarCambio = (e) => {

    const { name, value } = e.target;


    setFormulario((anterior) => ({

      ...anterior,

      [name]:
        name === "porcentaje_progreso"
          ? value
          : value

    }));

  };


  /* =========================================================
     LIMPIAR FORMULARIO
  ========================================================= */

  const limpiarFormulario = () => {

    setFormulario({

      nombre: "",

      descripcion: "",

      porcentaje_progreso: 0

    });

    setEditandoId(null);

    setMostrarFormulario(false);

  };


  /* =========================================================
     GUARDAR ASIGNATURA
  ========================================================= */

  const manejarGuardar = async (e) => {

    e.preventDefault();


    setError("");

    setMensaje("");


    if (!usuarioId) {

      setError(
        "No fue posible identificar al usuario."
      );

      return;

    }


    if (!formulario.nombre.trim()) {

      setError(
        "El nombre de la asignatura es obligatorio."
      );

      return;

    }


    const porcentaje =
      Number(
        formulario.porcentaje_progreso
      );


    if (
      Number.isNaN(porcentaje) ||
      porcentaje < 0 ||
      porcentaje > 100
    ) {

      setError(
        "El progreso debe estar entre 0 y 100."
      );

      return;

    }


    try {

      if (editandoId) {

        /* =====================================================
           ACTUALIZAR
        ===================================================== */

        await actualizarAsignatura(

          editandoId,

          {

            nombre:
              formulario.nombre.trim(),

            descripcion:
              formulario.descripcion.trim(),

            porcentaje_progreso:
              porcentaje,

            usuario_id:
              usuarioId

          }

        );


        setMensaje(
          "Asignatura actualizada correctamente."
        );


      } else {

        /* =====================================================
           CREAR
        ===================================================== */

        await crearAsignatura({

          nombre:
            formulario.nombre.trim(),

          descripcion:
            formulario.descripcion.trim(),

          porcentaje_progreso:
            porcentaje,

          usuario_id:
            usuarioId

        });


        setMensaje(
          "Asignatura creada correctamente."
        );

      }


      limpiarFormulario();

      await cargarAsignaturas();


    } catch (error) {

      console.error(
        "Error al guardar asignatura:",
        error
      );


      setError(

        error?.response?.data?.mensaje ||

        "No fue posible guardar la asignatura."

      );

    }

  };


  /* =========================================================
     EDITAR
  ========================================================= */

  const manejarEditar = (asignatura) => {

    setError("");

    setMensaje("");


    setFormulario({

      nombre:
        asignatura.nombre || "",

      descripcion:
        asignatura.descripcion || "",

      porcentaje_progreso:
        asignatura.porcentaje_progreso ?? 0

    });


    setEditandoId(
      asignatura.id
    );


    setMostrarFormulario(true);


    window.scrollTo({

      top: 0,

      behavior: "smooth"

    });

  };


  /* =========================================================
     ELIMINAR
  ========================================================= */

  const manejarEliminar = async (id) => {

    setError("");

    setMensaje("");


    const confirmar =
      window.confirm(
        "¿Estás seguro de eliminar esta asignatura? También se eliminarán sus actividades."
      );


    if (!confirmar) {

      return;

    }


    try {

      await eliminarAsignatura(

        id,

        usuarioId

      );


      setMensaje(
        "Asignatura eliminada correctamente."
      );


      await cargarAsignaturas();


    } catch (error) {

      console.error(
        "Error al eliminar asignatura:",
        error
      );


      setError(

        error?.response?.data?.mensaje ||

        "No fue posible eliminar la asignatura."

      );

    }

  };


  /* =========================================================
     INTERFAZ
  ========================================================= */

  return (

    <div className="subjects-container">


      <h1>
        Mis asignaturas
      </h1>


      <p className="subjects-description">

        Consulta y organiza las asignaturas
        de tu programa académico.

      </p>


      {/* =====================================================
          MENSAJES
      ===================================================== */}

      {error && (

        <div
          style={{
            color: "red",
            marginBottom: "15px"
          }}
        >

          {error}

        </div>

      )}


      {mensaje && (

        <div
          style={{
            color: "green",
            marginBottom: "15px"
          }}
        >

          {mensaje}

        </div>

      )}


      {/* =====================================================
          BOTÓN NUEVA ASIGNATURA
      ===================================================== */}

      {!mostrarFormulario && (

        <button
          type="button"
          onClick={() => {

            setError("");

            setMensaje("");

            setEditandoId(null);

            setFormulario({

              nombre: "",

              descripcion: "",

              porcentaje_progreso: 0

            });

            setMostrarFormulario(true);

          }}
          style={{
            marginBottom: "25px"
          }}
        >

          + Nueva asignatura

        </button>

      )}


      {/* =====================================================
          FORMULARIO
      ===================================================== */}

      {mostrarFormulario && (

        <div
          className="subject-form"
          style={{
            marginBottom: "30px"
          }}
        >

          <h2>

            {editandoId
              ? "Editar asignatura"
              : "Nueva asignatura"}

          </h2>


          <form
            onSubmit={manejarGuardar}
          >


            <div>

              <label>
                Nombre de la asignatura
              </label>

              <input

                type="text"

                name="nombre"

                placeholder="Ejemplo: Ingeniería de Software"

                value={
                  formulario.nombre
                }

                onChange={
                  manejarCambio
                }

              />

            </div>


            <div>

              <label>
                Descripción
              </label>

              <textarea

                name="descripcion"

                placeholder="Describe brevemente la asignatura"

                value={
                  formulario.descripcion
                }

                onChange={
                  manejarCambio
                }

                rows="4"

              />

            </div>


            <div>

              <label>
                Porcentaje de progreso
              </label>

              <input

                type="number"

                name="porcentaje_progreso"

                min="0"

                max="100"

                value={
                  formulario.porcentaje_progreso
                }

                onChange={
                  manejarCambio
                }

              />

            </div>


            <div
              style={{
                display: "flex",
                gap: "10px",
                marginTop: "15px"
              }}
            >

              <button
                type="submit"
              >

                {editandoId
                  ? "Actualizar asignatura"
                  : "Guardar asignatura"}

              </button>


              <button

                type="button"

                onClick={
                  limpiarFormulario
                }

              >

                Cancelar

              </button>

            </div>


          </form>

        </div>

      )}


      {/* =====================================================
          CARGANDO
      ===================================================== */}

      {cargando && (

        <p>
          Cargando asignaturas...
        </p>

      )}


      {/* =====================================================
          SIN ASIGNATURAS
      ===================================================== */}

      {!cargando &&
        !error &&
        asignaturas.length === 0 && (

          <div>

            <p>
              No tienes asignaturas registradas.
            </p>

            <p>

              Registra una asignatura para comenzar
              a organizar tus actividades académicas.

            </p>

          </div>

        )}


      {/* =====================================================
          LISTA DE ASIGNATURAS
      ===================================================== */}

      {!cargando &&
        asignaturas.length > 0 && (

          <div className="subjects-grid">


            {asignaturas.map(
              (asignatura) => (

                <div
                  className="subject-card"
                  key={asignatura.id}
                >


                  <div className="subject-icon">
                    📚
                  </div>


                  <h2>

                    {asignatura.nombre}

                  </h2>


                  <p className="subject-type">

                    Asignatura académica

                  </p>


                  <p className="subject-description">

                    {asignatura.descripcion ||

                      "Sin descripción registrada."}

                  </p>


                  <p className="subject-progress">

                    Progreso:{" "}

                    {asignatura.porcentaje_progreso ?? 0}%

                  </p>


                  <p className="subject-id">

                    ID: {asignatura.id}

                  </p>


                  {/* =========================================
                      ACCIONES
                  ========================================= */}

                  <div
                    style={{
                      display: "flex",
                      gap: "10px",
                      marginTop: "15px"
                    }}
                  >

                    <button

                      type="button"

                      onClick={() =>
                        manejarEditar(
                          asignatura
                        )
                      }

                    >

                      Editar

                    </button>


                    <button

                      type="button"

                      onClick={() =>
                        manejarEliminar(
                          asignatura.id
                        )
                      }

                    >

                      Eliminar

                    </button>

                  </div>


                </div>

              )
            )}

          </div>

        )}


    </div>

  );

}


export default Subjects;

