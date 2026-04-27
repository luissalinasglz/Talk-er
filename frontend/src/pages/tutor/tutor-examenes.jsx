import { useState } from "react"; 
import "./tutor-examenes.css";
import ExamenesPanel from "./examenes/examenes-panel";
import ExamenesResultados from "./examenes/examenes-resultado";

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
                    />
                )}
                {vista === "resultados" && (
                    <ExamenesResultados examen={examenActivo} />
                )}
            </div>
        </div>
    );
}

export default Examenes