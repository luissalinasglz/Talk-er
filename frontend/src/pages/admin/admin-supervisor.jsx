import { useState, useEffect } from "react";
import { apiFetch } from "./adminApi";
import "./admin-supervisor.css";

function AdminSupervisor() {
  const [tutores, setTutores] = useState([]);
  const [bitacoras, setBitacoras] = useState([]);
  const [selectedTutor, setSelectedTutor] = useState(null);
  const [sesiones, setSesiones] = useState([]);
  const [selectedBitacora, setSelectedBitacora] = useState(null);
  const [correcciones, setCorrecciones] = useState("");
  const [view, setView] = useState("sesiones"); // "sesiones" | "bitacoras"
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState({ show: false, message: "", type: "success" });
  const API_URL = import.meta.env.VITE_API_URL;

  useEffect(() => { fetchData(); }, []);

  useEffect(() => {
    if (selectedTutor) fetchSesiones(selectedTutor.tutor_id);
  }, [selectedTutor]);

  const showMsg = (message, type = "success") => {
    setToast({ show: true, message, type });
    setTimeout(() => setToast({ show: false, message: "", type: "success" }), 3000);
  };

  const fetchData = async () => {
    try {
      const [t, b] = await Promise.all([
        apiFetch("/supervisor/tutors"),
        apiFetch("/supervisor/bitacoras"),
      ]);
      setTutores(t);
      setBitacoras(b);
      if (t.length > 0) setSelectedTutor(t[0]);
    } catch (e) {
      showMsg(e.message, "error");
    } finally {
      setLoading(false);
    }
  };

  const fetchSesiones = async (tutorId) => {
    try {
      const data = await apiFetch(`/supervisor/tutor/${tutorId}/sessions`);
      setSesiones(data);
    } catch (e) {
      console.error(e);
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
      showMsg("¡Bitácora aprobada!");
      fetchData();
    } catch {
      showMsg("Error al aprobar la bitácora", "error");
    }
  };

  const handleCorrection = async () => {
    if (!selectedBitacora) return;
    if (!correcciones.trim()) return showMsg("Escribe una observación primero", "error");
    try {
      await postCorrection({ validated: false, approved: false, corrections: correcciones });
      showMsg("Corrección enviada al tutor");
      setCorrecciones("");
      fetchData();
    } catch {
      showMsg("Error al enviar corrección", "error");
    }
  };

  const fmt = (d) => d ? new Date(d).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) : "--:--";
  const fmtDate = (d) => d ? new Date(d).toLocaleDateString("es-MX", { day: "numeric", month: "long" }) : "—";
  const fmtDay = (d) => d ? new Date(d).toLocaleDateString("es-MX", { weekday: "long" }) : "—";
  const fmtIdioma = (i) => i?.includes("english") ? "Inglés" : i?.includes("french") ? "Francés" : i ?? "—";

  if (loading) return <div className="admin-supervisor-page"><p style={{ padding: "2rem", color: "#000" }}>Cargando...</p></div>;

  return (
    <div className="admin-supervisor-page">
      {toast.show && <div className={`sv-toast ${toast.type}`}>{toast.message}</div>}

      <div className="sv-tabs">
        <button className={`sv-tab${view === "sesiones" ? " active" : ""}`} onClick={() => setView("sesiones")}>
          Sesiones de Tutores
        </button>
        <button className={`sv-tab${view === "bitacoras" ? " active" : ""}`} onClick={() => setView("bitacoras")}>
          Bitácoras Pendientes {bitacoras.length > 0 && <span className="sv-badge">{bitacoras.length}</span>}
        </button>
      </div>

      {view === "sesiones" && (
        <div className="sv-sessions-layout">
          {/* LEFT: tutor list */}
          <div className="sv-left">
            <h3>Todos los Tutores</h3>
            {tutores.map((t) => (
              <div
                key={t.tutor_id}
                className={`sv-tutor-item${selectedTutor?.tutor_id === t.tutor_id ? " active" : ""}`}
                onClick={() => setSelectedTutor(t)}
              >
                <p className="sv-tutor-name">{t.tutor_name}</p>
                <p className="sv-tutor-sub">{fmtIdioma(t.idioma)} · {t.total_sessions} sesiones</p>
                {t.supervisores && <p className="sv-tutor-sup">Supervisor: {t.supervisores}</p>}
              </div>
            ))}
          </div>

          {/* RIGHT: sessions */}
          <div className="sv-right">
            {selectedTutor && (
              <>
                <div className="sv-tutor-banner">
                  <div>
                    <h2>{selectedTutor.tutor_name}</h2>
                    <p>{fmtDate(selectedTutor.period_start)} – {fmtDate(selectedTutor.period_end)}</p>
                    {selectedTutor.supervisores && <p style={{ color: "#9D9CE9", fontSize: "13px" }}>Supervisado por: {selectedTutor.supervisores}</p>}
                  </div>
                  <div className="sv-stats">
                    <div className="sv-stat"><h3>{selectedTutor.total_sessions}</h3><p>Sesiones</p></div>
                    <div className="sv-stat"><h3>{selectedTutor.total_logs}</h3><p>Bitácoras</p></div>
                    <div className="sv-stat"><h3>{selectedTutor.total_incidences}</h3><p>Incidencias</p></div>
                  </div>
                </div>

                <h3 style={{ textAlign: "left", color: "#000", margin: "1.5rem 0 0.5rem" }}>Sesiones</h3>
                {sesiones.length === 0 && <p style={{ color: "#888" }}>Sin sesiones registradas</p>}
                {sesiones.map((s) => (
                  <div key={s.session_id} className="sv-session-row">
                    <div>
                      <p style={{ color: "#888", margin: 0, fontSize: "13px" }}>{fmtDay(s.start_time)}</p>
                      <h4 style={{ margin: 0, color: "#000" }}>{fmtDate(s.start_time)}</h4>
                    </div>
                    <div style={{ textAlign: "center" }}>
                      <p style={{ margin: 0, fontWeight: 600, color: "#000" }}>{fmtIdioma(s.idioma)}</p>
                      <p style={{ margin: 0, color: "#888", fontSize: "12px" }}>{fmt(s.start_time)} – {fmt(s.end_time)}</p>
                    </div>
                    {!s.validated && !s.approved ? (
                      <span className="sv-badge-status pending">Sin Bitácora</span>
                    ) : s.validated && !s.approved ? (
                      <span className="sv-badge-status review" onClick={() => setView("bitacoras")} style={{ cursor: "pointer" }}>
                        Pendiente de Revisión
                      </span>
                    ) : (
                      <span className="sv-badge-status approved">Aprobada</span>
                    )}
                  </div>
                ))}
              </>
            )}
          </div>
        </div>
      )}

      {view === "bitacoras" && (
        <div className="sv-bitacoras-layout">
          {/* LEFT: pending list */}
          <div className="sv-left">
            <h3>Pendientes</h3>
            {bitacoras.length === 0 ? (
              <p style={{ color: "#888", fontSize: "13px" }}>Sin bitácoras pendientes</p>
            ) : (
              bitacoras.map((b) => (
                <div
                  key={b.id}
                  className={`sv-tutor-item${selectedBitacora?.id === b.id ? " active" : ""}`}
                  onClick={() => { setSelectedBitacora(b); setCorrecciones(b.corrections || ""); }}
                >
                  <p className="sv-tutor-name">Sesión #{b.session_id}</p>
                  <p className="sv-tutor-sub">{fmt(b.start_time)} – {fmt(b.end_time)}</p>
                  <p className="sv-tutor-sub">{b.idioma?.toUpperCase()}</p>
                </div>
              ))
            )}
          </div>

          {/* CENTER: bitacora detail */}
          {bitacoras.length === 0 ? (
            <div className="sv-right" style={{ display: "flex", alignItems: "center", justifyContent: "center" }}>
              <p style={{ color: "#888" }}>No hay bitácoras pendientes por revisar.</p>
            </div>
          ) : selectedBitacora ? (
            <>
              <div className="sv-right sv-bit-detail">
                <h2>Bitácora – Sesión {selectedBitacora.session_id}</h2>
                <p style={{ color: "#888", marginBottom: "1.5rem" }}>{fmt(selectedBitacora.start_time)} – {fmt(selectedBitacora.end_time)}</p>

                <div className="sv-bit-grid">
                  <div className="sv-bit-col">
                    {[["Clase", selectedBitacora.idioma?.toUpperCase()], ["Tema / Título", selectedBitacora.title],
                      ["Descripción", selectedBitacora.description], ["Planeación siguiente sesión", selectedBitacora.planning]
                    ].map(([label, val]) => (
                      <div key={label} className="sv-bit-field">
                        <p className="sv-bit-label">{label}</p>
                        <div className="sv-bit-value"><p>{val || "—"}</p></div>
                      </div>
                    ))}
                  </div>
                  <div className="sv-bit-col">
                    <div className="sv-bit-field">
                      <p className="sv-bit-label">Evidencia</p>
                      <div className="sv-bit-evidence">
                        {!selectedBitacora.evidence_url ? <p style={{ color: "#888" }}>Sin evidencia</p> : (
                          <>
                            {selectedBitacora.signed_evidence_url?.toLowerCase().endsWith(".pdf")
                              ? <iframe src={selectedBitacora.signed_evidence_url} title="PDF" className="sv-pdf" />
                              : <img src={selectedBitacora.signed_evidence_url} alt="Evidencia" className="sv-img" />
                            }
                            <a href={selectedBitacora.signed_evidence_url} target="_blank" rel="noreferrer" className="sv-link">Abrir completa</a>
                          </>
                        )}
                      </div>
                    </div>
                    <div className="sv-bit-field">
                      <p className="sv-bit-label">Incidencia</p>
                      <div className="sv-incidencia-row">
                        <span className={`sv-inc-btn${selectedBitacora.incidence ? " active" : ""}`}>Sí</span>
                        <span className={`sv-inc-btn${!selectedBitacora.incidence ? " active" : ""}`}>No</span>
                      </div>
                    </div>
                    {selectedBitacora.incidence && (
                      <>
                        <div className="sv-bit-field">
                          <p className="sv-bit-label">Tipo de incidencia</p>
                          <div className="sv-bit-value"><p>{selectedBitacora.incidence_type === "assistance" ? "Asistencia" : "Falta de Respeto"}</p></div>
                        </div>
                        <div className="sv-bit-field">
                          <p className="sv-bit-label">Descripción</p>
                          <div className="sv-bit-value"><p>{selectedBitacora.incidence_description}</p></div>
                        </div>
                      </>
                    )}
                  </div>
                </div>

                <div style={{ textAlign: "center", marginTop: "2rem" }}>
                  <button className="sv-approve-btn" onClick={handleApprove}>Aprobar Bitácora</button>
                </div>
              </div>

              {/* RIGHT: corrections panel */}
              <div className="sv-corrections">
                <h4>Solicitar corrección</h4>
                <textarea
                  className="sv-corrections-area"
                  value={correcciones}
                  onChange={(e) => setCorrecciones(e.target.value)}
                  placeholder="Escribe las observaciones para el tutor..."
                />
                <button className="sv-correction-btn" onClick={handleCorrection}>Enviar a Corrección</button>
              </div>
            </>
          ) : (
            <div className="sv-right" style={{ display: "flex", alignItems: "center", justifyContent: "center" }}>
              <p style={{ color: "#888" }}>Selecciona una bitácora</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default AdminSupervisor;
