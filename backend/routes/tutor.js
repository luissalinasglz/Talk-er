import express from "express";
import multer from "multer";
import path from "path";
import pool from "../db/db.js";
import { Verify, VerifyRoleTeacher } from "../middleware/verify.js";

const router = express.Router();

// --- Multer helpers ---
const diskStorage = (folder) => multer.diskStorage({
  destination: (req, file, cb) => cb(null, `uploads/${folder}`),
  filename: (req, file, cb) => cb(null, Date.now() + path.extname(file.originalname)),
});

const ALLOWED_EVIDENCE = ["image/png", "image/jpeg", "image/jpg", "application/pdf"];

const uploadBitacora = multer({
  storage: diskStorage("bitacoras"),
  fileFilter: (req, file, cb) =>
    ALLOWED_EVIDENCE.includes(file.mimetype) ? cb(null, true) : cb(new Error("Formato no permitido"), false),
  limits: { fileSize: 5 * 1024 * 1024 },
});

export const uploadMaterial = multer({ storage: diskStorage("materials") });

// --- GET ---

router.use(VerifyRoleTeacher)
router.get("/my-groups", Verify, async (req, res) => {
  try {
    const [rows] = await pool.query(`
      SELECT st.id, st.idioma, CONCAT(u.name,' ',u.last_name) AS student_name
      FROM student_tutor st
      JOIN users u ON u.id = st.student
      WHERE st.tutor = ?
    `, [req.user.id]);
    res.json(rows);
  } catch {
    res.status(500).json({ message: "Error obteniendo grupos" });
  }
});

router.get("/horario", Verify, async (req, res) => {
  try {
    const [rows] = await pool.query(`
      SELECT CONCAT(u.name, ' ', u.last_name) AS student_name,
        h.dia_semana, h.hora_inicio, h.hora_fin
      FROM horarios h
      JOIN student_tutor st ON h.student_tutor_id = st.id
      JOIN users u ON st.student = u.id
      WHERE st.tutor = ?
    `, [req.user.id]);
    res.json(rows);
  } catch (error) {
    console.error("Error en el horario:", error);
    res.status(500).json({ message: "Error al cargar el horario" });
  }
});

router.get("/my-groups/week", Verify, async (req, res) => {
  try {
    const [rows] = await pool.query(`
      SELECT h.id AS horario_id, st.id, st.idioma,
        CONCAT(u.name, ' ', u.last_name) AS student_name,
        h.dia_semana, h.hora_inicio, h.hora_fin
      FROM student_tutor st
      JOIN users u ON u.id = st.student
      JOIN horarios h ON h.student_tutor_id = st.id
      WHERE st.tutor = ?
        AND NOT EXISTS (
          SELECT 1 FROM sessions s
          WHERE s.student_tutor = st.id
            AND YEARWEEK(s.start_time, 0) = YEARWEEK(CURDATE(), 0)
        )
      ORDER BY h.dia_semana, h.hora_inicio
    `, [req.user.id]);
    res.json(rows);
  } catch (error) {
    console.error("Error al consultar pendientes de la semana:", error);
    res.status(500).json({ message: "Error obteniendo grupos de la semana" });
  }
});

router.get("/sessions/:groupId", Verify, async (req, res) => {
  try {
    const [rows] = await pool.query(`
      SELECT * FROM sessions WHERE student_tutor = ? ORDER BY id DESC LIMIT 1
    `, [req.params.groupId]);
    res.json(rows[0] || null);
  } catch {
    res.status(500).json({ message: "Error obteniendo sesión" });
  }
});

