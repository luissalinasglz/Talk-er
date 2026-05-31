import express from "express";
import pool from "../db/db.js";
import { Verify } from "../middleware/verify.js";
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

router.get("/tareas", Verify, async (req, res) => {
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

router.post("/tareas/presign", Verify, async (req, res) => {
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

router.post("/tareas/:id/submit", Verify, async (req, res) => {
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

router.get("/tareas/:id/submission-url", Verify, async (req, res) => {
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

router.get("/materials", Verify, async (req, res) => {
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

export default router;