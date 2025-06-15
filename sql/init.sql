-- Create the database
CREATE DATABASE IF NOT EXISTS subscription_manager;
USE subscription_manager;



-- Create the subscriptions table
CREATE TABLE IF NOT EXISTS subscriptions (
    id INT AUTO_INCREMENT PRIMARY KEY,
    firstname VARCHAR(100) NOT NULL,
    lastname VARCHAR(100) NOT NULL,
    email VARCHAR(150) NOT NULL UNIQUE,
    phonenumber VARCHAR(50) NOT NULL,
    subscription VARCHAR(50),
    services VARCHAR(255)
);

CREATE TABLE IF NOT EXISTS users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(50) NOT NULL UNIQUE,
    password VARCHAR(100) NOT NULL,
    role VARCHAR(20) NOT NULL DEFAULT 'user'
);



-- Insert admin user (password: admin0000)
INSERT INTO users (username, password, role)
VALUES ('admin', 'admin0000', 'admin');

