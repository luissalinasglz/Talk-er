import "./supervisor-bitacoras.css";
import { useState, useEffect } from "react";

function SupervisorBitacoras() {
    const API_URL = import.meta.env.VITE_API_URL;

    const [bitacoras, setBitacoras] = useState([]);
    const [selectedBitacora, setSelectedBitacora] = useState(null);
    const [correcciones, setCorrecciones] = useState("");
    const [loading, setLoading] = useState(true);
    const [toast, setToast] = useState({ show: false, message: "", type: "success" });

    useEffect(() => { fetchBitacoras(); }, []);

    const showMessage = (message, type = "success") => {
        setToast({ show: true, message, type });
        setTimeout(() => setToast({ show: false, message: "", type: "success" }), 3000);
    };

    const fetchBitacoras = async () => {
        try {
            const response = await fetch(`${API_URL}/supervisor/bitacoras`, {
                method: "GET",
                headers: { "Content-Type": "application/json" },
                credentials: "include",
            });
            const data = await response.json();
            setBitacoras(data);
            setSelectedBitacora(data[0] ?? null);
            setCorrecciones(data[0]?.corrections || "");
        } catch (error) {
            console.error("Error al obtener bitácoras:", error);
        } finally {
            setLoading(false);
        }
    };

    const postCorrection = async (payload) => {
        await fetch(`${API_URL}/supervisor/correcciones`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            credentials: "include",
            body: JSON.stringify({ session_id: selectedBitacora.session_id, ...payload }),
        });
    };

    const handleApprove = async () => {
        if (!selectedBitacora) return;
        try {
            await postCorrection({ validated: true, approved: true, corrections: "" });
            showMessage("¡Bitácora aprobada!");
            fetchBitacoras();
        } catch {
            showMessage("Ocurrió un error al aprobar la bitácora", "error");
        }
    };

    const handleCorrection = async () => {
        if (!selectedBitacora) return;
        if (!correcciones.trim()) return showMessage("Debes escribir una observación para solicitar corrección", "error");
        try {
            await postCorrection({ validated: false, approved: false, corrections: correcciones });
            showMessage("Corrección enviada al tutor");
            setCorrecciones("");
            fetchBitacoras();
        } catch {
            showMessage("Error al enviar la corrección", "error");
        }
    };

    const formatTime = (dateString) => {
        if (!dateString) return "--:--";
        return new Date(dateString).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
    };

    const formatDate = (dateString) => {
        if (!dateString) return "dd/mm/aaaa";
        return new Date(dateString).toLocaleDateString();
    };

    const sel = selectedBitacora;

    if (loading) return <p>Cargando bitácoras...</p>;

    return (
        <div className="bitacoras-supervisor">
            {toast.show && <div className={`toast-notification ${toast.type}`}>{toast.message}</div>}
            <div className="bitacora-line"></div>

            <div className="bitacoras-content">
                <div className="bitacoras-left">
                    <h3>Mis Bitácoras</h3>
                    {bitacoras.length === 0 ? (
                        <p className="month">Sin pendientes</p>
                    ) : (
                        bitacoras.map((b) => (
                            <div
                                key={b.id}
                                className={`bitacora-item ${sel?.id === b.id ? "active" : ""}`}
                                onClick={() => { setSelectedBitacora(b); setCorrecciones(b.corrections || ""); }}
                            >
                                <p className="item-name">Sesión: {b.session_id}</p>
                                <p className="item-hour">{formatTime(b.start_time)} - {formatTime(b.end_time)}</p>
                                <p className="item-class">{b.idioma ? b.idioma.toUpperCase() : "Clase"}</p>
                            </div>
                        ))
                    )}
                </div>

                {bitacoras.length === 0 ? (
                    <div className="no-bitacoras-message">
                        <p>No hay bitácoras pendientes por revisar en este momento.</p>
                    </div>
                ) : (
                    <>
                        <div className="bitacoras-right">
                            <h2>Bitácora - Sesión {sel?.session_id}</h2>
                            <p className="bitacora-hour">{formatTime(sel?.start_time)} - {formatTime(sel?.end_time)}</p>

                            <div className="bitacoras-side">
                                <div className="bitacora-right-left">
                                    <div className="bitacora-row">
                                        <div className="bitacora-group">
                                            <p>Clase</p>
                                            <div className="bitacora-input">
                                                <p>{sel?.idioma ? sel.idioma.toUpperCase() : "No especificado"}</p>
                                            </div>
                                        </div>
                                        <div className="bitacora-group">
                                            <p>Fecha de Sesión</p>
                                            <div className="bitacora-input"><p>{formatDate(sel?.start_time)}</p></div>
                                        </div>
                                    </div>

                                    {[
                                        ["Tema / Título de la sesión", sel?.title, "Sin título"],
                                        ["Descripción de la sesión", sel?.description, "Sin descripción"],
                                        ["Planeación de la siguiente sesión", sel?.planning, "Sin planeación"],
                                    ].map(([label, value, fallback]) => (
                                        <div key={label} className="bitacora-group grow">
                                            <p>{label}</p>
                                            <div className="bitacora-text"><p>{value || fallback}</p></div>
                                        </div>
                                    ))}
                                </div>

                                <div className="bitacora-right-right">
                                    <div className="bitacora-group">
                                        <p>Evidencia de la clase</p>
                                        <div className="bitacora-upload">
                                            {!sel?.evidence_url ? (
                                                <p>Sin evidencia proporcionada</p>
                                            ) : (
                                                <>
                                                    <div className="evidence-preview">
                                                        {sel.evidence_url.toLowerCase().endsWith(".pdf")
                                                            ? <iframe src={sel.evidence_url} title="PDF Evidence" className="pdf-frame" />
                                                            : <img src={sel.evidence_url} alt="Evidencia" className="evidence-image" />
                                                        }
                                                    </div>
                                                    <a href={sel.evidence_url} target="_blank" rel="noopener noreferrer" className="open-evidence-link">
                                                        Abrir evidencia completa
                                                    </a>
                                                </>
                                            )}
                                        </div>
                                    </div>

                                    <div className="bitacora-group">
                                        <p>Hubo <strong>incidencias</strong> en la clase</p>
                                        <div className="incidencia-selector">
                                            <div className={`incidencia-btn ${sel?.incidence ? "active" : ""}`}>Sí</div>
                                            <div className={`incidencia-btn ${!sel?.incidence ? "active-no" : ""}`}>No</div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {!!sel?.incidence && (
                                <div className="incidencia-extra">
                                    <div className="bitacora-group">
                                        <p>Tipo de Incidencia</p>
                                        <div className="bitacora-text">
                                            <p>{sel.incidence_type === "assistance" ? "Asistencia" : "Falta de Respeto"}</p>
                                        </div>
                                    </div>
                                    <div className="bitacora-group">
                                        <p>Descripción de la incidencia</p>
                                        <div className="bitacora-text"><p>{sel.incidence_description}</p></div>
                                    </div>
                                </div>
                            )}

                            <div className="save">
                                <div className="button" onClick={handleApprove}>Aprobar Bitácora</div>
                            </div>
                        </div>

                        <div className="bitacoras-review">
                            <h3 className="review-subtitle">Solicitar corrección</h3>
                            <textarea
                                className="review-comments-area"
                                value={correcciones}
                                onChange={(e) => setCorrecciones(e.target.value)}
                                placeholder="Escribe aquí las observaciones para el tutor..."
                                data-cy="supervisor-correction-input"
                            />
                            <div className="review-buttons">
                                <div className="btn-correction" onClick={handleCorrection} data-cy="supervisor-correction-button">Enviar a Corrección</div>
                            </div>
                        </div>
                    </>
                )}
            </div>
        </div>
    );
}

export default SupervisorBitacoras;
