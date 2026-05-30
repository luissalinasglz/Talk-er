import { useEffect, useState } from "react";
import "./tutor-horas.css";

// Días en español
const DIAS = ["Dom", "Lun", "Mar", "Mié", "Jue", "Vie", "Sáb"];
const MESES = [
  "enero", "febrero", "marzo", "abril", "mayo", "junio",
  "julio", "agosto", "septiembre", "octubre", "noviembre", "diciembre",
];

function formatFecha(fechaStr) {
  const d = new Date(fechaStr);
  return `${d.getDate()} de ${MESES[d.getMonth()]}`;
}

function formatHora(fechaStr) {
  const d = new Date(fechaStr);
  return d.toLocaleTimeString("es-MX", { hour: "2-digit", minute: "2-digit" });
}

function estadoBitacora(clase) {
  if (clase.approved) return "Aprobada";
  if (clase.validated) return "En revisión";
  if (clase.log_id) return "Pendiente";
  return "Sin bitácora";
}

function colorEstado(estado) {
  switch (estado) {
    case "Aprobada":   return "#4CAF50";
    case "En revisión": return "#FF9800";
    case "Pendiente":  return "#6883BA";
    default:           return "#BBBEC7";
  }
}

function Horas() {
  const API_URL = import.meta.env.VITE_API_URL;

  const [clases, setClases] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [totalHoras, setTotalHoras] = useState(0);
  const [horasAprobadas, setHorasAprobadas] = useState(0);
  const [horasMes, setHorasMes] = useState(0);
  const [sesionesMes, setSesionesMes] = useState(0);
  const [historial, setHistorial] = useState([]);

  const META_HORAS = 180;

  useEffect(() => {
    fetchClases();
  }, []);

  async function fetchClases() {
    try {
      setLoading(true);
      setError(null);

      const res = await fetch(`${API_URL}/tutor/clases`, {
        method: "GET",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
      });

      const data = await res.json();

      if (res.ok) {
        setClases(data);
        calcularMetricas(data);
      } else {
        setError(data.message || "Error obteniendo clases");
      }
    } catch (err) {
      setError("Error de conexión al cargar las horas");
      console.error("Error obteniendo clases", err);
    } finally {
      setLoading(false);
    }
  }

  function calcularMetricas(data) {
    const ahora = new Date();
    const mesActual = ahora.getMonth();
    const anioActual = ahora.getFullYear();

    let total = 0;
    let aprobadas = 0;
    let mes = 0;
    let sesionesDelMes = 0;
    const hist = [];

    data.forEach((clase) => {
      const dur = clase.duracion || 0; 
      const horas = dur / 60;

      if (clase.log_id) {
        total += horas;

        if (clase.approved) {
          aprobadas += horas;
        }

        const fecha = new Date(clase.start_time);
        if (
          fecha.getMonth() === mesActual &&
          fecha.getFullYear() === anioActual
        ) {
          mes += horas;
          sesionesDelMes++;
        }

        hist.push({
          fecha: formatFecha(clase.start_time),
          hora: formatHora(clase.start_time),
          actividad: clase.title || "Registro de bitácora",
          idioma: clase.idioma === "english" ? "Inglés" : "Francés",
          horas: Math.round(horas * 10) / 10,
          estado: estadoBitacora(clase),
          alumno: clase.nombre_alumno,
        });
      }
    });

    setTotalHoras(Math.round(aprobadas * 10) / 10);
    setHorasAprobadas(Math.round(aprobadas * 10) / 10);
    setHorasMes(Math.round(mes * 10) / 10);
    setSesionesMes(sesionesDelMes);
    setHistorial(hist);
  }

  const porcentaje = Math.min((horasAprobadas / META_HORAS) * 100, 100);
  const radio = 34;
  const circunferencia = 2 * Math.PI * radio;
  const arco = circunferencia * (porcentaje / 100);

  const mesActual = MESES[new Date().getMonth()];
  const anioActual = new Date().getFullYear();

  if (loading) {
    return (
      <div className="horas" style={{ padding: "2rem", color: "black" }}>
        Cargando horas...
      </div>
    );
  }

  if (error) {
    return (
      <div className="horas" style={{ padding: "2rem", color: "red" }}>
        {error}
      </div>
    );
  }

  return (
    <div className="horas">
      <div className="horas-side">
        {/* Columna izquierda */}
        <div className="horas-left">
          <div className="info-hours">
            <div className="circle-hours">
              <svg width="80" height="80" viewBox="0 0 80 80">
                <circle
                  cx="40" cy="40" r={radio}
                  fill="#252467"
                  stroke="#555588"
                  strokeWidth="5"
                />
                <circle
                  cx="40" cy="40" r={radio}
                  fill="none"
                  stroke="#93E490"
                  strokeWidth="5"
                  strokeDasharray={`${arco} ${circunferencia}`}
                  strokeLinecap="round"
                  transform="rotate(-90 40 40)"
                />
                <text
                  x="40" y="46"
                  textAnchor="middle"
                  fill="white"
                  fontSize="18"
                  fontWeight="bold"
                >
                  {horasAprobadas}
                </text>
              </svg>
            </div>
            <div className="total-hours">
              <h3>{horasAprobadas} de {META_HORAS} horas acreditadas</h3>
              <p>Periodo actual</p>
            </div>
          </div>

          <div className="count-hours">
            <h2>Desglose por categoría</h2>
            <div className="count-data">
              <p>Bitácoras registradas</p>
              <div className="percentage-hours">
                <div
                  className="line-percentage"
                  style={{ width: `${Math.min((horasAprobadas / META_HORAS) * 100, 100)}%` }}
                />
              </div>
              <p>{horasAprobadas}hrs</p>
            </div>
            <div className="count-data">
              <p>Carta</p>
              <div className="percentage-hours" />
              <p>0hrs</p>
            </div>
            <div className="count-data">
              <p>Video</p>
              <div className="percentage-hours" />
              <p>0hrs</p>
            </div>
          </div>
        </div>

        {/* Columna derecha */}
        <div className="horas-right">
          <div className="advance">
            <p>Horas completadas este mes</p>
            <p style={{ textTransform: "capitalize" }}>
              {mesActual} {anioActual}
            </p>
            <h1>{horasMes}hrs</h1>
          </div>
          <div className="advance sessions-days">
            <p>Sesiones impartidas</p>
            <p style={{ textTransform: "capitalize" }}>
              {mesActual} {anioActual}
            </p>
            <h1>{sesionesMes}</h1>
          </div>
        </div>
      </div>

      {/* Historial */}
      <div className="hours-record">
        <p className="category-title">Historial de horas</p>

        {historial.length === 0 ? (
          <p style={{ color: "#BBBEC7", marginTop: "1rem" }}>
            No hay bitácoras registradas aún.
          </p>
        ) : (
          <div className="category-total">
            <div className="category-data">
              <p><strong>Fecha</strong></p>
              {historial.map((h, i) => (
                <p key={i}>{h.fecha}</p>
              ))}
            </div>
            <div className="category-data">
              <p><strong>Actividad</strong></p>
              {historial.map((h, i) => (
                <p key={i}>{h.actividad}</p>
              ))}
            </div>
            <div className="category-data">
              <p><strong>Alumno</strong></p>
              {historial.map((h, i) => (
                <p key={i}>{h.alumno}</p>
              ))}
            </div>
            <div className="category-data">
              <p><strong>Idioma</strong></p>
              {historial.map((h, i) => (
                <p key={i}>{h.idioma}</p>
              ))}
            </div>
            <div className="category-data">
              <p><strong>Horas</strong></p>
              {historial.map((h, i) => (
                <p key={i}>{h.horas} hrs</p>
              ))}
            </div>
            <div className="category-data">
              <p><strong>Estado</strong></p>
              {historial.map((h, i) => (
                <p key={i} style={{ color: colorEstado(h.estado), fontWeight: "600" }}>
                  {h.estado}
                </p>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default Horas;
