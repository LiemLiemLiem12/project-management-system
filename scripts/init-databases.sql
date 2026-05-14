-- ==============================================================================
-- 1. GLOBAL SETTINGS & ENVIRONMENT SETUP
-- ==============================================================================
/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!50503 SET NAMES utf8mb4 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;


-- ==============================================================================
-- 2. INITIALIZE DATABASES & PRIVILEGES
-- ==============================================================================
CREATE SCHEMA IF NOT EXISTS `authdb` DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
CREATE SCHEMA IF NOT EXISTS `auditdb` DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
CREATE SCHEMA IF NOT EXISTS `notificationdb` DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
CREATE SCHEMA IF NOT EXISTS `projectdb` DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
CREATE SCHEMA IF NOT EXISTS `storagedb` DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

GRANT ALL PRIVILEGES ON `authdb`.* TO 'root'@'%';
GRANT ALL PRIVILEGES ON `auditdb`.* TO 'root'@'%';
GRANT ALL PRIVILEGES ON `notificationdb`.* TO 'root'@'%';
GRANT ALL PRIVILEGES ON `projectdb`.* TO 'root'@'%';
GRANT ALL PRIVILEGES ON `storagedb`.* TO 'root'@'%';
FLUSH PRIVILEGES;


-- ==============================================================================
-- 3. DATABASE: AUTHDB
-- ==============================================================================
USE `authdb`;

