import pool from "./db.js";
import bcrypt from "bcrypt";

const SALT_ROUNDS = 10;

export async function seed() {

  const [[{ count }]] = await pool.query("SELECT COUNT(*) as count FROM users");
  if (count > 0) {
    console.log("DB already seeded");
    return;
  }

  console.log("Seeding initial data");

  await pool.query(`
    INSERT INTO periods (name, session_log_percentage, letter_percentage, video_percentage, start_date, end_date)
    VALUES ('Febrero Junio 2026', 80, 10, 10, '2026-02-10 00:00:01', '2026-06-25 23:59:59')
  `);

  const users = [
    { name: "Admin",     last_name: "Apellido",  username: "A01752364",          password: "Admin134679$",   role: "admin",      period: 1 },
    { name: "Beto",      last_name: "Castro",    username: "A01425602",          password: "Beto258369$",    role: "supervisor", period: 1 },
    { name: "Dari",      last_name: "Gonzales",  username: "A01425755",          password: "DArI1607#$",     role: "teacher",    period: 1 },
    { name: "Wicho",     last_name: "Ponce",     username: "TwinchoSalinasFJ26", password: "TwinchoPro123$", role: "student",    period: 1 },
    { name: "Sebastian", last_name: "Rodriguez", username: "SebastianPonceFJ26", password: "SebasPro123",    role: "student",    period: 1 },
  ];

  for (const u of users) {
    const hash = await bcrypt.hash(u.password, SALT_ROUNDS);
    await pool.query(
      `INSERT INTO users (name, last_name, username, password_hash, role, period) VALUES (?, ?, ?, ?, ?, ?)`,
      [u.name, u.last_name, u.username, hash, u.role, u.period]
    );
  }

  await pool.query(`
    INSERT INTO student_tutor (tutor, student, idioma, start_date, end_date)
    VALUES (3, 4, 'english', '2026-02-10', '2026-06-25'), (3, 5, 'french', '2026-02-10', '2026-06-25')
  `);

  await pool.query(`INSERT INTO reviewer_tutor (tutor_id, supervisor_id) VALUES (3, 2)`);

  await pool.query(`
    INSERT INTO assignments (\`group\`, title, description, due_date)
    VALUES
      (1, 'Lección del verbo to be', 'Completa los ejercicios de la pagina 24 de tu libro de trabajo.', '2026-04-28 23:59:59'),
      (1, 'Leccion pasado simple', 'Escribe un ensayo corto de 300 palabras.', '2026-04-30 18:00:00')
  `);

  await pool.query(`
    INSERT INTO submissions (assignment, file, grade, feedback, submitted_at)
    VALUES (1, 'Verbo_to_be-Wicho.pdf', NULL, NULL, '2026-04-27 10:15:00')
  `);

  await pool.query(`
    INSERT INTO sessions (student_tutor, session_url, platform, password, start_time, end_time)
    VALUES
      (1, 'https://zoom.us/j/1112223333', 'Zoom', '12345', '2026-04-20 16:00:00', '2026-04-20 17:00:00'),
      (1, 'https://zoom.us/j/4445556666', 'Zoom', '54321', '2026-04-22 16:00:00', '2026-04-22 17:00:00')
  `);

  await pool.query(`
    INSERT INTO session_logs (session_id, title, description, evidence_url, planning, incidence, incidence_type, incidence_description, validated, corrections, approved)
    VALUES (1, 'verbo to be', 'El alumno repaso el verbo to be de forma excelente. Mostro buena actitud y participamos en un juego de roles.',
      'http://localhost:3000/v1/uploads/bitacoras/evidencia-demo-1.png',
      'Se planeo repasar la unidad 1 del libro.', FALSE, NULL, NULL, TRUE, '', FALSE)
  `);

  await pool.query(`
    INSERT INTO horarios (student_tutor_id, dia_semana, hora_inicio, hora_fin)
    VALUES (1, 4, '15:00:00', '16:00:00'), (1, 0, '20:15:00', '21:15:00')
  `);

  console.log("Seed complete");
}
