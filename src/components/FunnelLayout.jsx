import { useEffect } from "react";
import { Link } from "react-router-dom";

import Logo from "./Logo";

import "../pages/Landing.css";
import "../pages/Sales.css";

const CURRENT_YEAR = new Date().getFullYear();

/*
  Marco común de las páginas del embudo (ventas, checkout, compra):
  mismo encabezado y pie que la landing, título de la pestaña y,
  si se pide, etiqueta noindex.
*/
function FunnelLayout({ title, noindex = false, children }) {
  useEffect(() => {
    const tituloPrevio = document.title;
    let meta = null;

    if (title) document.title = title;

    if (noindex) {
      meta = document.createElement("meta");
      meta.name = "robots";
      meta.content = "noindex";
      document.head.appendChild(meta);
    }

    return () => {
      document.title = tituloPrevio;
      meta?.remove();
    };
  }, [title, noindex]);

  return (
    <div className="lp">
      <a className="lp-skip" href="#contenido">
        Saltar al contenido
      </a>

      <header className="lp-header">
        <div className="lp-container lp-header-inner">
          <Logo />
          <Link className="lp-btn lp-btn-ghost" to="/">
            Volver al inicio
          </Link>
        </div>
      </header>

      <main id="contenido">{children}</main>

      <footer className="lp-footer">
        <div className="lp-container">
          <strong>Ruta Académica</strong>
          <p>
            Proyecto académico · Comercio Electrónico · Universidad Militar
            Nueva Granada
          </p>
          <p>© {CURRENT_YEAR}</p>
        </div>
      </footer>
    </div>
  );
}

export default FunnelLayout;
