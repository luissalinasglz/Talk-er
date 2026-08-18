import express from "express";
import pool from "../db/db.js";
import Examen from "../models/Examen.js";
import Submission from "../models/Submission.js";
import { Verify, VerifyRoleStudent } from "../middleware/verify.js";
import cellar from "../middleware/cellar.js";
import { PutObjectCommand, DeleteObjectCommand, GetObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import crypto from "crypto";

const ALLOWED_MIME_TYPES_SUBMISSIONS = [
    "application/pdf",
    "image/png",
    "image/jpeg",
    "image/jpg",
    "application/msword",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
];

const router = express.Router();

router.use(Verify)
router.use(VerifyRoleStudent)

// ─── DASHBOARD ───────────────────────────────────────────────────────────────
router.get("/dashboard", async (req, res) => {
    try {
        // 1. Clases (grupos activos del estudiante)
        const [clases] = await pool.query(`
            SELECT
                st.id,
                CASE st.idioma
                    WHEN 'english' THEN 'Inglés'
                    WHEN 'french' THEN 'Francés'
                    ELSE st.idioma
                END AS idioma,
                u.name AS tutor_name
            FROM student_tutor st
            JOIN users u ON u.id = st.tutor
            WHERE st.student = ?
        `, [req.user.id]);

        // 2. Tareas próximas (sin entrega aún, ordenadas por due_date ASC)
        const [tareas] = await pool.query(`
            SELECT
                a.id,
                a.title,
                a.due_date,
                CASE st.idioma
                    WHEN 'english' THEN 'Inglés'
                    WHEN 'french' THEN 'Francés'
                    ELSE st.idioma
                END AS idioma
            FROM assignments a
            JOIN student_tutor st ON a.\`group\` = st.id
            LEFT JOIN submissions sub ON sub.assignment = a.id
            WHERE st.student = ?
              AND sub.id IS NULL
              AND a.due_date >= NOW()
            ORDER BY a.due_date ASC
            LIMIT 5
        `, [req.user.id]);

        // 3. Sesiones — se trae desde hace 1 día para cubrir diferencias de
        //    zona horaria entre el servidor (UTC) y el cliente (UTC-6).
        //    El frontend filtra con hora local del navegador.
        const [sesiones] = await pool.query(`
            SELECT
                s.id,
                s.start_time,
                s.end_time,
                s.session_url,
                u.name AS tutor_name,
                CASE st.idioma
                    WHEN 'english' THEN 'Inglés'
                    WHEN 'french' THEN 'Francés'
                    ELSE st.idioma
                END AS idioma
            FROM sessions s
            JOIN student_tutor st ON s.student_tutor = st.id
            JOIN users u ON u.id = st.tutor
            WHERE st.student = ?
              AND s.start_time >= NOW() - INTERVAL 1 DAY
            ORDER BY s.start_time ASC
        `, [req.user.id]);

        res.json({ clases, tareas, sesiones });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Error cargando dashboard" });
    }
});

// ─── SESIONES ─────────────────────────────────────────────────────────────────
router.get("/sesiones", async (req, res) => {
    try {
        const [sesiones] = await pool.query(`
            SELECT
                s.id,
                s.start_time,
                s.end_time,
                s.session_url,
                u.name AS tutor_name,
                CASE st.idioma
                    WHEN 'english' THEN 'Inglés'
                    WHEN 'french' THEN 'Francés'
                    ELSE st.idioma
                END AS idioma
            FROM sessions s
            JOIN student_tutor st ON s.student_tutor = st.id
            JOIN users u ON u.id = st.tutor
            WHERE st.student = ?
            ORDER BY s.start_time ASC
        `, [req.user.id]);

        res.json(sesiones);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Error cargando sesiones" });
    }
});

router.get("/tareas", async (req, res) => {
    try {
        const [tareas] = await pool.query(`
            SELECT
                a.id,
                a.title,
                a.description,
                a.due_date,
                CASE st.idioma
                    WHEN 'english' THEN 'Inglés'
                    WHEN 'french' THEN 'Francés'
                    ELSE st.idioma
                END AS idioma,
                sub.id AS submission_id,
                sub.file AS submission_file,
                sub.grade,
                sub.feedback,
                sub.submitted_at
            FROM assignments a
            JOIN student_tutor st ON a.\`group\` = st.id
            LEFT JOIN submissions sub ON sub.assignment = a.id
            WHERE st.student = ?
            ORDER BY a.due_date ASC
        `, [req.user.id]);

        res.json(tareas);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Error al cargar tareas" });
    }
});

router.post("/tareas/presign", async (req, res) => {
    try {
        const { filename, contentType, assignmentId } = req.body;

        if (!filename || !contentType || !assignmentId) {
            return res.status(400).json({ message: "Faltan campos requeridos" });
        }

        if (!ALLOWED_MIME_TYPES_SUBMISSIONS.includes(contentType)) {
            return res.status(400).json({ message: "Tipo de archivo no permitido" });
        }

        const [rows] = await pool.query(`
            SELECT a.id
            FROM assignments a
            JOIN student_tutor st ON a.\`group\` = st.id
            WHERE a.id = ? AND st.student = ?
        `, [assignmentId, req.user.id]);

        if (rows.length === 0) {
            return res.status(403).json({ message: "Acceso denegado" });
        }

        const ext = filename.split(".").pop()?.toLowerCase();
        const fileId = crypto.randomBytes(16).toString("hex");
        const fileKey = `submissions/${fileId}.${ext}`;

        const command = new PutObjectCommand({
            Bucket: process.env.CELLAR_ADDON_BUCKET,
            Key: fileKey,
            ContentType: contentType,
            ContentLengthRange: [1, 5 * 1024 * 1024], // máx 5MB
        });

        const uploadUrl = await getSignedUrl(cellar, command, { expiresIn: 120 });

        res.json({ uploadUrl, fileKey });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Error al preparar subida" });
    }
});

router.post("/tareas/:id/submit", async (req, res) => {
    try {
        const { fileKey } = req.body;
        const assignmentId = req.params.id;

        if (!fileKey) {
            return res.status(400).json({ message: "Archivo requerido" });
        }

        const [rows] = await pool.query(`
            SELECT a.id
            FROM assignments a
            JOIN student_tutor st ON a.\`group\` = st.id
            WHERE a.id = ? AND st.student = ?
        `, [assignmentId, req.user.id]);

        if (rows.length === 0) {
            return res.status(403).json({ message: "Acceso denegado" });
        }

        const [existing] = await pool.query(
            `SELECT id, file FROM submissions WHERE assignment = ?`,
            [assignmentId]
        );

        if (existing.length > 0) {
            if (existing[0].file) {
                try {
                    await cellar.send(new DeleteObjectCommand({
                        Bucket: process.env.CELLAR_ADDON_BUCKET,
                        Key: existing[0].file,
                    }));
                } catch (deleteErr) {
                    console.warn("No se pudo borrar archivo viejo:", deleteErr.message);
                }
            }

            await pool.query(
                `UPDATE submissions SET file = ?, submitted_at = NOW() WHERE assignment = ?`,
                [fileKey, assignmentId]
            );
        } else {
            await pool.query(
                `INSERT INTO submissions (assignment, file, feedback, submitted_at) VALUES (?, ?, '', NOW())`,
                [assignmentId, fileKey]
            );
        }

        res.json({ message: "Tarea entregada correctamente" });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Error al guardar entrega" });
    }
});

router.get("/tareas/:id/submission-url", async (req, res) => {
    try {
        const [rows] = await pool.query(`
            SELECT sub.file
            FROM submissions sub
            JOIN assignments a ON sub.assignment = a.id
            JOIN student_tutor st ON a.\`group\` = st.id
            WHERE a.id = ? AND st.student = ?
        `, [req.params.id, req.user.id]);

        if (rows.length === 0 || !rows[0].file) {
            return res.status(404).json({ message: "No hay entrega" });
        }

        const command = new GetObjectCommand({
            Bucket: process.env.CELLAR_ADDON_BUCKET,
            Key: rows[0].file,
        });

        const url = await getSignedUrl(cellar, command, { expiresIn: 300 });

        res.json({ url, fileKey: rows[0].file });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Error generando URL" });
    }
});

router.get("/materials", async (req, res) => {
    try {
        const [rows] = await pool.query(`
            SELECT
                m.id,
                m.title,
                m.type,
                m.file_url,
                m.external_url,
                m.uploaded_at,
                CASE st.idioma
                    WHEN 'english' THEN 'Inglés'
                    WHEN 'french' THEN 'Francés'
                    ELSE st.idioma
                END AS idioma
            FROM materials m
            INNER JOIN student_tutor st ON st.id = m.student_tutor_id
            WHERE st.student = ?
            ORDER BY m.uploaded_at DESC
        `, [req.user.id]);

        await Promise.all(rows.map(async (row) => {
            if (row.file_url && row.type !== "LINK") {
                const command = new GetObjectCommand({
                    Bucket: process.env.CELLAR_ADDON_BUCKET,
                    Key: row.file_url,
                });
                row.signed_file_url = await getSignedUrl(cellar, command, { expiresIn: 1800 });
            }
        }));

        res.json(rows);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Error obteniendo materiales" });
    }
});

// GET lista de exámenes
router.get("/examenes", async (req, res) => {
    try {
        const [stRows] = await pool.query(
            `SELECT id FROM student_tutor WHERE student = ?`,
            [req.user.id]
        );

        if (stRows.length === 0) {
            return res.json({ disponibles: [], calificados: [] });
        }

        const studentTutorIds = stRows.map((r) => r.id);

        const examenes = await Examen.find({ clase: { $in: studentTutorIds } })
            .select("-preguntas")
            .sort({ fecha_limite: 1 })
            .lean();

        const examenIds = examenes.map((e) => e._id);
        const submissions = await Submission.find({
            examen_id: { $in: examenIds },
            student_id: req.user.id,
        }).lean();

        const subMap = {};
        submissions.forEach((s) => {
            subMap[s.examen_id.toString()] = s;
        });

        const ahora = new Date();
        const disponibles = [];
        const calificados = [];

        examenes.forEach((e) => {
            const sub = subMap[e._id.toString()];
            if (sub) {
                calificados.push({ ...e, submission: sub });
            } else if (new Date(e.fecha_limite) > ahora) {
                disponibles.push(e);
            }
        });

        res.json({ disponibles, calificados });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Error obteniendo exámenes" });
    }
});

// GET examen completo con preguntas
router.get("/examenes/:id", async (req, res) => {
    try {
        const [stRows] = await pool.query(
            `SELECT id FROM student_tutor WHERE student = ?`,
            [req.user.id]
        );

        if (stRows.length === 0) {
            return res.status(403).json({ message: "Acceso denegado" });
        }

        const studentTutorIds = stRows.map((r) => r.id);

        const examen = await Examen.findOne({
            _id: req.params.id,
            clase: { $in: studentTutorIds },
        }).lean();

        if (!examen) return res.status(404).json({ message: "No encontrado" });

        const existing = await Submission.findOne({
            examen_id: req.params.id,
            student_id: req.user.id,
        });

        if (existing) {
            return res.status(403).json({ message: "Ya presentaste este examen" });
        }

        // Enviar preguntas sin la respuesta correcta
        const examenSinRespuestas = {
            ...examen,
            preguntas: examen.preguntas.map(({ enunciado, opciones }) => ({
                enunciado,
                opciones,
            })),
        };

        res.json(examenSinRespuestas);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Error obteniendo examen" });
    }
});

// POST enviar respuestas
router.post("/examenes/:id/submit", async (req, res) => {
    try {
        const { respuestas } = req.body;

        if (!Array.isArray(respuestas)) {
            return res.status(400).json({ message: "Respuestas inválidas" });
        }

        const [stRows] = await pool.query(
            `SELECT id FROM student_tutor WHERE student = ?`,
            [req.user.id]
        );

        if (stRows.length === 0) {
            return res.status(403).json({ message: "Acceso denegado" });
        }

        const studentTutorIds = stRows.map((r) => r.id);

        const examen = await Examen.findOne({
            _id: req.params.id,
            clase: { $in: studentTutorIds },
        }).lean();

        if (!examen) return res.status(404).json({ message: "No encontrado" });

        if (new Date(examen.fecha_limite) < new Date()) {
            return res.status(403).json({ message: "El examen ya venció" });
        }

        const existing = await Submission.findOne({
            examen_id: req.params.id,
            student_id: req.user.id,
        });
        if (existing) {
            return res.status(403).json({ message: "Ya presentaste este examen" });
        }

        // Evaluar
        const total = examen.preguntas.length;
        let correctas = 0;
        examen.preguntas.forEach((pregunta, i) => {
            if (respuestas[i] === pregunta.correcta) correctas++;
        });

        const calificacion = total > 0
            ? Math.round((correctas / total) * 10 * 10) / 10
            : 0;

        const submission = await Submission.create({
            examen_id: examen._id,
            student_id: req.user.id,
            respuestas,
            calificacion,
            retro: "",
        });

        res.status(201).json({
            message: "Examen enviado",
            calificacion,
            correctas,
            total,
            submission_id: submission._id,
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Error enviando examen" });
    }
});

export default router;