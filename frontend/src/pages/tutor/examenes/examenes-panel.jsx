import { useState, useEffect } from "react";
import "../tutor-examenes.css"

function ExamenesPanel({ onSeleccionar, onCrearNuevo }) {
    
    const [examenes, setExamenes] = useState([
    { id: 1, nombre: "Examen Diagnóstico Unidad 1", clase: "Inglés A", duracion: 60, vence: "2026-05-15 23:59" },
    { id: 2, nombre: "Quiz Vocabulario", clase: "Inglés B", duracion: 30, vence: "2026-05-20 18:00" }
  ]);

    return (
        <div className="examenes-panel vista-centrada">
            <div className="panel-left w-100">
                <div className="header-flex">
                    <h2>Exámenes Activos</h2>
                    <button className="button-save" onClick={onCrearNuevo}>+ Crear Examen</button>
                </div>
                
                {examenes.map((examen) => (
                    <div key={examen.id} className="exam-item">
                        <div className="exam-header">
                            <div className="exam-indicator"></div>
                            <div className="exam-info">
                                <p className="exam-name">{examen.nombre}</p>
                                <p className="exam-date">
                                    Vence {examen.vence} · {examen.preguntas} preguntas · {examen.duracion}min
                                </p>
                            </div>
                            <p className="exam-class">{examen.clase}</p>
                        </div>
                        <p 
                            className="exam-link"
                            onClick={() => onSeleccionar(examen)}
                        >
                            Ver resultados →
                        </p>
                    </div>
                ))}
            </div>
        </div>
    );
}

export default ExamenesPanel;