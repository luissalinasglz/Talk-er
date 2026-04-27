import { useState } from "react";
import "../tutor-tareas.css";
import documentoazul from "../../../assets/documento_tarea.png";

function TareasCrear({ onCrear }) {
  const [titulo, setTitulo] = useState("");
  const [descripcion, setDescripcion] = useState("");
  const [beneficiario, setBeneficiario] = useState("");
  const [fechaEntrega, setFechaEntrega] = useState("");
  const [horaLimite, setHoraLimite] = useState("");

  const handleSubmit = () => {
    if (!titulo || !beneficiario) {
      alert("Por favor, ingresa al menos un título y un beneficiario.");
      return;
    }

    const nuevaTarea = {
      titulo,
      descripcion,
      beneficiario,
      fechaEntrega,
      horaLimite,
      archivo: "Sin archivo",
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
          value={beneficiario}
          onChange={(e) => setBeneficiario(e.target.value)}
        >
          <option value="">Seleccionar beneficiario</option>
          <option value="Inglés A">Inglés A</option>
          <option value="Inglés B">Inglés B</option>
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