import { useState } from "react";
import "../tutor-tareas.css";
import documentoazul from "../../../assets/documento_tarea.png";

function TareasDetalle({ tarea, onEditar, onVolver }) {
  // Estado para la calificación en la demo
  const [calificacion, setCalificacion] = useState("0");
  const [retroalimentacion, setRetroalimentacion] = useState("");

  if (!tarea) return <p>Cargando tarea...</p>;

  return (
    <div className="homework-details" style={{ display: "flex", gap: "2rem" }}>
      <div className="detail-left" style={{ flex: 1 }}>
        <div className="indications">
          <div className="indications-details">
            <button onClick={onVolver} style={{ background: "none", border: "none", color: "#6883BA", cursor: "pointer", fontWeight: "bold", padding: "0 0 1rem 0" }}>
              ← Volver a la lista
            </button>
            
            <h3>Indicaciones: {tarea.titulo}</h3>
            <p>{tarea.descripcion}</p>
            <p style={{ marginTop: "1rem", color: "#888", fontSize: "14px" }}>
              <strong>Vence:</strong> {tarea.fechaEntrega} a las {tarea.horaLimite}
            </p>
          </div>
          <div className="file" style={{ marginTop: "1rem" }}>
            <p>📎 {tarea.archivo}</p>
          </div>
          <div className="save" style={{ marginTop: "2rem" }}>
            <button className="button" onClick={onEditar} style={{ background: "#BBBEC7", color: "black" }}>
              Editar Tarea
            </button>
          </div>
        </div>
      </div>

      <div className="detail-right" style={{ flex: 1, backgroundColor: "#fff", padding: "1.5rem", borderRadius: "20px" }}>
        <h3>Calificar Entregas</h3>
        
        <div className="student" style={{ display: "flex", alignItems: "center", gap: "1rem", margin: "1.5rem 0" }}>
          <div className="circle-student" style={{ width: "40px", height: "40px", backgroundColor: "#252467", borderRadius: "50%" }}></div>
          <div className="name">
            <p style={{ margin: 0, fontWeight: "bold" }}>Otrebor Castro</p>
            <p className="info-date" style={{ margin: 0, fontSize: "12px", color: "#888" }}>Entregado hace 20min.</p>
          </div>
        </div>

        <div className="file-info" style={{ display: "flex", alignItems: "center", gap: "1rem", backgroundColor: "#F0F2F7", padding: "1rem", borderRadius: "10px" }}>
          <img className="blue-document" src={documentoazul} alt="doc" width="24" />
          <p style={{ margin: 0, flex: 1 }}>Respuesta_Otrebor.pdf</p>
          <p className="ver" style={{ margin: 0, color: "#6883BA", cursor: "pointer", fontWeight: "bold" }}>Ver</p>
        </div>

        <div className="calification" style={{ display: "flex", alignItems: "center", gap: "1rem", margin: "1.5rem 0" }}>
          <div className="input-cal">
            <input 
              type="number" 
              value={calificacion} 
              onChange={(e) => setCalificacion(e.target.value)}
              style={{ width: "60px", padding: "0.5rem", borderRadius: "10px", border: "1px solid #ccc", textAlign: "center" }}
            />
          </div>
          <div className="cal">
            <p style={{ margin: 0 }}>/ 100</p>
          </div>
        </div>

        <div className="feedback">
          <textarea 
            placeholder="Retroalimentación para el estudiante..."
            value={retroalimentacion}
            onChange={(e) => setRetroalimentacion(e.target.value)}
            style={{ width: "100%", padding: "1rem", borderRadius: "10px", border: "1px solid #ccc", fontFamily: "inherit", boxSizing: "border-box" }}
            rows="3"
          />
        </div>

        <div className="save" style={{ marginTop: "1.5rem" }}>
          <button className="button" onClick={() => alert("Calificación guardada (Demo)")}>
            Guardar Calificación
          </button>
        </div>
      </div>
    </div>
  );
}

export default TareasDetalle;