import { useState, useEffect } from "react";
import "../tutor-examenes.css";

const API_URL = import.meta.env.VITE_API_URL;

function ExamenesPanel({ onSeleccionar, onCrearNuevo }) {
    const [examenes, setExamenes] = useState([]);
    const [alumnos, setAlumnos]   = useState({});
    const [loading, setLoading]   = useState(true);

    useEffect(() => {
        fetch(`${API_URL}/tutor/examenes`, { credentials: "include" })
            .then(r => r.json())
            .then(data => setExamenes(Array.isArray(data) ? data : []))
            .catch(console.error)
            .finally(() => setLoading(false));
    }, []);

    useEffect(() => {
        if (examenes.length === 0) return;

        examenes.forEach((examen) => {
            fetch(`${API_URL}/tutor/alumno/${examen.clase}`, { credentials: "include" })
                .then(r => r.json())
                .then(data => {
                    setAlumnos(prev => ({ ...prev, [examen._id]: data }));
                })
                .catch(console.error);
        });
    }, [examenes]);

    if (loading) return <p className="estado-cargando">Cargando exámenes...</p>;

    return (
        <div className="examenes-panel vista-centrada">
            <div className="panel-left w-100">
                <div className="header-flex">
                    <h2>Exámenes Activos</h2>
                    <button className="button-save" onClick={onCrearNuevo}>+ Crear Examen</button>
                </div>

                {examenes.length === 0 && (
                    <p className="estado-vacio">No hay exámenes creados aún.</p>
                )}

                {examenes.map((examen) => {
                    const estudiantesDelExamen = alumnos[examen._id] || [];
                    return (
                        <div key={examen._id} className="exam-item">
                            <div className="exam-header">
                                <div className="exam-indicator" />
                                <div className="exam-info">
                                    <p className="exam-name">{examen.nombre}</p>
                                    <p className="exam-date">
                                        Vence {new Date(examen.fecha_limite).toLocaleString("es-MX")} · {examen.duracion}min
                                    </p>
                                </div>
                                <div className="exam-alumnos">
                                    {estudiantesDelExamen.map((alumno, i) => (
                                        <p key={i} className="exam-class">{alumno.nombre_alumno}</p>
                                    ))}
                                </div>
                            </div>
                            <p className="exam-link" onClick={() => onSeleccionar(examen)}>
                                Ver resultados →
                            </p>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}

export default ExamenesPanel;
