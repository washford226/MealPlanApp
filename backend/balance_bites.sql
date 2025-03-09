-- Create the database
CREATE DATABASE IF NOT EXISTS balance_bites;

-- Use the database
USE balance_bites;

-- Create the users table
CREATE TABLE IF NOT EXISTS users (
    id INT AUTO_INCREMENT PRIMARY KEY UNIQUE,
    username VARCHAR(50) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    email VARCHAR(100) NOT NULL UNIQUE,
    profile_picture BLOB,
    calories_goal varchar(255),
    diatary_restrictions varchar(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create the meals table
CREATE TABLE IF NOT EXISTS meals (
    id CHAR(36) PRIMARY KEY UNIQUE,
    user_id INT NOT NULL,
    name VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    ingredients TEXT NOT NULL,
    calories INT NOT NULL,
    protein INT NOT NULL,
    carbohydrates INT NOT NULL,
    fat INT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);