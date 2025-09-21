-- server/init.sql (Optional - only if you need initial database setup)

-- Create database if it doesn't exist (this is already handled by MYSQL_DATABASE)
-- CREATE DATABASE IF NOT EXISTS pomodoro_go;

-- Use the database
USE pomodoro_go;

-- Example: Create a users table if your Go application needs it
-- Uncomment and modify according to your actual schema needs

/*
CREATE TABLE IF NOT EXISTS users (
    id INT PRIMARY KEY AUTO_INCREMENT,
    username VARCHAR(50) UNIQUE NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS pomodoro_sessions (
    id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT,
    session_type ENUM('work', 'short_break', 'long_break') NOT NULL,
    duration_minutes INT NOT NULL,
    completed BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Add indexes for performance
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_sessions_user_id ON pomodoro_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_sessions_created_at ON pomodoro_sessions(created_at);
*/