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
VALUES ('Admin', 'Admin', 'A01752364', 'Admin134679$', 'admin', 1),
('Beto', 'Supervisor', 'A01425602', 'Beto258369$', 'supervisor', 1),
('Dari', 'Tutora', 'A01425755', 'DArI1607#$', 'teacher', 1),
('Wicho', 'Estudiante', 'TwinchoSalinasFJ26', 'TwinchoPro123$', 'student', 1);
