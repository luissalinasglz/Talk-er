import { useEffect, useState, useCallback, useRef } from "react";
import { apiFetch } from "./adminApi";
import * as XLSX from "xlsx";
import "./admin-usuarios.css";
import "./admin-import.css";

const ROLES = ["student", "teacher", "supervisor", "admin"];
const ROLE_LABELS = { student: "Alumno", teacher: "Tutor", supervisor: "Revisor", admin: "Admin" };
const ROLE_COLORS = { student: "alumno", teacher: "tutor", supervisor: "revisor", admin: "revisor" };

const EMPTY_FORM = { name: "", last_name: "", username: "", role: "student", period: "", password: "" };

// ─── helpers ────────────────────────────────────────────────────────────────

function normalize(str = "") {
  return str
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-zA-Z0-9]/g, "")
    .toLowerCase();
}

function generatePassword(length = 10) {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789";
  const specials = "!@#$%";
  let pwd = specials[Math.floor(Math.random() * specials.length)];
  for (let i = 0; i < length - 1; i++) pwd += chars[Math.floor(Math.random() * chars.length)];
  return pwd;
}

// Parse tutor xlsx — filters rows with status "INSCRITX"
function parseTutores(wb, periodId) {
  const ws = wb.Sheets[wb.SheetNames[0]];
  const rows = XLSX.utils.sheet_to_json(ws, { defval: "" });

  const users = [];
  for (const row of rows) {
    // Find column keys dynamically
    const statusKey = Object.keys(row).find((k) => k.includes("Estatus"));
    const matriculaKey = Object.keys(row).find((k) => k.includes("Matr"));
    const nombreKey = Object.keys(row).find((k) => k === "Nombre completo");

    const status = String(row[statusKey] ?? "").trim();
    if (status !== "INSCRITX") continue;

    const matricula = String(row[matriculaKey] ?? "").trim();
    const fullName = String(row[nombreKey] ?? "").trim();
    const nameParts = fullName.split(/\s+/);
    const name = nameParts[0] ?? fullName;
    const last_name = nameParts.slice(1).join(" ") || nameParts[0];
    const password = generatePassword();

    users.push({ name, last_name, username: matricula, password, role: "teacher", period: periodId });
  }
  return users;
}

// Parse student xlsx
function parseEstudiantes(wb, periodId) {
  const ws = wb.Sheets[wb.SheetNames[0]];
  const rows = XLSX.utils.sheet_to_json(ws, { defval: "" });

  // Find proyecto column once
  const sample = rows[0] ?? {};
  const proyectoKey = Object.keys(sample).find((k) => k.includes("Proyecto Solidario") || k.includes("Nombre del Proyecto"));

  const users = [];
  const usernameCount = {};

  for (const row of rows) {
    const beneficiarioKey = Object.keys(row).find((k) => k.includes("Nombre del Beneficiario") || k.includes("Beneficiario"));
    const fullName = String(row[beneficiarioKey] ?? "").trim();
    if (!fullName) continue;

    const nameParts = fullName.split(/\s+/);
    const name = nameParts[0] ?? fullName;
    const last_name = nameParts.slice(1).join(" ") || nameParts[0];

    // Build username: first name + first last name + first 4 chars of project
    const proyecto = String(row[proyectoKey] ?? "").trim();
    const proyectoSlug = normalize(proyecto).slice(0, 4).toUpperCase();
    let base = normalize(name) + normalize(nameParts[1] ?? "") + proyectoSlug;

    // De-duplicate
    if (usernameCount[base] === undefined) {
      usernameCount[base] = 0;
    } else {
      usernameCount[base]++;
      base = base + usernameCount[base];
    }

    const password = generatePassword();
    users.push({ name, last_name, username: base, password, role: "student", period: periodId });
  }
  return users;
}

function buildOutputXlsx(created) {
  const data = created.map((u) => ({
    Nombre: u.name,
    Apellido: u.last_name,
    Usuario: u.username,
    Contraseña: u.password,
    Rol: ROLE_LABELS[u.role] ?? u.role,
  }));
  const ws = XLSX.utils.json_to_sheet(data);
  ws["!cols"] = [{ wch: 18 }, { wch: 18 }, { wch: 22 }, { wch: 18 }, { wch: 10 }];
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "Usuarios");
  return wb;
}

// ─── component ──────────────────────────────────────────────────────────────

