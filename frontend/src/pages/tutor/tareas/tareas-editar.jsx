import { useRef, useState } from "react";
import "../tutor-tareas.css";
import documentoazul from "../../../assets/documento_tarea.png";
import { useFileUpload } from "../../../hooks/useFileUpload";

function TareasEditar({ tarea, onGuardar, onCancelar }) {
  const [titulo, setTitulo] = useState(tarea?.titulo || "");
  const [descripcion, setDescripcion] = useState(tarea?.descripcion || "");
  const [fechaEntrega, setFechaEntrega] = useState(tarea?.fechaEntrega || "");
  const [horaLimite, setHoraLimite] = useState(tarea?.horaLimite || "");
  const [archivoNuevo, setArchivoNuevo] = useState(null);
  const [removeFile, setRemoveFile] = useState(false);
  const [message, setMessage] = useState("");

  const fileInputRef = useRef(null);
  const { upload, uploading } = useFileUpload();

  const tieneArchivoExistente = !removeFile && !archivoNuevo && !!tarea?.file_url;
  const nombreArchivoExistente = tarea?.file_url?.split("/").pop() || "Archivo adjunto";

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
    setArchivoNuevo(file);
    setRemoveFile(false);
  };

  const handleGuardar = async () => {
    setMessage("");
    let fileKey = undefined; 

    try {
      if (archivoNuevo) {
        setMessage("Subiendo archivo...");
        fileKey = await upload(archivoNuevo, "assignment");
        setMessage("");
      } else if (removeFile) {
        fileKey = null; 
      }

      const tareaActualizada = {
        ...tarea,
        titulo,
        descripcion,
        fechaEntrega,
        horaLimite,
        ...(fileKey !== undefined ? { file_url: fileKey } : {}),
        remove_file: removeFile && !archivoNuevo,
      };

      onGuardar(tareaActualizada);
    } catch (err) {
      setMessage(err.message || "Error subiendo archivo.");
    }
  };

  return (
    <div className="homework-form">
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <h3>Editar Tarea</h3>
        <button
          onClick={onCancelar}
          style={{ background: "none", border: "none", color: "#6883BA", cursor: "pointer", fontWeight: "bold" }}
        >
          Volver
        </button>
      </div>

      <div className="form-group">
        <p>Título</p>
        <input
          type="text"
          className="select-input"
          value={titulo}
          onChange={(e) => setTitulo(e.target.value)}
        />
      </div>

      <div className="form-group">
        <p>Descripción</p>
        <textarea
          className="select-input"
          rows="4"
          value={descripcion}
          onChange={(e) => setDescripcion(e.target.value)}
          style={{ fontFamily: "inherit", resize: "vertical" }}
        />
      </div>

      <div className="form-group">
        <p>Material de apoyo</p>

        {tieneArchivoExistente && (
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "0.75rem",
              background: "#F0F2F7",
              borderRadius: "12px",
              padding: "0.75rem 1rem",
              marginBottom: "0.5rem",
            }}
          >
            <img className="blue-document" src={documentoazul} alt="doc" />
            <span
              style={{ flex: 1, fontSize: "14px", cursor: "pointer", color: "#252467", fontWeight: 600 }}
              onClick={() => tarea.signed_file_url && window.open(tarea.signed_file_url, "_blank")}
            >
              {nombreArchivoExistente}
            </span>
            <button
              type="button"
              onClick={() => { setRemoveFile(true); }}
              style={{ background: "none", border: "none", color: "#e74c3c", cursor: "pointer", fontSize: "13px" }}
            >
              ✕ Quitar
            </button>
          </div>
        )}

        {!tieneArchivoExistente && (
          <label className="file-attach" style={{ cursor: "pointer" }}>
            <img className="blue-document" src={documentoazul} alt="doc" />
            <span>
              {archivoNuevo
                ? archivoNuevo.name
                : removeFile
                ? "Archivo eliminado — haz clic para adjuntar uno nuevo"
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
        )}

        {archivoNuevo && (
          <button
            type="button"
            onClick={() => {
              setArchivoNuevo(null);
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
            ✕ Quitar archivo nuevo
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
        <p style={{ color: message.startsWith("Error") || message.startsWith("Tipo") || message.startsWith("El archivo") ? "#e74c3c" : "#6883BA", margin: 0, fontSize: "14px" }}>
          {message}
        </p>
      )}

      <div className="save">
        <button
          className="button"
          onClick={handleGuardar}
          disabled={uploading}
          style={{ opacity: uploading ? 0.6 : 1 }}
        >
          {uploading ? "Guardando..." : "Guardar Tarea"}
        </button>
      </div>
    </div>
  );
}

export default TareasEditar;
