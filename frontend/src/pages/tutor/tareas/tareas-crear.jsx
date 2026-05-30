import { useState } from "react";
import "../tutor-tareas.css";
import documentoazul from "../../../assets/documento_tarea.png";

function TareasCrear({ grupos = [], onCrear }) {
  const [titulo, setTitulo] = useState("");
  const [descripcion, setDescripcion] = useState("");
  const [groupId, setGroupId] = useState("");
  const [fechaEntrega, setFechaEntrega] = useState("");
  const [horaLimite, setHoraLimite] = useState("");

  const handleSubmit = () => {
    if (!titulo.trim()) {
      alert("Por favor, ingresa un título.");
      return;
    }
    if (!groupId) {
      alert("Por favor, selecciona un beneficiario.");
      return;
    }

    const nuevaTarea = {
      group: parseInt(groupId),
      titulo: titulo.trim(),
      descripcion: descripcion.trim(),
      fechaEntrega,
      horaLimite,
    };

    onCrear(nuevaTarea);
  };

  return (
    <div className="homework-form">
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
        <p>Material de apoyo (Simulado)</p>
        <div className="file-attach" style={{ cursor: "pointer" }}>
          <img className="blue-document" src={documentoazul} alt="doc" />
          <p>Subir archivo...</p>
        </div>
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

      <div className="save">
        <button className="button" onClick={handleSubmit}>
          Subir Tarea
        </button>
      </div>
    </div>
  );
}

export default TareasCrear;