router.get("/clases", Verify, async (req, res) => {
  try {
    const [rows] = await pool.query(`
      SELECT s.id, s.start_time, s.end_time,
        DATE(s.start_time) AS fecha,
        TIME(s.start_time) AS hora_inicio,
        TIME(s.end_time) AS hora_fin,
        TIMESTAMPDIFF(MINUTE, s.start_time, s.end_time) AS duracion,
        st.idioma,
        CONCAT(u.name, ' ', u.last_name) AS nombre_alumno,
        sl.id AS log_id, sl.title, sl.description, sl.planning,
        sl.evidence_url, sl.corrections AS comentarios,
        sl.incidence, sl.incidence_type, sl.incidence_description,
        sl.validated, sl.approved
      FROM sessions s
      JOIN student_tutor st ON s.student_tutor = st.id
      JOIN users u ON st.student = u.id
      LEFT JOIN session_logs sl ON sl.session_id = s.id
      WHERE st.tutor = ?
      ORDER BY s.start_time DESC
    `, [req.user.id]);
    res.json(rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error al obtener sesiones" });
  }
});

router.get("/examenes", Verify, async (req, res) => {
  try {
    const [rows] = await pool.query(
      "SELECT id, nombre, clase, duracion, DATE_FORMAT(fecha_limite, '%Y-%m-%d %H:%i') AS vence FROM examenes WHERE tutor_id = ?",
      [req.user.id]
    );
    res.json(rows);
  } catch {
    res.status(500).json({ message: "Error al obtener exámenes" });
  }
});

router.get("/tareas", Verify, async (req, res) => {
  try {
    const [rows] = await pool.query(`
      SELECT a.id, a.title AS titulo, a.description AS descripcion,
        st.idioma AS beneficiario,
        DATE_FORMAT(a.due_date, '%Y-%m-%d') AS fechaEntrega,
        DATE_FORMAT(a.due_date, '%H:%i') AS horaLimite
      FROM assignments a
      JOIN student_tutor st ON a.\`group\` = st.id
      WHERE st.tutor = ?
    `, [req.user.id]);
    res.json(rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error obteniendo tareas" });
  }
});

router.get("/materials", Verify, async (req, res) => {
  try {
    const [rows] = await pool.query(`
      SELECT m.id, m.title, m.type, m.file_url, m.external_url, m.uploaded_at,
        st.id AS student_tutor_id,
        CONCAT(u.name, ' ', u.last_name) AS nombre_alumno
      FROM materials m
      INNER JOIN student_tutor st ON st.id = m.student_tutor_id
      INNER JOIN users u ON u.id = st.student
      WHERE st.tutor = ?
      ORDER BY m.uploaded_at DESC
    `, [req.user.id]);
    res.json(rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error obteniendo materiales" });
  }
});

// --- POST ---
router.post("/bitacoras/upload", Verify, uploadBitacora.single("evidence"), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ message: "No se subió ningún archivo" });
    const fileUrl = `${req.protocol}://${req.get("host")}/uploads/bitacoras/${req.file.filename}`;
    res.json({ url: fileUrl });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error subiendo evidencia" });
  }
});

