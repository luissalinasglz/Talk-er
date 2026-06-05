import { useEffect, useState } from "react";
import { apiFetch } from "./adminApi";
import "./admin-horas.css";

function AdminHoras() {
  const [config, setConfig]       = useState(null);
  const [loading, setLoading]     = useState(true);
  const [error, setError]         = useState(null);
  const [actividades, setActividades] = useState([]);
  const [feedback, setFeedback]   = useState(null);
  const [saving, setSaving]       = useState(false);

  useEffect(() => {
    apiFetch("/horas/config")
      .then((data) => {
        setConfig(data);
        setActividades(data.actividades.map((a) => ({ ...a })));
      })
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  const activePeriod = config?.periods?.[0];

  const handleSaveActividades = async () => {
    if (!activePeriod) return;
    const total = actividades.reduce((s, a) => s + Number(a.porcentaje), 0);
    if (total !== 100) {
      setFeedback({ type: "err", msg: `Los porcentajes suman ${total}%, deben sumar 100%` });
      return;
    }
    setSaving(true);
    setFeedback(null);
    try {
      await apiFetch("/horas/actividades", {
        method: "PUT",
        body: JSON.stringify({
          period_id: activePeriod.id,
          session_log_percentage: Number(actividades[0]?.porcentaje ?? 80),
          letter_percentage:      Number(actividades[1]?.porcentaje ?? 10),
          video_percentage:       Number(actividades[2]?.porcentaje ?? 10),
        }),
      });
      setFeedback({ type: "ok", msg: "Porcentajes guardados correctamente" });
    } catch (e) {
      setFeedback({ type: "err", msg: e.message });
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="horas-admin"><p style={{ padding: "2rem", color: "#000" }}>Cargando...</p></div>;
  if (error)   return <div className="horas-admin"><p style={{ padding: "2rem", color: "red" }}>{error}</p></div>;

  const metas = config?.metas ?? [];

  return (
    <div className="horas-admin">
      {/* LEFT: hour goals per program type */}
      <div className="horas-left">
        <h2>Meta de horas por programa</h2>
        <p>
          Define cuántas horas debe acreditar un tutor en el periodo según el tipo de programa.
          Esto se refleja en el progreso visible en su dashboard y en los reportes del revisor.
        </p>

        {metas.map((m, i) => (
          <div key={i} className="hours-period">
            <div className="period-detail">
              <h4>{m.tipo}</h4>
            </div>
            <div className="select-hours">
              <p>Meta:</p>
              <input
                type="number"
                defaultValue={m.meta}
                style={{ width: "80px" }}
              />
            </div>
            <div className="select-hours">
              <p>Periodo:</p>
              <input
                type="text"
                defaultValue={activePeriod?.name ?? "—"}
                readOnly
                style={{ width: "140px", background: "#f5f5f5" }}
              />
            </div>
          </div>
        ))}

        <div className="save-activity-btn" style={{ cursor: "pointer" }}>
          <p>Guardar</p>
        </div>
      </div>

      {/* RIGHT: activity percentages */}
      <div className="horas-right">
        <h2>Valor de cada Actividad</h2>
        <p>
          Define cuántos porcentaje representa cada tipo de actividad del tutor para
          las horas acreditadas del periodo activo: <strong>{activePeriod?.name ?? "—"}</strong>
        </p>

        {feedback && (
          <p style={{ color: feedback.type === "ok" ? "green" : "red", marginTop: "0.5rem" }}>
            {feedback.msg}
          </p>
        )}

        <div className="activity-header">
          <span className="col-activity">Actividad</span>
          <span className="col-pct">Porcentaje del total</span>
        </div>

        {actividades.map((act, i) => (
          <div key={i} className="activity-row">
            <span className="col-activity">{act.nombre}</span>
            <input
              type="number"
              className="activity-input"
              value={act.porcentaje}
              min={0}
              max={100}
              onChange={(e) => {
                const updated = [...actividades];
                updated[i] = { ...updated[i], porcentaje: Number(e.target.value) };
                setActividades(updated);
              }}
            />
            <span style={{ color: "#888", fontSize: "0.85rem" }}>%</span>
          </div>
        ))}

        <p style={{ color: "#BBBEC7", fontSize: "0.8rem", marginTop: "0.5rem" }}>
          Total: {actividades.reduce((s, a) => s + Number(a.porcentaje), 0)}% (debe ser 100%)
        </p>

        <div
          className="save-activity-btn"
          onClick={!saving ? handleSaveActividades : undefined}
          style={{ cursor: saving ? "not-allowed" : "pointer", opacity: saving ? 0.6 : 1 }}
        >
          <p>{saving ? "Guardando..." : "Guardar"}</p>
        </div>
      </div>
    </div>
  );
}

export default AdminHoras;
