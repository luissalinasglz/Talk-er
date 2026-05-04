USE talker;

CREATE TABLE IF NOT EXISTS `users` (
	`id` int AUTO_INCREMENT NOT NULL UNIQUE,
	`name` varchar(50) NOT NULL,
	`last_name` varchar(50) NOT NULL,
	`username` varchar(40) NOT NULL UNIQUE,
	`password_hash` varchar(60) NOT NULL,
	`role` enum('student', 'teacher', 'supervisor', 'admin') NOT NULL,
	`period` int NOT NULL,
	PRIMARY KEY (`id`)
);

CREATE TABLE IF NOT EXISTS `sessions` (
    `id` int AUTO_INCREMENT NOT NULL UNIQUE,
    `student_tutor` int NOT NULL,
    `session_url` varchar(150) NOT NULL,
    `platform` varchar(50) DEFAULT 'Zoom',
    `password` varchar(50) DEFAULT NULL,
    `start_time` timestamp NOT NULL,
    `end_time` timestamp NOT NULL,
    PRIMARY KEY (`id`)
);

CREATE TABLE IF NOT EXISTS `student_tutor` (
	`id` int AUTO_INCREMENT NOT NULL UNIQUE,
	`tutor` int NOT NULL,
	`student` int NOT NULL,
	`idioma` enum('english', 'french') NOT NULL,
	`start_date` date NOT NULL,
	`end_date` date NOT NULL,
	PRIMARY KEY (`id`)
);

CREATE TABLE IF NOT EXISTS `assignments` (
	`id` int AUTO_INCREMENT NOT NULL UNIQUE,
	`group` int NOT NULL,
	`title` varchar(100) NOT NULL,
	`description` varchar(300) NOT NULL,
	`due_date` timestamp NOT NULL,
	PRIMARY KEY (`id`)
);

CREATE TABLE IF NOT EXISTS `submissions` (
	`id` int AUTO_INCREMENT NOT NULL UNIQUE,
	`assignment` int NOT NULL,
	`file` varchar(100) NOT NULL,
	`grade` int,
	`feedback` varchar(100) NOT NULL,
	`submitted_at` timestamp NOT NULL,
	PRIMARY KEY (`id`)
);

CREATE TABLE IF NOT EXISTS `materials` (
	`id` int AUTO_INCREMENT NOT NULL UNIQUE,
	`group` int NOT NULL,
	`title` varchar(100) NOT NULL,
	`file` varchar(100) NOT NULL,
	`uploaded_at` timestamp NOT NULL,
	PRIMARY KEY (`id`)
);

CREATE TABLE IF NOT EXISTS `session_logs` (
	`id` int AUTO_INCREMENT NOT NULL UNIQUE,
	`session_id` int NOT NULL,
	`description` varchar(300) NOT NULL,
	`evidence_url` varchar(100) NOT NULL,
	`planning` varchar(200) NOT NULL,
	`incidence` boolean NOT NULL,
	`incidence_type` enum('assistance', 'respect'),
	`incidence_description` varchar(200),
	`validated` boolean NOT NULL,
	`corrections` varchar(300),
	`approved` boolean NOT NULL,
	PRIMARY KEY (`id`)
);

CREATE TABLE IF NOT EXISTS `reviewer_tutor` (
	`id` int AUTO_INCREMENT NOT NULL UNIQUE,
	`tutor_id` int NOT NULL,
	`group_id` int NOT NULL,
	PRIMARY KEY (`id`)
);

