import express from "express";
import pool from "../db/db.js";
import { Verify, VerifyRoleTeacher } from "../middleware/verify.js";

const router = express.Router();

// get groups
router.get("/my-groups", Verify, VerifyRoleTeacher, async (req, res) => {
  try {
    const tutorId = req.user.id;

    const [rows] = await pool.query(`
      SELECT 
        st.id,
        st.idioma,
        CONCAT(u.name,' ',u.last_name) AS student_name
      FROM student_tutor st
      JOIN users u ON u.id = st.student
      WHERE st.tutor = ?
    `, [tutorId]);

    res.json(rows);
  } catch (error) {
    res.status(500).json({ message: "Error obteniendo grupos" });
  }
});

router.get("/horario", Verify, VerifyRoleTeacher, async (req, res) => {
  try {
    const tutorId = req.user.id;

    const [rows] = await pool.query(`
      SELECT 
        CONCAT(u.name, ' ', u.last_name) AS student_name,
        h.dia_semana,
        h.hora_inicio,
        h.hora_fin
      FROM horarios h
      JOIN student_tutor st ON h.student_tutor_id = st.id
      JOIN users u ON st.student = u.id
      WHERE st.tutor = ?
      `, [tutorId]);

    res.json(rows);
  } catch (error) {
    console.log("Error en el horario: ", error);
    res.status(500).json({ message: "Error al cargar el horario" });
  }
});

router.get("/my-groups/week", Verify, VerifyRoleTeacher, async (req, res) => {
  try {
    const tutorId = req.user.id;

    const [rows] = await pool.query(`
      SELECT 
        h.id AS horario_id,
        st.id,
        st.idioma,
        CONCAT(u.name, ' ', u.last_name) AS student_name,
        h.dia_semana,
        h.hora_inicio,
        h.hora_fin
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
    `, [tutorId]);

    res.json(rows);
  } catch (error) {
    console.error("Error al consultar pendientes de la semana:", error);
    res.status(500).json({ message: "Error obteniendo grupos de la semana" });
  }
});

// group session

router.get("/sessions/:groupId", Verify, VerifyRoleTeacher, async (req, res) => {
  try {
    const { groupId } = req.params;

    const [rows] = await pool.query(`
      SELECT * FROM sessions
      WHERE student_tutor=?
      ORDER BY id DESC
      LIMIT 1
    `, [groupId]);

    res.json(rows[0] || null);
  } catch {
    res.status(500).json({ message: "Error obteniendo sesión" });
  }
});


