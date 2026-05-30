import { useState, useEffect } from "react";
import "../tutor-examenes.css";

const API_URL = import.meta.env.VITE_API_URL;

function ExamenesPanel({ onSeleccionar, onCrearNuevo }) {
    const [examenes, setExamenes] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetch(`${API_URL}/tutor/examenes`, { credentials: "include" })
            .then(r => r.json())
            .then(data => setExamenes(Array.isArray(data) ? data : []))
            .catch(console.error)
            .finally(() => setLoading(false));
    }, []);

    if (loading) return <p style={{ padding: "2rem" }}>Cargando exámenes...</p>;

    return (
        <div className="examenes-panel vista-centrada">
            <div className="panel-left w-100">
                <div className="header-flex">
                    <h2>Exámenes Activos</h2>
                    <button className="button-save" onClick={onCrearNuevo}>+ Crear Examen</button>
                </div>

                {examenes.length === 0 && (
                    <p style={{ color: "#999", textAlign: "center", marginTop: "2rem" }}>
                        No hay exámenes creados aún.
                    </p>
                )}

                {examenes.map((examen) => (
                    <div key={examen._id} className="exam-item">
                        <div className="exam-header">
                            <div className="exam-indicator"></div>
                            <div className="exam-info">
                                <p className="exam-name">{examen.nombre}</p>
                                <p className="exam-date">
                                    Vence {new Date(examen.fecha_limite).toLocaleString("es-MX")} · {examen.duracion}min
                                </p>
                            </div>
                            <p className="exam-class">{examen.clase}</p>
                        </div>
                        <p className="exam-link" onClick={() => onSeleccionar(examen)}>
                            Ver resultados →
                        </p>
                    </div>
                ))}
            </div>
        </div>
    );
}

export default ExamenesPanel;
