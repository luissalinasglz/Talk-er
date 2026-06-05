import { useEffect, useState } from "react";
import "../tutor-tareas.css";
import documentoazul from "../../../assets/documento_tarea.png";

function TareasDetalle({ tarea, onEditar, onVolver }) {
  const API_URL = import.meta.env.VITE_API_URL;

  const [submissions, setSubmissions] = useState([]);
  const [loadingSubs, setLoadingSubs] = useState(true);
  const [gradingId, setGradingId] = useState(null);
  const [grades, setGrades] = useState({});
  const [messages, setMessages] = useState({});

  useEffect(() => {
    if (!tarea?.id) return;
    fetchSubmissions();
  }, [tarea?.id]);

  async function fetchSubmissions() {
    setLoadingSubs(true);
    try {
      const res = await fetch(`${API_URL}/tutor/tareas/${tarea.id}/submissions`, {
        credentials: "include",
      });
      const data = await res.json();
      if (res.ok) {
        setSubmissions(data);
        const initial = {};
        data.forEach((s) => {
          initial[s.id] = { grade: s.grade ?? "", feedback: s.feedback ?? "" };
        });
        setGrades(initial);
      }
    } catch (err) {
      console.error("Error cargando entregas:", err);
    } finally {
      setLoadingSubs(false);
    }
  }

  async function saveGrade(sub) {
    setGradingId(sub.id);
    setMessages((prev) => ({ ...prev, [sub.id]: "" }));
    try {
      const { grade, feedback } = grades[sub.id] ?? {};
      const res = await fetch(
        `${API_URL}/tutor/tareas/${tarea.id}/submissions/${sub.id}/grade`,
        {
          method: "PUT",
          credentials: "include",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ grade: grade === "" ? null : Number(grade), feedback }),
        }
      );
      const data = await res.json();
      if (res.ok) {
        setMessages((prev) => ({ ...prev, [sub.id]: "✓ Guardado" }));
        setSubmissions((prev) =>
          prev.map((s) =>
            s.id === sub.id
              ? { ...s, grade: grade === "" ? null : Number(grade), feedback }
              : s
          )
        );
      } else {
        setMessages((prev) => ({ ...prev, [sub.id]: data.message || "Error guardando" }));
      }
    } catch {
      setMessages((prev) => ({ ...prev, [sub.id]: "Error de conexión" }));
    } finally {
      setGradingId(null);
    }
  }

  function abrirArchivo(url) {
    if (!url) return;
    window.open(url, "_blank");
  }

  if (!tarea) return <p>Cargando tarea...</p>;

  return (
    <div className="homework-details" style={{ display: "flex", gap: "2rem" }}>
      {/* LEFT — task details */}
      <div className="detail-left" style={{ flex: 1 }}>
        <div className="indications">
          <div className="indications-details">
            <button
              onClick={onVolver}
              style={{ background: "none", border: "none", color: "#6883BA", cursor: "pointer", fontWeight: "bold", padding: "0 0 1rem 0" }}
            >
              ← Volver a la lista
            </button>
            <h3>Indicaciones: {tarea.titulo}</h3>
            <p>{tarea.descripcion}</p>
            {tarea.fechaEntrega && (
              <p style={{ marginTop: "1rem", color: "#888", fontSize: "14px" }}>
                <strong>Vence:</strong> {tarea.fechaEntrega} a las {tarea.horaLimite}
              </p>
            )}
          </div>

          {tarea.file_url && (
            <div
              className="file"
              style={{ marginTop: "1rem", cursor: "pointer" }}
              onClick={() => abrirArchivo(tarea.signed_file_url)}
            >
              <p>📎 {tarea.file_url.split("/").pop()}</p>
            </div>
          )}

          <div className="save" style={{ marginTop: "2rem" }}>
            <button
              className="button"
              onClick={onEditar}
              style={{ background: "#BBBEC7", color: "black" }}
            >
              Editar Tarea
            </button>
          </div>
        </div>
      </div>

      {/* RIGHT — submissions + grading */}
      <div
        className="detail-right"
        style={{ flex: 1.4, backgroundColor: "#fff", padding: "1.5rem", borderRadius: "20px", overflowY: "auto" }}
      >
        <h3>Calificar Entregas</h3>

        {loadingSubs ? (
          <p style={{ color: "#888" }}>Cargando entregas...</p>
        ) : submissions.length === 0 ? (
          <p style={{ color: "#888" }}>Aún no hay entregas para esta tarea.</p>
        ) : (
          submissions.map((sub) => (
            <SubmissionCard
              key={sub.id}
              sub={sub}
              gradeState={grades[sub.id] ?? { grade: "", feedback: "" }}
              onGradeChange={(field, value) =>
                setGrades((prev) => ({
                  ...prev,
                  [sub.id]: { ...(prev[sub.id] ?? {}), [field]: value },
                }))
              }
              onSave={() => saveGrade(sub)}
              saving={gradingId === sub.id}
              message={messages[sub.id] || ""}
            />
          ))
        )}
      </div>
    </div>
  );
}

