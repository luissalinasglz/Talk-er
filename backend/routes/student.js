import express from "express";
import pool from "../db/db.js";
import { Verify } from "../middleware/verify.js";

const router = express.Router();

router.get("/dashboard", Verify, async (req, res) => {
    const studentId = req.user.id;

    try {
        const [clases] = await pool.query(`
            SELECT
                CASE st.idioma
                    WHEN 'english' THEN 'Inglés'
                    WHEN 'french' THEN 'Francés'
                    ELSE st.idioma
                END AS idioma,
                CONCAT(u.name, ' ', u.last_name) AS tutor_name
            FROM student_tutor st
            JOIN users u ON st.tutor = u.id
            WHERE st.student = ?
        `, [studentId]);

        const [tareas] = await pool.query(`
            SELECT a.id, a.title, a.due_date,
                CASE st.idioma
                    WHEN 'english' THEN 'Inglés'
                    WHEN 'french' THEN 'Francés'
                    ELSE st.idioma
                END AS idioma
            FROM assignments a
            JOIN student_tutor st ON a.group = st.id
            WHERE st.student = ? AND a.due_date >= DATE_SUB(NOW(), INTERVAL 1 DAY)
            ORDER BY a.due_date ASC
            LIMIT 4
        `, [studentId]);

        const [sesiones] = await pool.query(`
            SELECT s.id, s.start_time, s.end_time, s.session_url,
                CASE st.idioma
                    WHEN 'english' THEN 'Inglés'
                    WHEN 'french' THEN 'Francés'
                    ELSE st.idioma
                END AS idioma,
                CONCAT(u.name, ' ', u.last_name) AS tutor_name
            FROM sessions s
            JOIN student_tutor st ON s.student_tutor = st.id
            JOIN users u ON st.tutor = u.id
            WHERE st.student = ? AND s.end_time >= DATE_SUB(NOW(), INTERVAL 2 DAY)
            ORDER BY s.start_time ASC
        `, [studentId]);

        res.json({ clases, tareas, sesiones });

    } catch (error) {
        console.error("Error en dashboard de estudiante: ", error);
        res.status(500).json({ message: "Error al cargar el dashboard" });
    }
});

router.get("/sesiones", Verify, async (req, res) => {
    try {
        const [sesiones] = await pool.query(`
            SELECT s.id, s.start_time, s.end_time, s.session_url, s.platform,
                CASE st.idioma
                    WHEN 'english' THEN 'Inglés'
                    WHEN 'french' THEN 'Francés'
                    ELSE st.idioma
                END AS idioma,
                CONCAT(u.name, ' ', u.last_name) AS tutor_name
            FROM sessions s
            JOIN student_tutor st ON s.student_tutor = st.id
            JOIN users u ON st.tutor = u.id
            WHERE st.student = ?
            ORDER BY s.start_time ASC
        `, [req.user.id]);

        res.json(sesiones);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Error al cargar sesiones" });
    }
});

export default router;