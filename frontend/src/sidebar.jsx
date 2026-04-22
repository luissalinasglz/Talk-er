import "./sidebar.css"
import { NavLink } from "react-router-dom"
import profileWhite from "./assets/profile-white.png"
import dashboardIcon from "./assets/dashboard.png"
import sesionesIcon from "./assets/calendario.png"
import ligasIcon from "./assets/ligas.png"
import tareasIcon from "./assets/tarea.png"
import examenIcon from "./assets/examenes.png"
import materialIcon from "./assets/material.png"
import anunciosIcon from "./assets/anuncios.png"
import bitacoraIcon from "./assets/bitacora.png"
import horasIcon from "./assets/horas.png"

function Sidebar(){
    return(
        <aside className="sidebar">
            <div className="profile">
                <img className="profile-white" src={profileWhite}/>
            </div>
            <nav>
                <NavLink to="/" className="option">
                    <img className="icon" src={dashboardIcon}/>
                    <p>Dashboard</p>
                </NavLink>
                <NavLink to="/sesiones" className="option">
                    <img className="icon" src={sesionesIcon}/>
                    <p>Sesiones</p>
                </NavLink>
                <NavLink to="/ligas" className="option">
                    <img className="icon" src={ligasIcon}/>
                    <p>Ligas</p>
                </NavLink>
                <NavLink to="/tareas" className="option">
                    <img className="icon" src={tareasIcon}/>
                    <p>Tareas</p>
                </NavLink>
                <NavLink to="/examenes" className="option">
                    <img className="icon" src={examenIcon}/>
                    <p>Examenes</p>
                </NavLink>
                <NavLink to="/material" className="option">
                    <img className="icon" src={materialIcon}/>
                    <p>Material</p>
                </NavLink>
                <NavLink to="/anuncios" className="option">
                    <img className="icon" src={anunciosIcon}/>
                    <p>Anuncios</p>
                </NavLink>
                <NavLink to="/bitacora" className="option">
                    <img className="icon" src={bitacoraIcon}/>
                    <p>Bitacora</p>
                </NavLink>
                <NavLink to="/horas" className="option">
                    <img className="icon" src={horasIcon}/>
                    <p>Horas</p>
                </NavLink>
            </nav>
        </aside>
    );
}

export default Sidebar