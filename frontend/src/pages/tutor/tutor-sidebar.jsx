import { NavLink, useNavigate } from "react-router-dom";
import "../../sidebar.css";

import horasIcon from "../../assets/horas.png";
import sesionesIcon from "../../assets/calendario.png";
import ligasIcon from "../../assets/ligas.png";
import tareasIcon from "../../assets/tarea.png";
import examenIcon from "../../assets/examenes.png";
import materialIcon from "../../assets/material.png";
import bitacoraIcon from "../../assets/bitacora.png";
import dashboardIcon from "../../assets/dashboard.png";
import profileWhite from "../../assets/profile-white.png";
import logoutIcon from "../../assets/logout.png";

const API_URL = import.meta.env.VITE_API_URL;

function SidebarTutor() {
  const base = "/tutor";
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await fetch(`${API_URL}/auth/logout`, {
        method: "POST",
        credentials: "include",
      });
    } catch (err) {
      console.error("Logout error:", err);
    } finally {
      navigate("/");
    }
  };

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

        <NavLink to={`${base}/ligas`} className="option">
          <img className="icon" src={ligasIcon} alt="" />
          <p>Ligas</p>
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

        <NavLink to={`${base}/bitacora`} className="option">
          <img className="icon" src={bitacoraIcon} alt="" />
          <p>Bitácora</p>
        </NavLink>

        <NavLink to={`${base}/horas`} className="option">
          <img className="icon" src={horasIcon} alt="" />
          <p>Horas</p>
        </NavLink>
        
        <button className="logout-btn" onClick={handleLogout}>
          <img className="icon" src={logoutIcon} alt="" />
          <p>Cerrar Sesion</p>
        </button>
        
      </nav>
    </aside>
  );
}

export default SidebarTutor;
