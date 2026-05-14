import { Routes, Route } from "react-router-dom";
import SidebarAdmin from "./admin-sidebar";
import Dashboard from "./admin-dashboard";

import Sesiones from "./admin-sesiones";
import Bitacoras from "./admin-bitacoras";
import Header from "../../header";
import "./admin-container.css";

function AdminContainer() {
  return (
    <div style={{ display: "flex" }}>
      <SidebarAdmin />
      <Header/>

      <div style={{ flex: 1 }}>

        <Routes>
          <Route index element={<Dashboard />} />
          <Route path="sesiones" element={<Sesiones />} />
          <Route path="bitacora" element={<Bitacoras />} />
        </Routes>
      </div>
    </div>
  );
}

export default AdminContainer;