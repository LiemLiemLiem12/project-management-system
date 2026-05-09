-- Initialize all databases for Project Management System

-- Create authdb
CREATE SCHEMA IF NOT EXISTS `authdb` DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- Create auditdb
CREATE SCHEMA IF NOT EXISTS `auditdb` DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- Create notificationdb
CREATE SCHEMA IF NOT EXISTS `notificationdb` DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- Create projectdb
CREATE SCHEMA IF NOT EXISTS `projectdb` DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- Create storagedb
CREATE SCHEMA IF NOT EXISTS `storagedb` DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- Grant privileges to root user
GRANT ALL PRIVILEGES ON `authdb`.* TO 'root'@'%';
GRANT ALL PRIVILEGES ON `auditdb`.* TO 'root'@'%';
GRANT ALL PRIVILEGES ON `notificationdb`.* TO 'root'@'%';
GRANT ALL PRIVILEGES ON `projectdb`.* TO 'root'@'%';
GRANT ALL PRIVILEGES ON `storagedb`.* TO 'root'@'%';

-- Apply privilege changes
FLUSH PRIVILEGES;
