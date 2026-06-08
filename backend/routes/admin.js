import express from "express";
import pool from "../db/db.js";
import { Verify, VerifyRoleAdmin } from "../middleware/verify.js";
import cellar from "../middleware/cellar.js";
import { GetObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import bcrypt from "bcrypt";

const router = express.Router();

router.use(Verify);
router.use(VerifyRoleAdmin);

// ==========================================
// DASHBOARD
// ==========================================

router.get("/dashboard", async (req, res) => {
  try {
    const [[period]] = await pool.query(
      `SELECT * FROM periods WHERE NOW() BETWEEN start_date AND end_date LIMIT 1`
    );

    const [[{ tutores }]] = await pool.query(
      `SELECT COUNT(DISTINCT u.id) AS tutores
       FROM users u
       JOIN student_tutor st ON st.tutor = u.id
       WHERE u.role = 'teacher'`
    );

    const [[{ alumnos }]] = await pool.query(
      `SELECT COUNT(DISTINCT u.id) AS alumnos FROM users u WHERE u.role = 'student'`
    );

    const [[{ promedio }]] = await pool.query(
      `SELECT ROUND(AVG(grade), 1) AS promedio FROM submissions WHERE grade IS NOT NULL`
    );

    const [[{ dias_restantes }]] = await pool.query(
      `SELECT GREATEST(0, DATEDIFF(end_date, NOW())) AS dias_restantes
       FROM periods WHERE NOW() BETWEEN start_date AND end_date LIMIT 1`
    );

    const [tutorProgress] = await pool.query(
      `SELECT u.id, CONCAT(u.name, ' ', u.last_name) AS nombre,
         COUNT(DISTINCT s.id) AS horas_realizadas,
         GROUP_CONCAT(DISTINCT st.idioma) AS idioma
       FROM users u
       JOIN student_tutor st ON st.tutor = u.id
       JOIN sessions s ON s.student_tutor = st.id
       JOIN session_logs sl ON sl.session_id = s.id
       WHERE u.role = 'teacher' AND sl.approved = TRUE
       GROUP BY u.id`
    );

    const [[{ tasa_entregas }]] = await pool.query(
      `SELECT ROUND(COUNT(CASE WHEN file IS NOT NULL AND file != '' THEN 1 END) * 100.0 / NULLIF(COUNT(*), 0), 1) AS tasa_entregas FROM submissions`
    );

    const [[{ tasa_bitacoras }]] = await pool.query(
      `SELECT ROUND(COUNT(sl.id) * 100.0 / NULLIF(COUNT(s.id), 0), 1) AS tasa_bitacoras
       FROM sessions s LEFT JOIN session_logs sl ON sl.session_id = s.id`
    );

    res.json({
      period, tutores, alumnos,
      promedio: promedio ?? 0,
      dias_restantes: dias_restantes ?? 0,
      tutorProgress,
      metricas: { promedio: promedio ?? 0, tasa_entregas: tasa_entregas ?? 0, tasa_bitacoras: tasa_bitacoras ?? 0 },
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error obteniendo dashboard" });
  }
});

// ==========================================
// ESTADÍSTICAS
// ==========================================

router.get("/estadisticas", async (req, res) => {
  try {
    const [periods] = await pool.query(`SELECT * FROM periods ORDER BY start_date DESC`);

    const periodStats = await Promise.all(
      periods.map(async (p) => {
        const [[{ alumnos }]] = await pool.query(`SELECT COUNT(*) AS alumnos FROM users WHERE role = 'student' AND period = ?`, [p.id]);
        const [[{ tutores }]] = await pool.query(`SELECT COUNT(*) AS tutores FROM users WHERE role = 'teacher' AND period = ?`, [p.id]);
        const [[{ calificacion }]] = await pool.query(
          `SELECT ROUND(AVG(sub.grade), 1) AS calificacion
           FROM submissions sub JOIN assignments a ON a.id = sub.assignment
           JOIN student_tutor st ON st.id = a.\`group\` JOIN users u ON u.id = st.student
           WHERE u.period = ? AND sub.grade IS NOT NULL`, [p.id]
        );
        const [[{ entregas_total, entregas_con_archivo }]] = await pool.query(
          `SELECT COUNT(*) AS entregas_total, COUNT(CASE WHEN file IS NOT NULL AND file != '' THEN 1 END) AS entregas_con_archivo
           FROM submissions sub JOIN assignments a ON a.id = sub.assignment
           JOIN student_tutor st ON st.id = a.\`group\` JOIN users u ON u.id = st.student WHERE u.period = ?`, [p.id]
        );
        const tasa_entregas = entregas_total > 0 ? Math.round((entregas_con_archivo / entregas_total) * 100) : 0;
        const [[{ horas_acreditadas }]] = await pool.query(
          `SELECT COUNT(DISTINCT s.id) AS horas_acreditadas
           FROM sessions s JOIN session_logs sl ON sl.session_id = s.id
           JOIN student_tutor st ON st.id = s.student_tutor JOIN users u ON u.id = st.tutor
           WHERE u.period = ? AND sl.approved = TRUE`, [p.id]
        );
        const meta_horas = tutores * 180;
        const pct_horas = meta_horas > 0 ? Math.min(100, Math.round((horas_acreditadas / meta_horas) * 100)) : 0;
        return { ...p, alumnos, tutores, calificacion: calificacion ?? 0, tasa_entregas, horas_acreditadas, meta_horas, pct_horas };
      })
    );

    const [tutorHoras] = await pool.query(
      `SELECT u.id, CONCAT(u.name, ' ', u.last_name) AS nombre,
         GROUP_CONCAT(DISTINCT st.idioma SEPARATOR '/') AS idiomas,
         COUNT(DISTINCT CASE WHEN sl.approved = TRUE THEN s.id END) AS horas_acreditadas, 180 AS meta_horas
       FROM users u JOIN student_tutor st ON st.tutor = u.id
       LEFT JOIN sessions s ON s.student_tutor = st.id LEFT JOIN session_logs sl ON sl.session_id = s.id
       WHERE u.role = 'teacher' GROUP BY u.id`
    );

    res.json({ periods: periodStats, tutorHoras: tutorHoras.map((t) => ({ ...t, pct: Math.min(100, Math.round((t.horas_acreditadas / t.meta_horas) * 100)) })) });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error obteniendo estadísticas" });
  }
});

// ==========================================
// USUARIOS
// ==========================================

router.get("/usuarios", async (req, res) => {
  try {
    const { role } = req.query;
    const whereClause = role ? `WHERE u.role = ?` : "";
    const params = role ? [role] : [];

    const [users] = await pool.query(
      `SELECT u.id, u.name, u.last_name, u.username, u.role, u.period, p.name AS period_name
       FROM users u LEFT JOIN periods p ON p.id = u.period ${whereClause} ORDER BY u.role, u.last_name`,
      params
    );

    const [studentTutors] = await pool.query(
      `SELECT st.id AS student_tutor_id, st.student, st.idioma, st.start_date, st.end_date,
         CONCAT(u.name, ' ', u.last_name) AS tutor_name, u.id AS tutor_id
       FROM student_tutor st JOIN users u ON u.id = st.tutor`
    );

    const stByStudent = {};
    studentTutors.forEach((st) => {
      if (!stByStudent[st.student]) stByStudent[st.student] = [];
      stByStudent[st.student].push(st);
    });

    const [reviewerTutors] = await pool.query(
      `SELECT rt.id, rt.supervisor_id, rt.tutor_id, CONCAT(u.name, ' ', u.last_name) AS tutor_name
       FROM reviewer_tutor rt JOIN users u ON u.id = rt.tutor_id`
    );

    const rtBySupervisor = {};
    reviewerTutors.forEach((rt) => {
      if (!rtBySupervisor[rt.supervisor_id]) rtBySupervisor[rt.supervisor_id] = [];
      rtBySupervisor[rt.supervisor_id].push(rt);
    });

    // Also build tutor→supervisor mapping
    const [supervisorOfTutor] = await pool.query(
      `SELECT rt.id, rt.tutor_id, rt.supervisor_id, CONCAT(u.name, ' ', u.last_name) AS supervisor_name
       FROM reviewer_tutor rt JOIN users u ON u.id = rt.supervisor_id`
    );

    const supervisorByTutor = {};
    supervisorOfTutor.forEach((r) => {
      if (!supervisorByTutor[r.tutor_id]) supervisorByTutor[r.tutor_id] = [];
      supervisorByTutor[r.tutor_id].push(r);
    });

    const enriched = users.map((u) => ({
      ...u,
      tutores: stByStudent[u.id] ?? [],
      supervisados: rtBySupervisor[u.id] ?? [],
      supervisores: supervisorByTutor[u.id] ?? [],
    }));

    res.json(enriched);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error obteniendo usuarios" });
  }
});

router.get("/usuarios/:id", async (req, res) => {
  try {
    const [[user]] = await pool.query(
      `SELECT u.id, u.name, u.last_name, u.username, u.role, u.period, p.name AS period_name
       FROM users u LEFT JOIN periods p ON p.id = u.period WHERE u.id = ?`,
      [req.params.id]
    );
    if (!user) return res.status(404).json({ message: "Usuario no encontrado" });

    const [tutores] = await pool.query(
      `SELECT st.id AS student_tutor_id, st.idioma, st.start_date, st.end_date,
         CONCAT(u.name, ' ', u.last_name) AS tutor_name, u.id AS tutor_id
       FROM student_tutor st JOIN users u ON u.id = st.tutor WHERE st.student = ?`,
      [req.params.id]
    );

    const [supervisados] = await pool.query(
      `SELECT rt.id, rt.tutor_id, CONCAT(u.name, ' ', u.last_name) AS tutor_name
       FROM reviewer_tutor rt JOIN users u ON u.id = rt.tutor_id WHERE rt.supervisor_id = ?`,
      [req.params.id]
    );

    const [supervisores] = await pool.query(
      `SELECT rt.id, rt.supervisor_id, CONCAT(u.name, ' ', u.last_name) AS supervisor_name
       FROM reviewer_tutor rt JOIN users u ON u.id = rt.supervisor_id WHERE rt.tutor_id = ?`,
      [req.params.id]
    );

    res.json({ ...user, tutores, supervisados, supervisores });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error obteniendo usuario" });
  }
});

router.post("/usuarios", async (req, res) => {
  try {
    const { name, last_name, username, password, role, period } = req.body;
    if (!name || !last_name || !username || !password || !role || !period) {
      return res.status(400).json({ message: "Todos los campos son requeridos" });
    }
    const [existing] = await pool.query(`SELECT id FROM users WHERE username = ?`, [username]);
    if (existing.length > 0) return res.status(409).json({ message: "El username ya existe" });

    const hash = await bcrypt.hash(password, 10);
    const [result] = await pool.query(
      `INSERT INTO users (name, last_name, username, password_hash, role, period) VALUES (?, ?, ?, ?, ?, ?)`,
      [name, last_name, username, hash, role, period]
    );
    res.status(201).json({ id: result.insertId, message: "Usuario creado" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error creando usuario" });
  }
});

router.post("/usuarios/bulk", async (req, res) => {
  try {
    const { users } = req.body; // [{ name, last_name, username, password, role, period }]
    if (!Array.isArray(users) || users.length === 0) {
      return res.status(400).json({ message: "Lista de usuarios requerida" });
    }

    const results = [];
    const errors = [];

    for (const u of users) {
      try {
        const [existing] = await pool.query(`SELECT id FROM users WHERE username = ?`, [u.username]);
        if (existing.length > 0) {
          errors.push({ username: u.username, error: "Username ya existe" });
          continue;
        }
        const hash = await bcrypt.hash(u.password, 10);
        const [result] = await pool.query(
          `INSERT INTO users (name, last_name, username, password_hash, role, period) VALUES (?, ?, ?, ?, ?, ?)`,
          [u.name, u.last_name, u.username, hash, u.role, u.period]
        );
        results.push({ id: result.insertId, username: u.username, password: u.password, name: u.name, last_name: u.last_name, role: u.role });
      } catch (e) {
        errors.push({ username: u.username, error: e.message });
      }
    }

    res.status(201).json({ created: results, errors, message: `${results.length} usuarios creados, ${errors.length} errores` });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error en importación masiva" });
  }
});

router.put("/usuarios/:id", async (req, res) => {
  try {
    const { name, last_name, username, role, period, password } = req.body;
    if (password) {
      const hash = await bcrypt.hash(password, 10);
      await pool.query(
        `UPDATE users SET name=?, last_name=?, username=?, role=?, period=?, password_hash=? WHERE id=?`,
        [name, last_name, username, role, period, hash, req.params.id]
      );
    } else {
      await pool.query(
        `UPDATE users SET name=?, last_name=?, username=?, role=?, period=? WHERE id=?`,
        [name, last_name, username, role, period, req.params.id]
      );
    }
    res.json({ message: "Usuario actualizado" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error actualizando usuario" });
  }
});

router.delete("/usuarios/:id", async (req, res) => {
  try {
    await pool.query(`DELETE FROM users WHERE id = ?`, [req.params.id]);
    res.json({ message: "Usuario eliminado" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error eliminando usuario" });
  }
});

router.post("/usuarios/asignar-tutor", async (req, res) => {
  try {
    const { student_id, tutor_id, idioma, start_date, end_date } = req.body;
    if (!student_id || !tutor_id || !idioma || !start_date || !end_date) {
      return res.status(400).json({ message: "Faltan campos requeridos" });
    }
    await pool.query(
      `INSERT INTO student_tutor (tutor, student, idioma, start_date, end_date) VALUES (?, ?, ?, ?, ?)`,
      [tutor_id, student_id, idioma, start_date, end_date]
    );
    res.status(201).json({ message: "Tutor asignado correctamente" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error asignando tutor" });
  }
});

router.delete("/usuarios/desvincular-tutor/:student_tutor_id", async (req, res) => {
  try {
    await pool.query(`DELETE FROM student_tutor WHERE id = ?`, [req.params.student_tutor_id]);
    res.json({ message: "Tutor desvinculado" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error desvinculando tutor" });
  }
});

router.post("/usuarios/asignar-supervisor", async (req, res) => {
  try {
    const { tutor_id, supervisor_id } = req.body;
    const [existing] = await pool.query(
      `SELECT id FROM reviewer_tutor WHERE tutor_id = ? AND supervisor_id = ?`,
      [tutor_id, supervisor_id]
    );
    if (existing.length > 0) return res.status(409).json({ message: "Ya está asignado" });
    await pool.query(`INSERT INTO reviewer_tutor (tutor_id, supervisor_id) VALUES (?, ?)`, [tutor_id, supervisor_id]);
    res.status(201).json({ message: "Supervisor asignado" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error asignando supervisor" });
  }
});

router.delete("/usuarios/desvincular-supervisor/:id", async (req, res) => {
  try {
    await pool.query(`DELETE FROM reviewer_tutor WHERE id = ?`, [req.params.id]);
    res.json({ message: "Supervisor desvinculado" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error desvinculando supervisor" });
  }
});

// ==========================================
// PERIODS
// ==========================================

router.get("/periods", async (req, res) => {
  try {
    const [rows] = await pool.query(`SELECT * FROM periods ORDER BY start_date DESC`);
    res.json(rows);
  } catch (err) {
    res.status(500).json({ message: "Error obteniendo periodos" });
  }
});

// ==========================================
// MATERIALS
// ==========================================

router.get("/materials", async (req, res) => {
  try {
    const { type, idioma, search } = req.query;
    let query = `
      SELECT m.id, m.title, m.type, m.file_url, m.external_url, m.uploaded_at, st.idioma,
        CONCAT(u_student.name, ' ', u_student.last_name) AS alumno_name,
        CONCAT(u_tutor.name, ' ', u_tutor.last_name) AS tutor_name
      FROM materials m
      JOIN student_tutor st ON st.id = m.student_tutor_id
      JOIN users u_student ON u_student.id = st.student
      JOIN users u_tutor ON u_tutor.id = st.tutor
      WHERE 1=1
    `;
    const params = [];
    if (type && type !== "TODOS") { query += ` AND m.type = ?`; params.push(type); }
    if (idioma) { query += ` AND st.idioma = ?`; params.push(idioma); }
    if (search) { query += ` AND m.title LIKE ?`; params.push(`%${search}%`); }
    query += ` ORDER BY m.uploaded_at DESC`;

    const [rows] = await pool.query(query, params);
    await Promise.all(rows.map(async (row) => {
      if (row.file_url && row.type !== "LINK") {
        const command = new GetObjectCommand({ Bucket: process.env.CELLAR_ADDON_BUCKET, Key: row.file_url });
        row.signed_file_url = await getSignedUrl(cellar, command, { expiresIn: 300 });
      }
    }));
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error obteniendo materiales" });
  }
});

// ==========================================
// HORAS
// ==========================================

router.get("/horas/config", async (req, res) => {
  try {
    const [periods] = await pool.query(
      `SELECT id, name, session_log_percentage, letter_percentage, video_percentage, start_date, end_date FROM periods ORDER BY start_date DESC`
    );
    const actividades = [
      { nombre: "Registro de bitácoras", porcentaje: periods[0]?.session_log_percentage ?? 80 },
      { nombre: "Carta", porcentaje: periods[0]?.letter_percentage ?? 10 },
      { nombre: "Video", porcentaje: periods[0]?.video_percentage ?? 10 },
    ];
    const metas = [
      { tipo: "Periodo Normal (Inglés)", meta: 180 },
      { tipo: "Periodo Normal (Francés)", meta: 180 },
      { tipo: "Periodo Intensivo (Inglés)", meta: 200 },
      { tipo: "Periodo Intensivo (Francés)", meta: 200 },
    ];
    res.json({ periods, actividades, metas });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error obteniendo configuración de horas" });
  }
});

router.put("/horas/actividades", async (req, res) => {
  try {
    const { period_id, session_log_percentage, letter_percentage, video_percentage } = req.body;
    if (session_log_percentage + letter_percentage + video_percentage !== 100) {
      return res.status(400).json({ message: "Los porcentajes deben sumar 100" });
    }
    await pool.query(
      `UPDATE periods SET session_log_percentage=?, letter_percentage=?, video_percentage=? WHERE id=?`,
      [session_log_percentage, letter_percentage, video_percentage, period_id]
    );
    res.json({ message: "Porcentajes actualizados" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error actualizando porcentajes" });
  }
});

// ==========================================
// ADMIN → SUPERVISOR VIEW (all tutors)
// ==========================================

router.get("/supervisor/tutors", async (req, res) => {
  try {
    const [rows] = await pool.query(`
      SELECT
        u.id AS tutor_id,
        CONCAT(u.name, ' ', u.last_name) AS tutor_name,
        GROUP_CONCAT(DISTINCT st.idioma) AS idioma,
        COUNT(DISTINCT s.id) AS total_sessions,
        COUNT(DISTINCT sl.id) AS total_logs,
        COUNT(DISTINCT CASE WHEN sl.incidence = TRUE THEN sl.id END) AS total_incidences,
        MIN(st.start_date) AS period_start,
        MAX(st.end_date) AS period_end,
        GROUP_CONCAT(DISTINCT CONCAT(u2.name, ' ', u2.last_name) SEPARATOR ', ') AS supervisores
      FROM users u
      LEFT JOIN student_tutor st ON st.tutor = u.id
      LEFT JOIN sessions s ON s.student_tutor = st.id
      LEFT JOIN session_logs sl ON sl.session_id = s.id
      LEFT JOIN reviewer_tutor rt ON rt.tutor_id = u.id
      LEFT JOIN users u2 ON u2.id = rt.supervisor_id
      WHERE u.role = 'teacher'
      GROUP BY u.id
    `);
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error obteniendo tutores" });
  }
});

router.get("/supervisor/tutor/:tutorId/sessions", async (req, res) => {
  try {
    const [rows] = await pool.query(`
      SELECT s.id AS session_id, s.start_time, s.end_time, st.idioma,
        sl.id AS log_id,
        COALESCE(sl.validated, FALSE) AS validated,
        COALESCE(sl.approved, FALSE) AS approved,
        sl.incidence
      FROM sessions s
      JOIN student_tutor st ON st.id = s.student_tutor
      LEFT JOIN session_logs sl ON sl.session_id = s.id
      WHERE st.tutor = ?
      ORDER BY s.start_time DESC
    `, [req.params.tutorId]);

    res.json(rows.map(row => ({ ...row, validated: !!row.validated, approved: !!row.approved })));
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error obteniendo sesiones" });
  }
});

router.get("/supervisor/bitacoras", async (req, res) => {
  try {
    const [rows] = await pool.query(`
      SELECT sl.*, s.start_time, s.end_time,
        DATE(s.start_time) AS session_day,
        TIMESTAMPDIFF(MINUTE, s.start_time, s.end_time) AS duration_minutes,
        st.tutor AS tutor_id, st.idioma
      FROM session_logs sl
      JOIN sessions s ON sl.session_id = s.id
      JOIN student_tutor st ON s.student_tutor = st.id
      WHERE sl.validated = TRUE AND sl.approved = FALSE
    `);

    await Promise.all(rows.map(async (row) => {
      if (row.evidence_url) {
        const command = new GetObjectCommand({ Bucket: process.env.CELLAR_ADDON_BUCKET, Key: row.evidence_url });
        row.signed_evidence_url = await getSignedUrl(cellar, command, { expiresIn: 300 });
      }
    }));

    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error obteniendo bitácoras" });
  }
});

export default router;
