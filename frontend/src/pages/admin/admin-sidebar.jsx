import { NavLink } from "react-router-dom";
import "../../sidebar.css";

import profileWhite from "../../assets/profile-white.png";
import dashboardIcon from "../../assets/dashboard.png";
import estadisticasIcon from "../../assets/estadistica.png";
import usuariosIcon from "../../assets/usuarios.png";
import horasIcon from "../../assets/horas.png"
import materialIcon from "../../assets/material.png"

function SidebarAdmin() {
  const base = "/admin";

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

        <NavLink to={`${base}/estadisticas`} className="option">
          <img className="icon" src={estadisticasIcon} alt="" />
          <p>Estadistica</p>
        </NavLink>

        <NavLink to={`${base}/usuarios`} className="option">
          <img className="icon" src={usuariosIcon} alt="" />
          <p>Usuarios</p>
        </NavLink>

         <NavLink to={`${base}/horas`} className="option">
          <img className="icon" src={horasIcon} alt="" />
          <p>Horas</p>
        </NavLink>

         <NavLink to={`${base}/material`} className="option">
          <img className="icon" src={materialIcon} alt="" />
          <p>Material</p>
        </NavLink>
      </nav>
    </aside>
  );
}

export default SidebarAdmin;