router.post("/bitacoras", Verify, async (req, res) => {
  const { sesion_id, title, description, planning, evidence_url, incidence, incidence_type, incidence_description } = req.body;
  try {
    const [existing] = await pool.query("SELECT id FROM session_logs WHERE session_id = ?", [sesion_id]);

    if (existing.length > 0) {
      await pool.query(`
        UPDATE session_logs
        SET title=?, description=?, planning=?, incidence=?,
          incidence_type=?, incidence_description=?,
          evidence_url = IF(? != '', ?, evidence_url),
          corrections = '',
          validated=TRUE, approved=FALSE
        WHERE session_id=?
      `, [title, description, planning, incidence, incidence_type || null, incidence_description || null, evidence_url, evidence_url, sesion_id]);
    } else {
      await pool.query(`
        INSERT INTO session_logs
          (session_id, title, description, evidence_url, planning, incidence, incidence_type, incidence_description, validated, approved)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, TRUE, FALSE)
      `, [sesion_id, title, description, evidence_url || "", planning, incidence, incidence_type || null, incidence_description || null]);
    }

    res.json({ message: "Bitácora enviada a revisión correctamente" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error guardando bitácora" });
  }
});

router.post("/sessions", Verify, async (req, res) => {
  try {
    const { student_tutor, session_url, platform, password, start_time, end_time } = req.body;
    await pool.query(
      "INSERT INTO sessions (student_tutor, session_url, platform, password, start_time, end_time) VALUES (?, ?, ?, ?, ?, ?)",
      [student_tutor, session_url, platform, password, start_time, end_time]
    );
    res.json({ message: "Guardado correctamente" });
  } catch (error) {
    console.error("\nERROR AL GUARDAR SESION:", error);
    res.status(500).json({ message: "Error guardando sesión", details: error.message });
  }
});

router.post("/tareas", Verify, async (req, res) => {
  try {
    let { titulo, descripcion, fechaEntrega, horaLimite, group_id } = req.body;

    if (!group_id) {
      const [groups] = await pool.query("SELECT id FROM student_tutor WHERE tutor = ? LIMIT 1", [req.user.id]);
      if (groups.length === 0) return res.status(400).json({ message: "El tutor no tiene alumnos asignados" });
      group_id = groups[0].id;
    }

    const [result] = await pool.query(
      "INSERT INTO assignments (`group`, title, description, due_date) VALUES (?, ?, ?, ?)",
      [group_id, titulo, descripcion, `${fechaEntrega} ${horaLimite}:00`]
    );

    res.json({ message: "Tarea creada con éxito", tarea: { id: result.insertId, titulo, descripcion, fechaEntrega, horaLimite } });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error al crear la tarea" });
  }
});

router.post("/examenes", Verify, async (req, res) => {
  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();
    const { nombre, clase, duracion, fecha_limite, preguntas } = req.body;

    const [examResult] = await connection.query(
      "INSERT INTO examenes (tutor_id, nombre, clase, duracion, fecha_limite) VALUES (?, ?, ?, ?, ?)",
      [req.user.id, nombre, clase, duracion, fecha_limite]
    );

    for (const p of preguntas) {
      await connection.query(
        "INSERT INTO preguntas (examen_id, texto_pregunta, opcion_a, opcion_b, opcion_c, opcion_d) VALUES (?, ?, ?, ?, ?, ?)",
        [examResult.insertId, p.texto, p.a, p.b, p.c, p.d]
      );
    }

    await connection.commit();
    res.json({ message: "Examen creado con éxito", id: examResult.insertId });
  } catch (error) {
    await connection.rollback();
    res.status(500).json({ message: "Error al guardar el examen" });
  } finally {
    connection.release();
  }
});

router.post("/horarios", Verify, async (req, res) => {
  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();
    const { group_id, horarios } = req.body;

    await connection.query("DELETE FROM horarios WHERE student_tutor_id = ?", [group_id]);

    for (const h of horarios) {
      await connection.query(
        "INSERT INTO horarios (student_tutor_id, dia_semana, hora_inicio, hora_fin) VALUES (?, ?, ?, ?)",
        [group_id, h.dia, h.hora_inicio, h.hora_fin]
      );
    }

    await connection.commit();
    res.json({ message: "Horario guardado con éxito" });
  } catch (error) {
    await connection.rollback();
    console.error("Error al guardar horario:", error);
    res.status(500).json({ message: "Error al guardar el horario" });
  } finally {
    connection.release();
  }
});

router.post("/materials", Verify, uploadMaterial.single("file"), async (req, res) => {
  try {
    const { student_tutor_ids, title, type, external_url } = req.body;

    if (!student_tutor_ids) return res.status(400).json({ message: "Grupo inválido" });

    let idsArray;
    try { idsArray = JSON.parse(student_tutor_ids); }
    catch { return res.status(400).json({ message: "Formato de alumnos inválido" }); }

    if (!Array.isArray(idsArray) || idsArray.length === 0) return res.status(400).json({ message: "Selecciona al menos un alumno" });
    if (!title?.trim()) return res.status(400).json({ message: "Título requerido" });
    if (!type) return res.status(400).json({ message: "Tipo requerido" });

    const placeholders = idsArray.map(() => "?").join(",");
    const [grupos] = await pool.query(
      `SELECT id FROM student_tutor WHERE id IN (${placeholders}) AND tutor = ?`,
      [...idsArray, req.user.id]
    );

    if (grupos.length !== idsArray.length) return res.status(403).json({ message: "Uno o más alumnos no autorizados" });

    const fileUrl = req.file ? `/uploads/materials/${req.file.filename}` : null;

    if (type !== "LINK" && !fileUrl) return res.status(400).json({ message: "Archivo requerido" });
    if (type === "LINK" && !external_url?.trim()) return res.status(400).json({ message: "Enlace requerido" });

    for (const studentId of idsArray) {
      await pool.query(
        "INSERT INTO materials (student_tutor_id, title, type, file_url, external_url) VALUES (?, ?, ?, ?, ?)",
        [studentId, title.trim(), type, fileUrl, external_url || null]
      );
    }

    res.status(201).json({ message: "Material publicado a los alumnos seleccionados", file_url: fileUrl });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error subiendo material" });
  }
});

export default router;
