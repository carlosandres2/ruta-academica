import { Link, useNavigate } from "react-router-dom";

import FunnelLayout from "../components/FunnelLayout";
import { ORDER_KEY, PRODUCT, formatearPrecio } from "../data/offer";

function crearNumeroPedido() {
  const aleatorio = Math.random().toString(36).slice(2, 8).toUpperCase();

  return `RA-${Date.now().toString(36).toUpperCase()}-${aleatorio}`;
}

/*
  Checkout SIMULADO: no hay pasarela de pago, no se piden datos de pago y no
  se cobra nada. Solo genera un número de pedido y lleva a /compra-exitosa,
  donde se registra Purchase.
*/
function Checkout() {
  const navigate = useNavigate();

  function confirmar() {
    const pedido = {
      orderId: crearNumeroPedido(),
      value: PRODUCT.price,
      currency: PRODUCT.currency
    };

    try {
      sessionStorage.setItem(ORDER_KEY, JSON.stringify(pedido));
    } catch {
      // El pedido también viaja en el estado de la navegación.
    }

    navigate("/compra-exitosa", { state: { pedido } });
  }

  return (
    <FunnelLayout title={`Confirmar compra | ${PRODUCT.name}`} noindex>
      <section className="lp-checkout" aria-labelledby="lp-checkout-title">
        <div className="lp-container">
          <div className="lp-checkout-card">
            <h1 id="lp-checkout-title">Confirma tu compra</h1>

            <p className="lp-sim">
              Proyecto académico: esta compra es una simulación. No se cobra ni
              se piden datos de pago.
            </p>

            <div className="lp-summary">
              <span>{PRODUCT.name}</span>
              <strong>{formatearPrecio(PRODUCT.price)}</strong>
            </div>

            <div className="lp-actions">
              <button
                type="button"
                className="lp-btn lp-btn-primary lp-btn-lg"
                onClick={confirmar}
              >
                Confirmar compra simulada
              </button>
              <Link className="lp-btn lp-btn-outline lp-btn-lg" to="/ventas">
                Volver
              </Link>
            </div>
          </div>
        </div>
      </section>
    </FunnelLayout>
  );
}

export default Checkout;
