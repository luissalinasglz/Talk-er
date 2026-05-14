import { useEffect, useState } from "react";
import "./tutor-sesiones.css";

function Sesiones() {
    const [groups, setGroups] = useState([]);
    const [selectedGroup, setSelectedGroup] = useState(null);

    const [selectedDays, setSelectedDays] = useState([]);
    const [startTime, setStartTime] = useState("");
    const [endTime, setEndTime] = useState("");
    const [message, setMessage] = useState("");

    const [isCustom, setIsCustom] = useState(false);
    const [customTimes, setCustomTimes] = useState({});

    const weekDays = [
        { id: 1, name: "Lunes" },
        { id: 2, name: "Martes" },
        { id: 3, name: "Miércoles" },
        { id: 4, name: "Jueves" },
        { id: 5, name: "Viernes" },
    ];

    const API_URL = import.meta.env.VITE_API_URL;

    useEffect(() => {
        fetchGroups();
    }, []);

    async function fetchGroups() {
        try {
            const res = await fetch(`${API_URL}/tutor/my-groups`, {
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

    const calculateEndTime = (startStr) => {
        if (!startStr) return "";
        const [hours, minutes] = startStr.split(":");
        const date = new Date();
        date.setHours(parseInt(hours));
        date.setMinutes(parseInt(minutes));
        date.setHours(date.getHours() + 1);
        return `${String(date.getHours()).padStart(2, "0")}:${String(date.getMinutes()).padStart(2, "0")}`;
    };

    const toggleDay = (dayId) => {
        if (selectedDays.includes(dayId)) {
            setSelectedDays(selectedDays.filter((d) => d !== dayId));
        } else {
            setSelectedDays([...selectedDays, dayId]);
            if (!customTimes[dayId]) {
                setCustomTimes((prev) => ({ ...prev, [dayId]: { start: "", end: "" } }));
            }
        }
    };

    const handleStartTimeChange = (e) => {
        const val = e.target.value;
        setStartTime(val);
        setEndTime(calculateEndTime(val));
    };

    const handleCustomTimeChange = (dayId, field, value) => {
        setCustomTimes((prev) => {
            const updatedDay = { ...prev[dayId], [field]: value };
            if (field === "start" && value) {
                updatedDay.end = calculateEndTime(value);
            }
            return { ...prev, [dayId]: updatedDay };
        });
    };

    async function guardarHorario() {
        if (!selectedGroup) return setMessage("Selecciona un alumno.");
        if (selectedDays.length === 0) return setMessage("Selecciona al menos un día.");

        let horariosPayload = [];

        if (isCustom) {
            const faltanHoras = selectedDays.some(
                (d) => !customTimes[d]?.start || !customTimes[d]?.end
            );
            if (faltanHoras)
                return setMessage("Ingresa las horas para todos los días seleccionados.");

            horariosPayload = selectedDays.map((day) => ({
                dia: day,
                hora_inicio: customTimes[day].start,
                hora_fin: customTimes[day].end,
            }));
        } else {
            if (!startTime || !endTime) return setMessage("Ingresa hora de inicio y fin.");

            horariosPayload = selectedDays.map((day) => ({
                dia: day,
                hora_inicio: startTime,
                hora_fin: endTime,
            }));
        }

        try {
            const res = await fetch(`${API_URL}/tutor/horarios`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                credentials: "include",
                body: JSON.stringify({ group_id: selectedGroup.id, horarios: horariosPayload }),
            });

            const data = await res.json();
            if (res.ok) {
                setMessage("¡Horario guardado correctamente!");
                setSelectedDays([]);
                setStartTime("");
                setEndTime("");
                setCustomTimes({});
            } else {
                setMessage(data.message || "Error al guardar");
            }
        } catch {
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
                        <div className="select-day__header">
                            <p>Días de la semana</p>
                            <label className="custom-toggle">
                                <input
                                    type="checkbox"
                                    checked={isCustom}
                                    onChange={() => setIsCustom(!isCustom)}
                                />
                                <span className="toggle-track">
                                    <span className="toggle-thumb"></span>
                                </span>
                                Horario diferente por día
                            </label>
                        </div>

                        <div className="weekdays">
                            {weekDays.map((day) => (
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

                    {!isCustom && (
                        <div className="select-hour">
                            <div className="start-time">
                                <p>Hora de inicio</p>
                                <div className="time">
                                    <input type="time" value={startTime} onChange={handleStartTimeChange} />
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
                    )}

                    {isCustom && selectedDays.length > 0 && (
                        <div className="custom-times">
                            {selectedDays.map((dayId) => {
                                const dayName = weekDays.find((d) => d.id === dayId)?.name;
                                return (
                                    <div key={dayId} className="select-hour custom-times__row">
                                        <p className="custom-times__label">{dayName}</p>
                                        <div className="start-time">
                                            <div className="time">
                                                <input
                                                    type="time"
                                                    value={customTimes[dayId]?.start || ""}
                                                    onChange={(e) =>
                                                        handleCustomTimeChange(dayId, "start", e.target.value)
                                                    }
                                                />
                                            </div>
                                        </div>
                                        <div className="end-time">
                                            <div className="time">
                                                <input
                                                    type="time"
                                                    value={customTimes[dayId]?.end || ""}
                                                    onChange={(e) =>
                                                        handleCustomTimeChange(dayId, "end", e.target.value)
                                                    }
                                                />
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}

                    {message && <p className="form-message">{message}</p>}

                    <div className="save">
                        <button className="button" onClick={guardarHorario}>
                            Guardar Horario
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default Sesiones;