import { Routes, Route } from "react-router-dom";
// import SidebarTutor from "./admin-sidebar";
import Dashboard from "./admin-dashboard";

// import Sesiones from "./admin-sesiones";
// import Ligas from "./admin-ligas";
// import Tareas from "./admin-tareas";
// import Examenes from "./admin-examenes";
// import Material from "./admin-material";
// import Anuncios from "./admin-anuncios";
// import Bitacoras from "./admin-bitacoras";
// import Horas from "./admin-horas";

function AdminContainer() {
  return (
    <div style={{ display: "flex" }}>
      <Sidebaradmin />

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

export default AdminContainer;