import { Link, Navigate, useLocation } from "react-router-dom";

import FunnelLayout from "../components/FunnelLayout";
import { ORDER_KEY, PRODUCT } from "../data/offer";

function leerPedidoGuardado() {
  try {
    return JSON.parse(sessionStorage.getItem(ORDER_KEY) || "null");
  } catch {
    return null;
  }
}

function PurchaseSuccess() {
  const location = useLocation();
  const pedido = location.state?.pedido || leerPedidoGuardado();
  const orderId = pedido?.orderId;

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