DROP TABLE IF EXISTS `users`;
CREATE TABLE `users` (
  `id` varchar(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `username` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `email` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `password_hash` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `full_name` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `avatar_url` longtext COLLATE utf8mb4_unicode_ci,
  `provider` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'local',
  `birthday` date DEFAULT NULL,
  `created_at` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  PRIMARY KEY (`id`),
  UNIQUE KEY `IDX_fe0bb3f6520ee0469504521e71` (`username`),
  UNIQUE KEY `IDX_97672ac88f789774dd47f7c8be` (`email`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

LOCK TABLES `users` WRITE;
/*!40000 ALTER TABLE `users` DISABLE KEYS */;
INSERT INTO `users` VALUES 
('195eac2d-8266-48d8-a3c2-b64a1157defe','Liêm','thuydiem274@gmail.com','','Liêm Trần Thanh','https://lh3.googleusercontent.com/a/ACg8ocIVfGTzGwY_-HMX5LAfyJ0QQsSRJYdcy1lz9lqEjifDLggI0RAf=s96-c','google','2026-05-11','2026-05-11 16:54:27.548047'),
('4a21277e-83f9-4756-957a-37419e04de6d','vuive','tranthanhliemvvt@gmail.com','$2b$10$59xFtIw/QKvhSGhpxwYwYeaBYrFPyG3Nvh9MBjO3VCTqCqpsrCsPO','Vui Vẻ','https://res.cloudinary.com/dvzeqwp7a/image/upload/1000_F_331699188_lRpvqxO5QRtwOM05gR50ImaaJgBx68vi_iilv4h','local','2005-02-01','2026-05-11 16:59:23.505000');
/*!40000 ALTER TABLE `users` ENABLE KEYS */;
UNLOCK TABLES;


-- ==============================================================================
-- 4. DATABASE: AUDITDB
-- ==============================================================================
USE `auditdb`;

DROP TABLE IF EXISTS `audit_logs`;
CREATE TABLE `audit_logs` (
  `id` varchar(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `project_id` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `user_id` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `action` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `entity_type` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `entity_id` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `old_value` text COLLATE utf8mb4_unicode_ci,
  `new_value` text COLLATE utf8mb4_unicode_ci,
  `created_at` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  `status` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'SUCCESS',
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

LOCK TABLES `audit_logs` WRITE;
/*!40000 ALTER TABLE `audit_logs` DISABLE KEYS */;

UNLOCK TABLES;


-- ==============================================================================
-- 5. DATABASE: NOTIFICATIONDB
-- ==============================================================================
USE `notificationdb`;

DROP TABLE IF EXISTS `notifications`;
CREATE TABLE `notifications` (
  `id` varchar(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `recipient_id` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `sender_id` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `sender_name` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `sender_avatar` text COLLATE utf8mb4_unicode_ci,
  `title` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `message` text COLLATE utf8mb4_unicode_ci NOT NULL,
  `type` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `project_id` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `project_name` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `redirect_url` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `is_read` tinyint NOT NULL DEFAULT '0',
  `created_at` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  `updated_at` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

LOCK TABLES `notifications` WRITE;
/*!40000 ALTER TABLE `notifications` DISABLE KEYS */;
INSERT INTO `notifications` VALUES 
('5245d577-16de-4bbd-9f6e-f217988b5f6f','195eac2d-8266-48d8-a3c2-b64a1157defe','4a21277e-83f9-4756-957a-37419e04de6d','Vui Vẻ','https://res.cloudinary.com/dvzeqwp7a/image/upload/1000_F_331699188_lRpvqxO5QRtwOM05gR50ImaaJgBx68vi_iilv4h','New Task Assigned','Vui Vẻ assigned the task \"Khởi tạo repository, setup Next.js và cấu hình TailwindCSS\" to you in Project.','TASK_ASSIGNED','6fffe9ba-580f-4264-a6d0-0ea0e51ce819','Project','/project/6fffe9ba-580f-4264-a6d0-0ea0e51ce819/kanban',0,'2026-05-11 17:08:41.931178','2026-05-11 17:08:41.931178'),
('a4349acf-258f-4aaf-a67e-da1de4e19d24','4a21277e-83f9-4756-957a-37419e04de6d','195eac2d-8266-48d8-a3c2-b64a1157defe','Liêm Trần Thanh','https://lh3.googleusercontent.com/a/ACg8ocIVfGTzGwY_-HMX5LAfyJ0QQsSRJYdcy1lz9lqEjifDLggI0RAf=s96-c','Project Invitation','Liêm Trần Thanh invited you to join Nexus - Hệ thống AI Customer Support tích hợp RAG as a MODERATOR.','PROJECT_INVITATION','6fffe9ba-580f-4264-a6d0-0ea0e51ce819','Nexus - Hệ thống AI Customer Support tích hợp RAG','/for-you',0,'2026-05-11 16:59:49.584609','2026-05-11 16:59:49.584609');
/*!40000 ALTER TABLE `notifications` ENABLE KEYS */;
UNLOCK TABLES;


-- ==============================================================================
-- 6. DATABASE: PROJECTDB (Sorted by Hierarchy)
-- ==============================================================================
USE `projectdb`;

-- 6.1 projects
DROP TABLE IF EXISTS `projects`;
CREATE TABLE `projects` (
  `id` varchar(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `name` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `description` text COLLATE utf8mb4_unicode_ci,
  `status` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `created_date` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

LOCK TABLES `projects` WRITE;
/*!40000 ALTER TABLE `projects` DISABLE KEYS */;
INSERT INTO `projects` VALUES 
('6fffe9ba-580f-4264-a6d0-0ea0e51ce819','Nexus - Hệ thống AI Customer Support tích hợp RAG','Xây dựng và tích hợp module Chatbot hỗ trợ khách hàng thông minh cho nền tảng thương mại điện tử hiện tại. Hệ thống áp dụng kiến trúc Microservices, sử dụng frontend Next.js, backend NestJS, và tích hợp mô hình RAG (Retrieval-Augmented Generation) kết hợp với LLM API để tự động phân tích và phản hồi câu hỏi của khách hàng dựa trên dữ liệu sản phẩm.','Active','2026-05-11 16:56:53.434728');
/*!40000 ALTER TABLE `projects` ENABLE KEYS */;
UNLOCK TABLES;

-- 6.2 project_members
DROP TABLE IF EXISTS `project_members`;
CREATE TABLE `project_members` (
  `project_id` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `user_id` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `role` enum('Leader','Member','Moderator') COLLATE utf8mb4_unicode_ci NOT NULL,
  `status` enum('Pending','Active','Declined') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'Pending',
  `invite_token` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `joined_date` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  PRIMARY KEY (`project_id`,`user_id`),
  CONSTRAINT `FK_b5729113570c20c7e214cf3f58d` FOREIGN KEY (`project_id`) REFERENCES `projects` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

LOCK TABLES `project_members` WRITE;
/*!40000 ALTER TABLE `project_members` DISABLE KEYS */;
INSERT INTO `project_members` VALUES 
('6fffe9ba-580f-4264-a6d0-0ea0e51ce819','195eac2d-8266-48d8-a3c2-b64a1157defe','Leader','Active',NULL,'2026-05-11 16:56:53.444000'),
('6fffe9ba-580f-4264-a6d0-0ea0e51ce819','4a21277e-83f9-4756-957a-37419e04de6d','Moderator','Active',NULL,'2026-05-11 16:59:49.471000');
/*!40000 ALTER TABLE `project_members` ENABLE KEYS */;
UNLOCK TABLES;

-- 6.3 group_tasks
DROP TABLE IF EXISTS `group_tasks`;
CREATE TABLE `group_tasks` (
  `id` varchar(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `project_id` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `title` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `order` int NOT NULL,
  `isSuccess` tinyint NOT NULL DEFAULT '0',
  PRIMARY KEY (`id`),
  KEY `FK_5b603871e3883783c63767712c7` (`project_id`),
  CONSTRAINT `FK_5b603871e3883783c63767712c7` FOREIGN KEY (`project_id`) REFERENCES `projects` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

LOCK TABLES `group_tasks` WRITE;
/*!40000 ALTER TABLE `group_tasks` DISABLE KEYS */;
INSERT INTO `group_tasks` VALUES 
('0cc7bb91-6a10-4db6-a812-cb7b2de5d6fe','6fffe9ba-580f-4264-a6d0-0ea0e51ce819','Done',4,1),
('13b65a98-dc7a-4238-b9e5-5ca45056588a','6fffe9ba-580f-4264-a6d0-0ea0e51ce819','To Do',1,0),
('75613243-af90-4a97-9deb-77eea9c122b1','6fffe9ba-580f-4264-a6d0-0ea0e51ce819','In Progress',2,0),
('adef91d9-9ed0-4b7e-b973-d30f474e31ec','6fffe9ba-580f-4264-a6d0-0ea0e51ce819','Backlog',0,0),
('ea6adefb-8b58-430d-a8e9-3a6db65bd77a','6fffe9ba-580f-4264-a6d0-0ea0e51ce819','testing',3,0);
/*!40000 ALTER TABLE `group_tasks` ENABLE KEYS */;
UNLOCK TABLES;

-- 6.4 labels
DROP TABLE IF EXISTS `labels`;
CREATE TABLE `labels` (
  `id` varchar(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `project_id` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `name` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `color_code` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  PRIMARY KEY (`id`),
  KEY `FK_68b0da461f6765824f6db642f12` (`project_id`),
  CONSTRAINT `FK_68b0da461f6765824f6db642f12` FOREIGN KEY (`project_id`) REFERENCES `projects` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

LOCK TABLES `labels` WRITE;
/*!40000 ALTER TABLE `labels` DISABLE KEYS */;
INSERT INTO `labels` VALUES 
('5dc9cb80-ee52-4f95-923a-76d5b7b44c06','6fffe9ba-580f-4264-a6d0-0ea0e51ce819','backlog','#f59e0b'),
('a02731b9-2ce7-4052-a0f2-54465ebaf964','6fffe9ba-580f-4264-a6d0-0ea0e51ce819','immediately','#f59e0b');
/*!40000 ALTER TABLE `labels` ENABLE KEYS */;
UNLOCK TABLES;

-- 6.5 talent_labels
DROP TABLE IF EXISTS `talent_labels`;
CREATE TABLE `talent_labels` (
  `id` varchar(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `project_id` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `name` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `color_code` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  PRIMARY KEY (`id`),
  KEY `FK_97bc0c995dc3d418f43218abcf9` (`project_id`),
  CONSTRAINT `FK_97bc0c995dc3d418f43218abcf9` FOREIGN KEY (`project_id`) REFERENCES `projects` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

LOCK TABLES `talent_labels` WRITE;
/*!40000 ALTER TABLE `talent_labels` DISABLE KEYS */;
/*!40000 ALTER TABLE `talent_labels` ENABLE KEYS */;
UNLOCK TABLES;

-- 6.6 member_talents
DROP TABLE IF EXISTS `member_talents`;
CREATE TABLE `member_talents` (
  `user_id` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `talent_label_id` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `project_id` varchar(36) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  PRIMARY KEY (`user_id`,`talent_label_id`),
  KEY `FK_6af36cdcf886a57f6f41a3961c4` (`project_id`,`user_id`),
  KEY `FK_1d9f1fe7e7a949996a5c6d3136b` (`talent_label_id`),
  CONSTRAINT `FK_1d9f1fe7e7a949996a5c6d3136b` FOREIGN KEY (`talent_label_id`) REFERENCES `talent_labels` (`id`),
  CONSTRAINT `FK_6af36cdcf886a57f6f41a3961c4` FOREIGN KEY (`project_id`, `user_id`) REFERENCES `project_members` (`project_id`, `user_id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

LOCK TABLES `member_talents` WRITE;
/*!40000 ALTER TABLE `member_talents` DISABLE KEYS */;
/*!40000 ALTER TABLE `member_talents` ENABLE KEYS */;
UNLOCK TABLES;

-- 6.7 tasks
DROP TABLE IF EXISTS `tasks`;
CREATE TABLE `tasks` (
  `id` varchar(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `task_id` text COLLATE utf8mb4_unicode_ci NOT NULL,
  `parent_id` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `title` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `description` text COLLATE utf8mb4_unicode_ci,
  `position` int NOT NULL,
  `start_date` timestamp NULL DEFAULT NULL,
  `due_date` timestamp NULL DEFAULT NULL,
  `assignee_id` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `created_by` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `group_task_id` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `is_archived` tinyint NOT NULL DEFAULT '0',
  PRIMARY KEY (`id`),
  KEY `FK_964642f42701ca6465fb5943f64` (`group_task_id`),
  KEY `FK_b03c99063a4eaf084f069a4d5a7` (`parent_id`),
  CONSTRAINT `FK_964642f42701ca6465fb5943f64` FOREIGN KEY (`group_task_id`) REFERENCES `group_tasks` (`id`),
  CONSTRAINT `FK_b03c99063a4eaf084f069a4d5a7` FOREIGN KEY (`parent_id`) REFERENCES `tasks` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

LOCK TABLES `tasks` WRITE;
/*!40000 ALTER TABLE `tasks` DISABLE KEYS */;
INSERT INTO `tasks` VALUES 
('0445063b-078b-4f63-bdb9-0a8763ff90f3','task-1','bb7aa1dd-5a38-4758-85b4-aa69a5496c9c','Khởi tạo repository, setup Next.js và cấu hình TailwindCSS','<p><strong>? Mô tả chi tiết (Description):</strong> Nhiệm vụ này bao gồm việc khởi tạo dự án Frontend cốt lõi. Cần thiết lập một boilerplate chuẩn chỉ với Next.js (sử dụng App Router), tích hợp TailwindCSS để phục vụ cho việc styling nhanh chóng sau này. Đồng thời, cấu hình các công cụ kiểm soát chất lượng mã nguồn (Linter, Formatter) và thiết lập cấu trúc thư mục tiêu chuẩn để cả team có thể bắt đầu code các feature tiếp theo mà không bị conflict.</p><p><strong>✅ Checklist công việc:</strong></p><ul><li><p>[x] Khởi tạo dự án bằng <code>create-next-app</code> (chọn TypeScript, App Router).</p></li><li><p>[x] Cài đặt và cấu hình TailwindCSS, PostCSS.</p></li><li><p>[x] Khởi tạo file <code>.eslintrc.json</code> và <code>.prettierrc</code>, xử lý conflict giữa ESLint và Prettier.</p></li><li><p>[x] Cấu hình Path Aliases trong <code>tsconfig.json</code> (ví dụ: <code>@/components</code>, <code>@/lib</code>, <code>@/hooks</code>).</p></li><li><p>[x] Xóa các file rác mặc định, setup thư mục UI layouts cơ bản.</p></li><li><p>[x] Đẩy commit đầu tiên lên nhánh <code>develop</code> trên GitHub.</p></li></ul><img src=\"https://res.cloudinary.com/dvzeqwp7a/image/upload/v1778519105/task_descriptions/cloud-computing-1778519103217.jpg.jpg\" alt=\"cloud-computing\" title=\"cloud-computing\"><p></p>',0,'2026-05-13 00:00:00','2026-05-14 00:00:00','195eac2d-8266-48d8-a3c2-b64a1157defe','195eac2d-8266-48d8-a3c2-b64a1157defe','13b65a98-dc7a-4238-b9e5-5ca45056588a',0),
('15606784-a626-436a-a80b-606285a1848a','task-4','0445063b-078b-4f63-bdb9-0a8763ff90f3','Thiết lập Message Broker với RabbitMQ để xử lý hàng đợi tin nhắn',NULL,2,NULL,NULL,NULL,'195eac2d-8266-48d8-a3c2-b64a1157defe','adef91d9-9ed0-4b7e-b973-d30f474e31ec',0),
('2b0a4e72-136b-4f09-b325-c74a15d29d78','task-2',NULL,'Thiết kế database schema cho lịch sử chat trên PostgreSQL',NULL,1,NULL,NULL,NULL,'195eac2d-8266-48d8-a3c2-b64a1157defe','13b65a98-dc7a-4238-b9e5-5ca45056588a',0),
('bb7aa1dd-5a38-4758-85b4-aa69a5496c9c','task-3',NULL,'Xây dựng UI/UX cho cửa sổ Chatbot (dạng popup)',NULL,1,NULL,NULL,NULL,'195eac2d-8266-48d8-a3c2-b64a1157defe','adef91d9-9ed0-4b7e-b973-d30f474e31ec',0),
('c1840b28-bed6-45a6-bba2-2ab567dfff58','task-6',NULL,'Cấu hình Redis để lưu trữ và quản lý cache session người dùng',NULL,4,NULL,NULL,NULL,'195eac2d-8266-48d8-a3c2-b64a1157defe','adef91d9-9ed0-4b7e-b973-d30f474e31ec',0),
('fb59ab6e-7292-4970-af8c-17e61dcf3070','task-5',NULL,'Viết API tích hợp LLM API để phân tích ngữ nghĩa câu hỏi',NULL,3,NULL,NULL,NULL,'195eac2d-8266-48d8-a3c2-b64a1157defe','adef91d9-9ed0-4b7e-b973-d30f474e31ec',0);
/*!40000 ALTER TABLE `tasks` ENABLE KEYS */;
UNLOCK TABLES;

-- 6.8 task_labels
DROP TABLE IF EXISTS `task_labels`;
CREATE TABLE `task_labels` (
  `task_id` varchar(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `label_id` varchar(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  PRIMARY KEY (`task_id`,`label_id`),
  KEY `IDX_844df22351eb86c33c3e8c132f` (`task_id`),
  KEY `IDX_09dd3f6f9d04063726c498155f` (`label_id`),
  CONSTRAINT `FK_09dd3f6f9d04063726c498155f2` FOREIGN KEY (`label_id`) REFERENCES `labels` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `FK_844df22351eb86c33c3e8c132f4` FOREIGN KEY (`task_id`) REFERENCES `tasks` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

LOCK TABLES `task_labels` WRITE;
/*!40000 ALTER TABLE `task_labels` DISABLE KEYS */;
INSERT INTO `task_labels` VALUES 
('0445063b-078b-4f63-bdb9-0a8763ff90f3','5dc9cb80-ee52-4f95-923a-76d5b7b44c06'),
('0445063b-078b-4f63-bdb9-0a8763ff90f3','a02731b9-2ce7-4052-a0f2-54465ebaf964');
/*!40000 ALTER TABLE `task_labels` ENABLE KEYS */;
UNLOCK TABLES;

-- 6.9 checklists
DROP TABLE IF EXISTS `checklists`;
CREATE TABLE `checklists` (
  `id` varchar(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `title` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `is_completed` tinyint NOT NULL DEFAULT '0',
  `position` int NOT NULL,
  `task_id` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  PRIMARY KEY (`id`),
  KEY `FK_abcc7a3510958376d5d1c254368` (`task_id`),
  CONSTRAINT `FK_abcc7a3510958376d5d1c254368` FOREIGN KEY (`task_id`) REFERENCES `tasks` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

LOCK TABLES `checklists` WRITE;
/*!40000 ALTER TABLE `checklists` DISABLE KEYS */;
INSERT INTO `checklists` VALUES 
('383bf8b6-33c6-4261-8a81-1594901c487d','Xóa các file rác mặc định, setup thư mục UI layouts cơ bản.',1,5,'0445063b-078b-4f63-bdb9-0a8763ff90f3'),
('71bab58b-01fb-4165-baff-cc3f89b3f4be','Cài đặt và cấu hình TailwindCSS, PostCSS.',0,2,'0445063b-078b-4f63-bdb9-0a8763ff90f3'),
('76a1f3fb-af8d-4cb8-8794-622caffd6b10','Khởi tạo file .eslintrc.json và .prettierrc, xử lý conflict giữa ESLint và Prettier.',1,3,'0445063b-078b-4f63-bdb9-0a8763ff90f3'),
('a0fd233f-1de6-4379-bfb7-48f85af63526','Cấu hình Path Aliases trong tsconfig.json (ví dụ: @/components, @/lib, @/hooks).',1,4,'0445063b-078b-4f63-bdb9-0a8763ff90f3'),
('a2b36e57-e580-4450-86c0-3fb494fb8d83','Khởi tạo dự án bằng create-next-app (chọn TypeScript, App Router).',0,1,'0445063b-078b-4f63-bdb9-0a8763ff90f3'),
('cc81cad8-3a73-4ea3-8bbc-4680f12dcd9f','Đẩy commit đầu tiên lên nhánh develop trên GitHub.',0,6,'0445063b-078b-4f63-bdb9-0a8763ff90f3');
/*!40000 ALTER TABLE `checklists` ENABLE KEYS */;
UNLOCK TABLES;

-- 6.10 comments
DROP TABLE IF EXISTS `comments`;
CREATE TABLE `comments` (
  `id` varchar(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `parent_comment_id` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `task_id` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `project_id` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `user_id` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `content` text COLLATE utf8mb4_unicode_ci NOT NULL,
  `created_at` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  `updated_at` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

LOCK TABLES `comments` WRITE;
/*!40000 ALTER TABLE `comments` DISABLE KEYS */;
INSERT INTO `comments` VALUES 
('2a8ba20d-6ab1-48d3-bceb-d00e1f9c8369',NULL,'0445063b-078b-4f63-bdb9-0a8763ff90f3','6fffe9ba-580f-4264-a6d0-0ea0e51ce819','4a21277e-83f9-4756-957a-37419e04de6d','Approved! Code clear rồi. Đã merge nhánh feature/nex-01-setup','2026-05-11 17:08:36.940029','2026-05-11 17:08:36.940029'),
('426cbce2-3cb5-4ba1-a584-9ce973991d98',NULL,'0445063b-078b-4f63-bdb9-0a8763ff90f3','6fffe9ba-580f-4264-a6d0-0ea0e51ce819','195eac2d-8266-48d8-a3c2-b64a1157defe','Fix được rồi nhé, tks Đức. Đã cấu hình xong toàn bộ Path Aliases và tạo PR #1. Mọi người vào review code giúp mình để merge vào develop nha','2026-05-11 17:06:57.933054','2026-05-11 17:06:57.933054'),
('9f4a66ff-1f5c-4da5-927e-06fa3897a9e2',NULL,'0445063b-078b-4f63-bdb9-0a8763ff90f3','6fffe9ba-580f-4264-a6d0-0ea0e51ce819','195eac2d-8266-48d8-a3c2-b64a1157defe','Mình đã init xong project với Next.js bản mới nhất. Tuy nhiên đang gặp chút issue báo lỗi đỏ ở file layout.tsx do conflict rule giữa Prettier và ESLint. Sẽ xử lý dứt điểm trong sáng nay','2026-05-11 17:06:43.266132','2026-05-11 17:06:43.266132'),
('bf4ab9f2-cc67-4a1f-bb7a-ff9c9e823eb6',NULL,'0445063b-078b-4f63-bdb9-0a8763ff90f3','6fffe9ba-580f-4264-a6d0-0ea0e51ce819','4a21277e-83f9-4756-957a-37419e04de6d','Ông thử cài thêm package eslint-config-prettier xem sao, nó sẽ tắt mấy rule của ESLint bị trùng với Prettier đi đấy. Cần thì ping tôi support nhé','2026-05-11 17:06:45.986634','2026-05-11 17:06:45.986634');
/*!40000 ALTER TABLE `comments` ENABLE KEYS */;
UNLOCK TABLES;

-- 6.11 comment_medias
DROP TABLE IF EXISTS `comment_medias`;
CREATE TABLE `comment_medias` (
  `id` varchar(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `comment_id` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `file_name` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `file_url` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `file_type` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `file_size` float NOT NULL,
  `public_id` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `created_at` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  PRIMARY KEY (`id`),
  KEY `FK_2e7c10a74492b4eee1c8d8a9520` (`comment_id`),
  CONSTRAINT `FK_2e7c10a74492b4eee1c8d8a9520` FOREIGN KEY (`comment_id`) REFERENCES `comments` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

LOCK TABLES `comment_medias` WRITE;
/*!40000 ALTER TABLE `comment_medias` DISABLE KEYS */;
/*!40000 ALTER TABLE `comment_medias` ENABLE KEYS */;
UNLOCK TABLES;


-- ==============================================================================
-- 7. DATABASE: STORAGEDB (Sorted by Hierarchy)
-- ==============================================================================
USE `storagedb`;

-- 7.1 assets
DROP TABLE IF EXISTS `assets`;
CREATE TABLE `assets` (
  `id` varchar(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `parent_id` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `project_id` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `name` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `is_folder` tinyint NOT NULL DEFAULT '0',
  `task_id` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT '0',
  `file_type` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `file_size` bigint NOT NULL DEFAULT '0',
  `storage_url` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `public_id` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `uploaded_by` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `is_deleted` int NOT NULL DEFAULT '0',
  `created_at` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  `updated_at` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
  PRIMARY KEY (`id`),
  KEY `FK_16dc9ac636505c329e9cd34ff86` (`parent_id`),
  CONSTRAINT `FK_16dc9ac636505c329e9cd34ff86` FOREIGN KEY (`parent_id`) REFERENCES `assets` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

LOCK TABLES `assets` WRITE;
/*!40000 ALTER TABLE `assets` DISABLE KEYS */;
INSERT INTO `assets` VALUES 
('3673fd2e-297e-47a3-808f-43b940974ffe',NULL,'6fffe9ba-580f-4264-a6d0-0ea0e51ce819','cloud-computing.jpg',0,'0445063b-078b-4f63-bdb9-0a8763ff90f3','jpg',66974,'https://res.cloudinary.com/dvzeqwp7a/image/upload/v1778519740/storage:6fffe9ba-580f-4264-a6d0-0ea0e51ce819/cloud-computing-1778519738222.jpg.jpg','storage:6fffe9ba-580f-4264-a6d0-0ea0e51ce819/cloud-computing-1778519738222.jpg','195eac2d-8266-48d8-a3c2-b64a1157defe',0,'2026-05-11 17:15:40.243649','2026-05-11 17:15:40.243649'),
('8c269fb6-4576-4aa5-a3f8-1928dcc68382','b32c5967-52b3-4737-88f9-925ce3368bfb','6fffe9ba-580f-4264-a6d0-0ea0e51ce819','receipt_report.docx.pdf',0,'0','pdf',173737,'https://res.cloudinary.com/dvzeqwp7a/image/upload/v1778519803/storage:6fffe9ba-580f-4264-a6d0-0ea0e51ce819/receipt_report.docx-1778519800483.pdf.pdf','storage:6fffe9ba-580f-4264-a6d0-0ea0e51ce819/receipt_report.docx-1778519800483.pdf','195eac2d-8266-48d8-a3c2-b64a1157defe',0,'2026-05-11 17:16:43.129241','2026-05-11 17:16:43.129241'),
('b32c5967-52b3-4737-88f9-925ce3368bfb',NULL,'6fffe9ba-580f-4264-a6d0-0ea0e51ce819','Brain Storm',1,'0',NULL,0,NULL,NULL,'195eac2d-8266-48d8-a3c2-b64a1157defe',0,'2026-05-11 17:16:22.036372','2026-05-11 17:16:22.036372');
/*!40000 ALTER TABLE `assets` ENABLE KEYS */;
UNLOCK TABLES;

-- 7.2 asset_permission
DROP TABLE IF EXISTS `asset_permission`;
CREATE TABLE `asset_permission` (
  `id` varchar(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `file_id` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `user_id` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `permission` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  PRIMARY KEY (`id`),
  KEY `FK_7a4a210cb23d69f91b137715d96` (`file_id`),
  CONSTRAINT `FK_7a4a210cb23d69f91b137715d96` FOREIGN KEY (`file_id`) REFERENCES `assets` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

LOCK TABLES `asset_permission` WRITE;
/*!40000 ALTER TABLE `asset_permission` DISABLE KEYS */;
INSERT INTO `asset_permission` VALUES 
('184770ab-42c6-4eba-af8b-15f555ac2799','b32c5967-52b3-4737-88f9-925ce3368bfb','195eac2d-8266-48d8-a3c2-b64a1157defe','CREATE'),
('18bf4ae2-0648-4a48-9e58-7dc4825c99a3','b32c5967-52b3-4737-88f9-925ce3368bfb','195eac2d-8266-48d8-a3c2-b64a1157defe','UPDATE'),
('1e9b1a6a-f95a-4358-86b9-e1b58a9da767','8c269fb6-4576-4aa5-a3f8-1928dcc68382','195eac2d-8266-48d8-a3c2-b64a1157defe','CREATE'),
('3a5e4ea1-2c79-4839-808e-90c8039c11f3','3673fd2e-297e-47a3-808f-43b940974ffe','195eac2d-8266-48d8-a3c2-b64a1157defe','UPDATE'),
('61688517-2a18-409b-9387-d010564ac5c3','3673fd2e-297e-47a3-808f-43b940974ffe','195eac2d-8266-48d8-a3c2-b64a1157defe','CREATE'),
('657513ab-f508-48f1-ae10-93c374a322cb','3673fd2e-297e-47a3-808f-43b940974ffe','195eac2d-8266-48d8-a3c2-b64a1157defe','DELETE'),
('6cb08065-fcba-4964-9b68-5e1b6a1792cd','8c269fb6-4576-4aa5-a3f8-1928dcc68382','195eac2d-8266-48d8-a3c2-b64a1157defe','READ'),
('a960ea25-4f1b-4668-b566-d48423b15c21','8c269fb6-4576-4aa5-a3f8-1928dcc68382','195eac2d-8266-48d8-a3c2-b64a1157defe','UPDATE'),
('ad9afdc2-c78f-4f1d-9c21-102384ea7111','3673fd2e-297e-47a3-808f-43b940974ffe','195eac2d-8266-48d8-a3c2-b64a1157defe','READ'),
('b3bb6130-38a1-4a95-91bb-ed8a2293eb9b','b32c5967-52b3-4737-88f9-925ce3368bfb','195eac2d-8266-48d8-a3c2-b64a1157defe','READ'),
('d2e86141-48ed-478d-ba7c-16bba6bc703e','8c269fb6-4576-4aa5-a3f8-1928dcc68382','195eac2d-8266-48d8-a3c2-b64a1157defe','DELETE'),
('fd2dcb4d-a7ed-4591-af7a-8be861eb8d68','b32c5967-52b3-4737-88f9-925ce3368bfb','195eac2d-8266-48d8-a3c2-b64a1157defe','DELETE');
/*!40000 ALTER TABLE `asset_permission` ENABLE KEYS */;
UNLOCK TABLES;


-- ==============================================================================
-- 8. RESTORE GLOBAL SETTINGS
-- ==============================================================================
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;
/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;