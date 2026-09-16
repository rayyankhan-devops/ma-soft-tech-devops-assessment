-- ====================================================================
-- MA SOFT TECH SOLUTIONS — Pre-loaded Database Seed Data
-- File: 02_seed.sql
-- Description: Inserts initial DevOps records automatically upon container spin-up
-- ====================================================================

USE `ma_devops_db`;

INSERT INTO `items` (`title`, `priority`, `category`) VALUES
  ('Initialize CI/CD Pipeline', 'high', 'CI/CD'),
  ('Containerize Application with Docker', 'medium', 'Docker'),
  ('Configure Health Check Telemetry', 'high', 'Monitoring'),
  ('Implement Linux Process Supervision', 'medium', 'Linux'),
  ('Harden Production Secrets & TLS', 'high', 'Security');
