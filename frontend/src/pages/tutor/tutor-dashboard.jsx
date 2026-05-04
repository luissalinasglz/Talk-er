import React, { useState, useEffect } from "react";
import "./tutor-dashboard.css";

function Dashboard() {
  const [horarios, setHorarios] = useState([]);

  const API_URL = import.meta.env.VITE_API_URL;

  useEffect(() => {
    const fetchHorarios = async () => {
      try {
        const response = await fetch(`${API_URL}/tutor/horario`, {
          method: "GET",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
        });
        if (response.ok) {
          const data = await response.json();
          setHorarios(data);
        }
      } catch (error) {
        console.error("Error al cargar horarios", error);
      }
    };
    fetchHorarios();
  }, []);

  const getSunday = (date) => {
    const day = new Date(date);
    day.setDate(day.getDate() - day.getDay());
    return day;
  };

  const today = new Date();
  const sunday = getSunday(today);
  const weekDays = ["Domingo", "Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado"];

  const calendarDays = weekDays.map((name, i) => {
    const day = new Date(sunday);
    day.setDate(sunday.getDate() + i);
    return {
      name,
      number: day.getDate(),
      month: day.toLocaleDateString("es-MX", { month: "short" }),
    };
  });

  const firstDay = new Date(sunday);
  const lastDay = new Date(sunday);
  lastDay.setDate(sunday.getDate() + 6);
  const weekTitle = `Semana ${firstDay.getDate()} de ${firstDay.toLocaleString("es-MX", { month: "long" })} al ${lastDay.getDate()} de ${lastDay.toLocaleString("es-MX", { month: "long" })}`;

  const formatTime = (timeString) => {
    if (!timeString) return "";
    const [hour, minute] = timeString.split(":");
    const date = new Date();
    date.setHours(hour, minute);
    return date.toLocaleTimeString("es-MX", { hour: "numeric", minute: "2-digit", hour12: true });
  };

  const clasesAgrupadas = horarios.reduce((acc, clase) => {
    if (!acc[clase.student_name]) acc[clase.student_name] = [];
    acc[clase.student_name].push(
      `${weekDays[clase.dia_semana]} de ${formatTime(clase.hora_inicio)} a ${formatTime(clase.hora_fin)}`
    );
    return acc;
  }, {});

  let minHour = 8;
  let maxHour = 19;

  if (horarios.length > 0) {
    const startHours = horarios.map((h) => parseInt(h.hora_inicio.split(":")[0]));
    minHour = Math.min(...startHours);

    const endHours = horarios.map((h) => {
      const [hour, min] = h.hora_fin.split(":").map(Number);
      return min === 0 ? hour - 1 : hour;
    });
    maxHour = Math.max(...endHours);
  }

  const horasCalendario = [];
  for (let i = minHour; i <= maxHour; i++) {
    horasCalendario.push(i);
  }

  const formatHour = (hora) => {
    const h = hora === 0 || hora === 12 ? 12 : hora > 12 ? hora - 12 : hora;
    const period = hora >= 12 ? "pm" : "am";
    return `${h}:00 ${period}`;
  };

  const renderCalendarBody = () => {
    const celdasSaltadas = {};

    return horasCalendario.map((hora) => (
      <tr key={hora}>
        <td className="hora">{formatHour(hora)}</td>

        {weekDays.map((_, diaIndex) => {
          if (celdasSaltadas[`${diaIndex}-${hora}`]) return null;

          const clase = horarios.find(
            (h) =>
              h.dia_semana === diaIndex &&
              parseInt(h.hora_inicio.split(":")[0]) === hora
          );

          if (clase) {
            const horaInicio = parseInt(clase.hora_inicio.split(":")[0]);
            const horaFin = parseInt(clase.hora_fin.split(":")[0]);
            const span = horaFin - horaInicio || 1;

            for (let i = 1; i < span; i++) {
              celdasSaltadas[`${diaIndex}-${hora + i}`] = true;
            }

            return (
              <td key={diaIndex} rowSpan={span}>
                <div className="evento">
                  <p>{clase.student_name}</p>
                  <p>{formatTime(clase.hora_inicio)} - {formatTime(clase.hora_fin)}</p>
                </div>
              </td>
            );
          }

          return <td key={diaIndex}></td>;
        })}
      </tr>
    ));
  };

  const studentEntries = Object.entries(clasesAgrupadas);

  return (
    <div className="dashboard">
      <div className="dashboard-content">
        <div className="left-rectangles">

          <div className="rectangle class-orden">
            <h3>Mis clases</h3>
            <div className="content">
              {studentEntries.length === 0 ? (
                <p className="empty-message">No tienes clases programadas.</p>
              ) : (
                studentEntries.map(([studentName, clases], index) => (
                  <React.Fragment key={index}>
                    <div className="info">
                      <div className="circle"></div>
                      <div className="side">
                        <p>{studentName}</p>
                        {clases.map((horario, i) => (
                          <p key={i} className="groups">{horario}</p>
                        ))}
                      </div>
                    </div>
                    {index < studentEntries.length - 1 && (
                      <div className="line-separate"></div>
                    )}
                  </React.Fragment>
                ))
              )}
            </div>
          </div>

          <div className="rectangle">
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
              <tbody>{renderCalendarBody()}</tbody>
            </table>
          </div>
        </div>

        <div className="right-rectangles">

          <div className="rectangle acreditadas">
            <h5>Horas acreditadas</h5>
            <div className="content">
              <p className="count">90/180 hrs</p>
              <div className="content-bar">
                <div className="percentage-bar"></div>
              </div>
              <div className="percentage">
                <p>50% Completado</p>
                <p>Faltan 90hrs</p>
              </div>
            </div>
          </div>

          <div className="rectangle grow">
            <h3>Por Calificar</h3>
            <div className="content">
              {[
                { title: "Lección del verbo to be", group: "Inglés A" },
                { title: "Examen de vocabulario", group: "Inglés B" },
                { title: "Lección del pasado simple", group: "Inglés B" },
              ].map((lesson, i) => (
                <div key={i} className="lessons">
                  <div className="circle"></div>
                  <div className="side">
                    <p>{lesson.title}</p>
                    <p className="groups">{lesson.group}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;