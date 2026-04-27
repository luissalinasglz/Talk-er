import { useEffect, useState } from "react";
import "./tutor-ligas.css";

function Ligas() {
  const [groups, setGroups] = useState([
    { id: 1, idioma: "english", student_name: "Wicho Estudiante" }
  ]);
  const [selected, setSelected] = useState(groups[0]);

  const [inputValue, setInputValue] = useState("");
  const [password, setPassword] = useState("");
  const [platform, setPlatform] = useState("Zoom");
  const [message, setMessage] = useState("");

  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");

  useEffect(() => {
    loadSession(groups[0]);
  }, []);

  async function loadSession(group) {
    setSelected(group);
    setMessage(""); 
    
    setInputValue("");
    setPlatform("Zoom");
  }

  async function guardarLiga() {
    setMessage("Liga guardada con éxito (Modo Demo)");
  }

  function resetForm() {
    setInputValue("");
    setPassword("");
    setStartTime("");
    setEndTime("");
    setPlatform("Zoom");
  }

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
      case "Zoom":
        return `https://zoom.us/j/${cleanId}`;
      case "Meet":
        return `https://meet.google.com/${cleanId}`;
      case "Teams":
        return trimmed;
      default:
        return trimmed;
    }
  };

  async function guardarLiga() {
    if (!selected) {
      setMessage("Selecciona un alumno");
      return;
    }

    const finalUrl = generateFinalUrl();

    try {
      const body = {
        student_tutor: selected.id,
        session_url: finalUrl,
        platform: platform,
        password: password,
        start_time: startTime || new Date(),
        end_time: endTime || new Date(Date.now() + 60 * 60 * 1000),
      };

      const res = await fetch("http://localhost:3000/v1/tutor/sessions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify(body),
      });

      const data = await res.json();
      setMessage(data.message || "Liga guardada con éxito");
    } catch {
      setMessage("Error guardando liga");
    }
  }

  return (
    <div className="ligas">
      <div className="sessions-list">
        <div className="list-title">
          <p>Clases</p>
        </div>

        <div className="list-classes">
          {groups.map((group) => (
            <div
              key={group.id}
              className={`class-item ${
                selected?.id === group.id ? "active" : ""
              }`}
              onClick={() => loadSession(group)}
            >
              <p>{group.idioma}</p>
              <p className="info-student">{group.student_name}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="ligas-content">
        <div className="blue-rectangle">
          <h2>{selected?.student_name || "Sin alumno"}</h2>
          <p>{selected?.idioma || ""}</p>
        </div>

        <div className="info-rectangle">
          <h3>Liga de clases</h3>
          <div className="line"></div>

          <div className="form-group">
            <p>Plataforma</p>
            <select
              value={platform}
              onChange={(e) => setPlatform(e.target.value)}
            >
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
            <button className="button" onClick={guardarLiga}>
              Guardar Liga
            </button>
          </div>

          {message && <p className="success-message">{message}</p>}
        </div>
      </div>
    </div>
  );
}

export default Ligas;