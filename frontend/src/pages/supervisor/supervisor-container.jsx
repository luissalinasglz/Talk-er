import { Routes, Route } from "react-router-dom";
import SidebarSupervisor from "./supervisor-sidebar";
import Dashboard from "./supervisor-dashboard";

import Sesiones from "./supervisor-sesiones";
import Bitacoras from "./supervisor-bitacoras";

function SupervisorContainer() {
  return (
    <div style={{ display: "flex" }}>
      <SidebarSupervisor />

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

export default SupervisorContainer;