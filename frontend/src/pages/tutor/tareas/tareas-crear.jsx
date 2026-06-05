import { useRef, useState } from "react";
import "../tutor-tareas.css";
import documentoazul from "../../../assets/documento_tarea.png";
import { useFileUpload } from "../../../hooks/useFileUpload";

function TareasCrear({ grupos = [], onCrear }) {
  const [titulo, setTitulo] = useState("");
  const [descripcion, setDescripcion] = useState("");
  const [groupId, setGroupId] = useState("");
  const [fechaEntrega, setFechaEntrega] = useState("");
  const [horaLimite, setHoraLimite] = useState("");
  const [archivoSeleccionado, setArchivoSeleccionado] = useState(null);
  const [message, setMessage] = useState("");

  const fileInputRef = useRef(null);
  const { upload, uploading } = useFileUpload();

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setMessage("");

    const allowed = [
      "application/pdf",
      "application/msword",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      "application/vnd.ms-powerpoint",
      "application/vnd.openxmlformats-officedocument.presentationml.presentation",
      "image/png",
      "image/jpeg",
      "image/jpg",
    ];

    if (!allowed.includes(file.type)) {
      setMessage("Tipo de archivo no permitido.");
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setMessage("El archivo supera 5 MB.");
      return;
    }
    setArchivoSeleccionado(file);
  };

  const handleSubmit = async () => {
    if (!titulo.trim()) return setMessage("Por favor, ingresa un título.");
    if (!groupId) return setMessage("Por favor, selecciona un beneficiario.");

    setMessage("");
    let fileKey = null;

    try {
      if (archivoSeleccionado) {
        setMessage("Subiendo archivo...");
        fileKey = await upload(archivoSeleccionado, "assignment");
        setMessage("");
      }

      const nuevaTarea = {
        group: parseInt(groupId),
        titulo: titulo.trim(),
        descripcion: descripcion.trim(),
        fechaEntrega,
        horaLimite,
        file_url: fileKey,
      };

      onCrear(nuevaTarea);
    } catch (err) {
      setMessage(err.message || "Error subiendo archivo.");
    }
  };

  return (
    <div
      style={{
        flex: 1,
        padding: "2rem",
        overflowY: "auto",
        display: "flex",
        justifyContent: "center",
        alignItems: "flex-start",
      }}
    >
      <div
        style={{
          background: "#FFFFFF",
          borderRadius: "20px",
          padding: "2rem 2.5rem",
          width: "100%",
          maxWidth: "580px",
          boxShadow: "0 4px 20px rgba(0,0,0,0.06)",
        }}
      >
        <div className="homework-form" style={{ width: "100%", minWidth: "unset", margin: 0 }}>
          <h3>Crear Tarea</h3>

          <div className="form-group">
            <p>Beneficiario (Grupo/Alumno)</p>
            <select
              className="select-input"
              value={groupId}
              onChange={(e) => setGroupId(e.target.value)}
            >
              <option value="">Seleccionar beneficiario</option>
              {grupos.map((g) => (
                <option key={g.id} value={g.id}>
                  {g.student_name} — {g.idioma === "english" ? "Inglés" : "Francés"}
                </option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <p>Título</p>
            <input
              type="text"
              className="select-input"
              placeholder="Escribir título"
              value={titulo}
              onChange={(e) => setTitulo(e.target.value)}
            />
          </div>

          <div className="form-group">
            <p>Descripción</p>
            <textarea
              className="select-input"
              placeholder="Explicar actividad"
              rows="4"
              value={descripcion}
              onChange={(e) => setDescripcion(e.target.value)}
              style={{ fontFamily: "inherit", resize: "vertical" }}
            />
          </div>

          <div className="form-group">
            <p>Material de apoyo (opcional)</p>
            <label className="file-attach" style={{ cursor: "pointer" }}>
              <img className="blue-document" src={documentoazul} alt="doc" />
              <span>
                {archivoSeleccionado
                  ? archivoSeleccionado.name
                  : "Haz clic para seleccionar archivo..."}
              </span>
              <input
                ref={fileInputRef}
                type="file"
                accept=".pdf,.doc,.docx,.ppt,.pptx,.png,.jpg,.jpeg"
                style={{ display: "none" }}
                onChange={handleFileChange}
              />
            </label>
            {archivoSeleccionado && (
              <button
                type="button"
                onClick={() => {
                  setArchivoSeleccionado(null);
                  if (fileInputRef.current) fileInputRef.current.value = "";
                }}
                style={{
                  alignSelf: "flex-start",
                  background: "none",
                  border: "none",
                  color: "#e74c3c",
                  cursor: "pointer",
                  fontSize: "13px",
                  padding: 0,
                }}
              >
                ✕ Quitar archivo
              </button>
            )}
          </div>

          <div className="form-row" style={{ display: "flex", gap: "1rem" }}>
            <div className="form-date" style={{ flex: 1 }}>
              <p>Fecha de entrega</p>
              <input
                type="date"
                className="select-input"
                value={fechaEntrega}
                onChange={(e) => setFechaEntrega(e.target.value)}
              />
            </div>
            <div className="form-hour" style={{ flex: 1 }}>
              <p>Hora límite</p>
              <input
                type="time"
                className="select-input"
                value={horaLimite}
                onChange={(e) => setHoraLimite(e.target.value)}
              />
            </div>
          </div>

          {message && (
            <p
              style={{
                color:
                  message.startsWith("Error") ||
                  message.startsWith("Tipo") ||
                  message.startsWith("El archivo")
                    ? "#e74c3c"
                    : "#6883BA",
                margin: 0,
                fontSize: "14px",
              }}
            >
              {message}
            </p>
          )}

          <div className="save">
            <button
              className="button"
              onClick={handleSubmit}
              disabled={uploading}
              style={{ opacity: uploading ? 0.6 : 1 }}
            >
              {uploading ? "Subiendo..." : "Subir Tarea"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default TareasCrear;
