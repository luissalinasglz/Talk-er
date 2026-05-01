import { useEffect, useState } from "react";
import "./tutor-sesiones.css";

function Sesiones() {
    const [groups, setGroups] = useState([]);
    const [selectedGroup, setSelectedGroup] = useState(null);
    
    const [selectedDays, setSelectedDays] = useState([]);
    const [startTime, setStartTime] = useState("");
    const [endTime, setEndTime] = useState("");
    const [message, setMessage] = useState("");

    const weekDays = [
        { id: 1, name: "Lunes" },
        { id: 2, name: "Martes" },
        { id: 3, name: "Miércoles" },
        { id: 4, name: "Jueves" },
        { id: 5, name: "Viernes" }
    ];

    useEffect(() => {
        fetchGroups();
    }, []);

    async function fetchGroups() {
        try {
            const res = await fetch("http://localhost:3000/v1/tutor/my-groups", {
                method: "GET",
                headers: { "Content-Type": "application/json" },
                credentials: "include",
            });
            if (res.ok) {
                const data = await res.json();
                setGroups(data);
                if (data.length > 0) setSelectedGroup(data[0]);
            }
        } catch (error) {
            console.error("Error al cargar grupos", error);
        }
    }

    const toggleDay = (dayId) => {
        if (selectedDays.includes(dayId)) {
            setSelectedDays(selectedDays.filter(d => d !== dayId));
        } else {
            setSelectedDays([...selectedDays, dayId]);
        }
    };

    const handleStartTimeChange = (e) => {
        const newStartTime = e.target.value;
        setStartTime(newStartTime);
        console.log("Hora inicio: ", startTime);

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
            console.log("Hora final: ",formattedEndTime);
        }
    }

    async function guardarHorario() {
        if (!selectedGroup) return setMessage("Selecciona un alumno.");
        if (selectedDays.length === 0) return setMessage("Selecciona al menos un día.");
        if (!startTime || !endTime) return setMessage("Ingresa hora de inicio y fin.");

        try {
            const body = {
                group_id: selectedGroup.id,
                dias: selectedDays,
                hora_inicio: startTime,
                hora_fin: endTime
            };

            const res = await fetch("http://localhost:3000/v1/tutor/horarios", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                credentials: "include",
                body: JSON.stringify(body)
            });
            console.log("Días seleccionados: ",selectedDays);

            const data = await res.json();
            if (res.ok) {
                setMessage("¡Horario guardado correctamente!");
                setSelectedDays([]);
                setStartTime("");
                setEndTime("");
            } else {
                setMessage(data.message || "Error al guardar");
            }
        } catch (error) {
            setMessage("Error de conexión al guardar el horario.");
        }
    }

    return (
        <div className="sessions">
            <div className="sessions-list">
                <div className="list-title">
                    <p>Alumnos Asignados</p>
                </div>
                <div className="list-classes">
                    {groups.map((group) => (
                        <div 
                            key={group.id} 
                            className={`class-item ${selectedGroup?.id === group.id ? "active" : ""}`}
                            onClick={() => {
                                setSelectedGroup(group);
                                setMessage("");
                            }}
                        >
                            <p>{group.idioma}</p>
                            <p className="info-student">{group.student_name}</p>
                        </div>
                    ))}
                </div>
            </div>

            <div className="sessions-content">
                <div className="blue-rectangle">
                    <h2>{selectedGroup?.student_name || "Sin alumno"}</h2>
                    <p>{selectedGroup?.idioma || ""}</p>
                </div>

                <div className="info-rectangle">
                    <h3>Horario Fijo de Clases</h3>
                    <div className="line"></div>
                    
                    <div className="select-day">
                        <p>Días de la semana</p>
                        <div className="weekdays">
                            {weekDays.map(day => (
                                <p 
                                    key={day.id}
                                    className={`day ${selectedDays.includes(day.id) ? "active" : ""}`}
                                    onClick={() => toggleDay(day.id)}
                                >
                                    {day.name}
                                </p>
                            ))}
                        </div>
                    </div>

                    <div className="select-hour">
                        <div className="start-time">
                            <p>Hora de inicio</p>
                            <div className="time">
                                <input 
                                    type="time" 
                                    value={startTime}
                                    onChange={handleStartTimeChange}
                                />
                            </div>
                        </div>
                        <div className="end-time">
                            <p>Hora de fin</p>
                            <div className="time">
                                <input 
                                    type="time" 
                                    value={endTime}
                                    onChange={(e) => setEndTime(e.target.value)}
                                />
                            </div>
                        </div>
                    </div>

                    {message && <p style={{ color: "#252467", marginTop: "1rem", fontWeight: "bold" }}>{message}</p>}

                    <div className="save">
                        <div className="button" onClick={guardarHorario} style={{ cursor: 'pointer' }}>
                            <p>Guardar Horario</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default Sesiones;