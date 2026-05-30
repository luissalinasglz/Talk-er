import { useEffect, useState } from "react";
import "../tutor-examenes.css";

const API_URL = import.meta.env.VITE_API_URL;
const LETRAS = ["A", "B", "C", "D"];

function ExamenesResultados({ examen, onVolver }) {
    const [detalle, setDetalle] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!examen?._id) return;
        fetch(`${API_URL}/tutor/examenes/${examen._id}`, { credentials: "include" })
            .then(r => r.json())
            .then(data => setDetalle(data))
            .catch(console.error)
            .finally(() => setLoading(false));
    }, [examen]);

    if (loading) return <p style={{ padding: "2rem" }}>Cargando examen...</p>;
    if (!detalle) return <p style={{ padding: "2rem" }}>No se pudo cargar el examen.</p>;

    return (
        <div className="examenes-resultados">
            <div className="results-left">
                <button className="button-add" onClick={onVolver}
                    style={{ width: "auto", marginBottom: "1.5rem", backgroundColor: "#e0e0e0", color: "#333" }}>
                    ← Volver al Panel
                </button>

                <h2>Examen: {detalle.nombre}</h2>

                <div className="general-info">
                    <div className="student-info">
                        <h3>{detalle.clase}</h3>
                        <p>{detalle.preguntas.length} preguntas · {detalle.duracion} min</p>
                        <p style={{ marginTop: "0.5rem", fontSize: "0.85rem" }}>
                            Vence: {new Date(detalle.fecha_limite).toLocaleString("es-MX")}
                        </p>
                    </div>
                    <div className="cal-info">
                        <div className="circle-cal">
                            <p>{detalle.preguntas.length}</p>
                        </div>
                    </div>
                </div>

                {detalle.preguntas.map((pregunta, idx) => (
                    <div key={idx} className="exam-data" style={{ marginTop: "1.5rem" }}>
                        <div className="number-question">
                            <p>{idx + 1}</p>
                        </div>
                        <div className="questions">
                            <div className="question-detail">
                                <p>{pregunta.enunciado}</p>
                            </div>
                            <div className="options-general-results">
                                <div className="answers-side">
                                    {[0, 1].map(i => (
                                        <div key={i}
                                            className={`answers-left ${pregunta.correcta === i ? "correct" : ""}`}>
                                            <div className={`option-circle ${pregunta.correcta === i ? "correct" : ""}`} />
                                            <p><strong>{LETRAS[i]}.</strong> {pregunta.opciones[i]?.texto}</p>
                                        </div>
                                    ))}
                                </div>
                                <div className="answers-side">
                                    {[2, 3].map(i => (
                                        <div key={i}
                                            className={`answers-right ${pregunta.correcta === i ? "correct" : ""}`}>
                                            <div className={`option-circle ${pregunta.correcta === i ? "correct" : ""}`} />
                                            <p><strong>{LETRAS[i]}.</strong> {pregunta.opciones[i]?.texto}</p>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            <div className="results-right">
                <h2>Retroalimentación</h2>
                <p>Mensaje al alumno:</p>
                <textarea
                    className="feedback-input"
                    placeholder="Ej: Muy buen trabajo, solo recuerda repasar las expresiones..."
                />
                <button className="button-save" style={{ marginTop: "1rem", width: "100%" }}>
                    Enviar Feedback
                </button>
            </div>
        </div>
    );
}

export default ExamenesResultados;
