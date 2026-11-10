import { useEffect } from "react";

export default function Gracias() {
  useEffect(() => {
    document.title = "¡Gracias por suscribirte! | Ruta Académica";

    // Registrar Lead solamente si Meta Pixel está instalado.
    if (typeof window.fbq === "function") {
      window.fbq("track", "Lead");
    }
  }, []);

  return (
    <main
      style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "24px",
        background: "#f1f5f9",
        fontFamily: "Arial, sans-serif",
      }}
    >
      <section
        style={{
          maxWidth: "560px",
          width: "100%",
          padding: "40px 28px",
          background: "#ffffff",
          borderRadius: "20px",
          textAlign: "center",
          boxShadow: "0 10px 35px rgba(0,0,0,0.08)",
        }}
      >
        <div style={{ fontSize: "64px" }}>🎉</div>

        <h1 style={{ color: "#1d4ed8" }}>
          ¡Gracias por suscribirte!
        </h1>

        <p style={{ fontSize: "18px", lineHeight: 1.7, color: "#334155" }}>
          Tu interés en Ruta Académica es muy importante para nosotros.
        </p>

        <p style={{ fontSize: "16px", lineHeight: 1.7, color: "#475569" }}>
          Tu proceso de confirmación ha finalizado. Te invitamos a seguir
          organizando tus asignaturas, fechas de entrega y prioridades
          académicas con nosotros.
        </p>

        <a
          href="/"
          style={{
            display: "inline-block",
            marginTop: "20px",
            padding: "14px 24px",
            background: "#2563eb",
            color: "#ffffff",
            textDecoration: "none",
            borderRadius: "10px",
            fontWeight: "bold",
          }}
        >
          Volver a Ruta Académica
        </a>
      </section>
    </main>
  );
}
