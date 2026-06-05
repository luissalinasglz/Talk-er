import { useEffect, useState } from "react";
import { apiFetch } from "./adminApi";
import "./admin-estadistica.css";

function AdminEstadisticas() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedPeriodIdx, setSelectedPeriodIdx] = useState(0);

  useEffect(() => {
    apiFetch("/estadisticas")
      .then(setData)
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="estadisticas-admin"><div className="estadistic-line"/><p style={{padding:"2rem",color:"#000"}}>Cargando...</p></div>;
  if (error)   return <div className="estadisticas-admin"><div className="estadistic-line"/><p style={{padding:"2rem",color:"red"}}>{error}</p></div>;

  const { periods, tutorHoras } = data;
  const selected = periods[selectedPeriodIdx] ?? {};

  const formatDate = (d) =>
    d ? new Date(d).toLocaleDateString("es-MX", { day: "numeric", month: "long", year: "numeric" }) : "—";

  const idioma = (i) =>
    i === "english" ? "Inglés" : i === "french" ? "Francés" : i;

  return (
    <div className="estadisticas-admin">
      <div className="estadistic-line" />

      <div className="estadistic">
        {/* LEFT PANEL — period list */}
        <div className="estadistic-left">
          <h3>Programas (Ciclos Escolares)</h3>
          <div className="programs-estadistic">
            {periods.map((p, i) => (
              <div
                key={p.id}
                className={`date-estadistic${i === selectedPeriodIdx ? " active-estadistic" : ""}`}
                onClick={() => setSelectedPeriodIdx(i)}
                style={{ cursor: "pointer" }}
              >
                <h4>{p.name}</h4>
                <p>{formatDate(p.start_date)} – {formatDate(p.end_date)}</p>
              </div>
            ))}
          </div>
        </div>

        {/* RIGHT PANEL */}
        <div className="estadistic-right">
          {/* Summary banner */}
          <div className="general-estadistic">
            <div className="program-info">
              <p>Programa Seleccionado</p>
              <h2>Ciclo {selected.name}</h2>
              <p>{formatDate(selected.start_date)} – {formatDate(selected.end_date)}</p>
              <p>{selected.alumnos} alumnos – {selected.tutores} tutores</p>
            </div>
            <div className="general-estadistic-info">
              <div className="estadistic-info">
                <h2>{selected.calificacion ?? "—"}</h2>
                <p>Calificación</p>
              </div>
              <div className="estadistic-info">
                <h2>{selected.tasa_entregas ?? 0}%</h2>
                <p>Entregas</p>
              </div>
              <div className="estadistic-info">
                <h2>{selected.pct_horas ?? 0}%</h2>
                <p>Hrs. Tutores</p>
              </div>
            </div>
          </div>

          {/* Metrics table */}
          <div className="stats-table-card">
            <h2>Evolución de métricas por programa (ciclo escolar)</h2>
            <table className="stats-table">
              <thead>
                <tr>
                  <th>Programa (Ciclo escolar)</th>
                  <th>Calificación Prom.</th>
                  <th>Tasa de Entrega</th>
                  <th>Horas Tutores</th>
                </tr>
              </thead>
              <tbody>
                {periods.map((p, i) => (
                  <tr key={p.id} style={i === selectedPeriodIdx ? { background: "#F0F5FF" } : {}}>
                    <td>
                      <p className="ciclo-nombre">{p.name}</p>
                      <p className="ciclo-detalle">{p.alumnos} alumnos – {p.tutores} tutores</p>
                    </td>
                    <td>
                      <p className="stat-num">{p.calificacion ?? "—"}</p>
                      <div className="mini-bar-container">
                        <div className="mini-bar-fill dark" style={{ width: `${p.calificacion ?? 0}%` }} />
                      </div>
                    </td>
                    <td>
                      <p className="stat-num">{p.tasa_entregas}%</p>
                      <div className="mini-bar-container">
                        <div className="mini-bar-fill dark" style={{ width: `${p.tasa_entregas}%` }} />
                      </div>
                    </td>
                    <td>
                      <p className="stat-num">{p.pct_horas}%</p>
                      <div className="mini-bar-container">
                        <div className="mini-bar-fill dark" style={{ width: `${p.pct_horas}%` }} />
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Tutor hours table */}
          <div className="stats-table-card">
            <h2>Avance de horas acreditadas por tutor</h2>
            <table className="stats-table">
              <thead>
                <tr>
                  <th>Tutor</th>
                  <th>Idioma</th>
                  <th>Horas / Meta</th>
                  <th>Progreso</th>
                  <th>Estado</th>
                </tr>
              </thead>
              <tbody>
                {tutorHoras.length === 0 && (
                  <tr><td colSpan={5} style={{ color: "#888", padding: "1rem" }}>Sin datos</td></tr>
                )}
                {tutorHoras.map((t, i) => (
                  <tr key={i}>
                    <td><p className="ciclo-nombre">{t.nombre}</p></td>
                    <td><p className="ciclo-detalle">{idioma(t.idiomas)}</p></td>
                    <td><p className="stat-num">{t.horas_acreditadas} / {t.meta_horas}</p></td>
                    <td>
                      <div className="progress-row">
                        <div className="mini-bar-container">
                          <div className="mini-bar-fill dark" style={{ width: `${t.pct}%` }} />
                        </div>
                        <p className="progress-pct">{t.pct}%</p>
                      </div>
                    </td>
                    <td>
                      <div className="estado-badge">
                        {t.pct >= 100 ? "Completado" : "En marcha"}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}

export default AdminEstadisticas;
