import express from "express";
import pool from "../db/db.js";
import { Verify, VerifyRoleTeacher } from "../middleware/verify.js";
import cellar from "../middleware/cellar.js";
import { PutObjectCommand, GetObjectCommand, DeleteObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import crypto from "crypto";

const router = express.Router();

// ==========================================
// CONFIG
// ==========================================

const ALLOWED_MIME_TYPES = [
  "application/pdf",

  "image/png",
  "image/jpeg",
  "image/jpg",
  "image/webp",

  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",

  "application/vnd.ms-powerpoint",
  "application/vnd.openxmlformats-officedocument.presentationml.presentation",

  "video/mp4",
];

const STORAGE_FOLDERS = {
  material: "materials",
  evidence: "bitacoras",
};

// ==========================================
// MIDDLEWARES
// ==========================================

router.use(Verify);
router.use(VerifyRoleTeacher);

// ==========================================
// STORAGE - PRESIGNED URL
// ==========================================

router.post("/storage/presign", async (req, res) => {
  try {
    const { type, filename, contentType } = req.body;

    if (!type || !filename || !contentType) {
      return res.status(400).json({
        message: "Faltan campos requeridos",
      });
    }

    if (!STORAGE_FOLDERS[type]) {
      return res.status(400).json({
        message: "Tipo de almacenamiento inválido",
      });
    }

    if (!ALLOWED_MIME_TYPES.includes(contentType)) {
      return res.status(400).json({
        message: "Tipo de archivo no permitido",
      });
    }

    const ext = filename.split(".").pop()?.toLowerCase();

    const fileId = crypto.randomBytes(16).toString("hex");

    const fileKey = `${STORAGE_FOLDERS[type]}/${fileId}.${ext}`;

    const command = new PutObjectCommand({
      Bucket: process.env.CELLAR_ADDON_BUCKET,
      Key: fileKey,
      ContentType: contentType,
    });

    const uploadUrl = await getSignedUrl(cellar, command, {
      expiresIn: 120,
    });

    res.json({
      uploadUrl,
      fileKey,
    });

  } catch (error) {
    console.error(error);

    res.status(500).json({
      message: "Error al preparar subida",
    });
  }
});

// ==========================================
// GET ENDPOINTS
// ==========================================

router.get("/my-groups", async (req, res) => {
  try {
    const [rows] = await pool.query(
      `
      SELECT st.id, st.idioma,
        CONCAT(u.name,' ',u.last_name) AS student_name
      FROM student_tutor st
      JOIN users u ON u.id = st.student
      WHERE st.tutor = ?
    `,
      [req.user.id]
    );

    res.json(rows);
  } catch {
    res.status(500).json({
      message: "Error obteniendo grupos",
    });
  }
});

router.get("/horario", async (req, res) => {
  try {
    const [rows] = await pool.query(
      `
      SELECT CONCAT(u.name, ' ', u.last_name) AS student_name,
        h.dia_semana,
        h.hora_inicio,
        h.hora_fin
      FROM horarios h
      JOIN student_tutor st
        ON h.student_tutor_id = st.id
      JOIN users u
        ON st.student = u.id
      WHERE st.tutor = ?
    `,
      [req.user.id]
    );

    res.json(rows);
  } catch (error) {
    console.error(error);

    res.status(500).json({
      message: "Error al cargar horario",
    });
  }
});

router.get("/my-groups/week", async (req, res) => {
  try {
    const [rows] = await pool.query(
      `
      SELECT h.id AS horario_id,
        st.id,
        st.idioma,
        CONCAT(u.name, ' ', u.last_name) AS student_name,
        h.dia_semana,
        h.hora_inicio,
        h.hora_fin
      FROM student_tutor st
      JOIN users u
        ON u.id = st.student
      JOIN horarios h
        ON h.student_tutor_id = st.id
      WHERE st.tutor = ?
        AND NOT EXISTS (
          SELECT 1
          FROM sessions s
          WHERE s.student_tutor = st.id
            AND DAYOFWEEK(s.start_time) - 1 = h.dia_semana
            AND TIME(s.start_time) = h.hora_inicio
            AND YEARWEEK(s.start_time, 0) =
                YEARWEEK(CURDATE(), 0)
        )
      ORDER BY h.dia_semana, h.hora_inicio
    `,
      [req.user.id]
    );

    res.json(rows);
  } catch (error) {
    console.error(error);

    res.status(500).json({
      message: "Error obteniendo grupos",
    });
  }
});

router.get("/sessions/:groupId", async (req, res) => {
  try {
    const [rows] = await pool.query(
      `
      SELECT *
      FROM sessions
      WHERE student_tutor = ?
      ORDER BY id DESC
      LIMIT 1
    `,
      [req.params.groupId]
    );

    res.json(rows[0] || null);
  } catch {
    res.status(500).json({
      message: "Error obteniendo sesión",
    });
  }
});

router.get("/clases", async (req, res) => {
  try {
    const [rows] = await pool.query(
      `
      SELECT s.id,
        s.start_time,
        s.end_time,
        DATE(s.start_time) AS fecha,
        TIME(s.start_time) AS hora_inicio,
        TIME(s.end_time) AS hora_fin,
        TIMESTAMPDIFF(MINUTE, s.start_time, s.end_time) AS duracion,
        st.idioma,
        CONCAT(u.name, ' ', u.last_name) AS nombre_alumno,
        sl.id AS log_id,
        sl.title,
        sl.description,
        sl.planning,
        sl.evidence_url,
        sl.corrections AS comentarios,
        sl.incidence,
        sl.incidence_type,
        sl.incidence_description,
        sl.validated,
        sl.approved
      FROM sessions s
      JOIN student_tutor st
        ON s.student_tutor = st.id
      JOIN users u
        ON st.student = u.id
      LEFT JOIN session_logs sl
        ON sl.session_id = s.id
      WHERE st.tutor = ?
      ORDER BY s.start_time DESC
    `,
      [req.user.id]
    );

    await Promise.all(
      rows.map(async (row) => {
        if (row.evidence_url) {
          const command = new GetObjectCommand({
            Bucket: process.env.CELLAR_ADDON_BUCKET,
            Key: row.evidence_url,
          });

          row.signed_evidence_url = await getSignedUrl(
            cellar,
            command,
            {
              expiresIn: 300,
            }
          );
        }
      })
    );

    res.json(rows);
  } catch (error) {
    console.error(error);

    res.status(500).json({
      message: "Error obteniendo sesiones",
    });
  }
});

router.get("/examenes", async (req, res) => {
  try {
    const [rows] = await pool.query(
      `
      SELECT id,
        nombre,
        clase,
        duracion,
        DATE_FORMAT(fecha_limite, '%Y-%m-%d %H:%i') AS vence
      FROM examenes
      WHERE tutor_id = ?
    `,
      [req.user.id]
    );

    res.json(rows);
  } catch {
    res.status(500).json({
      message: "Error obteniendo exámenes",
    });
  }
});

router.get("/tareas", async (req, res) => {
  try {
    const [rows] = await pool.query(
      `
      SELECT a.id,
        a.title AS titulo,
        a.description AS descripcion,
        st.idioma AS beneficiario,
        DATE_FORMAT(a.due_date, '%Y-%m-%d') AS fechaEntrega,
        DATE_FORMAT(a.due_date, '%H:%i') AS horaLimite
      FROM assignments a
      JOIN student_tutor st
        ON a.\`group\` = st.id
      WHERE st.tutor = ?
    `,
      [req.user.id]
    );

    res.json(rows);
  } catch (error) {
    console.error(error);

    res.status(500).json({
      message: "Error obteniendo tareas",
    });
  }
});

router.get("/materials", async (req, res) => {
  try {
    const [rows] = await pool.query(
      `
      SELECT m.id,
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
    `,
      [req.user.id]
    );

    await Promise.all(
      rows.map(async (row) => {
        if (row.file_url && row.type !== "LINK") {
          const command = new GetObjectCommand({
            Bucket: process.env.CELLAR_ADDON_BUCKET,
            Key: row.file_url,
          });

          row.signed_file_url = await getSignedUrl(
            cellar,
            command,
            {
              expiresIn: 300,
            }
          );
        }
      })
    );

    res.json(rows);
  } catch (error) {
    console.error(error);

    res.status(500).json({
      message: "Error obteniendo materiales",
    });
  }
});

// ==========================================
// POST ENDPOINTS
// ==========================================

router.post("/bitacoras", async (req, res) => {
  try {
    const {
      sesion_id,
      title,
      description,
      planning,
      evidence_url,
      incidence,
      incidence_type,
      incidence_description,
    } = req.body;

    const [existing] = await pool.query(
      `
      SELECT id
      FROM session_logs
      WHERE session_id = ?
    `,
      [sesion_id]
    );

    if (existing.length > 0) {
      await pool.query(
        `
        UPDATE session_logs
        SET title=?,
          description=?,
          planning=?,
          incidence=?,
          incidence_type=?,
          incidence_description=?,
          evidence_url = IF(? != '', ?, evidence_url),
          corrections='',
          validated=TRUE,
          approved=FALSE
        WHERE session_id=?
      `,
        [
          title,
          description,
          planning,
          incidence,
          incidence_type || null,
          incidence_description || null,
          evidence_url,
          evidence_url,
          sesion_id,
        ]
      );
    } else {
      await pool.query(
        `
        INSERT INTO session_logs (
          session_id,
          title,
          description,
          evidence_url,
          planning,
          incidence,
          incidence_type,
          incidence_description,
          validated,
          approved
        )
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, TRUE, FALSE)
      `,
        [
          sesion_id,
          title,
          description,
          evidence_url || "",
          planning,
          incidence,
          incidence_type || null,
          incidence_description || null,
        ]
      );
    }

    res.json({
      message: "Bitácora enviada correctamente",
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      message: "Error guardando bitácora",
    });
  }
});

router.post("/sessions", async (req, res) => {
  try {
    const {
      student_tutor,
      session_url,
      platform,
      password,
      start_time,
      end_time,
    } = req.body;

    await pool.query(
      `
      INSERT INTO sessions (
        student_tutor,
        session_url,
        platform,
        password,
        start_time,
        end_time
      )
      VALUES (?, ?, ?, ?, ?, ?)
    `,
      [
        student_tutor,
        session_url,
        platform,
        password,
        start_time,
        end_time,
      ]
    );

    res.json({
      message: "Sesión guardada",
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      message: "Error guardando sesión",
    });
  }
});

router.post("/materials", async (req, res) => {
  try {
    const {
      student_tutor_ids,
      title,
      type,
      file_url,
      external_url,
    } = req.body;

    if (
      !student_tutor_ids ||
      !Array.isArray(student_tutor_ids) ||
      student_tutor_ids.length === 0
    ) {
      return res.status(400).json({
        message: "Selecciona alumnos",
      });
    }

    if (!title?.trim()) {
      return res.status(400).json({
        message: "Título requerido",
      });
    }

    if (!type) {
      return res.status(400).json({
        message: "Tipo requerido",
      });
    }

    const placeholders = student_tutor_ids
      .map(() => "?")
      .join(",");

    const [grupos] = await pool.query(
      `
      SELECT id
      FROM student_tutor
      WHERE id IN (${placeholders})
        AND tutor = ?
    `,
      [...student_tutor_ids, req.user.id]
    );

    if (grupos.length !== student_tutor_ids.length) {
      return res.status(403).json({
        message: "Acceso denegado",
      });
    }

    if (type !== "LINK" && !file_url) {
      return res.status(400).json({
        message: "Archivo requerido",
      });
    }

    if (type === "LINK" && !external_url?.trim()) {
      return res.status(400).json({
        message: "Enlace requerido",
      });
    }

    await Promise.all(
      student_tutor_ids.map(async (studentId) => {
        await pool.query(
          `
          INSERT INTO materials (
            student_tutor_id,
            title,
            type,
            file_url,
            external_url
          )
          VALUES (?, ?, ?, ?, ?)
        `,
          [
            studentId,
            title.trim(),
            type,
            file_url || null,
            external_url || null,
          ]
        );
      })
    );

    res.status(201).json({
      message: "Material publicado",
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      message: "Error guardando material",
    });
  }
});

router.post("/deleteMaterial", async (req, res) => {
  try {
    const { file_url, type, student_tutor_ids } = req.body;

    if (
      !student_tutor_ids ||
      !Array.isArray(student_tutor_ids) ||
      student_tutor_ids.length === 0
    ) {
      return res.status(400).json({
        message: "IDs de material requeridos",
      });
    }

    // Verificar que todos los materiales pertenecen al tutor autenticado
    const placeholders = student_tutor_ids.map(() => "?").join(",");

    const [rows] = await pool.query(
      `
      SELECT m.id, m.file_url
      FROM materials m
      INNER JOIN student_tutor st ON st.id = m.student_tutor_id
      WHERE m.id IN (${placeholders})
        AND st.tutor = ?
    `,
      [...student_tutor_ids, req.user.id]
    );

    if (rows.length !== student_tutor_ids.length) {
      return res.status(403).json({
        message: "Acceso denegado",
      });
    }

    // Eliminar filas de la DB
    await pool.query(
      `DELETE FROM materials WHERE id IN (${placeholders})`,
      student_tutor_ids
    );

    // Eliminar archivo de Cellar solo si no es un LINK
    if (type !== "LINK" && file_url) {
      const command = new DeleteObjectCommand({
        Bucket: process.env.CELLAR_ADDON_BUCKET,
        Key: file_url,
      });

      await cellar.send(command);
    }

    res.json({
      message: "Material eliminado correctamente",
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      message: "Error eliminando el material",
    });
  }
});

router.put("/tareas/:id", async (req, res) => {
  try {
    const {
      titulo,
      descripcion,
      fechaEntrega,
      horaLimite,
    } = req.body;

    await pool.query(
      `
      UPDATE assignments
      SET title = ?,
        description = ?,
        due_date = ?
      WHERE id = ?
    `,
      [
        titulo,
        descripcion,
        `${fechaEntrega} ${horaLimite}:00`,
        req.params.id,
      ]
    );

    res.json({
      message: "Tarea actualizada",
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      message: "Error actualizando tarea",
    });
  }
});

router.post("/horarios",  async (req, res) => {
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

router.get("/hola", async (req, res) => {
  res.json("HOLA MUNDO TUTOR");
});

export default router;