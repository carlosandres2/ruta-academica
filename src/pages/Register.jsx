import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

import AuthLayout from "../components/AuthLayout";
import { crearUsuario } from "../services/usuarioService";

function Register() {

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
    <AuthLayout
      titulo="Crear cuenta"
      subtitulo="Regístrate para organizar tus asignaturas y entregas."
      pie={
        <p>
          ¿Ya tienes una cuenta?{" "}
          <Link to="/login">Iniciar sesión</Link>
        </p>
      }
    >

      <form className="app-auth-form" onSubmit={manejarRegistro}>

        <div className="app-auth-field">
          <label htmlFor="reg-nombre">
            Nombre completo
          </label>

          <input
            id="reg-nombre"
            type="text"
            autoComplete="name"
            placeholder="Carlos Andrés Pérez"
            value={nombre}
            onChange={(e) =>
              setNombre(e.target.value)
            }
          />
        </div>

        <div className="app-auth-field">
          <label htmlFor="reg-correo">
            Correo electrónico
          </label>

          <input
            id="reg-correo"
            type="email"
            autoComplete="email"
            placeholder="correo@ejemplo.com"
            value={correo}
            onChange={(e) =>
              setCorreo(e.target.value)
            }
          />
        </div>

        <div className="app-auth-row">

          <div className="app-auth-field">
            <label htmlFor="reg-password">
              Contraseña
            </label>

            <input
              id="reg-password"
              type="password"
              autoComplete="new-password"
              placeholder="Contraseña"
              value={password}
              onChange={(e) =>
                setPassword(e.target.value)
              }
            />
          </div>

          <div className="app-auth-field">
            <label htmlFor="reg-confirmar">
              Confirmar contraseña
            </label>

            <input
              id="reg-confirmar"
              type="password"
              autoComplete="new-password"
              placeholder="Repite la contraseña"
              value={confirmarPassword}
              onChange={(e) =>
                setConfirmarPassword(e.target.value)
              }
            />
          </div>

        </div>

        <div className="app-auth-field">
          <label htmlFor="reg-programa">
            Programa académico
          </label>

          <input
            id="reg-programa"
            type="text"
            autoComplete="organization-title"
            placeholder="Ingeniería Informática"
            value={programa}
            onChange={(e) =>
              setPrograma(e.target.value)
            }
          />
        </div>

        <div className="app-auth-field">
          <label htmlFor="reg-institucion">
            Institución
          </label>

          <input
            id="reg-institucion"
            type="text"
            autoComplete="organization"
            placeholder="Universidad Militar Nueva Granada"
            value={institucion}
            onChange={(e) =>
              setInstitucion(e.target.value)
            }
          />
        </div>

        {error && (
          <p className="app-auth-msg is-error" role="alert">
            {error}
          </p>
        )}

        {mensaje && (
          <p className="app-auth-msg is-success" role="status">
            {mensaje}
          </p>
        )}

        <button type="submit" className="app-auth-submit">
          Registrarse
        </button>

      </form>

    </AuthLayout>
  );

}

export default Register;
