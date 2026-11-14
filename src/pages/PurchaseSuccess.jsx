import { useEffect } from "react";
import { Link, Navigate, useLocation } from "react-router-dom";

import FunnelLayout from "../components/FunnelLayout";
import { ORDER_KEY, PRODUCT } from "../data/offer";
import { track } from "../services/tracking";

// Respaldo si sessionStorage no está disponible.
const pedidosRegistrados = new Set();

function leerPedidoGuardado() {
  try {
    return JSON.parse(sessionStorage.getItem(ORDER_KEY) || "null");
  } catch {
    return null;
  }
}

function claveRegistro(orderId) {
  return `ra_purchase_${orderId}`;
}

function yaRegistrado(orderId) {
  if (pedidosRegistrados.has(orderId)) return true;

  try {
    return Boolean(sessionStorage.getItem(claveRegistro(orderId)));
  } catch {
    return false;
  }
}

function marcarRegistrado(orderId) {
  pedidosRegistrados.add(orderId);

  try {
    sessionStorage.setItem(claveRegistro(orderId), "1");
  } catch {
    // El Set en memoria ya evita duplicados mientras la pestaña siga abierta.
  }
}

function PurchaseSuccess() {
  const location = useLocation();
  const pedido = location.state?.pedido || leerPedidoGuardado();
  const orderId = pedido?.orderId;
  const value = pedido?.value;
  const currency = pedido?.currency;

  useEffect(() => {
    if (!orderId || yaRegistrado(orderId)) return;

    // Se marca antes de registrar para que recargar la página o el doble
    // montaje de StrictMode en desarrollo no dupliquen el evento.
    marcarRegistrado(orderId);

    track(
      "Purchase",
      {
        content_ids: [PRODUCT.id],
        content_name: PRODUCT.name,
        content_type: "product",
        num_items: 1,
        value,
        currency
      },
      // El número de pedido es el event_id: Meta deduplica navegador y servidor.
      { eventId: orderId }
    );
  }, [orderId, value, currency]);

  if (!orderId) {
    return <Navigate to="/ventas" replace />;
  }

  return (
    <FunnelLayout title={`Compra simulada confirmada | ${PRODUCT.name}`} noindex>
      <section className="lp-checkout" aria-labelledby="lp-success-title">
        <div className="lp-container">
          <div className="lp-checkout-card">
            <span className="lp-badge">Simulación</span>
            <h1 id="lp-success-title">¡Compra simulada confirmada!</h1>

            <p>
              Gracias por recorrer el proceso de compra de {PRODUCT.name}. Como
              es un proyecto académico, no se realizó ningún cobro ni se
              entregó ningún producto.
            </p>

            <p className="lp-order">
              Número de pedido de prueba: <strong>{orderId}</strong>
            </p>

            <div className="lp-actions">
              <Link className="lp-btn lp-btn-primary lp-btn-lg" to="/">
                Volver a Ruta Académica
              </Link>
            </div>
          </div>
        </div>
      </section>
    </FunnelLayout>
  );
}

export default PurchaseSuccess;
