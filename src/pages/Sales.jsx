import { useEffect } from "react";
import { Link } from "react-router-dom";

import FunnelLayout from "../components/FunnelLayout";
import {
  PRODUCT,
  SURVEY_NOTE,
  SURVEY_STATS,
  formatearPrecio,
  parametrosProducto
} from "../data/offer";
import { track } from "../services/tracking";

const SIM_NOTICE =
  "Proyecto académico: la compra en esta página es una simulación. No se cobra ni se pide ningún dato de pago.";

function CheckIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      focusable="false"
    >
      <circle cx="12" cy="12" r="9" />
      <path d="M8 12.5l3 3 5-6" />
    </svg>
  );
}

function Sales() {
  useEffect(() => {
    track("ViewContent", parametrosProducto());
  }, []);

  function iniciarCompra() {
    track("InitiateCheckout", { ...parametrosProducto(), num_items: 1 });
  }

  return (
    <FunnelLayout title={`${PRODUCT.name} | Ruta Académica`}>
      <section className="lp-sales-hero" aria-labelledby="lp-sales-title">
        <div className="lp-container">
          <span className="lp-badge">Versión completa</span>
          <h1 id="lp-sales-title">{PRODUCT.headline}</h1>
          <p className="lp-sales-lead">{PRODUCT.tagline}</p>

          <p className="lp-price">
            <strong>{formatearPrecio(PRODUCT.price)}</strong>
            <span>{PRODUCT.currency} · pago único</span>
          </p>

          <div className="lp-actions">
            <Link
              className="lp-btn lp-btn-primary lp-btn-lg"
              to="/checkout"
              onClick={iniciarCompra}
            >
              Comprar {PRODUCT.name}
            </Link>
          </div>

          <p className="lp-sim lp-sales-sim">{SIM_NOTICE}</p>
        </div>
      </section>

      <section
        className="lp-section lp-survey"
        aria-labelledby="lp-sales-survey-title"
      >
        <div className="lp-container">
          <h2 id="lp-sales-survey-title">Lo que vimos en nuestra encuesta</h2>
          <div className="lp-grid lp-grid-3">
            {SURVEY_STATS.map((stat) => (
              <div className="lp-card lp-stat" key={stat.figure}>
                <strong>{stat.figure}</strong>
                <p>{stat.text}</p>
              </div>
            ))}
          </div>
          <p className="lp-footnote">{SURVEY_NOTE}</p>
        </div>
      </section>

      <section
        className="lp-section lp-section-alt"
        aria-labelledby="lp-sales-includes-title"
      >
        <div className="lp-container">
          <h2 id="lp-sales-includes-title">Qué incluye</h2>
          <ul className="lp-includes">
            {PRODUCT.includes.map((item) => (
              <li key={item}>
                <CheckIcon />
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section className="lp-sales-cta" aria-labelledby="lp-sales-cta-title">
        <div className="lp-container">
          <h2 id="lp-sales-cta-title">Empieza a organizar tu semestre</h2>

          <p className="lp-price">
            <strong>{formatearPrecio(PRODUCT.price)}</strong>
            <span>{PRODUCT.currency} · pago único</span>
          </p>

          <div className="lp-actions lp-actions-center">
            <Link
              className="lp-btn lp-btn-light lp-btn-lg"
              to="/checkout"
              onClick={iniciarCompra}
            >
              Comprar {PRODUCT.name}
            </Link>
          </div>

          <p className="lp-sim">{SIM_NOTICE}</p>
        </div>
      </section>
    </FunnelLayout>
  );
}

export default Sales;
