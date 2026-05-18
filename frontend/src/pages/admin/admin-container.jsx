import { Routes, Route } from "react-router-dom";
import SidebarAdmin from "./admin-sidebar";
import Dashboard from "./admin-dashboard";

import AdminEstadisticas from "./admin-estadistica";
import AdminUsuarios from "./admin-usuarios";
import AdminHoras from "./admin-horas";
import AdminMaterial from "./admin-material";
import Header from "../../header";
import "./admin-container.css";

function AdminContainer() {
  return (
    <div className="admin-layout">
      <SidebarAdmin />
      <Header/>

      <div className="admin-main">

        <Routes>
          <Route index element={<Dashboard />} />
          <Route path="estadisticas" element={<AdminEstadisticas />} />
          <Route path="usuarios" element={<AdminUsuarios />} />
          <Route path="horas" element={<AdminHoras />} />
          <Route path="material" element={<AdminMaterial />} />
        </Routes>
      </div>
    </div>
  );
}

export default AdminContainer;