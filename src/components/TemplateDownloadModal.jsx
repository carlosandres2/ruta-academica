import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";

import {
  descargarPlantilla,
  enviarCorreoPlantilla
} from "../services/leadService";

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

function ModalContent({ logged, onClose }) {
  const [correo, setCorreo] = useState("");
  const [consentimiento, setConsentimiento] = useState(false);
  const [trampa, setTrampa] = useState("");
  const [errores, setErrores] = useState({});
  const [listo, setListo] = useState(false);

  const correoRef = useRef(null);
  const consentimientoRef = useRef(null);

  function enviar(evento) {
    evento.preventDefault();

    if (listo) return;

    const correoLimpio = correo.trim();

    if (!EMAIL_REGEX.test(correoLimpio)) {
      setErrores({ correo: "Escribe un correo válido." });
      correoRef.current?.focus();
      return;
    }

    if (!consentimiento) {
      setErrores({ consentimiento: "Debes aceptar para continuar." });
      consentimientoRef.current?.focus();
      return;
    }

    setErrores({});

    descargarPlantilla();

    // Con el campo trampa relleno no se envía nada al formulario.
    if (!trampa) {
      enviarCorreoPlantilla(correoLimpio);
    }

    setListo(true);
  }

  if (listo) {
    return (
      <div className="lp-modal-body">
        <h2 id="lp-modal-title" className="lp-modal-title">
          ¡Listo! Tu descarga empezó
        </h2>
        <p className="lp-modal-text">
          Revisa tu carpeta de descargas. Si no ves el archivo, usa el enlace
          de abajo.
        </p>

        <button
          type="button"
          className="lp-modal-link"
          onClick={descargarPlantilla}
        >
          Descargar de nuevo
        </button>

        <div className="lp-modal-actions">
          <Link
            className="lp-btn lp-btn-primary"
            to={logged ? "/dashboard" : "/registro"}
          >
            {logged ? "Ir a mi panel" : "Probar la versión web"}
          </Link>
          <button type="button" className="lp-btn lp-btn-outline" onClick={onClose}>
            Cerrar
          </button>
        </div>
      </div>
    );
  }

  return (
    <form className="lp-modal-body" onSubmit={enviar} noValidate>
      <h2 id="lp-modal-title" className="lp-modal-title">
        Descarga la plantilla gratis
      </h2>
      <p className="lp-modal-text">
        Escribe tu correo y la descarga empieza al instante.
      </p>

      <div className="lp-field">
        <label htmlFor="lp-correo">Correo electrónico</label>
        <input
          id="lp-correo"
          ref={correoRef}
          type="email"
          name="correo"
          required
          autoComplete="email"
          placeholder="correo@ejemplo.com"
          value={correo}
          onChange={(e) => setCorreo(e.target.value)}
          aria-invalid={errores.correo ? "true" : undefined}
          aria-describedby={errores.correo ? "lp-correo-error" : undefined}
        />
        {errores.correo && (
          <p id="lp-correo-error" className="lp-field-error" role="alert">
            {errores.correo}
          </p>
        )}
      </div>

      <div className="lp-trap" aria-hidden="true">
        <label htmlFor="lp-sitio">Sitio web</label>
        <input
          id="lp-sitio"
          type="text"
          name="sitio"
          tabIndex={-1}
          autoComplete="off"
          value={trampa}
          onChange={(e) => setTrampa(e.target.value)}
        />
      </div>

      <div className="lp-field">
        <label className="lp-check" htmlFor="lp-consentimiento">
          <input
            id="lp-consentimiento"
            ref={consentimientoRef}
            type="checkbox"
            required
            checked={consentimiento}
            onChange={(e) => setConsentimiento(e.target.checked)}
            aria-invalid={errores.consentimiento ? "true" : undefined}
            aria-describedby={
              errores.consentimiento ? "lp-consentimiento-error" : undefined
            }
          />
          <span>
            Autorizo el uso de mi correo electrónico para contactarme sobre
            esta plantilla y las novedades del proyecto académico Ruta
            Académica.
          </span>
        </label>
        {errores.consentimiento && (
          <p
            id="lp-consentimiento-error"
            className="lp-field-error"
            role="alert"
          >
            {errores.consentimiento}
          </p>
        )}
      </div>

      <p className="lp-modal-small">
        Usaremos tu correo solo para este proyecto académico.
      </p>

      <button type="submit" className="lp-btn lp-btn-primary lp-btn-lg lp-modal-submit">
        Descargar plantilla
      </button>
    </form>
  );
}

function TemplateDownloadModal({ open, logged, onClose }) {
  const dialogRef = useRef(null);

  useEffect(() => {
    const dialog = dialogRef.current;

    if (!open || !dialog) return undefined;

    const origen = document.activeElement;
    const overflowPrevio = document.body.style.overflow;

    if (!dialog.open) dialog.showModal();

    document.body.style.overflow = "hidden";
    dialog.querySelector("input[type='email']")?.focus();

    return () => {
      document.body.style.overflow = overflowPrevio;

      if (dialog.open) dialog.close();

      if (origen instanceof HTMLElement) origen.focus();
    };
  }, [open]);

  function clicEnFondo(evento) {
    if (evento.target === dialogRef.current) {
      dialogRef.current.close();
    }
  }

  return (
    <dialog
      ref={dialogRef}
      className="lp-modal"
      aria-labelledby="lp-modal-title"
      onClose={onClose}
      onClick={clicEnFondo}
    >
      <button
        type="button"
        className="lp-modal-close"
        aria-label="Cerrar"
        onClick={() => dialogRef.current?.close()}
      >
        <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
          <path
            d="M6 6l12 12M18 6L6 18"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
          />
        </svg>
      </button>

      {open && <ModalContent logged={logged} onClose={onClose} />}
    </dialog>
  );
}

export default TemplateDownloadModal;
