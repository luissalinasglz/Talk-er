import { useEffect, useState } from "react";
import "./tutor-bitacoras.css";

function Bitacoras() {
    const API_URL = import.meta.env.VITE_API_URL;

    const [sesiones, setSesiones] = useState([]);
    const [mesesDisponibles, setMesesDisponibles] = useState([]);
    const [mesActivo, setMesActivo] = useState("");
    const [sesionActivaId, setSesionActivaId] = useState(null);
    const [loading, setLoading] = useState(true);
    const [message, setMessage] = useState("");
    const [isSaving, setIsSaving] = useState(false);

    const [description, setDescription] = useState("");
    const [planning, setPlanning] = useState("");
    const [evidenceFile, setEvidenceFile] = useState(null);
    const [evidencePreview, setEvidencePreview] = useState("");
    const [incidence, setIncidence] = useState(null);
    const [incidenceType, setIncidenceType] = useState("");
    const [incidenceDescription, setIncidenceDescription] = useState("");

    const meses = [
        "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
        "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre",
    ];

    const DAY_NAMES = ["Domingo", "Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado"];

    useEffect(() => {
        fetchSesiones();
    }, []);

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

                const ultimoMes = mesesUnicos[0];
                setMesActivo(ultimoMes);

                const primera = data.find((s) => s.fecha.startsWith(ultimoMes));
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
        setEvidencePreview(s.evidence_url || "");
        setDescription(s.description || "");
        setPlanning(s.planning || "");
        setIncidence(s.incidence ?? null);
        setIncidenceType(s.incidence_type || "");
        setIncidenceDescription(s.incidence_description || "");
    }

    const handleEvidenceChange = (e) => {
        const file = e.target.files[0];
        if (!file) return;
        setEvidenceFile(file);
        setEvidencePreview(URL.createObjectURL(file));
    };

    async function guardarBitacora() {
        if (!sesionActivaId) {
            setMessage("Selecciona una sesión primero.");
            return;
        }
        if (!description.trim()) {
            setMessage("La descripción de la sesión es obligatoria.");
            return;
        }
        if (incidence === null) {
            setMessage("Indica si hubo incidencias.");
            return;
        }
        if (incidence === true && !incidenceType) {
            setMessage("Selecciona el tipo de incidencia.");
            return;
        }

        setIsSaving(true);
        setMessage("");

        try {
            let evidenceUrl = evidencePreview;
            if (evidenceFile) {
                const formData = new FormData();
                formData.append("evidence", evidenceFile);
                formData.append("session_id", sesionActivaId);

                const uploadRes = await fetch(`${API_URL}/tutor/bitacoras/upload`, {
                    method: "POST",
                    credentials: "include",
                    body: formData,
                });

                if (!uploadRes.ok) {
                    setMessage("Error al subir el archivo de evidencia.");
                    setIsSaving(false);
                    return;
                }

                const uploadData = await uploadRes.json();
                evidenceUrl = uploadData.url;
            }

            const body = {
                sesion_id: sesionActivaId,
                description,
                planning,
                evidence_url: evidenceUrl || "",
                incidence,
                incidence_type: incidence ? incidenceType : null,
                incidence_description: incidence ? incidenceDescription : null,
            };

            const res = await fetch(`${API_URL}/tutor/bitacoras`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                credentials: "include",
                body: JSON.stringify(body),
            });

            const data = await res.json();

            if (res.ok) {
                setMessage("¡Bitácora guardada con éxito!");
                await fetchSesiones();
            } else {
                setMessage(data.message || "Error al guardar la bitácora.");
            }
        } catch (error) {
            console.error("Error:", error);
            setMessage("Error de conexión al guardar.");
        } finally {
            setIsSaving(false);
        }
    }

    const obtenerMesBonito = (valor) => {
        if (!valor) return "";
        const [year, month] = valor.split("-");
        return `${meses[parseInt(month, 10) - 1]} ${year}`;
    };

    const formatSessionDate = (dateString) => {
    if (!dateString) return "";

    const date = new Date(dateString);

    const dayName = DAY_NAMES[date.getUTCDay()];
    const dayNumber = date.getUTCDate();

    return `${dayName} ${dayNumber}`;
};

    const formatTime = (timeStr) => {
        if (!timeStr) return "";
        return timeStr.substring(0, 5);
    };

    const sesionesFiltradas = sesiones.filter((s) =>
        s.fecha.startsWith(mesActivo)
    );
    const datosSesion = sesiones.find((s) => s.id === sesionActivaId) || {};
    const yaGuardada = !!datosSesion.log_id;

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
                            <option key={mes} value={mes}>
                                {obtenerMesBonito(mes)}
                            </option>
                        ))}
                    </select>

                    {sesionesFiltradas.map((s) => (
                        <div
                            key={s.id}
                            className={`bitacora-item ${sesionActivaId === s.id ? "active" : ""}`}
                            onClick={() => loadSesion(s)}
                        >
                            <p className="item-name">{s.nombre_alumno || "Sesión"}</p>
                            <p className="item-hour">
                                {formatTime(s.hora_inicio)} - {formatTime(s.hora_fin)}
                            </p>
                            <p className="item-class">{s.idioma}</p>
                            {s.log_id && (
                                <span className="item-badge">Registrada</span>
                            )}
                        </div>
                    ))}
                </div>

                <div className="bitacoras-right">
                    <h2>
                        Bitácora — {datosSesion.nombre_alumno} — {formatSessionDate(datosSesion.fecha)}
                        {yaGuardada && <span className="badge-saved"> (Editando)</span>}
                    </h2>

                    <div className="bitacoras-side">
                        <div className="bitacora-right-left">
                            <div className="bitacora-group">
                                <p>Tema / Planeación de la sesión</p>
                                <input
                                    className="bitacora-input-real"
                                    type="text"
                                    value={planning}
                                    onChange={(e) => setPlanning(e.target.value)}
                                    placeholder="Ej: Unidad 3 — presente perfecto"
                                />
                            </div>

                            <div className="bitacora-group grow">
                                <p>Descripción de la sesión</p>
                                <textarea
                                    className="bitacora-text-real"
                                    value={description}
                                    onChange={(e) => setDescription(e.target.value)}
                                    placeholder="Ej: Se practicó conversación sobre experiencias pasadas..."
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
                                <input
                                    type="file"
                                    accept="image/*,video/*"
                                    className="bitacora-input-real"
                                    onChange={handleEvidenceChange}
                                />
                                {evidencePreview && (
                                    <div className="evidence-preview">
                                        {evidencePreview.match(/\.(mp4|webm|mov)$/i) ||
                                            (evidenceFile && evidenceFile.type.startsWith("video/")) ? (
                                            <video
                                                src={evidencePreview}
                                                controls
                                                className="evidence-media"
                                            />
                                        ) : (
                                            <img
                                                src={evidencePreview}
                                                alt="Evidencia"
                                                className="evidence-media"
                                            />
                                        )}
                                    </div>
                                )}
                            </div>

                            <div className="bitacora-group">
                                <p>
                                    Hubo <strong>incidencias</strong>
                                </p>
                                <div className="incidencia-selector">
                                    <div
                                        className={`incidencia-btn ${incidence === true ? "active" : ""}`}
                                        onClick={() => setIncidence(true)}
                                    >
                                        Sí
                                    </div>
                                    <div
                                        className={`incidencia-btn ${incidence === false ? "active-no" : ""}`}
                                        onClick={() => {
                                            setIncidence(false);
                                            setIncidenceType("");
                                            setIncidenceDescription("");
                                        }}
                                    >
                                        No
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {incidence === true && (
                        <div className="incidencia-extra">
                            <div className="bitacora-group">
                                <p>Tipo de incidencia</p>
                                <div className="incidencia-type-selector">
                                    <div
                                        className={`incidencia-type-btn ${incidenceType === "assistance" ? "active" : ""}`}
                                        onClick={() => setIncidenceType("assistance")}
                                    >
                                        Asistencia
                                    </div>
                                    <div
                                        className={`incidencia-type-btn ${incidenceType === "respect" ? "active" : ""}`}
                                        onClick={() => setIncidenceType("respect")}
                                    >
                                        Respeto
                                    </div>
                                </div>
                            </div>

                            <div className="bitacora-group">
                                <p>Descripción de la incidencia</p>
                                <textarea
                                    className="bitacora-text-real"
                                    value={incidenceDescription}
                                    onChange={(e) => setIncidenceDescription(e.target.value)}
                                    placeholder="Describe brevemente lo ocurrido..."
                                />
                            </div>
                        </div>
                    )}

                    <div className="save">
                        <button
                            className="button"
                            onClick={guardarBitacora}
                            disabled={isSaving}
                        >
                            {isSaving ? "Guardando..." : yaGuardada ? "Actualizar Bitácora" : "Guardar Bitácora"}
                        </button>
                    </div>

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