function AdminUsuarios() {
  const [usuarios, setUsuarios] = useState([]);
  const [periods, setPeriods] = useState([]);
  const [tutores, setTutores] = useState([]);
  const [supervisores, setSupervisores] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [roleFilter, setRoleFilter] = useState("all");
  const [selectedUser, setSelectedUser] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [isNew, setIsNew] = useState(false);
  const [saving, setSaving] = useState(false);
  const [feedback, setFeedback] = useState(null);

  // Modals
  const [showAssignTutor, setShowAssignTutor] = useState(false);
  const [assignTutorForm, setAssignTutorForm] = useState({ tutor_id: "", idioma: "english", start_date: "", end_date: "" });
  const [showAssignSupervisor, setShowAssignSupervisor] = useState(false);
  const [assignSupForm, setAssignSupForm] = useState({ supervisor_id: "" });

  // Import
  const [showImport, setShowImport] = useState(false);
  const [importType, setImportType] = useState("teacher"); // "teacher" | "student"
  const [importPeriod, setImportPeriod] = useState("");
  const [importing, setImporting] = useState(false);
  const [importResult, setImportResult] = useState(null);
  const fileInputRef = useRef();

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const [users, perds] = await Promise.all([apiFetch("/usuarios"), apiFetch("/periods")]);
      setUsuarios(users);
      setPeriods(perds);
      setTutores(users.filter((u) => u.role === "teacher"));
      setSupervisores(users.filter((u) => u.role === "supervisor"));
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadData(); }, [loadData]);

  const filtered = roleFilter === "all" ? usuarios : usuarios.filter((u) => u.role === roleFilter);

  const selectUser = (u) => {
    setSelectedUser(u);
    setForm({ name: u.name, last_name: u.last_name, username: u.username, role: u.role, period: u.period, password: "" });
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
        body: JSON.stringify({ student_id: selectedUser.id, ...assignTutorForm }),
      });
      setShowAssignTutor(false);
      const updated = await apiFetch(`/usuarios/${selectedUser.id}`);
      setSelectedUser({ ...selectedUser, tutores: updated.tutores });
      await loadData();
    } catch (e) {
      setFeedback({ type: "err", msg: e.message });
    }
  };

  const handleUnlinkSupervisor = async (rtId) => {
    if (!window.confirm("¿Desvincular este supervisor?")) return;
    try {
      await apiFetch(`/usuarios/desvincular-supervisor/${rtId}`, { method: "DELETE" });
      const updated = await apiFetch(`/usuarios/${selectedUser.id}`);
      setSelectedUser({ ...selectedUser, supervisores: updated.supervisores, supervisados: updated.supervisados });
      await loadData();
    } catch (e) {
      setFeedback({ type: "err", msg: e.message });
    }
  };

  const handleAssignSupervisor = async () => {
    try {
      // If selected user is tutor → assign supervisor to them
      // If selected user is supervisor → assign tutor to them
      const payload = selectedUser.role === "teacher"
        ? { tutor_id: selectedUser.id, supervisor_id: assignSupForm.supervisor_id }
        : { tutor_id: assignSupForm.supervisor_id, supervisor_id: selectedUser.id };

      await apiFetch("/usuarios/asignar-supervisor", { method: "POST", body: JSON.stringify(payload) });
      setShowAssignSupervisor(false);
      const updated = await apiFetch(`/usuarios/${selectedUser.id}`);
      setSelectedUser({ ...selectedUser, supervisores: updated.supervisores, supervisados: updated.supervisados });
      await loadData();
    } catch (e) {
      setFeedback({ type: "err", msg: e.message });
    }
  };

  // ── Import handlers ─────────────────────────────────────────────────────

  const handleImportFile = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (!importPeriod) {
      setImportResult({ error: "Selecciona un periodo antes de importar." });
      return;
    }

    setImporting(true);
    setImportResult(null);

    try {
      const arrayBuffer = await file.arrayBuffer();
      const wb = XLSX.read(arrayBuffer, { type: "array" });

      const users = importType === "teacher"
        ? parseTutores(wb, importPeriod)
        : parseEstudiantes(wb, importPeriod);

      if (users.length === 0) {
        setImportResult({ error: `No se encontraron usuarios con el status requerido en el archivo. Asegúrate de importar el archivo correcto.` });
        setImporting(false);
        return;
      }

      // Send to backend
      const result = await apiFetch("/usuarios/bulk", {
        method: "POST",
        body: JSON.stringify({ users }),
      });

      // Build download xlsx with credentials
      const outputWb = buildOutputXlsx(result.created);
      XLSX.writeFile(outputWb, `usuarios_${importType}_${Date.now()}.xlsx`);

      setImportResult({ success: true, ...result });
      await loadData();
    } catch (err) {
      setImportResult({ error: err.message });
    } finally {
      setImporting(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const idioma = (i) => i === "english" ? "Inglés" : i === "french" ? "Francés" : i ?? "—";

  if (loading) return <div className="usuarios-admin"><p style={{ padding: "2rem", color: "#000" }}>Cargando...</p></div>;
  if (error) return <div className="usuarios-admin"><p style={{ padding: "2rem", color: "red" }}>{error}</p></div>;

  const editingUser = selectedUser ?? (isNew ? {} : null);

  return (
    <div className="usuarios-admin">
      <div className="user-line" />

      <div className="users-admin">
        {/* LEFT: table */}
        <div className="user-left">
          <div className="type-users">
            <div className="options-user">
              {[["all", "Todos"], ["student", "Alumnos"], ["teacher", "Tutores"], ["supervisor", "Revisores"]].map(([val, label]) => (
                <div key={val} className={`opti-user${roleFilter === val ? " active-user" : ""}`}
                  onClick={() => setRoleFilter(val)} style={{ cursor: "pointer" }}>
                  <p>{label}</p>
                </div>
              ))}
            </div>
            <div style={{ display: "flex", gap: "0.75rem" }}>
              <div className="import-btn-trigger" onClick={() => setShowImport(!showImport)} style={{ cursor: "pointer" }}>
                <p>📥 Importar XLSX</p>
              </div>
              <div className="add-user" onClick={startNew} style={{ cursor: "pointer" }}>
                <p>+ Nuevo usuario</p>
              </div>
            </div>
          </div>

          {/* Import panel */}
          {showImport && (
            <div className="import-panel">
              <h4>Importar usuarios desde XLSX</h4>
              <div className="import-row">
                <label>Tipo:</label>
                <select value={importType} onChange={(e) => setImportType(e.target.value)} className="import-select">
                  <option value="teacher">Tutores (INSCRITX)</option>
                  <option value="student">Alumnos (Beneficiarios)</option>
                </select>
              </div>
              <div className="import-row">
                <label>Periodo:</label>
                <select value={importPeriod} onChange={(e) => setImportPeriod(e.target.value)} className="import-select">
                  <option value="">— Seleccionar —</option>
                  {periods.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
                </select>
              </div>
              <div className="import-row">
                <label>Archivo:</label>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".xlsx,.xls"
                  onChange={handleImportFile}
                  disabled={importing || !importPeriod}
                  className="import-file"
                />
              </div>
              {importing && <p className="import-status">⏳ Procesando e importando usuarios...</p>}
              {importResult?.error && <p className="import-error">⚠️ {importResult.error}</p>}
              {importResult?.success && (
                <div className="import-success">
                  <p>✅ {importResult.message}</p>
                  {importResult.errors?.length > 0 && (
                    <ul className="import-errors-list">
                      {importResult.errors.map((e, i) => <li key={i}>{e.username}: {e.error}</li>)}
                    </ul>
                  )}
                  <p className="import-download-note">📥 El archivo XLSX con credenciales se descargó automáticamente.</p>
                </div>
              )}
            </div>
          )}

          <div className="table-users">
            <table className="users-table">
              <thead>
                <tr>
                  <th>Usuario</th>
                  <th>Rol</th>
                  <th>Idioma / Info</th>
                  <th>Periodo</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((u) => (
                  <tr key={u.id} onClick={() => selectUser(u)} style={{ cursor: "pointer", background: selectedUser?.id === u.id ? "#F0F5FF" : undefined }}>
                    <td>
                      <p className="user-nombre">{u.name} {u.last_name}</p>
                      <p className="user-email">{u.username}</p>
                    </td>
                    <td>
                      <div className={`rol-badge ${ROLE_COLORS[u.role] ?? "revisor"}`}>{ROLE_LABELS[u.role] ?? u.role}</div>
                    </td>
                    <td>
                      <p className="user-idioma">
                        {u.role === "student" && u.tutores?.length > 0
                          ? u.tutores.map((t) => idioma(t.idioma)).join(" / ")
                          : u.role === "supervisor" && u.supervisados?.length > 0
                          ? `${u.supervisados.length} tutores`
                          : "—"}
                      </p>
                    </td>
                    <td><p style={{ color: "#000", margin: 0 }}>{u.period_name ?? "—"}</p></td>
                  </tr>
                ))}
                {filtered.length === 0 && <tr><td colSpan={4} style={{ color: "#888", padding: "1rem" }}>Sin usuarios</td></tr>}
              </tbody>
            </table>
          </div>
        </div>

        {/* RIGHT: edit panel */}
        <div className="user-right">
          {!editingUser && <p style={{ color: "#888" }}>Selecciona un usuario o crea uno nuevo.</p>}

          {editingUser && (
            <>
              <h3>{isNew ? "Nuevo Usuario" : `Editar – ${selectedUser?.name} ${selectedUser?.last_name}`}</h3>

              {feedback && <p style={{ color: feedback.type === "ok" ? "green" : "red", marginBottom: "1rem" }}>{feedback.msg}</p>}

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
                    <select value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value })}
                      style={{ padding: "0.75rem 1rem", borderRadius: "20px", border: "3px solid #BBBEC7", width: "100%", outline: "none", background: "#fff", color: "#000" }}>
                      {ROLES.map((r) => <option key={r} value={r}>{ROLE_LABELS[r]}</option>)}
                    </select>
                  </div>
                  <div className="user-detail">
                    <p>Periodo</p>
                    <select value={form.period} onChange={(e) => setForm({ ...form, period: e.target.value })}
                      style={{ padding: "0.75rem 1rem", borderRadius: "20px", border: "3px solid #BBBEC7", width: "100%", outline: "none", background: "#fff", color: "#000" }}>
                      <option value="">— Seleccionar —</option>
                      {periods.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
                    </select>
                  </div>
                </div>

                <div className="data-detail">
                  <div className="user-detail">
                    <p>{isNew ? "Contraseña" : "Nueva contraseña (vacío = no cambiar)"}</p>
                    <input type="password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} placeholder={isNew ? "Contraseña" : "••••••••"} />
                  </div>
                </div>

                {/* Student → Tutor assignments */}
                {!isNew && selectedUser?.role === "student" && (
                  <div className="tutor-assigned">
                    <h4>Tutores Asignados</h4>
                    {(selectedUser.tutores ?? []).length === 0 && <p style={{ color: "#aaa", fontSize: "0.85rem" }}>Sin tutor asignado</p>}
                    {(selectedUser.tutores ?? []).map((t) => (
                      <div key={t.student_tutor_id} className="tutor-assigned-data">
                        <p>{t.tutor_name}</p>
                        <p>{idioma(t.idioma)}</p>
                        <p className="unlink" onClick={() => handleUnlinkTutor(t.student_tutor_id)} style={{ cursor: "pointer" }}>Desvincular</p>
                      </div>
                    ))}
                    <div style={{ marginTop: "0.75rem", color: "#aaa", fontSize: "0.85rem", cursor: "pointer", textDecoration: "underline" }} onClick={() => setShowAssignTutor(true)}>
                      + Asignar tutor
                    </div>
                  </div>
                )}

                {/* Tutor → Supervisor assignments */}
                {!isNew && selectedUser?.role === "teacher" && (
                  <div className="tutor-assigned" style={{ marginTop: "1rem" }}>
                    <h4>Supervisores Asignados</h4>
                    {(selectedUser.supervisores ?? []).length === 0 && <p style={{ color: "#aaa", fontSize: "0.85rem" }}>Sin supervisor asignado</p>}
                    {(selectedUser.supervisores ?? []).map((s) => (
                      <div key={s.id} className="tutor-assigned-data">
                        <p>{s.supervisor_name}</p>
                        <p className="unlink" onClick={() => handleUnlinkSupervisor(s.id)} style={{ cursor: "pointer" }}>Desvincular</p>
                      </div>
                    ))}
                    <div style={{ marginTop: "0.75rem", color: "#aaa", fontSize: "0.85rem", cursor: "pointer", textDecoration: "underline" }} onClick={() => { setShowAssignSupervisor(true); }}>
                      + Asignar supervisor
                    </div>
                  </div>
                )}

                {/* Supervisor → tutors supervised */}
                {!isNew && selectedUser?.role === "supervisor" && (
                  <div className="tutor-assigned" style={{ marginTop: "1rem" }}>
                    <h4>Tutores Supervisados</h4>
                    {(selectedUser.supervisados ?? []).length === 0 && <p style={{ color: "#aaa", fontSize: "0.85rem" }}>Sin tutores asignados</p>}
                    {(selectedUser.supervisados ?? []).map((t) => (
                      <div key={t.id} className="tutor-assigned-data">
                        <p>{t.tutor_name}</p>
                        <p className="unlink" onClick={() => handleUnlinkSupervisor(t.id)} style={{ cursor: "pointer" }}>Desvincular</p>
                      </div>
                    ))}
                    <div style={{ marginTop: "0.75rem", color: "#aaa", fontSize: "0.85rem", cursor: "pointer", textDecoration: "underline" }} onClick={() => setShowAssignSupervisor(true)}>
                      + Asignar tutor a supervisar
                    </div>
                  </div>
                )}

                {/* Assign tutor modal */}
                {showAssignTutor && (
                  <div className="assign-modal">
                    <h4>Asignar tutor</h4>
                    <select value={assignTutorForm.tutor_id} onChange={(e) => setAssignTutorForm({ ...assignTutorForm, tutor_id: e.target.value })} className="assign-select">
                      <option value="">— Seleccionar tutor —</option>
                      {tutores.map((t) => <option key={t.id} value={t.id}>{t.name} {t.last_name}</option>)}
                    </select>
                    <select value={assignTutorForm.idioma} onChange={(e) => setAssignTutorForm({ ...assignTutorForm, idioma: e.target.value })} className="assign-select">
                      <option value="english">Inglés</option>
                      <option value="french">Francés</option>
                    </select>
                    <input type="date" value={assignTutorForm.start_date} onChange={(e) => setAssignTutorForm({ ...assignTutorForm, start_date: e.target.value })} style={{ width: "100%", marginBottom: "0.5rem" }} />
                    <input type="date" value={assignTutorForm.end_date} onChange={(e) => setAssignTutorForm({ ...assignTutorForm, end_date: e.target.value })} style={{ width: "100%", marginBottom: "0.75rem" }} />
                    <div style={{ display: "flex", gap: "0.5rem" }}>
                      <div onClick={handleAssignTutor} className="save-changes" style={{ flex: 1, marginTop: 0, cursor: "pointer" }}><p>Asignar</p></div>
                      <div onClick={() => setShowAssignTutor(false)} className="cancel-btn"><p>Cancelar</p></div>
                    </div>
                  </div>
                )}

                {/* Assign supervisor/tutor modal */}
                {showAssignSupervisor && (
                  <div className="assign-modal">
                    <h4>{selectedUser.role === "teacher" ? "Asignar supervisor" : "Asignar tutor a supervisar"}</h4>
                    <select
                      value={assignSupForm.supervisor_id}
                      onChange={(e) => setAssignSupForm({ supervisor_id: e.target.value })}
                      className="assign-select"
                    >
                      <option value="">— Seleccionar —</option>
                      {(selectedUser.role === "teacher" ? supervisores : tutores).map((u) => (
                        <option key={u.id} value={u.id}>{u.name} {u.last_name}</option>
                      ))}
                    </select>
                    <div style={{ display: "flex", gap: "0.5rem", marginTop: "0.75rem" }}>
                      <div onClick={handleAssignSupervisor} className="save-changes" style={{ flex: 1, marginTop: 0, cursor: "pointer" }}><p>Asignar</p></div>
                      <div onClick={() => setShowAssignSupervisor(false)} className="cancel-btn"><p>Cancelar</p></div>
                    </div>
                  </div>
                )}

                <div style={{ display: "flex", gap: "0.75rem", marginTop: "1.5rem" }}>
                  <div className="save-changes" style={{ flex: 2, cursor: saving ? "not-allowed" : "pointer", opacity: saving ? 0.6 : 1 }} onClick={!saving ? handleSave : undefined}>
                    <p>{saving ? "Guardando..." : "Guardar Cambios"}</p>
                  </div>
                  {!isNew && (
                    <div onClick={!saving ? handleDelete : undefined}
                      style={{ flex: 1, background: "#E79090", border: "3px solid #E05C5C", borderRadius: "20px", padding: "1rem", textAlign: "center", cursor: "pointer", color: "#E05C5C", fontWeight: 600 }}>
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