// --- Bitacoras ---
router.get("/clases", Verify, VerifyRoleTeacher, async (req, res) => {
  const tutorId = req.user.id;
  try {
    const [rows] = await pool.query(`
      SELECT 
        s.id,
        s.start_time,
        s.end_time,
        DATE(s.start_time) AS fecha,
        TIME(s.start_time) AS hora_inicio,
        TIME(s.end_time) AS hora_fin,
        TIMESTAMPDIFF(MINUTE, s.start_time, s.end_time) AS duracion,
        st.idioma,
        CONCAT(u.name, ' ', u.last_name) AS nombre_alumno,
        sl.id AS log_id,
        sl.description,
        sl.planning,
        sl.incidence,
        sl.incidence_type,
        sl.incidence_description
      FROM sessions s
      JOIN student_tutor st ON s.student_tutor = st.id
      JOIN users u ON st.student = u.id
      LEFT JOIN session_logs sl ON sl.session_id = s.id
      WHERE st.tutor = ?
      ORDER BY s.start_time DESC
    `, [tutorId]);

    res.json(rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error al obtener sesiones" });
  }
});

router.post("/bitacoras", Verify, VerifyRoleTeacher, async (req, res) => {
  const { sesion_id, description, planning, tareas, incidence, incidence_type, incidence_description } = req.body;

  try {
    const [existing] = await pool.query(
      `SELECT id FROM session_logs WHERE session_id = ?`, [sesion_id]
    );

    if (existing.length > 0) {
      await pool.query(`
        UPDATE session_logs 
        SET description = ?, planning = ?, incidence = ?, incidence_type = ?, incidence_description = ?
        WHERE session_id = ?
      `, [description, planning, incidence, incidence_type || null, incidence_description || null, sesion_id]);
    } else {
      await pool.query(`
        INSERT INTO session_logs (session_id, description, evidence_url, planning, incidence, incidence_type, incidence_description, validated, approved)
        VALUES (?, ?, '', ?, ?, ?, ?, false, false)
      `, [sesion_id, description, planning, incidence, incidence_type || null, incidence_description || null]);
    }

    res.json({ message: "Bitácora guardada correctamente" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error guardando bitácora" });
  }
});

// save

router.post("/sessions", Verify, VerifyRoleTeacher, async (req, res) => {
  try {
    const { student_tutor, session_url, platform, password, start_time, end_time } = req.body;

    console.log(`\n--- INTENTANDO GUARDAR SESIÓN ---`);
    console.log(`Datos recibidos:`, req.body);
    await pool.query(`
      INSERT INTO sessions (student_tutor, session_url, platform, password, start_time, end_time)
      VALUES (?, ?, ?, ?, ?, ?)
    `, [student_tutor, session_url, platform, password, start_time, end_time]);

    console.log("Sesion insertada en la DB");
    console.log(`---------------------------------\n`);

    res.json({ message: "Guardado correctamente" });
  } catch (error) {
    console.error("\nERROR AL GUARDAR SESION:", error);
    res.status(500).json({ message: "Error guardando sesión", details: error.message });
  }
});

// exams
router.get("/examenes", Verify, VerifyRoleTeacher, async (req, res) => {
  try {
    const tutorId = req.user.id;
    const [rows] = await pool.query(
      "SELECT id, nombre, clase, duracion, DATE_FORMAT(fecha_limite, '%Y-%m-%d %H:%i') as vence FROM examenes WHERE tutor_id = ?",
      [tutorId]
    );
    res.json(rows);
  } catch (error) {
    res.status(500).json({ message: "Error al obtener exámenes" });
  }
});


router.get("/tareas", Verify, VerifyRoleTeacher, async (req, res) => {
  try {
    const tutorId = req.user.id;

    const [rows] = await pool.query(`
      SELECT 
        a.id, 
        a.title AS titulo, 
        a.description AS descripcion, 
        st.idioma AS beneficiario, 
        DATE_FORMAT(a.due_date, '%Y-%m-%d') AS fechaEntrega,
        DATE_FORMAT(a.due_date, '%H:%i') AS horaLimite
      FROM assignments a
      JOIN student_tutor st ON a.\`group\` = st.id
      WHERE st.tutor = ?
    `, [tutorId]);

    res.json(rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error obteniendo tareas" });
  }
});


// -------POST--------
router.post("/tareas", Verify, VerifyRoleTeacher, async (req, res) => {
  try {
    const tutorId = req.user.id;
    let { titulo, descripcion, fechaEntrega, horaLimite, group_id } = req.body;

    if (!group_id) {
      const [groups] = await pool.query("SELECT id FROM student_tutor WHERE tutor = ? LIMIT 1", [tutorId]);
      if (groups.length > 0) {
        group_id = groups[0].id;
      } else {
        return res.status(400).json({ message: "El tutor no tiene alumnos asignados" });
      }
    }

    const due_date = `${fechaEntrega} ${horaLimite}:00`;

    const [result] = await pool.query(`
      INSERT INTO assignments (\`group\`, title, description, due_date)
      VALUES (?, ?, ?, ?)
    `, [group_id, titulo, descripcion, due_date]);

    res.json({
      message: "Tarea creada con éxito",
      tarea: {
        id: result.insertId,
        titulo,
        descripcion,
        fechaEntrega,
        horaLimite
      }
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error al crear la tarea" });
  }
});

router.post("/examenes", Verify, VerifyRoleTeacher, async (req, res) => {
  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();
    const tutorId = req.user.id;
    const { nombre, clase, duracion, fecha_limite, preguntas } = req.body;

    const [examResult] = await connection.query(
      "INSERT INTO examenes (tutor_id, nombre, clase, duracion, fecha_limite) VALUES (?, ?, ?, ?, ?)",
      [tutorId, nombre, clase, duracion, fecha_limite]
    );
    const examenId = examResult.insertId;

    for (const p of preguntas) {
      await connection.query(
        "INSERT INTO preguntas (examen_id, texto_pregunta, opcion_a, opcion_b, opcion_c, opcion_d) VALUES (?, ?, ?, ?, ?, ?)",
        [examenId, p.texto, p.a, p.b, p.c, p.d]
      );
    }

    await connection.commit();
    res.json({ message: "Examen creado con éxito", id: examenId });
  } catch (error) {
    await connection.rollback();
    res.status(500).json({ message: "Error al guardar el examen" });
  } finally {
    connection.release();
  }
});

router.post("/horarios", Verify, VerifyRoleTeacher, async (req, res) => {
  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();
    const { group_id, horarios } = req.body;

    await connection.query("DELETE FROM horarios WHERE student_tutor_id = ?", [group_id]);

    for (const horario of horarios) {
      await connection.query(
        "INSERT INTO horarios (student_tutor_id, dia_semana, hora_inicio, hora_fin) VALUES (?, ?, ?, ?)",
        [group_id, horario.dia, horario.hora_inicio, horario.hora_fin]
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

// --- Materiales ---

import multer from "multer";
import path from "path";

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/materials");
  },

  filename: (req, file, cb) => {
    const unique = Date.now() + path.extname(file.originalname);
    cb(null, unique);
  }
});

export const uploadMaterial = multer({ storage });
router.get("/materials", Verify, VerifyRoleTeacher, async (req, res) => {
  try {

    const tutorId = req.user.id;

    const [rows] = await pool.query(`
      SELECT
          m.id,
          m.title,
          m.type,
          m.file_url,
          m.external_url,
          m.uploaded_at,

          st.id AS student_tutor_id,

          CONCAT(u.name, ' ', u.last_name) AS nombre_alumno

      FROM materials m

      INNER JOIN student_tutor st
          ON st.id = m.student_tutor_id

      INNER JOIN users u
          ON u.id = st.student

      WHERE st.tutor = ?

      ORDER BY m.uploaded_at DESC
    `, [tutorId]);

    res.json(rows);

  } catch (error) {

    console.error(error);

    res.status(500).json({
      message: "Error obteniendo materiales"
    });
  }
});

router.post("/materials", Verify, VerifyRoleTeacher, uploadMaterial.single("file"), async (req, res) => {
    try {
        const tutorId = req.user.id;
        const { student_tutor_ids, title, type, external_url } = req.body;

        if (!student_tutor_ids) {
            return res.status(400).json({ message: "Grupo inválido" });
        }
        
        let idsArray;
        try {
            idsArray = JSON.parse(student_tutor_ids);
        } catch (e) {
            return res.status(400).json({ message: "Formato de alumnos inválido" });
        }

        if (!Array.isArray(idsArray) || idsArray.length === 0) {
            return res.status(400).json({ message: "Selecciona al menos un alumno" });
        }

        if (!title || !title.trim()) return res.status(400).json({ message: "Título requerido" });
        if (!type) return res.status(400).json({ message: "Tipo requerido" });

        const placeholders = idsArray.map(() => '?').join(',');
        const [grupos] = await pool.query(` 
            SELECT id 
            FROM student_tutor 
            WHERE id IN (${placeholders}) AND tutor = ?
        `, [...idsArray, tutorId]);

        if (grupos.length !== idsArray.length) {
            return res.status(403).json({ message: "Uno o más alumnos no autorizados" });
        }

        let fileUrl = null;
        if (req.file) {
            fileUrl = `/uploads/materials/${req.file.filename}`;
        }

        if (type !== "LINK" && !fileUrl) return res.status(400).json({ message: "Archivo requerido" });
        if (type === "LINK" && (!external_url || !external_url.trim())) return res.status(400).json({ message: "Enlace requerido" });

        for (const studentId of idsArray) {
            await pool.query(`
                INSERT INTO materials (
                    student_tutor_id, title, type, file_url, external_url
                ) VALUES (?, ?, ?, ?, ?)
            `, [studentId, title.trim(), type, fileUrl, external_url || null]);
        }

        res.status(201).json({
            message: "Material publicado a los alumnos seleccionados",
            file_url: fileUrl
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Error subiendo material" });
    }
});

export default router;
