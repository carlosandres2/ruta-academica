import { useEffect } from "react";

function Gracias() {
  useEffect(() => {
    document.title = "¡Gracias por suscribirte! | Ruta Académica";

    // Registrar Lead si el píxel de Meta está instalado.
    // La página debe utilizarse únicamente después
    // de confirmar la suscripción.
    if (typeof window.fbq === "function") {
      window.fbq("track", "Lead");
    }
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
