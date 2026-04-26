import { useState } from "react";
import "./tutor-tareas.css";
import TareasLista   from "./tareas/tareas-lista";
import TareasDetalle from "./tareas/tareas-detalle";
import TareasEditar  from "./tareas/tareas-editar";
import TareasCrear   from "./tareas/tareas-crear";

function Tareas() {
    const [tab, setTab] = useState("gestionar");
    const [vista, setVista] = useState("lista");   
    const [tareaActiva, setTareaActiva] = useState(null); 

    const renderContenido = () => {
        if (tab === "crear") return <TareasCrear />;
        if (vista === "lista") return <TareasLista   onSeleccionar={(t) => { setTareaActiva(t); setVista("detalle"); }} />;
        if (vista === "detalle") return <TareasDetalle tarea={tareaActiva} onEditar={() => setVista("editar")} />;
        if (vista === "editar") return <TareasEditar  tarea={tareaActiva} />;
};

  return (
    <div className="homework">
     <div className="homework-header">
        <div className="line-homework"></div>
        <div className="homework-tabs">
          <div
            className={`tab ${tab === "gestionar" ? "active" : ""}`}
            onClick={() => { setTab("gestionar"); setVista("lista"); }}>
            Gestionar Tareas
          </div>
          <div
            className={`tab ${tab === "crear" ? "active" : ""}`}
            onClick={() => setTab("crear")}>
            Crear Tarea
          </div>
        </div>
      </div>

      <div className="homework-content">
        {renderContenido()}
      </div>

    </div>
  );
}

export default Tareas;