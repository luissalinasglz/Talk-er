import { NavLink } from "react-router-dom";
import "../../sidebar.css";

import profileWhite from "../../assets/profile-white.png";
import dashboardIcon from "../../assets/dashboard.png";
import sesionesIcon from "../../assets/calendario.png";
import materialIcon from "../../assets/material.png";
import tareasIcon from "../../assets/tarea.png";
import examenIcon from "../../assets/examenes.png";
import Logout from "../../LogoutButton";

function SidebarStudent() {
  const base = "/student";

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

         <NavLink to={`${base}/tareas`} className="option">
            <img className="icon" src={tareasIcon} alt="" />
            <p>Tareas</p>
        </NavLink>

        <NavLink to={`${base}/examenes`} className="option">
            <img className="icon" src={examenIcon} alt="" />
            <p>Exámenes</p>
        </NavLink>

         <NavLink to={`${base}/material`} className="option">
            <img className="icon" src={materialIcon} alt="" />
            <p>Material</p>
        </NavLink>

        <Logout/>
      </nav>
    </aside>
  );
}

export default SidebarStudent;