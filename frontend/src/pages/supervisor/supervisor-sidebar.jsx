import { NavLink } from "react-router-dom";
import "../../sidebar.css";

import sesionesIcon from "../../assets/calendario.png";
import bitacoraIcon from "../../assets/bitacora.png";
import dashboardIcon from "../../assets/dashboard.png";
import profileWhite from "../../assets/profile-white.png";

function SidebarSupervisor() {
  const base = "/supervisor";

  return (
    <aside className="sidebar">
      <div className="profile">
        <img className="profile-white" src={profileWhite} alt="profile" />
      </div>

      <nav>
        <NavLink to={base} className="option">
          <img className="icon" src={dashboardIcon} alt="" />
          <p>Dashboard</p>
        </NavLink>

        <NavLink to={`${base}/sesiones`} className="option">
          <img className="icon" src={sesionesIcon} alt="" />
          <p>Sesiones</p>
        </NavLink>

        <NavLink to={`${base}/bitacora`} className="option">
          <img className="icon" src={bitacoraIcon} alt="" />
          <p>Bitácora</p>
        </NavLink>

      </nav>
    </aside>
  );
}

export default SidebarSupervisor;