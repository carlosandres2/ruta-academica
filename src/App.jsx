import { useEffect, useRef } from "react";
import {
  BrowserRouter,
  Routes,
  Route,
  useLocation
} from "react-router-dom";

import "./index.css";
import { trackPageView } from "./services/tracking";

import Landing from "./pages/Landing";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import Activities from "./pages/Activities";
import Subjects from "./pages/Subjects";
import Calendar from "./pages/Calendar";
import Progress from "./pages/Progress";
import Gracias from "./pages/Gracias";
import Sales from "./pages/Sales";
import Checkout from "./pages/Checkout";
import PurchaseSuccess from "./pages/PurchaseSuccess";

/*
  La app es de una sola página: el Pixel solo registra PageView al cargar.
  Aquí se registra en cada cambio de ruta (la primera carga ya la cubre
  initTracking).
*/
function RouteTracker() {
  const { pathname } = useLocation();
  const ultimaRuta = useRef(pathname);

  useEffect(() => {
    if (ultimaRuta.current === pathname) return;

    ultimaRuta.current = pathname;
    trackPageView();
  }, [pathname]);

  return null;
}

function App() {
  return (
    <BrowserRouter>
      <RouteTracker />

      <Routes>
        <Route
          path="/"
          element={<Landing />}
        />

        <Route
          path="/login"
          element={<Login />}
        />

        <Route
          path="/registro"
          element={<Register />}
        />

        <Route
          path="/dashboard"
          element={<Dashboard />}
        />

        <Route
          path="/actividades"
          element={<Activities />}
        />

        <Route
          path="/asignaturas"
          element={<Subjects />}
        />

        <Route
          path="/calendario"
          element={<Calendar />}
        />

        <Route
          path="/progreso"
          element={<Progress />}
        />

        <Route
          path="/gracias"
          element={<Gracias />}
        />

        <Route
          path="/ventas"
          element={<Sales />}
        />

        <Route
          path="/checkout"
          element={<Checkout />}
        />

        <Route
          path="/compra-exitosa"
          element={<PurchaseSuccess />}
        />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