function SubmissionCard({ sub, gradeState, onGradeChange, onSave, saving, message }) {
  function abrirArchivo() {
    if (!sub.signed_file_url) return;
    window.open(sub.signed_file_url, "_blank");
  }

  return (
    <div
      style={{
        borderBottom: "1px solid #F0F2F7",
        paddingBottom: "1.5rem",
        marginBottom: "1.5rem",
      }}
    >
      <div className="student" style={{ display: "flex", alignItems: "center", gap: "1rem", marginBottom: "1rem" }}>
        <div
          className="circle-student"
          style={{ width: "40px", height: "40px", backgroundColor: "#252467", borderRadius: "50%", flexShrink: 0 }}
        />
        <div>
          <p style={{ margin: 0, fontWeight: "bold", color: "black" }}>{sub.nombre_alumno}</p>
          <p className="info-date" style={{ margin: 0, fontSize: "12px", color: "#888" }}>
            {sub.submitted_at
              ? new Date(sub.submitted_at).toLocaleString("es-MX", { dateStyle: "medium", timeStyle: "short" })
              : "—"}
          </p>
        </div>
      </div>

      {sub.file ? (
        <div
          className="file-info"
          style={{
            display: "flex",
            alignItems: "center",
            gap: "1rem",
            backgroundColor: "#F0F2F7",
            padding: "0.75rem 1rem",
            borderRadius: "10px",
            marginBottom: "1rem",
          }}
        >
          <img src={documentoazul} alt="doc" className="blue-document" />
          <p style={{ margin: 0, flex: 1, fontSize: "14px", color: "black" }}>
            {sub.file.split("/").pop()}
          </p>
          <span
            className="ver"
            style={{ color: "#6883BA", fontWeight: "bold", cursor: "pointer" }}
            onClick={abrirArchivo}
          >
            Ver
          </span>
        </div>
      ) : (
        <p style={{ color: "#aaa", fontSize: "13px", marginBottom: "1rem" }}>Sin archivo adjunto</p>
      )}

      <div style={{ display: "flex", alignItems: "center", gap: "1rem", marginBottom: "0.75rem" }}>
        <input
          type="number"
          min="0"
          max="100"
          value={gradeState.grade}
          onChange={(e) => onGradeChange("grade", e.target.value)}
          placeholder="—"
          style={{
            width: "70px",
            padding: "0.5rem",
            borderRadius: "10px",
            border: "1px solid #ccc",
            textAlign: "center",
            fontSize: "16px",
            fontWeight: "bold",
          }}
        />
        <span style={{ color: "#888" }}>/ 100</span>
        {sub.grade !== null && sub.grade !== undefined && (
          <span style={{ fontSize: "12px", color: sub.grade >= 60 ? "#27ae60" : "#e74c3c" }}>
            Actual: {sub.grade}
          </span>
        )}
      </div>

      <textarea
        placeholder="Retroalimentación para el estudiante..."
        value={gradeState.feedback}
        onChange={(e) => onGradeChange("feedback", e.target.value)}
        rows="2"
        style={{
          width: "100%",
          padding: "0.75rem",
          borderRadius: "10px",
          border: "1px solid #ccc",
          fontFamily: "inherit",
          fontSize: "14px",
          boxSizing: "border-box",
          resize: "vertical",
          marginBottom: "0.75rem",
        }}
      />

      <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
        <button
          className="button"
          onClick={onSave}
          disabled={saving}
          style={{ padding: "0.5rem 1.5rem", opacity: saving ? 0.6 : 1 }}
        >
          {saving ? "Guardando..." : "Guardar"}
        </button>
        {message && (
          <span style={{ fontSize: "13px", color: message.startsWith("✓") ? "#27ae60" : "#e74c3c" }}>
            {message}
          </span>
        )}
      </div>
    </div>
  );
}

export default TareasDetalle;
