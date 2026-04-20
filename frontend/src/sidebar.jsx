import "./sidebar.css"
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
                <div className="option">
                    <img className="icon" src={dashboardIcon}/>
                    <p>Dashboard</p>
                </div>
                <div className="option">
                    <img className="icon" src={sesionesIcon}/>
                    <p>Sesiones</p>
                </div>
                 <div className="option">
                    <img className="icon" src={ligasIcon}/>
                    <p>Ligas</p>
                </div>
                <div className="option">
                    <img className="icon" src={tareasIcon}/>
                     <p>Tareas</p>
                </div>
                <div className="option">
                    <img className="icon" src={examenIcon}/>
                     <p>Examenes</p>
                </div>
                <div className="option">
                    <img className="icon" src={materialIcon}/>
                    <p>Material</p>
                </div>
                <div className="option">
                    <img className="icon" src={anunciosIcon}/>
                    <p>Anuncios</p>
                </div>
                <div className="option">
                    <img className="icon" src={bitacoraIcon}/>
                    <p>Bitacora</p>
                </div>
                <div className="option">
                    <img className="icon" src={horasIcon}/>
                    <p>Horas</p>
                </div>
            </nav>
        </aside>
    );
}

export default Sidebar