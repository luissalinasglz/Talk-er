import { Routes, Route, Navigate } from "react-router-dom";
import SidebarTutor from "./tutor-sidebar";
import Dashboard from "./tutor-dashboard";

import Sesiones from "./tutor-sesiones";
import Ligas from "./tutor-ligas";
import Tareas from "./tutor-tareas";
import Examenes from "./tutor-examenes";
import Material from "./tutor-material";
import Anuncios from "./tutor-anuncios";
import Bitacoras from "./tutor-bitacoras";
import Horas from "./tutor-horas";
import Header from "../../header";
import "./tutor-container.css";

function TutorContainer() {
  return (
    <div className="tutor-layout">
      <SidebarTutor />
      <Header/>

      <div className="tutor-main">
        <Routes>
          <Route index element={<Dashboard />} />
          <Route path="sesiones" element={<Sesiones />} />
          <Route path="ligas" element={<Ligas />} />
          <Route path="tareas" element={<Tareas />} />
          <Route path="examenes" element={<Examenes />} />
          <Route path="material" element={<Material />} />
          <Route path="anuncios" element={<Anuncios />} />
          <Route path="bitacora" element={<Bitacoras />} />
          <Route path="horas" element={<Horas />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </div>
    </div>
  );
}

export default TutorContainer;