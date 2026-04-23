import { Routes, Route } from "react-router-dom";
// import SidebarTutor from "./student-sidebar";
import Dashboard from "./student-dashboard";

// import Sesiones from "./student-sesiones";
// import Ligas from "./student-ligas";
// import Tareas from "./student-tareas";
// import Examenes from "./student-examenes";
// import Material from "./student-material";
// import Anuncios from "./student-anuncios";
// import Bitacoras from "./student-bitacoras";
// import Horas from "./student-horas";

function StudentContainer() {
  return (
    <div style={{ display: "flex" }}>
      <Sidebarstudent />

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

export default StudentContainer;