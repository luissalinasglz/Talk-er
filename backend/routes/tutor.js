import express from "express";
import pool from "../db/db.js";
import { Verify } from "../middleware/verify.js";

const router = express.Router();

// get groups

router.get("/my-groups", Verify, async (req, res) => {
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

// group session

router.get("/sessions/:groupId", Verify, async (req, res) => {
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

// save

router.post("/sessions", Verify, async (req, res) => {
  try {
    const { student_tutor, session_url, start_time, end_time } = req.body;

    await pool.query(`
      INSERT INTO sessions(student_tutor, session_url, start_time, end_time)
      VALUES (?, ?, ?, ?)
    `, [student_tutor, session_url, start_time, end_time]);

    res.json({ message: "Guardado correctamente" });
  } catch {
    res.status(500).json({ message: "Error guardando sesión" });
  }
});

// exams
router.get("/examenes", Verify, async (req, res) => {
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


router.get("/tareas", Verify, async (req, res) => {
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
router.post("/tareas", Verify, async (req, res) => {
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

router.post("/examenes", Verify, async (req, res) => {
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

export default router;