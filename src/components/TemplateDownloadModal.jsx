
import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";

import {
  descargarPlantilla,
  enviarCorreoPlantilla,
  suscribirCorreo
} from "../services/leadService";
import { guardarCorreoLead, track } from "../services/tracking";

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

function ModalContent({ logged, onClose }) {
  const [correo, setCorreo] = useState("");
  const [consentimiento, setConsentimiento] = useState(false);
  const [trampa, setTrampa] = useState("");
  const [errores, setErrores] = useState({});
  const [listo, setListo] = useState(false);
  const [enviando, setEnviando] = useState(false);

  const correoRef = useRef(null);
  const consentimientoRef = useRef(null);

  async function enviar(evento) {
    evento.preventDefault();

    if (listo || enviando) return;

    const correoLimpio = correo.trim().toLowerCase();

    if (!EMAIL_REGEX.test(correoLimpio)) {
      setErrores({ correo: "Escribe un correo válido." });
      correoRef.current?.focus();
      return;
    }

    if (!consentimiento) {
      setErrores({
        consentimiento: "Debes aceptar para continuar."
      });
      consentimientoRef.current?.focus();
      return;
    }

    setErrores({});
    setEnviando(true);

    try {
      // Se inicia la descarga durante la acción del usuario.
      descargarPlantilla();

      // Protección antispam.
      if (trampa) {
        setListo(true);
        return;
      }

      // Esperar confirmación de MailerLite.
      const registrado = await suscribirCorreo(correoLimpio);

      if (!registrado) {
        setErrores({
          general:
            "La plantilla se descargó, pero no pudimos registrar tu correo. Inténtalo nuevamente."
        });
        return;
      }

      // Respaldo de Google Forms, si sigue configurado.
      void enviarCorreoPlantilla(correoLimpio);

      guardarCorreoLead(correoLimpio);

      // Registrar Lead únicamente después de la confirmación.
      track(
        "Lead",
        {
          content_name: "Plantilla de Excel + Reto de 3 días"
        },
        { email: correoLimpio }
      );

      setListo(true);
    } catch {
      setErrores({
        general:
          "No pudimos completar el registro. Revisa tu conexión e inténtalo nuevamente."
      });
    } finally {
      setEnviando(false);
    }
  }

  if (listo) {
    return (
      <div className="lp-modal-body">
        <h2 id="lp-modal-title" className="lp-modal-title">
          ¡Listo! Tu descarga empezó
        </h2>

        <p className="lp-modal-text">
          Tu registro fue recibido. Revisa tu carpeta de descargas y tu correo electrónico.
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

          <button
            type="button"
            className="lp-btn lp-btn-outline"
            onClick={onClose}
          >
            Cerrar
          </button>
        </div>
      </div>
    );
  }

  return (
    <form
      className="lp-modal-body"
      onSubmit={enviar}
      noValidate
      aria-busy={enviando}
    >
      <h2 id="lp-modal-title" className="lp-modal-title">
        Descarga la plantilla gratis
      </h2>

      <p className="lp-modal-text">
        Escribe tu correo y recibirás la plantilla y el reto de 3 días.
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
          disabled={enviando}
          onChange={(e) => setCorreo(e.target.value)}
          aria-invalid={errores.correo ? "true" : undefined}
        />

        {errores.correo && (
          <p className="lp-field-error" role="alert">
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
            disabled={enviando}
            onChange={(e) => setConsentimiento(e.target.checked)}
          />

          <span>
            Autorizo el uso de mi correo electrónico para enviarme la
            plantilla, el reto de 3 días y novedades, incluida una oferta,
            del proyecto académico Ruta Académica.
          </span>
        </label>

        {errores.consentimiento && (
          <p className="lp-field-error" role="alert">
            {errores.consentimiento}
          </p>
        )}
      </div>

      {errores.general && (
        <p className="lp-field-error" role="alert">
          {errores.general}
        </p>
      )}

      <p className="lp-modal-small">
        Usaremos tu correo para los fines indicados en el consentimiento.
      </p>

      <button
        type="submit"
        disabled={enviando}
        className="lp-btn lp-btn-primary lp-btn-lg lp-modal-submit"
      >
        {enviando ? "Registrando correo..." : "Descargar plantilla"}
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
