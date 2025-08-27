-- AgroVida Normalized Database Schema (English)
-- Applying 1NF, 2NF and 3NF
-- Database name: agrovida_database

CREATE DATABASE IF NOT EXISTS agrovida_database;
USE agrovida_database;

-- Farms Table
CREATE TABLE farms (
    farm_id INT AUTO_INCREMENT PRIMARY KEY,
    farm_name VARCHAR(50) NOT NULL,
    region VARCHAR(50) NOT NULL,
    UNIQUE KEY unique_farm_name (farm_name)
);

-- Technicians Table
CREATE TABLE technicians (
    technician_id INT AUTO_INCREMENT PRIMARY KEY,
    technician_name VARCHAR(50) NOT NULL
);

-- Crop Types Table
CREATE TABLE crop_types (
    crop_type_id INT AUTO_INCREMENT PRIMARY KEY,
    crop_type_name VARCHAR(50) NOT NULL UNIQUE
);

-- Varieties Table (depends on crop_types)
CREATE TABLE varieties (
    variety_id INT AUTO_INCREMENT PRIMARY KEY,
    variety_name VARCHAR(50) NOT NULL,
    crop_type_id INT NOT NULL,
    FOREIGN KEY (crop_type_id) REFERENCES crop_types(crop_type_id) ON DELETE CASCADE,
    UNIQUE KEY unique_variety_per_crop (variety_name, crop_type_id)
);

-- Sensors Table
CREATE TABLE sensors (
    sensor_id VARCHAR(10) PRIMARY KEY,
    sensor_type VARCHAR(20) NOT NULL,
    sensor_status ENUM('Active', 'Inactive', 'Faulty') NOT NULL DEFAULT 'Active',
    maintenance_date DATE NOT NULL
);

-- Farm Crops Table (many-to-many relationship between farms and crops)
CREATE TABLE farm_crops (
    farm_crop_id INT AUTO_INCREMENT PRIMARY KEY,
    farm_id INT NOT NULL,
    crop_type_id INT NOT NULL,
    variety_id INT NOT NULL,
    production_tons DECIMAL(10,2) NOT NULL CHECK (production_tons >= 0),
    soil_type ENUM('Sandy', 'Clay', 'Loam', 'Silt', 'Peaty') NULL,
    irrigation_system ENUM('Sprinkler', 'Drip', 'None') NULL,
    fertilizer_used ENUM('Compost', 'Manure', 'NPK', 'None') NULL,
    is_organic ENUM('Yes', 'No') NOT NULL DEFAULT 'No',
    technician_id INT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (farm_id) REFERENCES farms(farm_id) ON DELETE CASCADE,
    FOREIGN KEY (crop_type_id) REFERENCES crop_types(crop_type_id) ON DELETE CASCADE,
    FOREIGN KEY (variety_id) REFERENCES varieties(variety_id) ON DELETE CASCADE,
    FOREIGN KEY (technician_id) REFERENCES technicians(technician_id) ON DELETE CASCADE
);

-- Sensor Readings Table
CREATE TABLE sensor_readings (
    reading_id INT AUTO_INCREMENT PRIMARY KEY,
    sensor_id VARCHAR(10) NOT NULL,
    farm_crop_id INT NOT NULL,
    reading_value DECIMAL(10,2) NOT NULL,
    reading_datetime DATETIME NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (sensor_id) REFERENCES sensors(sensor_id) ON DELETE CASCADE,
    FOREIGN KEY (farm_crop_id) REFERENCES farm_crops(farm_crop_id) ON DELETE CASCADE
);

-- Performance Indexes
CREATE INDEX idx_readings_datetime ON sensor_readings(reading_datetime);
CREATE INDEX idx_readings_sensor ON sensor_readings(sensor_id);
CREATE INDEX idx_farm_crops_farm ON farm_crops(farm_id);
CREATE INDEX idx_varieties_crop_type ON varieties(crop_type_id);
CREATE INDEX idx_farm_crops_technician ON farm_crops(technician_id);

-- Views for common queries
CREATE VIEW farm_production_summary AS
SELECT 
    f.farm_name,
    f.region,
    ct.crop_type_name,
    v.variety_name,
    fc.production_tons,
    fc.is_organic,
    t.technician_name
FROM farm_crops fc
JOIN farms f ON fc.farm_id = f.farm_id
JOIN crop_types ct ON fc.crop_type_id = ct.crop_type_id
JOIN varieties v ON fc.variety_id = v.variety_id
JOIN technicians t ON fc.technician_id = t.technician_id;

CREATE VIEW sensor_status_summary AS
SELECT 
    s.sensor_id,
    s.sensor_type,
    s.sensor_status,
    s.maintenance_date,
    DATEDIFF(CURDATE(), s.maintenance_date) as days_since_maintenance,
    COUNT(sr.reading_id) as total_readings
FROM sensors s
LEFT JOIN sensor_readings sr ON s.sensor_id = sr.sensor_id
GROUP BY s.sensor_id, s.sensor_type, s.sensor_status, s.maintenance_date;
