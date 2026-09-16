-- ====================================================================
-- MA SOFT TECH SOLUTIONS — Database Schema Initialization
-- File: 01_schema.sql
-- Description: Creates the application database and items table schema
-- ====================================================================

CREATE DATABASE IF NOT EXISTS `ma_devops_db`
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

USE `ma_devops_db`;

CREATE TABLE IF NOT EXISTS `items` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `title` VARCHAR(100) NOT NULL,
  `priority` ENUM('low', 'medium', 'high') NOT NULL DEFAULT 'medium',
  `category` VARCHAR(50) NOT NULL DEFAULT 'general',
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
