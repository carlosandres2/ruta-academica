import { useEffect } from "react";

function Gracias() {
  useEffect(() => {
    document.title = "¡Gracias por suscribirte! | Ruta Académica";

    // El evento Lead se registra al enviar el modal de la landing
    // (ver TemplateDownloadModal y services/tracking.js). No se registra
    // aquí para no contar dos veces la misma suscripción.
  }, []);

  return (
    <main className="gracias-container">
      <section className="gracias-card">
        <div className="gracias-icono" aria-hidden="true">
          🎉
        </div>

        <h1>¡Gracias por suscribirte!</h1>

        <p>
          Tu interés en Ruta Académica es muy importante para nosotros.
        </p>

        <p>
          Gracias por acompañarnos. Queremos ayudarte a organizar tus
          asignaturas, fechas de entrega y prioridades académicas.
        </p>

        <a href="/" className="gracias-boton">
          Volver a Ruta Académica
        </a>
      </section>
    </main>
  );
}

export default Gracias;
