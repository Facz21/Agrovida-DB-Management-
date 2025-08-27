-- Bulk Data Loading Script for AgroVida Database
-- Execute this script after creating the database schema

USE agrovida_database;

-- Disable foreign key checks temporarily for bulk loading
SET FOREIGN_KEY_CHECKS = 0;

-- Clear existing data (if any)
DELETE FROM sensor_readings;
DELETE FROM farm_crops;
DELETE FROM varieties;
DELETE FROM sensors;
DELETE FROM crop_types;
DELETE FROM technicians;
DELETE FROM farms;

-- Reset AUTO_INCREMENT counters
ALTER TABLE farms AUTO_INCREMENT = 1;
ALTER TABLE technicians AUTO_INCREMENT = 1;
ALTER TABLE crop_types AUTO_INCREMENT = 1;
ALTER TABLE varieties AUTO_INCREMENT = 1;
ALTER TABLE farm_crops AUTO_INCREMENT = 1;
ALTER TABLE sensor_readings AUTO_INCREMENT = 1;

-- Load Farms data
LOAD DATA LOCAL INFILE './csv_normalizados/farms.csv'
INTO TABLE farms
FIELDS TERMINATED BY ','
ENCLOSED BY '"'
LINES TERMINATED BY '\n'
IGNORE 1 ROWS
(farm_id, farm_name, region);

-- Load Technicians data
LOAD DATA LOCAL INFILE './csv_normalizados/technicians.csv'
INTO TABLE technicians
FIELDS TERMINATED BY ','
ENCLOSED BY '"'
LINES TERMINATED BY '\n'
IGNORE 1 ROWS
(technician_id, technician_name);

-- Load Crop Types data
LOAD DATA LOCAL INFILE './csv_normalizados/crop_types.csv'
INTO TABLE crop_types
FIELDS TERMINATED BY ','
ENCLOSED BY '"'
LINES TERMINATED BY '\n'
IGNORE 1 ROWS
(crop_type_id, crop_type_name);

-- Load Varieties data
LOAD DATA LOCAL INFILE './csv_normalizados/varieties.csv'
INTO TABLE varieties
FIELDS TERMINATED BY ','
ENCLOSED BY '"'
LINES TERMINATED BY '\n'
IGNORE 1 ROWS
(variety_id, variety_name, crop_type_id);

-- Load Sensors data
LOAD DATA LOCAL INFILE './csv_normalizados/sensors.csv'
INTO TABLE sensors
FIELDS TERMINATED BY ','
ENCLOSED BY '"'
LINES TERMINATED BY '\n'
IGNORE 1 ROWS
(sensor_id, sensor_type, sensor_status, maintenance_date);

-- Load Farm Crops data
LOAD DATA LOCAL INFILE './csv_normalizados/farm_crops.csv'
INTO TABLE farm_crops
FIELDS TERMINATED BY ','
ENCLOSED BY '"'
LINES TERMINATED BY '\n'
IGNORE 1 ROWS
(farm_crop_id, farm_id, crop_type_id, variety_id, production_tons, soil_type, irrigation_system, fertilizer_used, is_organic, technician_id);

-- Load Sensor Readings data
LOAD DATA LOCAL INFILE './csv_normalizados/sensor_readings.csv'
INTO TABLE sensor_readings
FIELDS TERMINATED BY ','
ENCLOSED BY '"'
LINES TERMINATED BY '\n'
IGNORE 1 ROWS
(reading_id, sensor_id, farm_crop_id, reading_value, reading_datetime);

-- Re-enable foreign key checks
SET FOREIGN_KEY_CHECKS = 1;

-- Verify data loading
SELECT 'Data Loading Summary' as status, '==================' as separator
UNION ALL
SELECT 'Farms loaded:', CAST(COUNT(*) AS CHAR) FROM farms
UNION ALL
SELECT 'Technicians loaded:', CAST(COUNT(*) AS CHAR) FROM technicians
UNION ALL
SELECT 'Crop Types loaded:', CAST(COUNT(*) AS CHAR) FROM crop_types
UNION ALL
SELECT 'Varieties loaded:', CAST(COUNT(*) AS CHAR) FROM varieties
UNION ALL
SELECT 'Sensors loaded:', CAST(COUNT(*) AS CHAR) FROM sensors
UNION ALL
SELECT 'Farm Crops loaded:', CAST(COUNT(*) AS CHAR) FROM farm_crops
UNION ALL
SELECT 'Sensor Readings loaded:', CAST(COUNT(*) AS CHAR) FROM sensor_readings
UNION ALL
SELECT '==================', 'COMPLETED' as status;
