import { useEffect, useState } from "react";
import "./tutor-bitacoras.css";

const MESES = ["Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio", "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"];
const DAY_NAMES = ["Domingo", "Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado"];
const ALLOWED_TYPES = ["application/pdf", "image/jpeg", "image/jpg", "image/png"];

function Bitacoras() {
    const API_URL = import.meta.env.VITE_API_URL;

    const [sesiones, setSesiones] = useState([]);
    const [mesesDisponibles, setMesesDisponibles] = useState([]);
    const [mesActivo, setMesActivo] = useState("");
    const [sesionActivaId, setSesionActivaId] = useState(null);
    const [loading, setLoading] = useState(true);
    const [message, setMessage] = useState("");
    const [isSaving, setIsSaving] = useState(false);
    const [title, setTitle] = useState("");
    const [description, setDescription] = useState("");
    const [planning, setPlanning] = useState("");
    const [evidenceFile, setEvidenceFile] = useState(null);
    const [evidencePreview, setEvidencePreview] = useState("");
    const [incidence, setIncidence] = useState(null);
    const [incidenceType, setIncidenceType] = useState("");
    const [incidenceDescription, setIncidenceDescription] = useState("");
    const [evidenceType, setEvidenceType] = useState("");

    useEffect(() => { fetchSesiones(); }, []);

    const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));   

    async function fetchSesiones() {
        try {
            const res = await fetch(`${API_URL}/tutor/clases`, {
                method: "GET",
                headers: { "Content-Type": "application/json" },
                credentials: "include",
            });
            const data = await res.json();
            if (res.ok && data.length > 0) {
                setSesiones(data);
                const mesesUnicos = [...new Set(data.map((s) => s.fecha.slice(0, 7)))];
                setMesesDisponibles(mesesUnicos);
                setMesActivo(mesesUnicos[0]);
                const primera = data.find((s) => s.fecha.startsWith(mesesUnicos[0]));
                if (primera) loadSesion(primera);
            }
        } catch (error) {
            console.error("Error cargando sesiones:", error);
        } finally {
            setLoading(false);
        }
    }

    function loadSesion(s) {
        setSesionActivaId(s.id);
        setMessage("");
        setEvidenceFile(null);
        setEvidencePreview(s.signed_evidence_url || "");

        // Deduce el tipo desde el fileKey guardado en BD
        if (s.evidence_url) {
            const ext = s.evidence_url.split(".").pop().toLowerCase();
            setEvidenceType(ext === "pdf" ? "application/pdf" : "image");
        } else {
            setEvidenceType("");
        }

        setTitle(s.title || "");
        setDescription(s.description || "");
        setPlanning(s.planning || "");
        setIncidence(s.incidence ?? null);
        setIncidenceType(s.incidence_type || "");
        setIncidenceDescription(s.incidence_description || "");
    }

    const handleEvidenceChange = (e) => {
        const file = e.target.files[0];
        if (!file) return;
        if (!ALLOWED_TYPES.includes(file.type)) {
            setMessage("Solo se permiten archivos PDF, JPG, JPEG o PNG.");
            e.target.value = "";
            return;
        }
        setEvidenceFile(file);
        setEvidenceType(file.type);
        setEvidencePreview(file.type === "application/pdf" ? "" : URL.createObjectURL(file));
    };

    async function guardarBitacora() {
        if (!sesionActivaId) return setMessage("Selecciona una sesión primero.");
        if (!title.trim()) return setMessage("El título/tema de la sesión es obligatorio.");
        if (!description.trim()) return setMessage("La descripción de la sesión es obligatoria.");
        if (!planning.trim()) return setMessage("La planeación de la siguiente sesión es obligatoria.");
        if (incidence === null) return setMessage("Indica si hubo incidencias.");
        if (incidence === true && !incidenceType) return setMessage("Selecciona el tipo de incidencia.");

        setIsSaving(true);
        setMessage("");

        try {
            let evidenceUrl = datosSesion.evidence_url || "";

            if (evidenceFile) {

                // 1. Pedir presigned URL
                const presignRes = await fetch(`${API_URL}/tutor/storage/presign`, {
                    method: "POST",
                    credentials: "include",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        type: "evidence",
                        filename: evidenceFile.name,
                        contentType: evidenceFile.type,
                    }),
                });

                const presignData = await presignRes.json();

                if (!presignRes.ok) {
                    throw new Error(presignData.message || "Error preparando archivo");
                }

                // 2. Subir directo a Cellar
                const uploadRes = await fetch(presignData.uploadUrl, {
                    method: "PUT",
                    headers: { "Content-Type": evidenceFile.type },
                    body: evidenceFile,
                });

                if (!uploadRes.ok) {
                    throw new Error("Error subiendo evidencia");
                }

                evidenceUrl = presignData.fileKey;
            }

            // 3. Guardar en base de datos
            const res = await fetch(`${API_URL}/tutor/bitacoras`, {
                method: "POST",
                credentials: "include",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    sesion_id: sesionActivaId,
                    title,
                    description,
                    planning,
                    evidence_url: evidenceUrl,
                    incidence,
                    incidence_type: incidence ? incidenceType : null,
                    incidence_description: incidence ? incidenceDescription : null,
                }),
            });

            const data = await res.json();

            if (!res.ok) throw new Error(data.message || "Error al guardar la bitácora.");

            setMessage("¡Bitácora enviada a revisión con éxito!");
            await sleep(1000);
            await fetchSesiones();

        } catch (error) {
            console.error("Error:", error);
            setMessage(error.message || "Error de conexión al guardar.");
        } finally {
            setIsSaving(false);
        }
    }

    const obtenerMesBonito = (valor) => {
        if (!valor) return "";
        const [year, month] = valor.split("-");
        return `${MESES[parseInt(month, 10) - 1]} ${year}`;
    };

    const formatSessionDate = (dateString) => {
        if (!dateString) return "";
        const date = new Date(dateString);
        return `${DAY_NAMES[date.getUTCDay()]} ${date.getUTCDate()}`;
    };

    const formatTime = (timeStr) => timeStr ? timeStr.substring(0, 5) : "";

    const getEstadoBitacora = (sesion) => {
        if (!sesion.log_id) return { label: "Faltante", classInfo: "badge-danger" };
        if (sesion.validated === 1 && sesion.approved === 1) return { label: "Aprobada", classInfo: "badge-primary" };
        if (sesion.comentarios?.trim()) return { label: "Por corregir", classInfo: "badge-warning" };
        return { label: "En Revisión", classInfo: "badge-success" };
    };

    const sesionesFiltradas = sesiones.filter((s) => s.fecha.startsWith(mesActivo));
    const datosSesion = sesiones.find((s) => s.id === sesionActivaId) || {};
    const estadoActual = getEstadoBitacora(datosSesion);

    const isAprobada = datosSesion.validated === 1 && datosSesion.approved === 1;
    const isEnRevision = !!datosSesion.log_id && !datosSesion.comentarios?.trim() && !isAprobada;
    const isReadOnly = isAprobada || isEnRevision;

    const hasIncidence = incidence === true || incidence === 1;

    if (loading) return <p>Cargando sesiones...</p>;
    if (sesiones.length === 0) return <p>No tienes sesiones registradas aún.</p>;

    return (
        <div className="bitacoras">
            <div className="bitacora-line"></div>
            <div className="bitacoras-content">

                <div className="bitacoras-left">
                    <h3>Mis Bitácoras</h3>
                    <select
                        className="month-select"
                        value={mesActivo}
                        onChange={(e) => {
                            const nuevoMes = e.target.value;
                            setMesActivo(nuevoMes);
                            const primera = sesiones.find((s) => s.fecha.startsWith(nuevoMes));
                            if (primera) loadSesion(primera);
                        }}
                    >
                        {mesesDisponibles.map((mes) => (
                            <option key={mes} value={mes}>{obtenerMesBonito(mes)}</option>
                        ))}
                    </select>

                    {sesionesFiltradas.map((s) => {
                        const { label, classInfo } = getEstadoBitacora(s);
                        return (
                            <div
                                key={s.id}
                                className={`bitacora-item ${sesionActivaId === s.id ? "active" : ""}`}
                                onClick={() => loadSesion(s)}
                            >
                                <p className="item-name">{s.nombre_alumno || "Sesión"}</p>
                                <p className="item-hour">{formatTime(s.hora_inicio)} - {formatTime(s.hora_fin)}</p>
                                <p className="item-class">{s.idioma}</p>
                                <span className={`item-badge ${classInfo}`}>{label}</span>
                            </div>
                        );
                    })}
                </div>

                <div className="bitacoras-right">
                    <h2>
                        Bitácora — {datosSesion.nombre_alumno} — {formatSessionDate(datosSesion.fecha)}
                        <span> ({estadoActual.label})</span>
                    </h2>

                    {datosSesion.comentarios && (
                        <div className="comentarios-box">
                            <strong>Correcciones solicitadas: </strong>
                            <p>{datosSesion.comentarios}</p>
                        </div>
                    )}

                    <div className="bitacoras-side">
                        <div className="bitacora-right-left">
                            <div className="bitacora-group">
                                <p>Tema / Título de la sesión</p>
                                <input
                                    className="bitacora-input-real"
                                    type="text"
                                    value={title}
                                    onChange={(e) => !isReadOnly && setTitle(e.target.value)}
                                    placeholder="Ej: Unidad 3 — Pasado Simple"
                                    readOnly={isReadOnly}
                                />
                            </div>
                            <div className="bitacora-group grow">
                                <p>Descripción de la sesión</p>
                                <textarea
                                    className="bitacora-text-real"
                                    value={description}
                                    onChange={(e) => !isReadOnly && setDescription(e.target.value)}
                                    placeholder="Ej: Se practicó conversación sobre experiencias pasadas..."
                                    readOnly={isReadOnly}
                                />
                            </div>
                            <div className="bitacora-group grow">
                                <p>Planeación de la SIGUIENTE sesión</p>
                                <textarea
                                    className="bitacora-text-real"
                                    value={planning}
                                    onChange={(e) => !isReadOnly && setPlanning(e.target.value)}
                                    placeholder="Ej: Revisaremos vocabulario de viajes y haremos quiz..."
                                    readOnly={isReadOnly}
                                />
                            </div>
                        </div>

                        <div className="bitacora-right-right">
                            <div className="bitacora-group">
                                <p>Duración (min)</p>
                                <input
                                    className="bitacora-input-real"
                                    type="number"
                                    value={datosSesion.duracion || 60}
                                    readOnly
                                />
                            </div>

                            <div className="bitacora-group">
                                <p>Evidencia de la clase</p>

                                {!isReadOnly && (
                                    <input
                                        type="file"
                                        accept=".pdf,.jpg,.jpeg,.png"
                                        className="bitacora-input-real"
                                        onChange={handleEvidenceChange}
                                    />
                                )}

                                {/* Archivo recién seleccionado */}
                                {evidenceFile && (
                                    <div className="evidence-preview">
                                        {evidenceType === "application/pdf"
                                            ? <div className="pdf-preview"><p> {evidenceFile.name}</p></div>
                                            : <img src={evidencePreview} alt="Evidencia" className="evidence-media" />
                                        }
                                    </div>
                                )}

                                {/* Evidencia ya guardada */}
                                {!evidenceFile && evidencePreview && (
                                    <div className="evidence-preview">
                                        {evidenceType === "application/pdf"
                                            ? <div className="pdf-preview">
                                                <p> Evidencia en PDF</p>
                                                <a href={evidencePreview} target="_blank" rel="noopener noreferrer">
                                                    Ver archivo
                                                </a>
                                            </div>
                                            : <img src={evidencePreview} alt="Evidencia guardada" className="evidence-media" />
                                        }
                                    </div>
                                )}

                                {!evidenceFile && !evidencePreview && isReadOnly && (
                                    <p className="evidence-empty">Sin evidencia adjunta</p>
                                )}
                            </div>

                            <div className="bitacora-group">
                                <p>Hubo <strong>incidencias</strong></p>
                                <div className="incidencia-selector">
                                    <div
                                        className={`incidencia-btn ${hasIncidence ? "active" : ""} ${isReadOnly ? "readonly" : ""}`}
                                        onClick={() => !isReadOnly && setIncidence(true)}
                                    >Sí </div>
                                    <div
                                        className={`incidencia-btn ${!hasIncidence && incidence !== null ? "active-no" : ""} ${isReadOnly ? "readonly" : ""}`}
                                        onClick={() => { if (!isReadOnly) { setIncidence(false); setIncidenceType(""); setIncidenceDescription(""); } }}
                                    >No</div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {hasIncidence && (
                        <div className="incidencia-extra">
                            <div className="bitacora-group">
                                <p>Tipo de incidencia</p>
                                {isReadOnly ? (
                                    <div className="bitacora-input-real">
                                        {incidenceType === "assistance" ? "Asistencia" : "Respeto"}
                                    </div>
                                ) : (
                                    <div className="incidencia-type-selector">
                                        {[["assistance", "Asistencia"], ["respect", "Respeto"]].map(([val, label]) => (
                                            <div
                                                key={val}
                                                className={`incidencia-type-btn ${incidenceType === val ? "active" : ""}`}
                                                onClick={() => setIncidenceType(val)}
                                            >{label}</div>
                                        ))}
                                    </div>
                                )}
                            </div>
                            <div className="bitacora-group">
                                <p>Descripción de la incidencia</p>
                                <textarea
                                    className="bitacora-text-real"
                                    value={incidenceDescription}
                                    onChange={(e) => !isReadOnly && setIncidenceDescription(e.target.value)}
                                    placeholder="Describe brevemente lo ocurrido..."
                                    readOnly={isReadOnly}
                                />
                            </div>
                        </div>
                    )}

                    {!isReadOnly && (
                        <div className="save">
                            <button className="button" onClick={guardarBitacora} disabled={isSaving}>
                                {isSaving ? "Guardando..." : "Enviar a Revisión"}
                            </button>
                        </div>
                    )}

                    {message && (
                        <p className={`success-message ${message.toLowerCase().includes("error") ? "error-message" : ""}`}>
                            {message}
                        </p>
                    )}
                </div>
            </div>
        </div>
    );
}

export default Bitacoras;