import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

import AuthLayout from "../components/AuthLayout";
import { iniciarSesion } from "../services/usuarioService";

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
    <AuthLayout
      titulo="Iniciar sesión"
      subtitulo="Bienvenido de nuevo. Ingresa para ver tu panel."
      pie={
        <p>
          ¿No tienes una cuenta?{" "}
          <Link to="/registro">Registrarse</Link>
        </p>
      }
    >

      <form className="app-auth-form" onSubmit={manejarLogin}>

        <div className="app-auth-field">
          <label htmlFor="login-correo">
            Correo electrónico
          </label>

          <input
            id="login-correo"
            type="email"
            autoComplete="email"
            placeholder="correo@ejemplo.com"
            value={correo}
            onChange={(e) =>
              setCorreo(e.target.value)
            }
          />
        </div>

        <div className="app-auth-field">
          <label htmlFor="login-password">
            Contraseña
          </label>

          <input
            id="login-password"
            type="password"
            autoComplete="current-password"
            placeholder="Contraseña"
            value={password}
            onChange={(e) =>
              setPassword(e.target.value)
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
          Ingresar
        </button>

      </form>

    </AuthLayout>
  );

}

export default Login;
