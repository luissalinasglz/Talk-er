import express from "express";
import pool from "../db/db.js";
import { Verify, VerifyRoleSupervisor } from "../middleware/verify.js";

const router = express.Router();

router.use(Verify)
router.use(VerifyRoleSupervisor)

router.get("/tutors", async (req, res) => {
  try {
    const supervisorId = req.user.id;

    const [rows] = await pool.query(`
      SELECT
        u.id AS tutor_id,
        CONCAT(u.name, ' ', u.last_name) AS tutor_name,
        GROUP_CONCAT(DISTINCT st.idioma) AS idioma,
        COUNT(DISTINCT s.id) AS total_sessions,
        COUNT(DISTINCT sl.id) AS total_logs,
        COUNT(DISTINCT CASE
          WHEN sl.incidence = TRUE THEN sl.id
        END) AS total_incidences,
        MIN(st.start_date) AS period_start,
        MAX(st.end_date) AS period_end
      FROM reviewer_tutor rt
      JOIN users u
        ON u.id = rt.tutor_id
      LEFT JOIN student_tutor st
        ON st.tutor = u.id
      LEFT JOIN sessions s
        ON s.student_tutor = st.id
      LEFT JOIN session_logs sl
        ON sl.session_id = s.id
      WHERE rt.supervisor_id = ?
      GROUP BY u.id
    `, [supervisorId]);

    res.json(rows);

  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: "Error obteniendo tutores"
    });
  }
});

router.get("/tutor/:tutorId/sessions", async (req, res) => {
  try {
    const { tutorId } = req.params;

    const [rows] = await pool.query(`
      SELECT
        s.id AS session_id,
        s.start_time,
        s.end_time,
        st.idioma,
        sl.id AS log_id,
        COALESCE(sl.validated, FALSE) AS validated,
        COALESCE(sl.approved, FALSE) AS approved,
        sl.incidence
      FROM sessions s
      JOIN student_tutor st ON st.id = s.student_tutor
      LEFT JOIN session_logs sl ON sl.session_id = s.id
      WHERE st.tutor = ?
      ORDER BY s.start_time DESC
    `, [tutorId]);

    // Convertimos 1 y 0 de SQL a booleanos
    const formattedRows = rows.map(row => ({
      ...row,
      validated: !!row.validated,
      approved: !!row.approved
    }));

    res.json(formattedRows);

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error obteniendo sesiones" });
  }
});

router.get("/bitacoras", async (req, res) => {
  try {
    const supervisorId = req.user.id;

    const [rows] = await pool.query(`
      SELECT 
        sl.*,
        s.start_time,
        s.end_time,
        DATE(s.start_time) AS session_day,
        TIMESTAMPDIFF(MINUTE, s.start_time, s.end_time) AS duration_minutes,
        st.tutor AS tutor_id,
        st.idioma
      FROM session_logs sl
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

router.post("/correcciones", async (req, res) => {
  const supervisorId = req.user.id;
  try {
    const { validated, corrections, approved, session_id} = req.body;

    await pool.query(`
      UPDATE session_logs
      SET validated = ?, corrections = ?, approved = ?, approved_by = supervisorId
      WHERE session_id = ?
    `, [validated, corrections, approved, session_id]);

    res.json({ message: "Bitácora guardada correctamente" });
  } catch (error) {
    console.error("Error en /correcciones:", error);
    res.status(500).json({ message: "Error guardando bitácora" });
  }
});

export default router;
