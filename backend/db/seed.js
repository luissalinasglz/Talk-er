import { readFile } from "fs/promises";
import { fileURLToPath } from "url";
import path from "path";
import pool from "./db.js";
import bcrypt from "bcrypt";

const SALT_ROUNDS = 10;

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DATA_PATH = path.join(__dirname, "seed-data.json");

async function loadSeedData() {
  const raw = await readFile(DATA_PATH, "utf-8");
  return JSON.parse(raw);
}

export async function seed() {

  const [[{ count }]] = await pool.query("SELECT COUNT(*) as count FROM users");
  if (count > 0) {
    console.log("DB already seeded");
    return;
  }

  console.log("Seeding initial data");

  const data = await loadSeedData();

  for (const p of data.periods) {
    await pool.query(
      `INSERT INTO periods (name, session_log_percentage, letter_percentage, video_percentage, start_date, end_date)
      VALUES (?, ?, ?, ?, ?, ?)`,
      [p.name, p.session_log_percentage, p.letter_percentage, p.video_percentage, p.start_date, p.end_date]
    );
  }

  for (const u of data.users) {
    const hash = await bcrypt.hash(u.password, SALT_ROUNDS);
    await pool.query(
      `INSERT INTO users (name, last_name, username, password_hash, role, period) VALUES (?, ?, ?, ?, ?, ?)`,
      [u.name, u.last_name, u.username, hash, u.role, u.period]
    );
  }

  for (const st of data.student_tutor) {
    await pool.query(
      `INSERT INTO student_tutor (tutor, student, idioma, start_date, end_date) VALUES (?, ?, ?, ?, ?)`,
      [st.tutor, st.student, st.idioma, st.start_date, st.end_date]
    );
  }

  for (const rt of data.reviewer_tutor) {
    await pool.query(
      `INSERT INTO reviewer_tutor (tutor_id, supervisor_id) VALUES (?, ?)`,
      [rt.tutor_id, rt.supervisor_id]
    );
  }

  for (const a of data.assignments) {
    await pool.query(
      `INSERT INTO assignments (\`group\`, title, description, due_date) VALUES (?, ?, ?, ?)`,
      [a.group, a.title, a.description, a.due_date]
    );
  }

  for (const s of data.submissions) {
    await pool.query(
      `INSERT INTO submissions (assignment, file, grade, feedback, submitted_at) VALUES (?, ?, ?, ?, ?)`,
      [s.assignment, s.file, s.grade, s.feedback, s.submitted_at]
    );
  }

  for (const s of data.sessions) {
    await pool.query(
      `INSERT INTO sessions (student_tutor, session_url, platform, password, start_time, end_time) VALUES (?, ?, ?, ?, ?, ?)`,
      [s.student_tutor, s.session_url, s.platform, s.password, s.start_time, s.end_time]
    );
  }

  for (const sl of data.session_logs) {
    await pool.query(
      `INSERT INTO session_logs (session_id, title, description, evidence_url, planning, incidence, incidence_type, incidence_description, validated, corrections, approved)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        sl.session_id, sl.title, sl.description, sl.evidence_url, sl.planning,
        sl.incidence, sl.incidence_type, sl.incidence_description, sl.validated,
        sl.corrections, sl.approved
      ]
    );
  }

  for (const h of data.horarios) {
    await pool.query(
      `INSERT INTO horarios (student_tutor_id, dia_semana, hora_inicio, hora_fin) VALUES (?, ?, ?, ?)`,
      [h.student_tutor_id, h.dia_semana, h.hora_inicio, h.hora_fin]
    );
  }

  console.log("Seed complete");
}