CREATE TABLE IF NOT EXISTS `horarios` (
    `id` int AUTO_INCREMENT NOT NULL UNIQUE,
    `student_tutor_id` int NOT NULL,
    `dia_semana` int NOT NULL, -- 0=Domingo, 1=Lunes, 2=Martes, 3=Miércoles, 4=Jueves, 5=Viernes, 6=Sábado
    `hora_inicio` time NOT NULL,
    `hora_fin` time NOT NULL,
    PRIMARY KEY (`id`),
    FOREIGN KEY (`student_tutor_id`) REFERENCES `student_tutor`(`id`) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS `periods` (
	`id` int AUTO_INCREMENT NOT NULL UNIQUE,
	`name` varchar(50) NOT NULL UNIQUE,
	`session_log_percentage` int NOT NULL,
	`letter_percentage` int NOT NULL,
	`video_percentage` int NOT NULL,
	`start_date` timestamp NOT NULL,
	`end_date` timestamp NOT NULL,
	PRIMARY KEY (`id`)
);

CREATE TABLE IF NOT EXISTS examenes (
    id INT AUTO_INCREMENT PRIMARY KEY,
    tutor_id INT NOT NULL,
    nombre VARCHAR(255) NOT NULL,
    clase VARCHAR(100),
    duracion INT,
    fecha_limite DATETIME,
    FOREIGN KEY (tutor_id) REFERENCES users(id)
);

CREATE TABLE IF NOT EXISTS preguntas (
    id INT AUTO_INCREMENT PRIMARY KEY,
    examen_id INT NOT NULL,
    texto_pregunta TEXT NOT NULL,
    opcion_a VARCHAR(255),
    opcion_b VARCHAR(255),
    opcion_c VARCHAR(255),
    opcion_d VARCHAR(255),
    FOREIGN KEY (examen_id) REFERENCES examenes(id) ON DELETE CASCADE
);

ALTER TABLE `users` ADD CONSTRAINT `users_fk6` FOREIGN KEY (`period`) REFERENCES `periods`(`id`);
ALTER TABLE `sessions` ADD CONSTRAINT `sessions_fk1` FOREIGN KEY (`student_tutor`) REFERENCES `student_tutor`(`id`);
ALTER TABLE `student_tutor` ADD CONSTRAINT `student_tutor_fk1` FOREIGN KEY (`tutor`) REFERENCES `users`(`id`);

ALTER TABLE `student_tutor` ADD CONSTRAINT `student_tutor_fk2` FOREIGN KEY (`student`) REFERENCES `users`(`id`);
ALTER TABLE `assignments` ADD CONSTRAINT `assignments_fk1` FOREIGN KEY (`group`) REFERENCES `student_tutor`(`id`);
ALTER TABLE `submissions` ADD CONSTRAINT `submissions_fk1` FOREIGN KEY (`assignment`) REFERENCES `assignments`(`id`);
ALTER TABLE `materials` ADD CONSTRAINT `materials_fk1` FOREIGN KEY (`group`) REFERENCES `student_tutor`(`id`);
ALTER TABLE `session_logs` ADD CONSTRAINT `session_logs_fk1` FOREIGN KEY (`session_id`) REFERENCES `sessions`(`id`);
ALTER TABLE `reviewer_tutor` ADD CONSTRAINT `reviewer_tutor_fk1` FOREIGN KEY (`tutor_id`) REFERENCES `users`(`id`);

ALTER TABLE `reviewer_tutor` ADD CONSTRAINT `reviewer_tutor_fk2` FOREIGN KEY (`group_id`) REFERENCES `student_tutor`(`id`);

INSERT INTO periods (name, session_log_percentage, letter_percentage, video_percentage, start_date, end_date)
VALUES ('Febrero Junio 2026', 80, 10, 10, '2026-02-10 00:00:01', '2026-06-25 23:59:59');

INSERT INTO users (name, last_name, username, password_hash, role, period)
VALUES ('Admin', 'Apellido', 'A01752364', 'Admin134679$', 'admin', 1),
('Beto', 'Castro', 'A01425602', 'Beto258369$', 'supervisor', 1),
('Dari', 'Gonzales', 'A01425755', 'DArI1607#$', 'teacher', 1),
('Wicho', 'Ponce', 'TwinchoSalinasFJ26', 'TwinchoPro123$', 'student', 1),
('Sebastian', 'Rodriguez', 'SebastianPonceFJ26', 'SebasPro123', 'student', '1');

INSERT INTO student_tutor (tutor, student, idioma, start_date, end_date)
VALUES (3, 4, 'english', '2026-02-10', '2026-06-25'),
(3, 5, 'french', '2026-02-10', '2026-06-25');

INSERT INTO assignments (`group`, title, description, due_date)
VALUES (1, 'Lección del verbo to be', 'Completa los ejercicios de la página 24 de tu libro de trabajo.', '2026-04-28 23:59:59'),
       (1, 'Lección pasado simple', 'Escribe un ensayo corto de 300 palabras.', '2026-04-30 18:00:00');

INSERT INTO submissions (assignment, file, grade, feedback, submitted_at)
VALUES (1, 'Verbo_to_be-Wicho.pdf', NULL, '', '2026-04-27 10:15:00');

INSERT INTO sessions (student_tutor, session_url, platform, password, start_time, end_time)
VALUES 
(1, 'https://zoom.us/j/1112223333', 'Zoom', '12345', '2026-04-20 16:00:00', '2026-04-20 17:00:00'),
(1, 'https://zoom.us/j/4445556666', 'Zoom', '54321', '2026-04-22 16:00:00', '2026-04-22 17:00:00');

INSERT INTO session_logs (session_id, description, evidence_url, planning, incidence, incidence_type, incidence_description, validated, corrections, approved)
VALUES 
(1, 'El alumno repasó el verbo to be de forma excelente. Mostró buena actitud y participamos en un juego de roles.', 'https://drive.google.com/file/d/demo1', 'Se planeó repasar la unidad 1 del libro.', FALSE, NULL, NULL, TRUE, '', TRUE);

INSERT INTO horarios (student_tutor_id, dia_semana, hora_inicio, hora_fin)
VALUES (1, 4, '15:00:00', '16:00:00'),
(1, 0, '20:15:00', '21:15:00');