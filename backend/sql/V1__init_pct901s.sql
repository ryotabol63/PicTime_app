-- V1__init_pct901s.sql
-- Create database, user, and required tables for pct901s
-- IMPORTANT: Change the password before using in production

-- 1) Create database if not exists
IF DB_ID(N'pct901s') IS NULL
BEGIN
    CREATE DATABASE [pct901s];
END
GO

USE [pct901s];
GO

-- 2) Create server login (password provided via sqlcmd variable PCT901S_USER_PASSWORD)
IF NOT EXISTS (SELECT 1 FROM sys.server_principals WHERE name = N'pct901s_user')
BEGIN
    CREATE LOGIN [pct901s_user] WITH PASSWORD = N'$(PCT901S_USER_PASSWORD)', CHECK_POLICY = ON;
END
GO

-- 3) Create database user and add to db_owner (full privileges)
IF NOT EXISTS (SELECT 1 FROM sys.database_principals WHERE name = N'pct901s_user')
BEGIN
    CREATE USER [pct901s_user] FOR LOGIN [pct901s_user];
END
ALTER ROLE db_owner ADD MEMBER [pct901s_user];
GO

-- 4) Tables (unqualified names)
-- events
IF OBJECT_ID(N'events', 'U') IS NULL
BEGIN
CREATE TABLE events (
    id NVARCHAR(36) NOT NULL PRIMARY KEY,
    title NVARCHAR(255) NULL,
    description NVARCHAR(1024) NULL,
    creator_id NVARCHAR(36) NULL,
    created_at DATETIME2 NOT NULL DEFAULT SYSUTCDATETIME()
);
END
GO

-- event_candidate_dates
IF OBJECT_ID(N'event_candidate_dates', 'U') IS NULL
BEGIN
CREATE TABLE event_candidate_dates (
    event_id NVARCHAR(36) NOT NULL,
    candidate_date NVARCHAR(255) NOT NULL
);
ALTER TABLE event_candidate_dates ADD CONSTRAINT pk_event_candidate_dates PRIMARY KEY (event_id, candidate_date);
END
GO

-- availabilities
IF OBJECT_ID(N'availabilities', 'U') IS NULL
BEGIN
CREATE TABLE availabilities (
    id NVARCHAR(36) NOT NULL PRIMARY KEY,
    event_id NVARCHAR(36) NOT NULL,
    participant_name NVARCHAR(255) NULL,
    available_date NVARCHAR(255) NULL
);
CREATE INDEX ix_avail_event ON availabilities(event_id);
CREATE INDEX ix_avail_event_participant ON availabilities(event_id, participant_name);
END
GO

-- users
IF OBJECT_ID(N'users', 'U') IS NULL
BEGIN
CREATE TABLE users (
    id NVARCHAR(36) NOT NULL PRIMARY KEY,
    email NVARCHAR(255) NOT NULL UNIQUE,
    password NVARCHAR(255) NOT NULL,
    created_at DATETIME2 NOT NULL DEFAULT SYSUTCDATETIME()
);
END
GO

-- End of DDL
