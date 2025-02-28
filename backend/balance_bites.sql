CREATE DATABASE balance_bites;

USE balance_bites;

CREATE TABLE meals (
    id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    ingredients TEXT NOT NULL,
    calories INT NOT NULL,
    protein INT NOT NULL,
    carbohydrates INT NOT NULL,
    fat INT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);