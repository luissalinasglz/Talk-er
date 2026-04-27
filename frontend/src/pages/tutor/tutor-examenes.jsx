import { useState } from "react"; 
import "./tutor-examenes.css";
import ExamenesPanel from "./examenes/examenes-panel";
import ExamenesResultados from "./examenes/examenes-resultado";
import ExamenesCrear from "./examenes/examenes-crear"; // <-- NUEVO COMPONENTE

function Examenes() {
    const [vista, setVista] = useState("panel");
    const [examenActivo, setExamenActivo] = useState(null);

    return (
        <div className="examenes">
            <div className="line-exam"></div>
            <div className="exams-content">
                {vista === "panel" && (
                    <ExamenesPanel
                        onSeleccionar={(e) => { setExamenActivo(e); setVista("resultados"); }}
                        onCrearNuevo={() => setVista("crear")}
                    />
                )}
                {vista === "crear" && (
                    <ExamenesCrear onVolver={() => setVista("panel")} />
                )}
                {vista === "resultados" && (
                    <ExamenesResultados examen={examenActivo} onVolver={() => setVista("panel")} />
                )}
            </div>
        </div>
    );
}

export default Examenes;