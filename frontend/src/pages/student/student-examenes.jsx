import { useEffect, useState } from "react";
import "./student-examenes.css";

const API_URL = import.meta.env.VITE_API_URL;

function StudentExamenes() {
    const [disponibles, setDisponibles] = useState([]);
    const [calificados, setCalificados] = useState([]);
    const [loading, setLoading] = useState(true);

    // Vista: "lista" | "examen" | "resultado"
    const [vista, setVista] = useState("lista");
    const [examenActivo, setExamenActivo] = useState(null);
    const [respuestas, setRespuestas] = useState([]);
    const [timeLeft, setTimeLeft] = useState(null);
    const [resultado, setResultado] = useState(null);
    const [retroActiva, setRetroActiva] = useState(null);
    const [enviando, setEnviando] = useState(false);
    const [message, setMessage] = useState("");

    useEffect(() => { fetchExamenes(); }, []);

    // Temporizador
    useEffect(() => {
        if (vista !== "examen" || timeLeft === null) return;
        if (timeLeft <= 0) { enviarExamen(); return; }
        const timer = setTimeout(() => setTimeLeft((t) => t - 1), 1000);
        return () => clearTimeout(timer);
    }, [vista, timeLeft]);

    async function fetchExamenes() {
        try {
            const res = await fetch(`${API_URL}/student/examenes`, { credentials: "include" });
            const data = await res.json();
            if (res.ok) {
                setDisponibles(data.disponibles || []);
                setCalificados(data.calificados || []);
            }
        } catch (err) {
            console.error("Error cargando exámenes:", err);
        } finally {
            setLoading(false);
        }
    }

    async function empezarExamen(examen) {
        setMessage("");
        try {
            const res = await fetch(`${API_URL}/student/examenes/${examen._id}`, {
                credentials: "include",
            });
            const data = await res.json();
            if (!res.ok) return setMessage(data.message || "Error cargando examen");

            setExamenActivo(data);
            setRespuestas(new Array(data.preguntas.length).fill(null));
            setTimeLeft(data.duracion * 60);
            setVista("examen");
        } catch (err) {
            console.error(err);
            setMessage("Error al cargar el examen");
        }
    }

    async function enviarExamen() {
        if (enviando) return;

        const sinResponder = respuestas.filter((r) => r === null).length;
        if (sinResponder > 0) {
            setMessage(`Tienes ${sinResponder} pregunta(s) sin responder. Debes responderlas todas antes de entregar.`);
            return;
        }

        setEnviando(true);
        setMessage("");
        try {
            const res = await fetch(`${API_URL}/student/examenes/${examenActivo._id}/submit`, {
                method: "POST",
                credentials: "include",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ respuestas }),
            });
            const data = await res.json();
            if (!res.ok) return setMessage(data.message || "Error enviando examen");

            setResultado(data);
            setVista("resultado");
            await fetchExamenes();
        } catch (err) {
            console.error(err);
            setMessage("Error al enviar el examen");
        } finally {
            setEnviando(false);
        }
    }

    function formatTime(seconds) {
        const m = Math.floor(seconds / 60).toString().padStart(2, "0");
        const s = (seconds % 60).toString().padStart(2, "0");
        return `${m}:${s}`;
    }

    function getCalColor(cal) {
        if (cal >= 9) return "excelente";
        if (cal >= 7) return "bien";
        if (cal >= 6) return "suficiente";
        return "reprobado";
    }

    if (loading) return <p>Cargando exámenes...</p>;

    // ─── VISTA: PRESENTAR EXAMEN ───────────────────────────────────────
    if (vista === "examen" && examenActivo) {
        const progreso = respuestas.filter((r) => r !== null).length;
        const urgente = timeLeft !== null && timeLeft < 120;

        return (
            <div className="examenes-student">
                <div className="exam-header">
                    <div className="exam-header-info">
                        <h2>{examenActivo.nombre}</h2>
                        <p>{progreso} / {examenActivo.preguntas.length} respondidas</p>
                    </div>
                    <div className={`exam-timer ${urgente ? "urgente" : ""}`}>
                        ⏱ {formatTime(timeLeft)}
                    </div>
                    <div
                        className="exam-submit-btn"
                        onClick={!enviando ? enviarExamen : undefined}
                    >
                        {enviando ? "Enviando..." : "Entregar examen"}
                    </div>
                </div>

                <div className="exam-questions">
                    {examenActivo.preguntas.map((p, i) => (
                        <div key={i} className={`exam-question ${respuestas[i] !== null ? "respondida" : ""}`}>
                            <p className="question-number">Pregunta {i + 1}</p>
                            <p className="question-text">{p.enunciado}</p>
                            <div className="question-options">
                                {p.opciones.map((op, j) => (
                                    <div
                                        key={j}
                                        className={`question-option ${respuestas[i] === j ? "selected" : ""}`}
                                        onClick={() => {
                                            const copia = [...respuestas];
                                            copia[i] = j;
                                            setRespuestas(copia);
                                        }}
                                    >
                                        <span className="option-letter">
                                            {["A", "B", "C", "D"][j]}
                                        </span>
                                        {op.texto}
                                    </div>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>

                {message && <p className="exam-message error-message">{message}</p>}
            </div>
        );
    }

    // ─── VISTA: RESULTADO INMEDIATO ────────────────────────────────────
    if (vista === "resultado" && resultado) {
        return (
            <div className="examenes-student">
                <div className="exam-resultado">
                    <div className={`resultado-circle ${getCalColor(resultado.calificacion)}`}>
                        <h2>{resultado.calificacion}</h2>
                    </div>
                    <h2>Examen entregado</h2>
                    <p>{resultado.correctas} de {resultado.total} respuestas correctas</p>
                    <div className="exam-submit-btn" onClick={() => setVista("lista")}>
                        Volver a exámenes
                    </div>
                </div>
            </div>
        );
    }

    // ─── VISTA: LISTA PRINCIPAL ────────────────────────────────────────
    return (
        <div className="examenes-student">

            {message && <p className="exam-message error-message">{message}</p>}

            {/* DISPONIBLES */}
            <div className="available">
                <h2>Disponibles</h2>
                {disponibles.length === 0 ? (
                    <p className="exam-empty">No tienes exámenes disponibles.</p>
                ) : (
                    <div className="exam-available">
                        {disponibles.map((e) => (
                            <div key={e._id} className="exam-detail">
                                <h3>{e.nombre}</h3>
                                <p>{e.duracion} min</p>
                                <p className="exam-vence">
                                    Vence {new Date(e.fecha_limite).toLocaleDateString("es-MX", {
                                        day: "numeric", month: "long"
                                    })}
                                </p>
                                <div className="exam-button" onClick={() => empezarExamen(e)}>
                                    <p>Empezar examen</p>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* CALIFICADOS */}
            {calificados.length > 0 && (
                <div className="exam-results">
                    <h2>Calificados</h2>
                    <div className="exam-calification-student">
                        {calificados.map((e) => {
                            const sub = e.submission;
                            const abierto = retroActiva === e._id;
                            return (
                                <div key={e._id} className="exam-calification">
                                    {!abierto ? (
                                        <>
                                            <div className="student-cal">
                                                <div className={`circle-calification-student ${getCalColor(sub.calificacion)}`}>
                                                    <h3>{sub.calificacion}</h3>
                                                </div>
                                                <div className="student-exam-detail">
                                                    <h3>{e.nombre}</h3>
                                                    <p>
                                                        Entregado {new Date(sub.enviado_en).toLocaleDateString("es-MX", {
                                                            day: "numeric", month: "long"
                                                        })}
                                                    </p>
                                                </div>
                                            </div>
                                            {sub.retro && (
                                                <div
                                                    className="exam-cal-button"
                                                    onClick={() => setRetroActiva(e._id)}
                                                >
                                                    <p>Ver retroalimentación</p>
                                                </div>
                                            )}
                                        </>
                                    ) : (
                                        <>
                                            <div className="exam-retro">
                                                <p>{sub.retro}</p>
                                            </div>
                                            <div
                                                className="exam-cal-button"
                                                onClick={() => setRetroActiva(null)}
                                            >
                                                <p>Ocultar</p>
                                            </div>
                                        </>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                </div>
            )}
        </div>
    );
}

export default StudentExamenes;