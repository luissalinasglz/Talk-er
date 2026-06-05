import { useEffect, useState } from "react";
import "../tutor-examenes.css";

const API_URL = import.meta.env.VITE_API_URL;
const LETRAS = ["A", "B", "C", "D"];

function ExamenesResultados({ examen, onVolver }) {
    const [detalle, setDetalle]               = useState(null);
    const [submissions, setSubmissions]       = useState([]);
    const [alumnoActivo, setAlumnoActivo]     = useState(null);
    const [retro, setRetro]                   = useState("");
    const [guardandoRetro, setGuardandoRetro] = useState(false);
    const [retroGuardada, setRetroGuardada]   = useState(false);
    const [loading, setLoading]               = useState(true);
    const [error, setError]                   = useState("");

    useEffect(() => {
        if (!examen?._id) return;

        fetch(`${API_URL}/tutor/examenes/${examen._id}/submissions`, {
            credentials: "include",
        })
            .then(r => r.json())
            .then(data => {
                setDetalle(data.examen);
                const subs = Array.isArray(data.submissions) ? data.submissions : [];
                setSubmissions(subs);
                if (subs.length > 0) {
                    setAlumnoActivo(subs[0]);
                    setRetro(subs[0].retro ?? "");
                }
            })
            .catch(() => setError("No se pudo cargar el examen."))
            .finally(() => setLoading(false));
    }, [examen]);

    const seleccionarAlumno = (sub) => {
        setAlumnoActivo(sub);
        setRetro(sub.retro ?? "");
        setRetroGuardada(false);
    };

    const guardarRetro = async () => {
        if (!alumnoActivo) return;
        setGuardandoRetro(true);
        setRetroGuardada(false);
        try {
            const res = await fetch(
                `${API_URL}/tutor/examenes/${examen._id}/submissions/${alumnoActivo._id}/retro`,
                {
                    method: "PUT",
                    credentials: "include",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ retro }),
                }
            );
            if (!res.ok) throw new Error();
            setSubmissions(prev =>
                prev.map(s => s._id === alumnoActivo._id ? { ...s, retro } : s)
            );
            setAlumnoActivo(prev => ({ ...prev, retro }));
            setRetroGuardada(true);
        } catch {
            setError("Error guardando retroalimentación.");
        } finally {
            setGuardandoRetro(false);
        }
    };

    if (loading)  return <p className="estado-cargando">Cargando examen...</p>;
    if (error)    return <p className="estado-error">{error}</p>;
    if (!detalle) return <p className="estado-cargando">No se pudo cargar el examen.</p>;

    const totalPreguntas = detalle.preguntas?.length ?? 0;

    return (
        <div className="examenes-resultados">

            {/* ── IZQUIERDA: preguntas y respuestas del alumno ── */}
            <div className="results-left">
                <button className="button-add volver" onClick={onVolver}>
                    ← Volver al Panel
                </button>

                <h2>Examen: {detalle.nombre}</h2>

                {/* Tarjeta resumen */}
                <div className="general-info">
                    <div className="student-info">
                        <h3>Clase {detalle.clase}</h3>
                        <p>{totalPreguntas} preguntas · {detalle.duracion} min</p>
                        <p className="student-info-fecha">
                            Vence: {new Date(detalle.fecha_limite).toLocaleString("es-MX")}
                        </p>
                    </div>
                    <div className="cal-info">
                        <div className="circle-cal">
                            <p>{alumnoActivo?.calificacion ?? "—"}{alumnoActivo != null ? "%" : ""}</p>
                        </div>
                    </div>
                </div>

                {submissions.length === 0 ? (
                    <p className="estado-vacio">
                        El alumno no ha entregado este examen.
                    </p>
                ) : (
                    <>
                        {/* Tabs de alumnos */}
                        <div className="alumnos-tabs">
                            {submissions.map(sub => (
                                <button
                                    key={sub._id}
                                    className={`alumno-tab${alumnoActivo?._id === sub._id ? " activo" : ""}`}
                                    onClick={() => seleccionarAlumno(sub)}
                                >
                                    {sub.nombre_alumno}
                                    {sub.calificacion != null && (
                                        <span className="alumno-tab-score">{sub.calificacion}%</span>
                                    )}
                                </button>
                            ))}
                        </div>

                        {/* Desglose pregunta por pregunta */}
                        {alumnoActivo && detalle.preguntas.map((pregunta, idx) => {
                            const respuesta = alumnoActivo.respuestas?.[idx];
                            const correcta  = pregunta.correcta;
                            const respondio = respuesta !== undefined && respuesta !== null;

                            return (
                                <div key={idx} className="exam-data">
                                    <div className="number-question">
                                        <p>{idx + 1}</p>
                                    </div>
                                    <div className="questions">
                                        <div className="question-detail">
                                            <p>{pregunta.enunciado}</p>
                                        </div>
                                        <div className="options-general-results">
                                            {[[0, 1], [2, 3]].map((par, colIdx) => (
                                                <div key={colIdx} className="answers-side">
                                                    {par.map(i => {
                                                        const esCorrecta  = correcta === i;
                                                        const esRespuesta = respondio && respuesta === i;
                                                        const esError     = esRespuesta && !esCorrecta;

                                                        let clase = "answers-left";
                                                        if (esCorrecta) clase += " correct";
                                                        else if (esError) clase += " incorrect";

                                                        return (
                                                            <div key={i} className={clase}>
                                                                <div className={`option-circle${esCorrecta ? " correct" : ""}`} />
                                                                <p>
                                                                    <strong>{LETRAS[i]}.</strong>{" "}
                                                                    {pregunta.opciones[i]?.texto}
                                                                    {esRespuesta && !esCorrecta && (
                                                                        <span className="answer-icon">✗</span>
                                                                    )}
                                                                    {esCorrecta && esRespuesta && (
                                                                        <span className="answer-icon">✓</span>
                                                                    )}
                                                                    {esCorrecta && !esRespuesta && (
                                                                        <span className="answer-icon faded">✓</span>
                                                                    )}
                                                                </p>
                                                            </div>
                                                        );
                                                    })}
                                                </div>
                                            ))}
                                        </div>

                                        <p className={`question-status ${
                                            !respondio ? "sin-respuesta"
                                            : respuesta === correcta ? "correcta"
                                            : "incorrecta"
                                        }`}>
                                            {!respondio
                                                ? "Sin respuesta"
                                                : respuesta === correcta
                                                    ? "✓ Correcta"
                                                    : `✗ Respondió ${LETRAS[respuesta]} — correcta: ${LETRAS[correcta]}`}
                                        </p>
                                    </div>
                                </div>
                            );
                        })}
                    </>
                )}
            </div>

            {/* ── DERECHA: retroalimentación ── */}
            <div className="results-right">
                <h2>Retroalimentación</h2>

                {submissions.length === 0 ? (
                    <p className="retro-vacia">
                        Disponible cuando el alumno entregue el examen.
                    </p>
                ) : alumnoActivo ? (
                    <>
                        <p className="retro-nombre">{alumnoActivo.nombre_alumno}</p>
                        <p className="retro-meta">
                            Calificación: {alumnoActivo.calificacion ?? "—"}% ·{" "}
                            Entregado: {new Date(alumnoActivo.enviado_en).toLocaleString("es-MX")}
                        </p>

                        <p className="retro-label">Mensaje al alumno:</p>
                        <textarea
                            className="feedback-input"
                            placeholder="Ej: Muy buen trabajo, solo recuerda repasar las expresiones..."
                            value={retro}
                            onChange={e => { setRetro(e.target.value); setRetroGuardada(false); }}
                        />

                        <button
                            className="button-save retro-btn"
                            onClick={guardarRetro}
                            disabled={guardandoRetro}
                        >
                            {guardandoRetro ? "Guardando..." : "Enviar Feedback"}
                        </button>

                        {retroGuardada && (
                            <p className="retro-ok">✓ Retroalimentación guardada</p>
                        )}
                    </>
                ) : null}
            </div>
        </div>
    );
}

export default ExamenesResultados;
