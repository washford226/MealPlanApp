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
    dietary_restrictions varchar(255),
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

--Create the foods table
CREATE TABLE Foods (
    food_id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    category_id INT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (category_id) REFERENCES Categories(category_id)
);

--Create the categories table
CREATE TABLE Categories (
    category_id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(255) NOT NULL,
    description TEXT
);

--Create the nutrients table
CREATE TABLE Nutrients (
    nutrient_id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(255) NOT NULL,
    unit VARCHAR(50) NOT NULL,  -- (e.g., grams, milligrams, IU)
    description TEXT
);

--Create the food nutrient table
CREATE TABLE Food_Nutrient (
    food_id INT,
    nutrient_id INT,
    amount DECIMAL(10, 2) NOT NULL,  -- The amount of the nutrient per serving
    PRIMARY KEY (food_id, nutrient_id),
    FOREIGN KEY (food_id) REFERENCES Foods(food_id),
    FOREIGN KEY (nutrient_id) REFERENCES Nutrients(nutrient_id)
);

--Creating portions table
CREATE TABLE Portions (
    portion_id INT PRIMARY KEY AUTO_INCREMENT,
    food_id INT,
    weight_in_grams DECIMAL(10, 2),  -- The weight of the portion
    serving_size VARCHAR(255),  -- E.g., 1 cup, 1 slice
    FOREIGN KEY (food_id) REFERENCES Foods(food_id)
);
