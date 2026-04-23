import { Routes, Route } from "react-router-dom";
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

function TutorContainer() {
  return (
    <div style={{ display: "flex" }}>
      <SidebarTutor />

      <div style={{ flex: 1 }}>

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
        </Routes>
      </div>
    </div>
  );
}

export default TutorContainer;