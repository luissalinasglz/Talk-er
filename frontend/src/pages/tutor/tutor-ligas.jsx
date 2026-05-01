import { useEffect, useState } from "react";
import "./tutor-ligas.css";

function Ligas() {
  const [groups, setGroups] = useState([]);
  const [selected, setSelected] = useState(null);

  const [inputValue, setInputValue] = useState("");
  const [password, setPassword] = useState("");
  const [platform, setPlatform] = useState("Zoom");
  const [message, setMessage] = useState("");

  const [sessionDate, setSessionDate] = useState("");
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");
  
  const [isEditingTime, setIsEditingTime] = useState(false);

  useEffect(() => {
    fetchTodayGroups();
  }, []);

  const getTodayString = () => {
    const d = new Date();
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    console.log("Día de hoy: ", `${year}-${month}-${day}`);
    return `${year}-${month}-${day}`;
  };

  const formatTime = (timeStr) => {
    if (!timeStr) return "";
    return timeStr.substring(0, 5);
  };

  async function fetchTodayGroups() {
    try {
      const res = await fetch("http://localhost:3000/v1/tutor/my-groups/today", {
        method: "GET",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
      });
      
      if (res.ok) {
        const data = await res.json();
        setGroups(data);
        if (data.length > 0) {
          loadSession(data[0]);
        }
      }
    } catch (error) {
      console.error("Error al cargar los grupos de hoy", error);
    }
  }

  function loadSession(group) {
    setSelected(group);
    setMessage(""); 
    setInputValue("");
    setPlatform("Zoom");
    setPassword("");
    setIsEditingTime(false);

    setSessionDate(getTodayString());
    setStartTime(formatTime(group.hora_inicio));
    setEndTime(formatTime(group.hora_fin));
  }

  const handleStartTimeChange = (e) => {
    const newStartTime = e.target.value;
    setStartTime(newStartTime);
    console.log("Hora inicio: ", newStartTime);

    if (newStartTime) {
      const [hours, minutes] = newStartTime.split(':');
      const date = new Date();
      date.setHours(parseInt(hours));
      date.setMinutes(parseInt(minutes));

      date.setHours(date.getHours() + 1);

      const endHour = String(date.getHours()).padStart(2, '0');
      const endMinutes = String(date.getMinutes()).padStart(2, '0');

      const formattedEndTime = `${endHour}:${endMinutes}`;
      setEndTime(formattedEndTime);
      console.log("Hora final: ", formattedEndTime);
    }
  };

  const handleInputChange = (e) => {
    const text = e.target.value;
    setInputValue(text);

    const passMatch = text.match(/(?:Passcode|Código de acceso|Contraseña|Password):\s*([A-Za-z0-9@*#]+)/i);
    if (passMatch && passMatch[1]) {
      setPassword(passMatch[1]);
    }

    const linkMatch = text.match(/(https?:\/\/[^\s]+)/);
    if (linkMatch && linkMatch[1]) {
      setInputValue(linkMatch[1]);
    }
  };

  const generateFinalUrl = () => {
    const trimmed = inputValue.trim();
    if (!trimmed) return "";
    
    if (trimmed.startsWith("http://") || trimmed.startsWith("https://")) {
      return trimmed;
    }

    const cleanId = trimmed.replace(/\s+/g, "");

    switch (platform) {
      case "Zoom": return `https://zoom.us/j/${cleanId}`;
      case "Meet": return `https://meet.google.com/${cleanId}`;
      case "Teams": return trimmed;
      default: return trimmed;
    }
  };

  async function guardarLiga() {
    if (!selected) {
      setMessage("Selecciona un alumno");
      return;
    }

    if (!sessionDate || !startTime || !endTime) {
      setMessage("Por favor verifica la fecha y hora de la sesión.");
      return;
    }

    const finalUrl = generateFinalUrl();

    try {
      const body = {
        student_tutor: selected.id,
        session_url: finalUrl,
        platform: platform,
        password: password,
        start_time: `${sessionDate} ${startTime}:00`,
        end_time: `${sessionDate} ${endTime}:00`,
      };

      const res = await fetch("http://localhost:3000/v1/tutor/sessions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(body),
      });

      const data = await res.json();
      
      if (res.ok) {
        setMessage(data.message || "Liga guardada con éxito");
        fetchTodayGroups(); // Recargar la lista para quitar al alumno
      } else {
        setMessage(data.message || "Error al guardar");
      }
    } catch {
      setMessage("Error de conexión guardando liga");
    }
  }

  return (
    <div className="ligas">
      <div className="sessions-list">
        <div className="list-title">
          <p>Clases de Hoy</p>
        </div>

        <div className="list-classes">
          {groups.length === 0 ? (
            <p style={{ padding: "1rem", color: "#666" }}>No hay clases pendientes hoy.</p>
          ) : (
            groups.map((group) => (
              <div
                key={group.id}
                className={`class-item ${selected?.id === group.id ? "active" : ""}`}
                onClick={() => loadSession(group)}
              >
                <p><strong>{group.idioma}</strong></p>
                <p className="info-student">{group.student_name}</p>
                <p style={{ fontSize: "0.85rem", color: selected?.id === group.id ? "#fff" : "#666", marginTop: "4px" }}>
                  {formatTime(group.hora_inicio)} - {formatTime(group.hora_fin)}
                </p>
              </div>
            ))
          )}
        </div>
      </div>

      <div className="ligas-content">
        <div className="blue-rectangle">
          <h2>{selected?.student_name || "Sin alumno seleccionado"}</h2>
          <p>
            {selected?.idioma || "N/A"} 
            {selected && ` | ${formatTime(selected.hora_inicio)} a ${formatTime(selected.hora_fin)}`}
          </p>
        </div>

        <div className="info-rectangle">
          <h3>Liga de clases</h3>
          <div className="line"></div>

          <div style={{ marginBottom: "1.5rem", padding: "1rem", backgroundColor: "#f9f9f9", borderRadius: "8px", border: "1px solid #eee" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <p style={{ margin: 0, color: "#333" }}>
                <strong>Horario a registrar:</strong> {sessionDate} | {startTime} - {endTime}
              </p>
              <button 
                onClick={() => setIsEditingTime(!isEditingTime)}
                style={{ background: "none", border: "none", color: "#252467", cursor: "pointer", textDecoration: "none", fontWeight: "bold" }}
              >
                {isEditingTime ? "Ocultar opciones" : "Modificar horario de hoy"}
              </button>
            </div>

            {isEditingTime && (
              <div style={{ display: "flex", gap: "1rem", marginTop: "1rem", flexWrap: "wrap", borderTop: "1px solid #ddd", paddingTop: "1rem" }}>
                <div className="form-group" style={{ flex: 1, margin: 0 }}>
                  <p>Fecha</p>
                  <input 
                    type="date" 
                    value={sessionDate} 
                    onChange={(e) => setSessionDate(e.target.value)} 
                  />
                </div>
                <div className="form-group" style={{ flex: 1, margin: 0 }}>
                  <p>Hora de inicio</p>
                  <input 
                    type="time" 
                    value={startTime} 
                    onChange={handleStartTimeChange} 
                  />
                </div>
                <div className="form-group" style={{ flex: 1, margin: 0 }}>
                  <p>Hora de fin</p>
                  <input 
                    type="time" 
                    value={endTime} 
                    onChange={(e) => setEndTime(e.target.value)} 
                  />
                </div>
              </div>
            )}
          </div>

          <div className="form-group">
            <p>Plataforma</p>
            <select value={platform} onChange={(e) => setPlatform(e.target.value)}>
              <option value="Zoom">Zoom</option>
              <option value="Meet">Google Meet</option>
              <option value="Teams">Microsoft Teams</option>
              <option value="Otro">Otro</option>
            </select>
          </div>

          <div className="form-group">
            <p>ID de reunión o Enlace</p>
            <input
              type="text"
              placeholder="Ej: https://zoom.us/j/123... o 123 456 7890"
              value={inputValue}
              onChange={handleInputChange}
            />
          </div>

          {platform !== "Meet" && (
            <div className="form-group">
              <p>Contraseña (Opcional)</p>
              <input
                type="text"
                placeholder="Código de acceso"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
          )}

          <div className="save">
            <button className="button" onClick={guardarLiga} disabled={!selected}>
              Guardar Liga
            </button>
          </div>

          {message && (
            <p className="success-message" style={{ marginTop: "1rem", fontWeight: "bold" }}>
              {message}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

export default Ligas;