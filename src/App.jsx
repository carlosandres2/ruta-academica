import {
  BrowserRouter,
  Routes,
  Route
} from "react-router-dom";

import "./index.css";

import Landing from "./pages/Landing";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import Activities from "./pages/Activities";
import Subjects from "./pages/Subjects";
import Calendar from "./pages/Calendar";
import Progress from "./pages/Progress";


function App() {

  return (

    <BrowserRouter>

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

      </Routes>

    </BrowserRouter>

  );

}


export default App;
