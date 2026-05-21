import { useState, useEffect } from "react";
import "../tutor-tareas.css";
import documentoazul from "../../../assets/documento_tarea.png";

function TareasEditar({ tarea, onGuardar, onCancelar }) {
  const [titulo, setTitulo] = useState(tarea?.titulo || "");
  const [descripcion, setDescripcion] = useState(tarea?.descripcion || "");
  const [fechaEntrega, setFechaEntrega] = useState(tarea?.fechaEntrega || "");
  const [horaLimite, setHoraLimite] = useState(tarea?.horaLimite || "");

  const handleGuardar = () => {
    const tareaActualizada = {
      ...tarea,
      titulo,
      descripcion,
      fechaEntrega,
      horaLimite,
    };
    onGuardar(tareaActualizada);
  };

  return (
    <div className="homework-form">
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <h3>Editar Tarea</h3>
        <button onClick={onCancelar} style={{ background: "none", border: "none", color: "#6883BA", cursor: "pointer", fontWeight: "bold" }}>
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
        <div className="file-attach">
          <img className="blue-document" src={documentoazul} alt="doc" />
          <p>{tarea?.archivo || "Sin archivo"}</p>
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
        <button className="button" onClick={handleGuardar}>
          Guardar Tarea
        </button>
      </div>
    </div>
  );
}

export default TareasEditar;