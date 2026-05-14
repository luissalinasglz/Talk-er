import express from "express";
import pool from "../db/db.js";
import { Verify } from "../middleware/verify.js";

const router = express.Router();

router.get("/tutors", Verify, async (req, res) => {
  try {
    const supervisorId = req.user.id;

    const [rows] = await pool.query(`
      SELECT
        rt.id,
        rt.tutor_id,
        CONCAT(u.name, ' ', u.last_name) AS tutor_name
      FROM reviewer_tutor rt
      JOIN users u ON u.id = rt.tutor_id
      WHERE rt.supervisor_id = ?
    `, [supervisorId]);

    res.json(rows);
  } catch (error) {
    console.error("Error en /tutors:", error);
    res.status(500).json({ message: "Error obteniendo tutores" });
  }
});

router.get("/bitacoras", Verify, async (req, res) => {
  try {
    const supervisorId = req.user.id;

    const [rows] = await pool.query(`
      SELECT sl.* FROM session_logs sl
      JOIN sessions s ON sl.session_id = s.id
      JOIN student_tutor st ON s.student_tutor = st.id
      JOIN reviewer_tutor rt ON st.tutor = rt.tutor_id
      WHERE rt.supervisor_id = ? 
      AND sl.validated = TRUE 
      AND sl.approved = FALSE
    `, [supervisorId]);

    res.json(rows);
  } catch (error) {
    console.error("Error en /bitacoras:", error);
    res.status(500).json({ message: "Error obteniendo bitácoras pendientes" });
  }
});

router.post("/correcciones", Verify, async (req, res) => {
  try {
    const { validated, corrections, approved, session_id } = req.body;

    await pool.query(`
      UPDATE session_logs
      SET validated = ?, corrections = ?, approved = ?
      WHERE session_id = ?
    `, [validated, corrections, approved, session_id]);

    res.json({ message: "Bitácora guardada correctamente" });
  } catch (error) {
    console.error("Error en /correcciones:", error);
    res.status(500).json({ message: "Error guardando bitácora" });
  }
});

export default router;