CREATE DATABASE IF NOT EXISTS subscription_db;
USE subscription_db;

-- Tabel voor subscriptions
CREATE TABLE IF NOT EXISTS subscriptions (
    id INT AUTO_INCREMENT PRIMARY KEY,
    firstname VARCHAR(50) NOT NULL,
    lastname VARCHAR(50) NOT NULL,
    email VARCHAR(100) NOT NULL UNIQUE,
    phonenumber VARCHAR(20) NOT NULL,
    subscription VARCHAR(20),
    services VARCHAR(255),
    status ENUM('Pending', 'Active', 'Inactive') NOT NULL DEFAULT 'Pending'
);

-- Tabel voor gebruikers
CREATE TABLE IF NOT EXISTS users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(50) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    role VARCHAR(20) NOT NULL
);

-- Standaard admin gebruiker toevoegen
INSERT INTO users (username, password, role)
VALUES ('admin', '12345678', 'ADMIN');