import { useEffect, useState } from "react";
import "./student-tareas.css";

const API_URL = import.meta.env.VITE_API_URL;

const ALLOWED_TYPES = [
    "application/pdf",
    "image/png",
    "image/jpeg",
    "image/jpg",
    "application/msword",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
];

const MAX_SIZE = 5 * 1024 * 1024;

function getUrgencia(due_date) {
    const ahora = new Date();
    const vence = new Date(due_date);
    const diffDias = (vence - ahora) / (1000 * 60 * 60 * 24);
    if (diffDias < 0) return "vencida";
    if (diffDias < 1) return "urgente";
    if (diffDias < 7) return "semana";
    return "proxima";
}

function formatVencimiento(due_date) {
    const ahora = new Date();
    const vence = new Date(due_date);
    const diffDias = Math.ceil((vence - ahora) / (1000 * 60 * 60 * 24));
    if (diffDias < 0) return "Vencida";
    if (diffDias === 0) return "Vence hoy";
    if (diffDias === 1) return "Vence mañana";
    return `Vence en ${diffDias} días`;
}

function StudentTareas() {
    const [tareas, setTareas] = useState([]);
    const [tareaActiva, setTareaActiva] = useState(null);
    const [archivo, setArchivo] = useState(null);
    const [submissionUrl, setSubmissionUrl] = useState(null);
    const [submissionEsPdf, setSubmissionEsPdf] = useState(false);
    const [reemplazando, setReemplazando] = useState(false);
    const [message, setMessage] = useState("");
    const [subiendo, setSubiendo] = useState(false);
    const [loading, setLoading] = useState(true);

    useEffect(() => { fetchTareas(); }, []);

    async function fetchTareas() {
        try {
            const res = await fetch(`${API_URL}/student/tareas`, { credentials: "include" });
            const data = await res.json();
            if (res.ok) {
                setTareas(data);
                if (data.length > 0) cargarTarea(data[0]);
            }
        } catch (error) {
            console.error("Error cargando tareas:", error);
        } finally {
            setLoading(false);
        }
    }

    async function cargarTarea(t) {
        setTareaActiva(t);
        setArchivo(null);
        setMessage("");
        setReemplazando(false);
        setSubmissionUrl(null);
        setSubmissionEsPdf(false);

        if (t.submission_id) {
            try {
                const res = await fetch(`${API_URL}/student/tareas/${t.id}/submission-url`, {
                    credentials: "include",
                });
                const data = await res.json();
                if (res.ok) {
                    setSubmissionUrl(data.url);
                    setSubmissionEsPdf(data.fileKey.endsWith(".pdf"));
                }
            } catch (err) {
                console.error("Error cargando URL de entrega:", err);
            }
        }
    }

    function handleArchivoChange(e) {
        const file = e.target.files[0];
        if (!file) return;
        if (!ALLOWED_TYPES.includes(file.type)) {
            setMessage("Tipo de archivo no permitido. Usa PDF, imagen o Word.");
            e.target.value = "";
            return;
        }
        if (file.size > MAX_SIZE) {
            setMessage("El archivo supera el límite de 5MB.");
            e.target.value = "";
            return;
        }
        setArchivo(file);
        setMessage("");
    }

    async function entregarTarea() {
        if (!tareaActiva || !archivo) return setMessage("Selecciona un archivo.");

        setSubiendo(true);
        setMessage("");

        try {
            const presignRes = await fetch(`${API_URL}/student/tareas/presign`, {
                method: "POST",
                credentials: "include",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    assignmentId: tareaActiva.id,
                    filename: archivo.name,
                    contentType: archivo.type,
                }),
            });
            const presignData = await presignRes.json();
            if (!presignRes.ok) throw new Error(presignData.message || "Error preparando archivo");

            const uploadRes = await fetch(presignData.uploadUrl, {
                method: "PUT",
                headers: { "Content-Type": archivo.type },
                body: archivo,
            });
            if (!uploadRes.ok) throw new Error("Error subiendo archivo");

            const submitRes = await fetch(`${API_URL}/student/tareas/${tareaActiva.id}/submit`, {
                method: "POST",
                credentials: "include",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ fileKey: presignData.fileKey }),
            });
            const submitData = await submitRes.json();
            if (!submitRes.ok) throw new Error(submitData.message || "Error guardando entrega");

            setMessage("¡Tarea entregada exitosamente!");
            setArchivo(null);
            setReemplazando(false);
            await fetchTareas();

        } catch (error) {
            console.error(error);
            setMessage(error.message || "Error al entregar la tarea.");
        } finally {
            setSubiendo(false);
        }
    }

    const urgentes = tareas.filter((t) => getUrgencia(t.due_date) === "urgente");
    const semana = tareas.filter((t) => getUrgencia(t.due_date) === "semana");
    const proximas = tareas.filter((t) => getUrgencia(t.due_date) === "proxima");
    const vencidas = tareas.filter((t) => getUrgencia(t.due_date) === "vencida");

    const yaEntrego = !!tareaActiva?.submission_id;
    const mostrarFormEntrega = !yaEntrego || reemplazando;

    if (loading) return <p>Cargando tareas...</p>;

    const renderLista = (lista, circulo) => lista.map((t) => (
        <div
            key={t.id}
            className={`homework-student-general ${tareaActiva?.id === t.id ? "active" : ""}`}
            onClick={() => cargarTarea(t)}
        >
            <div className={circulo}></div>
            <div className="homework-student-detail">
                <p>{t.title}</p>
                <h5>{t.idioma} — {formatVencimiento(t.due_date)}</h5>
            </div>
        </div>
    ));

    return (
        <div className="tareas-student">
            <div className="line-student"></div>

            <div className="student-homework-sides">

                <div className="homework-left">
                    <h3>Pendientes</h3>
                    {urgentes.length > 0 && (
                        <div className="homework-urgent">
                            <h4>Urgente</h4>
                            {renderLista(urgentes, "circle-student-red")}
                        </div>
                    )}
                    {semana.length > 0 && (
                        <div className="homework-next">
                            <h4>Esta Semana</h4>
                            {renderLista(semana, "circle-student-orange")}
                        </div>
                    )}
                    {proximas.length > 0 && (
                        <div className="homework-next">
                            <h4>Próximas</h4>
                            {renderLista(proximas, "circle-student-orange")}
                        </div>
                    )}
                    {vencidas.length > 0 && (
                        <div className="homework-next">
                            <h4>Vencidas</h4>
                            {renderLista(vencidas, "circle-student-red")}
                        </div>
                    )}
                    {tareas.length === 0 && <p>No tienes tareas pendientes.</p>}
                </div>

                {tareaActiva && (
                    <div className="homework-right">
                        <div className="homework-details-student">
                            <h2>{tareaActiva.title}</h2>
                            <p className={`due-date ${getUrgencia(tareaActiva.due_date) === "vencida" ? "overdue" : ""}`}>
                                {tareaActiva.idioma} — {formatVencimiento(tareaActiva.due_date)}
                            </p>
                            <div className="homework-indications">
                                <h3>Indicaciones</h3>
                                <p>{tareaActiva.description}</p>
                            </div>

                            {/* Info de entrega existente */}
                            {yaEntrego && (
                                <div className="homework-submitted">
                                    <p className="submitted-date">
                                        Entregada el {new Date(tareaActiva.submitted_at).toLocaleDateString("es-MX")}
                                    </p>
                                    {tareaActiva.grade != null && (
                                        <div className="submitted-grade">
                                            <span className="grade-label">Calificación</span>
                                            <span className="grade-value">{tareaActiva.grade}</span>
                                        </div>
                                    )}
                                    {tareaActiva.feedback && (
                                        <div className="submitted-feedback">
                                            <span className="feedback-label">💬 Retroalimentación del tutor</span>
                                            <p className="feedback-text">{tareaActiva.feedback}</p>
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>

                        {/* Preview de entrega existente */}
                        {yaEntrego && submissionUrl && !reemplazando && (
                            <div className="homework-preview">
                                <h3>Tu entrega</h3>
                                {submissionEsPdf ? (
                                    <div className="submission-pdf">
                                        <p>Archivo PDF</p>
                                        <a href={submissionUrl} target="_blank" rel="noopener noreferrer">
                                            Ver archivo
                                        </a>
                                    </div>
                                ) : (
                                    <img
                                        src={submissionUrl}
                                        alt="Tu entrega"
                                        className="submission-img"
                                    />
                                )}
                                <button
                                    className="btn-reemplazar"
                                    onClick={() => { setReemplazando(true); setMessage(""); }}
                                >
                                    Reemplazar entrega
                                </button>
                            </div>
                        )}

                        {/* Formulario de entrega */}
                        {mostrarFormEntrega && (
                            <>
                                <div className="homework-sent">
                                    <h2>{yaEntrego ? "Reemplazar entrega" : "Entregar Tarea"}</h2>
                                    <label className="file-sent">
                                        {archivo
                                            ? <p>{archivo.name}</p>
                                            : <p>Haz click para adjuntar un archivo o arrastra uno aquí — PDF, Word, Imagen (máx. 5MB)</p>
                                        }
                                        <input
                                            type="file"
                                            accept=".pdf,.png,.jpg,.jpeg,.doc,.docx"
                                            style={{ display: "none" }}
                                            onChange={handleArchivoChange}
                                        />
                                    </label>
                                </div>

                                <div className="homework-save-row">
                                    <div
                                        className="homework-save"
                                        onClick={!subiendo ? entregarTarea : undefined}
                                    >
                                        <p>{subiendo ? "Enviando..." : "Enviar Tarea"}</p>
                                    </div>
                                    {reemplazando && (
                                        <div
                                            className="homework-cancel"
                                            onClick={() => { setReemplazando(false); setArchivo(null); setMessage(""); }}
                                        >
                                            <p>Cancelar</p>
                                        </div>
                                    )}
                                </div>
                            </>
                        )}

                        {message && (
                            <p className={`homework-message ${message.toLowerCase().includes("error") ||
                                    message.toLowerCase().includes("no permitido") ||
                                    message.toLowerCase().includes("supera")
                                    ? "error-message" : ""
                                }`}>
                                {message}
                            </p>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}

export default StudentTareas;