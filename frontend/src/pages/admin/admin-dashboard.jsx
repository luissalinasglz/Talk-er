import { useEffect, useState } from "react";
import { apiFetch } from "./adminApi";
import "./admin-dashboard.css";

function Dashboard() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    apiFetch("/dashboard")
      .then(setData)
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="dashboard-admin"><div className="admin-content"><p style={{color:"#000"}}>Cargando...</p></div></div>;
  if (error)   return <div className="dashboard-admin"><div className="admin-content"><p style={{color:"red"}}>{error}</p></div></div>;

  const { tutores, alumnos, promedio, dias_restantes, tutorProgress, metricas, period } = data;

  const META_HORAS = 180;

  const metricsDisplay = [
    { nombre: "Calificación Promedio",          valor: metricas.promedio,        porcentaje: metricas.promedio },
    { nombre: "Tasa de Entrega de Tareas",      valor: `${metricas.tasa_entregas}%`,  porcentaje: metricas.tasa_entregas },
    { nombre: "Bitácoras Registradas",          valor: `${metricas.tasa_bitacoras}%`, porcentaje: metricas.tasa_bitacoras },
  ];

  return (
    <div className="dashboard-admin">
      <div className="admin-content">
        <div className="admin-widgets">
          <div className="admin-wid">
            <p>Tutores</p>
            <h3>{tutores}</h3>
            <p>Con alumnos activos</p>
          </div>
          <div className="admin-wid">
            <p>Alumnos</p>
            <h3>{alumnos}</h3>
            <p>En el programa</p>
          </div>
          <div className="admin-wid">
            <p>Promedio Global</p>
            <h3>{promedio ?? "—"}</h3>
            <p>Semestre en curso</p>
          </div>
          <div className="admin-wid">
            <p>Días restantes</p>
            <h3>{dias_restantes}</h3>
            <p>Semestre Actual</p>
          </div>
        </div>

        <div className="side-admin">
          <div className="left-admin">
            <div className="program">
              <p>Programa Activo</p>
              <h2>Ciclo</h2>
              <h2>{period?.name ?? "—"}</h2>
              <p>
                {period
                  ? `${new Date(period.start_date).toLocaleDateString("es-MX")} - ${new Date(period.end_date).toLocaleDateString("es-MX")}`
                  : "Sin periodo activo"}
              </p>
            </div>

            <div className="hours-count">
              <h3>Avance de horas por tutor</h3>
              {tutorProgress.length === 0 && (
                <p style={{ color: "#888" }}>Sin datos de horas aprobadas aún</p>
              )}
              {tutorProgress.map((tutor, i) => {
                const pct = Math.min(100, Math.round((tutor.horas_realizadas / META_HORAS) * 100));
                return (
                  <div key={i} className="tutor-progress">
                    <div className="circle-progress"></div>
                    <div className="tutor-progress-info">
                      <p className="tutor-progress-nombre">{tutor.nombre}</p>
                      <p className="tutor-progress-clase">
                        {tutor.idioma === "english" ? "Inglés" : tutor.idioma === "french" ? "Francés" : tutor.idioma}
                      </p>
                    </div>
                    <div className="progress-bar-container">
                      <div className="progress-bar-fill" style={{ width: `${pct}%` }}></div>
                      <p className="progress-label">{tutor.horas_realizadas}/{META_HORAS} horas</p>
                    </div>
                    <p className="progress-percent">{pct}%</p>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="right-admin">
            <h3>Métricas del Programa Actual</h3>
            {metricsDisplay.map((metrica, i) => (
              <div key={i} className="metrica-row">
                <p className="metrica-nombre">{metrica.nombre}</p>
                <div className="metrica-bar-container">
                  <div className="metrica-bar-fill" style={{ width: `${metrica.porcentaje}%` }}></div>
                </div>
                <p className="metrica-valor">{metrica.valor}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;
