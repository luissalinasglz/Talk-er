import { Routes, Route } from "react-router-dom";
import SidebarSupervisor from "./supervisor-sidebar";
import Dashboard from "./supervisor-dashboard";

import Sesiones from "./supervisor-sesiones";
import Bitacoras from "./supervisor-bitacoras";
import Header from "../../header";
import "./supervisor-container.css";

function SupervisorContainer() {
  return (
    <div className="supervisor-layout">
      <SidebarSupervisor />
      <Header/>

      <div className="supervisor-main">

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