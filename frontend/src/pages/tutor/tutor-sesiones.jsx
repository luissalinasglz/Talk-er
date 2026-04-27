import { useEffect, useState } from "react";
import "./tutor-sesiones.css";

function Sesiones() {
    const [groups, setGroups] = useState([
        { id: 1, idioma: "english", student_name: "Wicho Estudiante" }
    ]);
    const [selected, setSelected] = useState(groups[0]);

    const [sessionId, setSessionId] = useState(null);
    const [startTime, setStartTime] = useState("");
    const [endTime, setEndTime] = useState("");
    const [message, setMessage] = useState("");

    useEffect(() => {
        selectGroup(groups[0]);
    }, []);

    async function selectGroup(group) {
        setSelected(group);
        setMessage("");
        setSessionId(1);
        setStartTime("2026-05-05T16:00");
        setEndTime("2026-05-05T17:00");
    }

    function formatForInput(dateString) {
        if (!dateString) return "";
        return new Date(dateString).toISOString().slice(0, 16);
    }

    async function saveSession() {
        setMessage("Horario guardado correctamente en la simulación.");
    }

    const handleStartTimeChange = (e) => {
        const newStartTime = e.target.value;
        setStartTime(newStartTime);

        if (newStartTime) {
            const startDate = new Date(newStartTime);

            startDate.setHours(startDate.getHours() + 1);

            const year = startDate.getFullYear();
            const month = String(startDate.getMonth() + 1).padStart(2, '0');
            const day = String(startDate.getDate()).padStart(2, '0');
            const hours = String(startDate.getHours()).padStart(2, '0');
            const minutes = String(startDate.getMinutes()).padStart(2, '0');

            const formattedEndTime = `${year}-${month}-${day}T${hours}:${minutes}`;

            setEndTime(formattedEndTime);
        }
    };

    return (
        <div className="sessions">
            {/* Lista izquierda */}
            <div className="sessions-list">
                <div className="list-title">
                    <p>Clases</p>
                </div>

                <div className="list-classes">
                    {groups.length === 0 && <p>No hay alumnos asignados</p>}
                    {groups.map((group) => (
                        <div
                            key={group.id}
                            className={`class-item ${selected?.id === group.id ? "active" : ""}`}
                            onClick={() => selectGroup(group)}
                        >
                            <p>{group.idioma}</p>
                            <p>{group.student_name}</p>
                        </div>
                    ))}
                </div>
            </div>

            {/* Contenido */}
            <div className="sessions-content">
                <div className="blue-rectangle">
                    <h2>{selected?.student_name || "Sin alumno"}</h2>
                    <p>{selected?.idioma || ""}</p>
                </div>

                <div className="info-rectangle">
                    <h3>Horario de clases</h3>
                    <div className="line"></div>

                    <div className="select-hour">
                        <div className="start-time">
                            <p>Hora de inicio</p>
                            <input
                                type="datetime-local"
                                value={startTime}
                                onChange={handleStartTimeChange}
                            />
                        </div>

                        <div className="end-time">
                            <p>Hora de fin</p>
                            <input
                                type="datetime-local"
                                value={endTime}
                                onChange={(e) => setEndTime(e.target.value)}
                            />
                        </div>
                    </div>
                </div>
                <div className="save">
                    <button className="button" onClick={saveSession}>
                        Guardar Horario
                    </button>
                </div>

                {message && (
                    <p className="success-message">
                        {message}
                    </p>
                )}
            </div>
        </div>
    );
}

export default Sesiones;