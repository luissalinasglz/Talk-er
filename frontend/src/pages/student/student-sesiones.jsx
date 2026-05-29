import React, { useEffect, useState } from "react";
import "./student-sesiones.css";
import video from "../../assets/video.png";
import profileBlue from "../../assets/profile-blue.png";

const API_URL = import.meta.env.VITE_API_URL;

const parseDBDate = (dateString) => {
    if (!dateString) return new Date();
    const cleanString = dateString.endsWith('Z') ? dateString.slice(0, -1) : dateString;
    return new Date(cleanString.replace(' ', 'T'));
};

function StudentSesiones() {
    const [sesiones, setSesiones] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetch(`${API_URL}/student/sesiones`, {
            credentials: "include",
        })
            .then((res) => res.json())
            .then((data) => setSesiones(Array.isArray(data) ? data : []))
            .catch((err) => console.error("Error cargando sesiones:", err))
            .finally(() => setLoading(false));
    }, []);

    const ahora = new Date();

    const getSunday = (date) => {
        const day = new Date(date);
        day.setDate(day.getDate() - day.getDay());
        day.setHours(0, 0, 0, 0);
        return day;
    };

    const sunday = getSunday(ahora);
    const saturday = new Date(sunday);
    saturday.setDate(sunday.getDate() + 6);
    saturday.setHours(23, 59, 59, 999);

    const weekDays = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];

    const calendarDays = weekDays.map((name, i) => {
        const day = new Date(sunday);
        day.setDate(sunday.getDate() + i);
        return { name, number: day.getDate(), dateObj: day };
    });

    const weekTitle = `Semana ${sunday.getDate()} de ${sunday.toLocaleString('es-MX', { month: 'long' })} al ${saturday.getDate()} de ${saturday.toLocaleString('es-MX', { month: 'long' })}`;

    const sesionesSemana = sesiones
        .map((s) => ({ ...s, startObj: parseDBDate(s.start_time), endObj: parseDBDate(s.end_time) }))
        .filter((s) => s.startObj >= sunday && s.startObj <= saturday)
        .sort((a, b) => a.startObj - b.startObj);

    const proximaSesion = sesionesSemana.filter((s) => s.endObj > ahora)[0] || null;

    const tutoresUnicos = Array.from(
        new Map(sesionesSemana.map((s) => [s.tutor_name, s.idioma])),
        ([name, idioma]) => ({ name, idioma })
    );

    const horasCalendario = [8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20];

    const getSesionParaCelda = (diaIndice, hora) =>
        sesionesSemana.find(
            (s) => s.startObj.getDay() === diaIndice && s.startObj.getHours() === hora
        );

    if (loading) return <p>Cargando sesiones...</p>;

    return (
        <div className="sesiones-student">

            <div className="session-student-general">
                <div className="session-details">
                    <div className="image-video">
                        <img className="video-student" src={video} alt="video" />
                    </div>
                    <div className="session-details-student">
                        <p>Próxima sesión</p>
                        {proximaSesion ? (
                            <>
                                <h2>{proximaSesion.idioma}</h2>
                                <p>
                                    {proximaSesion.startObj.toLocaleDateString('es-MX', { weekday: 'long' })}{' '}
                                    {proximaSesion.startObj.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })} -{' '}
                                    {proximaSesion.endObj.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })}
                                </p>
                            </>
                        ) : (
                            <>
                                <h2>Sin sesiones</h2>
                                <p>No hay próximas sesiones programadas.</p>
                            </>
                        )}
                    </div>
                </div>
                {proximaSesion && (
                    <a href={proximaSesion.session_url} target="_blank" rel="noreferrer" className="link-join-student" style={{ textDecoration: 'none' }}>
                        <h3>Unirse a la reunión</h3>
                    </a>
                )}
            </div>

            <div className="student-side">

                <div className="left-session-student">
                    <h3>{weekTitle}</h3>
                    <table className="calendario">
                        <thead>
                            <tr>
                                <th></th>
                                {calendarDays.map((day, i) => (
                                    <th key={i}>{day.name} {day.number}</th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {horasCalendario.map((hora) => (
                                <tr key={hora}>
                                    <td className="hora">{hora > 12 ? hora - 12 : hora}:00 {hora >= 12 ? 'pm' : 'am'}</td>
                                    {calendarDays.map((_, diaIndice) => {
                                        const sesion = getSesionParaCelda(diaIndice, hora);
                                        return (
                                            <td key={diaIndice}>
                                                {sesion && (
                                                    <div className="evento">
                                                        <p>{sesion.idioma}</p>
                                                        <p>
                                                            {sesion.startObj.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })} -{' '}
                                                            {sesion.endObj.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })}
                                                        </p>
                                                    </div>
                                                )}
                                            </td>
                                        );
                                    })}
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                <div className="right-session-student">

                    <div className="student-tutors">
                        <h2>Mis tutores</h2>
                        {tutoresUnicos.length > 0 ? tutoresUnicos.map((tutor, i) => (
                            <div className="tutor-student" key={i}>
                                <img className="profileblue" src={profileBlue} alt="profileblue" />
                                <div className="tutor-detail-student">
                                    <h3>Tutor {tutor.name}</h3>
                                    <p>{tutor.idioma}</p>
                                </div>
                            </div>
                        )) : (
                            <p style={{ marginTop: '10px', color: '#666' }}>No hay tutores esta semana.</p>
                        )}
                    </div>

                    <div className="student-class-week">
                        <h2>Sesiones de esta semana</h2>
                        {sesionesSemana.length > 0 ? sesionesSemana.map((s, i) => (
                            <div className="week-student" key={i}>
                                <div className="circle-student-class"></div>
                                <div className="student-week-detail">
                                    <h3>
                                        {s.idioma} - {s.startObj.toLocaleDateString('es-MX', { weekday: 'short', day: 'numeric', month: 'long' })}
                                    </h3>
                                    <p>
                                        {s.startObj.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })} -{' '}
                                        {s.endObj.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })}
                                    </p>
                                </div>
                            </div>
                        )) : (
                            <p style={{ marginTop: '10px', color: '#666' }}>No hay clases agendadas esta semana.</p>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}

export default StudentSesiones;