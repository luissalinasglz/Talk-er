import { useEffect, useState } from "react";
import "./student-dashboard.css";
import profileWhite from "../../assets/profile-white.png";

function Dashboard() {
    const API_URL = import.meta.env.VITE_API_URL;

    const [dashboardData, setDashboardData] = useState({
        clases: [],
        tareas: [],
        sesiones: []
    });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchDashboard = async () => {
            try {
                const res = await fetch(`${API_URL}/student/dashboard`, {
                    method: "GET",
                    headers: { "Content-Type": "application/json" },
                    credentials: "include"
                });
                const data = await res.json();
                if (res.ok) {
                    setDashboardData(data);
                }
            } catch (error) {
                console.error("Error cargando dashboard:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchDashboard();
    }, []);

    // --- Helpers de Formato y Fechas ---
    const parseDBDate = (dateString) => {
    if (!dateString) return new Date();
    // No quitar la Z — dejar que el navegador convierta UTC a hora local
    return new Date(dateString.replace(' ', 'T'));
};

    const formatearFecha = (fechaObj) => {
        const opciones = { weekday: 'long', hour: 'numeric', minute: 'numeric', hour12: true };
        return fechaObj.toLocaleString('es-MX', opciones);
    };

    const formatearHora12h = (hora24) => {
        const ampm = hora24 >= 12 ? 'p.m.' : 'a.m.';
        let hora12 = hora24 % 12;
        hora12 = hora12 ? hora12 : 12;
        return `${hora12}:00 ${ampm}`;
    };

    if (loading) return <p style={{ padding: "2rem" }}>Cargando información...</p>;

    const { clases, tareas, sesiones } = dashboardData;
    const ahora = new Date();

    const sesionesParseadas = sesiones.map(s => ({
        ...s,
        inicioObj: parseDBDate(s.start_time),
        finObj: parseDBDate(s.end_time)
    }));

    const horarioHoy = sesionesParseadas.filter(s => {
        return s.inicioObj.getDate() === ahora.getDate() &&
            s.inicioObj.getMonth() === ahora.getMonth() &&
            s.inicioObj.getFullYear() === ahora.getFullYear();
    });

    const proximaSesion = sesionesParseadas.find(s => s.finObj > ahora);
        console.log("=== DEBUG DASHBOARD ===");
console.log("ahora:", ahora.toString());
sesionesParseadas.forEach(s => {
    console.log(`Sesión ${s.id}:`, {
        start_raw: s.start_time,
        inicioObj: s.inicioObj.toString(),
        finObj: s.finObj.toString(),
        inicioDate: s.inicioObj.getDate(),
        ahoraDate: ahora.getDate(),
        inicioMonth: s.inicioObj.getMonth(),
        ahoraMonth: ahora.getMonth(),
        inicioYear: s.inicioObj.getFullYear(),
        ahoraYear: ahora.getFullYear(),
        esHoy: s.inicioObj.getDate() === ahora.getDate() &&
               s.inicioObj.getMonth() === ahora.getMonth() &&
               s.inicioObj.getFullYear() === ahora.getFullYear(),
        finMayorAhora: s.finObj > ahora,
    });
});
console.log("horarioHoy:", horarioHoy);
console.log("proximaSesion:", proximaSesion);

    const obtenerRangoHoras = () => {
        if (!horarioHoy || horarioHoy.length === 0) return [8, 9, 10, 11, 12];

        const horasExtraidas = horarioHoy.map(s => s.inicioObj.getHours());
        const minHora = Math.min(...horasExtraidas);
        const maxHora = Math.max(...horasExtraidas) + 1;

        const rango = [];
        for (let i = minHora; i <= maxHora; i++) {
            rango.push(i);
        }
        return rango;
    };

    const horasDinamicas = obtenerRangoHoras();

    return (
        <div className="dashboard-student">
            <div className="student-left">
                {/* --- TUS CLASES --- */}
                <div className="groups-rectangles">
                    <h2>Tus Clases</h2>
                    <div className="general-student-rectangles">
                        {clases.length > 0 ? (
                            clases.map((clase, idx) => (
                                <div key={idx} className="group-rectangle">
                                    <h3 style={{ textTransform: "capitalize" }}>{clase.idioma}</h3>
                                    <div className="tutor-details">
                                        <p>Profesor:</p>
                                        <p>{clase.tutor_name}</p>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <p>Aún no tienes clases asignadas.</p>
                        )}
                    </div>
                </div>

                {/* --- PRÓXIMAS ENTREGAS --- */}
                <div className="next-sent">
                    <h2>Próximas Entregas</h2>
                    {tareas.length > 0 ? (
                        tareas.map((tarea, idx) => {
                            const fechaObj = parseDBDate(tarea.due_date);
                            return (
                                <div key={tarea.id} className="lessons-student">
                                    <div className={`circle-student-${idx % 2 === 0 ? 'red' : 'orange'}`}></div>
                                    <div className="lesson-sent-detail">
                                        <h4>{tarea.title}</h4>
                                        <p style={{ textTransform: "capitalize" }}>{tarea.idioma}</p>
                                        <p>Se entrega: {formatearFecha(fechaObj)}</p>
                                    </div>
                                </div>
                            );
                        })
                    ) : (
                        <p>No hay entregas próximas. ¡Descansa!</p>
                    )}
                </div>
            </div>

            <div className="student-right">
                {/* --- HORARIO DEL DÍA  --- */}
                <div className="hour-student">
                    <h2>Horario de Hoy</h2>
                    <div className="schedule-grid">
                        {horarioHoy.length > 0 ? (
                            horasDinamicas.map((hora24) => {
                                const clasesEnEstaHora = horarioHoy.filter(
                                    (s) => s.inicioObj.getHours() === hora24
                                );

                                return (
                                    <div key={hora24} className="schedule-row">
                                        <span className="schedule-hour">{formatearHora12h(hora24)}</span>
                                        <div className="schedule-slot">
                                            {clasesEnEstaHora.map((clase) => {
                                                const inicio = clase.inicioObj.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
                                                const fin = clase.finObj.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

                                                return (
                                                    <div key={clase.id} className={`schedule-event event-${clase.idioma.toLowerCase()}`} style={{ marginBottom: "5px" }}>
                                                        <p className="event-title" style={{ textTransform: "capitalize" }}>
                                                            {clase.idioma}
                                                        </p>
                                                        <p className="event-time">
                                                            {inicio} - {fin}
                                                        </p>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    </div>
                                );
                            })
                        ) : (
                            <p style={{ padding: "1rem" }}>No tienes sesiones programadas para hoy.</p>
                        )}
                    </div>
                </div>

                {/* --- PRÓXIMA SESIÓN --- */}
                <div className="next-session-student">
                    <h2>Próxima Sesión</h2>
                    {proximaSesion ? (
                        <>
                            <div className="next-session-details">
                                <img className="profile-white-student" src={profileWhite} alt="profile" />
                                <div>
                                    <h4>{proximaSesion.tutor_name}</h4>
                                    <p style={{ margin: 0, fontSize: "0.9rem", opacity: 0.8 }}>
                                        {formatearFecha(proximaSesion.inicioObj)}
                                    </p>
                                </div>
                            </div>
                            <div
                                className="session-join"
                                onClick={() => window.open(proximaSesion.session_url, "_blank")}
                                style={{ cursor: "pointer" }}
                            >
                                <p>Unirse a la reunión</p>
                            </div>
                        </>
                    ) : (
                        <p style={{ fontSize: "0.9rem", opacity: 0.8 }}>
                            No hay links de sesiones programadas a futuro.
                        </p>
                    )}
                </div>
            </div>
        </div>
    );
}

export default Dashboard;