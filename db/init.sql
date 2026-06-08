USE talker;

CREATE TABLE IF NOT EXISTS `users` (
	`id` int AUTO_INCREMENT NOT NULL UNIQUE,
	`name` varchar(100) NOT NULL,
	`last_name` varchar(100) NOT NULL,
	`username` varchar(60) NOT NULL UNIQUE,
	`password_hash` varchar(255) NOT NULL,
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
    `file_url` varchar(255) DEFAULT NULL,
	PRIMARY KEY (`id`)
);

CREATE TABLE IF NOT EXISTS `submissions` (
	`id` int AUTO_INCREMENT NOT NULL UNIQUE,
	`assignment` int NOT NULL,
	`file` varchar(100) NOT NULL,
	`grade` int,
	`feedback` varchar(100),
	`submitted_at` timestamp NOT NULL,
	`student` INT DEFAULT NULL,
	PRIMARY KEY (`id`),
    FOREIGN KEY (`student`) REFERENCES `users`(`id`) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS `materials` (
    `id` INT AUTO_INCREMENT PRIMARY KEY,
    `student_tutor_id` INT NOT NULL,
    `title` VARCHAR(100) NOT NULL,
    `type` enum('PDF','DOC','IMAGE','VIDEO','LINK') NOT NULL,
    `file_url` VARCHAR(255),
    `external_url` VARCHAR(255),
    `uploaded_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS `session_logs` (
	`id` int AUTO_INCREMENT NOT NULL UNIQUE,
	`session_id` int NOT NULL,
	`title` varchar(300) NOT NULL,
	`description` varchar(300) NOT NULL,
	`evidence_url` varchar(100) NOT NULL,
	`planning` varchar(200) NOT NULL,
	`incidence` boolean NOT NULL,
	`incidence_type` enum('assistance', 'respect'),
	`incidence_description` varchar(200),
	`validated` boolean NOT NULL,
	`corrections` varchar(300),
	`approved` boolean NOT NULL,
	`approved_by` int,
	PRIMARY KEY (`id`)
);

CREATE TABLE IF NOT EXISTS `reviewer_tutor` (
	`id` int AUTO_INCREMENT NOT NULL UNIQUE,
	`tutor_id` int NOT NULL,
	`supervisor_id` int NOT NULL,
	PRIMARY KEY (`id`)
);

CREATE TABLE IF NOT EXISTS `horarios` (
    `id` int AUTO_INCREMENT NOT NULL UNIQUE,
    `student_tutor_id` int NOT NULL,
    `dia_semana` int NOT NULL,
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

CREATE TABLE IF NOT EXISTS blacklist (
    id INT AUTO_INCREMENT PRIMARY KEY,
    token VARCHAR(512) NOT NULL,
    expires_at DATETIME NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_token (token(255))
);

ALTER TABLE `users` ADD CONSTRAINT `users_fk6` FOREIGN KEY (`period`) REFERENCES `periods`(`id`);
ALTER TABLE `sessions` ADD CONSTRAINT `sessions_fk1` FOREIGN KEY (`student_tutor`) REFERENCES `student_tutor`(`id`);
ALTER TABLE `student_tutor` ADD CONSTRAINT `student_tutor_fk1` FOREIGN KEY (`tutor`) REFERENCES `users`(`id`);
ALTER TABLE `student_tutor` ADD CONSTRAINT `student_tutor_fk2` FOREIGN KEY (`student`) REFERENCES `users`(`id`);
ALTER TABLE `assignments` ADD CONSTRAINT `assignments_fk1` FOREIGN KEY (`group`) REFERENCES `student_tutor`(`id`);
ALTER TABLE `submissions` ADD CONSTRAINT `submissions_fk1` FOREIGN KEY (`assignment`) REFERENCES `assignments`(`id`);
ALTER TABLE `materials` ADD CONSTRAINT `materials_fk1` FOREIGN KEY (`student_tutor_id`) REFERENCES `student_tutor`(`id`);
ALTER TABLE `session_logs` ADD CONSTRAINT `session_logs_fk1` FOREIGN KEY (`session_id`) REFERENCES `sessions`(`id`);
ALTER TABLE `session_logs` ADD CONSTRAINT `session_logs_fk2` FOREIGN KEY (`approved_by`) REFERENCES `users`(`id`);
ALTER TABLE `reviewer_tutor` ADD CONSTRAINT `reviewer_tutor_fk1` FOREIGN KEY (`tutor_id`) REFERENCES `users`(`id`);
ALTER TABLE `reviewer_tutor` ADD CONSTRAINT `reviewer_tutor_fk2` FOREIGN KEY (`supervisor_id`) REFERENCES `users`(`id`);
