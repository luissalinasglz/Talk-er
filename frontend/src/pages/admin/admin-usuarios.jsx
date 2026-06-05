import { useEffect, useState, useCallback } from "react";
import { apiFetch } from "./adminApi";
import "./admin-usuarios.css";

const ROLES = ["student", "teacher", "supervisor", "admin"];
const ROLE_LABELS = { student: "Alumno", teacher: "Tutor", supervisor: "Revisor", admin: "Admin" };
const ROLE_COLORS = { student: "alumno", teacher: "tutor", supervisor: "revisor", admin: "revisor" };

const EMPTY_FORM = {
  name: "", last_name: "", username: "", role: "student", period: "", password: ""
};

function AdminUsuarios() {
  const [usuarios, setUsuarios]     = useState([]);
  const [periods, setPeriods]       = useState([]);
  const [tutores, setTutores]       = useState([]); // for assigning tutor to student
  const [loading, setLoading]       = useState(true);
  const [error, setError]           = useState(null);
  const [roleFilter, setRoleFilter] = useState("all");
  const [selectedUser, setSelectedUser] = useState(null);
  const [form, setForm]             = useState(EMPTY_FORM);
  const [isNew, setIsNew]           = useState(false);
  const [saving, setSaving]         = useState(false);
  const [feedback, setFeedback]     = useState(null);
  // Assign tutor modal state
  const [showAssign, setShowAssign] = useState(false);
  const [assignForm, setAssignForm] = useState({ tutor_id: "", idioma: "english", start_date: "", end_date: "" });

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const [users, perds] = await Promise.all([
        apiFetch("/usuarios"),
        apiFetch("/periods"),
      ]);
      setUsuarios(users);
      setPeriods(perds);
      // Tutores list for assignment
      setTutores(users.filter((u) => u.role === "teacher"));
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadData(); }, [loadData]);

  const filtered = roleFilter === "all"
    ? usuarios
    : usuarios.filter((u) => u.role === roleFilter);

  const selectUser = (u) => {
    setSelectedUser(u);
    setForm({
      name: u.name, last_name: u.last_name,
      username: u.username, role: u.role,
      period: u.period, password: ""
    });
    setIsNew(false);
    setFeedback(null);
  };

  const startNew = () => {
    setSelectedUser(null);
    setForm(EMPTY_FORM);
    setIsNew(true);
    setFeedback(null);
  };

  const handleSave = async () => {
    setSaving(true);
    setFeedback(null);
    try {
      if (isNew) {
        await apiFetch("/usuarios", { method: "POST", body: JSON.stringify(form) });
        setFeedback({ type: "ok", msg: "Usuario creado correctamente" });
      } else {
        await apiFetch(`/usuarios/${selectedUser.id}`, { method: "PUT", body: JSON.stringify(form) });
        setFeedback({ type: "ok", msg: "Usuario actualizado correctamente" });
      }
      await loadData();
      setIsNew(false);
    } catch (e) {
      setFeedback({ type: "err", msg: e.message });
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!selectedUser) return;
    if (!window.confirm(`¿Eliminar a ${selectedUser.name} ${selectedUser.last_name}?`)) return;
    setSaving(true);
    try {
      await apiFetch(`/usuarios/${selectedUser.id}`, { method: "DELETE" });
      setSelectedUser(null);
      setFeedback(null);
      await loadData();
    } catch (e) {
      setFeedback({ type: "err", msg: e.message });
    } finally {
      setSaving(false);
    }
  };

  const handleUnlinkTutor = async (stId) => {
    if (!window.confirm("¿Desvincular este tutor?")) return;
    try {
      await apiFetch(`/usuarios/desvincular-tutor/${stId}`, { method: "DELETE" });
      // Refresh selected user
      const updated = await apiFetch(`/usuarios/${selectedUser.id}`);
      setSelectedUser({ ...selectedUser, tutores: updated.tutores });
      await loadData();
    } catch (e) {
      setFeedback({ type: "err", msg: e.message });
    }
  };

  const handleAssignTutor = async () => {
    try {
      await apiFetch("/usuarios/asignar-tutor", {
        method: "POST",
        body: JSON.stringify({ student_id: selectedUser.id, ...assignForm }),
      });
      setShowAssign(false);
      const updated = await apiFetch(`/usuarios/${selectedUser.id}`);
      setSelectedUser({ ...selectedUser, tutores: updated.tutores });
      await loadData();
    } catch (e) {
      setFeedback({ type: "err", msg: e.message });
    }
  };

  const idioma = (i) =>
    i === "english" ? "Inglés" : i === "french" ? "Francés" : i ?? "—";

  if (loading) return <div className="usuarios-admin"><p style={{ padding: "2rem", color: "#000" }}>Cargando...</p></div>;
  if (error)   return <div className="usuarios-admin"><p style={{ padding: "2rem", color: "red" }}>{error}</p></div>;

  const editingUser = selectedUser ?? (isNew ? {} : null);

  return (
    <div className="usuarios-admin">
      <div className="user-line" />

      <div className="users-admin">
        {/* LEFT: table */}
        <div className="user-left">
          <div className="type-users">
            <div className="options-user">
              {[["all","Todos"],["student","Alumnos"],["teacher","Tutores"],["supervisor","Revisores"]].map(([val, label]) => (
                <div
                  key={val}
                  className={`opti-user${roleFilter === val ? " active-user" : ""}`}
                  onClick={() => setRoleFilter(val)}
                  style={{ cursor: "pointer" }}
                >
                  <p>{label}</p>
                </div>
              ))}
            </div>
            <div className="add-user" onClick={startNew} style={{ cursor: "pointer" }}>
              <p>+ Nuevo usuario</p>
            </div>
          </div>

          <div className="table-users">
            <table className="users-table">
              <thead>
                <tr>
                  <th>Usuario</th>
                  <th>Rol</th>
                  <th>Idioma</th>
                  <th>Periodo</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((u) => (
                  <tr
                    key={u.id}
                    className="user-row"
                    onClick={() => selectUser(u)}
                    style={{
                      cursor: "pointer",
                      background: selectedUser?.id === u.id ? "#F0F5FF" : undefined,
                    }}
                  >
                    <td>
                      <p className="user-nombre">{u.name} {u.last_name}</p>
                      <p className="user-email">{u.username}</p>
                    </td>
                    <td>
                      <div className={`rol-badge ${ROLE_COLORS[u.role] ?? "revisor"}`}>
                        {ROLE_LABELS[u.role] ?? u.role}
                      </div>
                    </td>
                    <td>
                      <p className="user-idioma">
                        {u.tutores?.length > 0
                          ? u.tutores.map((t) => idioma(t.idioma)).join(" / ")
                          : "—"}
                      </p>
                    </td>
                    <td>
                      <p style={{ color: "#000", margin: 0 }}>{u.period_name ?? "—"}</p>
                    </td>
                  </tr>
                ))}
                {filtered.length === 0 && (
                  <tr><td colSpan={4} style={{ color: "#888", padding: "1rem" }}>Sin usuarios</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* RIGHT: edit panel */}
        <div className="user-right">
          {!editingUser && (
            <p style={{ color: "#888" }}>Selecciona un usuario para editarlo, o crea uno nuevo.</p>
          )}

          {editingUser && (
            <>
              <h3>{isNew ? "Nuevo Usuario" : `Editar – ${selectedUser?.name} ${selectedUser?.last_name}`}</h3>

              {feedback && (
                <p style={{ color: feedback.type === "ok" ? "green" : "red", marginBottom: "1rem" }}>
                  {feedback.msg}
                </p>
              )}

              <div className="data-user">
                <div className="data-detail">
                  <div className="user-detail">
                    <p>Nombre(s)</p>
                    <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Nombre" />
                  </div>
                  <div className="user-detail">
                    <p>Apellidos</p>
                    <input value={form.last_name} onChange={(e) => setForm({ ...form, last_name: e.target.value })} placeholder="Apellidos" />
                  </div>
                </div>

                <div className="data-detail">
                  <div className="user-detail">
                    <p>Username / Matrícula</p>
                    <input value={form.username} onChange={(e) => setForm({ ...form, username: e.target.value })} placeholder="A01XXXXXX" />
                  </div>
                </div>

                <div className="data-detail">
                  <div className="user-detail">
                    <p>Rol</p>
                    <select
                      value={form.role}
                      onChange={(e) => setForm({ ...form, role: e.target.value })}
                      style={{ padding: "0.75rem 1rem", borderRadius: "20px", border: "3px solid #BBBEC7", width: "100%", outline: "none", background: "#fff", color: "#000" }}
                    >
                      {ROLES.map((r) => <option key={r} value={r}>{ROLE_LABELS[r]}</option>)}
                    </select>
                  </div>
                  <div className="user-detail">
                    <p>Periodo</p>
                    <select
                      value={form.period}
                      onChange={(e) => setForm({ ...form, period: e.target.value })}
                      style={{ padding: "0.75rem 1rem", borderRadius: "20px", border: "3px solid #BBBEC7", width: "100%", outline: "none", background: "#fff", color: "#000" }}
                    >
                      <option value="">— Seleccionar —</option>
                      {periods.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
                    </select>
                  </div>
                </div>

                <div className="data-detail">
                  <div className="user-detail">
                    <p>{isNew ? "Contraseña" : "Nueva contraseña (dejar vacío para no cambiar)"}</p>
                    <input
                      type="password"
                      value={form.password}
                      onChange={(e) => setForm({ ...form, password: e.target.value })}
                      placeholder={isNew ? "Contraseña" : "••••••••"}
                    />
                  </div>
                </div>

                {/* Tutor assignments for students */}
                {!isNew && selectedUser?.role === "student" && (
                  <div className="tutor-assigned">
                    <h4>Tutores Asignados</h4>
                    {(selectedUser.tutores ?? []).length === 0 && (
                      <p style={{ color: "#aaa", fontSize: "0.85rem" }}>Sin tutor asignado</p>
                    )}
                    {(selectedUser.tutores ?? []).map((t) => (
                      <div key={t.student_tutor_id} className="tutor-assigned-data">
                        <p>{t.tutor_name}</p>
                        <p>{idioma(t.idioma)}</p>
                        <p
                          className="unlink"
                          onClick={() => handleUnlinkTutor(t.student_tutor_id)}
                          style={{ cursor: "pointer" }}
                        >
                          Desvincular
                        </p>
                      </div>
                    ))}
                    <div
                      style={{ marginTop: "0.75rem", color: "#aaa", fontSize: "0.85rem", cursor: "pointer", textDecoration: "underline" }}
                      onClick={() => setShowAssign(true)}
                    >
                      + Asignar tutor
                    </div>
                  </div>
                )}

                {/* Assign tutor modal (inline) */}
                {showAssign && (
                  <div style={{ background: "#fff", border: "2px solid #6883BA", borderRadius: "16px", padding: "1rem", marginTop: "1rem" }}>
                    <h4 style={{ color: "#000", marginBottom: "0.75rem" }}>Asignar tutor</h4>
                    <select
                      value={assignForm.tutor_id}
                      onChange={(e) => setAssignForm({ ...assignForm, tutor_id: e.target.value })}
                      style={{ width: "100%", padding: "0.5rem", borderRadius: "12px", border: "2px solid #BBBEC7", marginBottom: "0.5rem", color: "#000" }}
                    >
                      <option value="">— Seleccionar tutor —</option>
                      {tutores.map((t) => <option key={t.id} value={t.id}>{t.name} {t.last_name}</option>)}
                    </select>
                    <select
                      value={assignForm.idioma}
                      onChange={(e) => setAssignForm({ ...assignForm, idioma: e.target.value })}
                      style={{ width: "100%", padding: "0.5rem", borderRadius: "12px", border: "2px solid #BBBEC7", marginBottom: "0.5rem", color: "#000" }}
                    >
                      <option value="english">Inglés</option>
                      <option value="french">Francés</option>
                    </select>
                    <input type="date" value={assignForm.start_date} onChange={(e) => setAssignForm({ ...assignForm, start_date: e.target.value })} style={{ width: "100%", marginBottom: "0.5rem" }} />
                    <input type="date" value={assignForm.end_date} onChange={(e) => setAssignForm({ ...assignForm, end_date: e.target.value })} style={{ width: "100%", marginBottom: "0.75rem" }} />
                    <div style={{ display: "flex", gap: "0.5rem" }}>
                      <div onClick={handleAssignTutor} className="save-changes" style={{ flex: 1, marginTop: 0, cursor: "pointer" }}><p>Asignar</p></div>
                      <div onClick={() => setShowAssign(false)} style={{ flex: 1, background: "#eee", borderRadius: "20px", padding: "1rem", textAlign: "center", cursor: "pointer", color: "#666" }}><p>Cancelar</p></div>
                    </div>
                  </div>
                )}

                <div style={{ display: "flex", gap: "0.75rem", marginTop: "1.5rem" }}>
                  <div
                    className="save-changes"
                    style={{ flex: 2, cursor: saving ? "not-allowed" : "pointer", opacity: saving ? 0.6 : 1 }}
                    onClick={!saving ? handleSave : undefined}
                  >
                    <p>{saving ? "Guardando..." : "Guardar Cambios"}</p>
                  </div>
                  {!isNew && (
                    <div
                      onClick={!saving ? handleDelete : undefined}
                      style={{
                        flex: 1, background: "#E79090", border: "3px solid #E05C5C",
                        borderRadius: "20px", padding: "1rem", textAlign: "center",
                        cursor: "pointer", color: "#E05C5C", fontWeight: 600,
                      }}
                    >
                      <p>Eliminar</p>
                    </div>
                  )}
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export default AdminUsuarios;
