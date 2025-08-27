-- Example Queries for AgroVida Normalized Database

USE agrovida_database;

-- 1. Get all sensor readings with complete information
SELECT 
    f.farm_name,
    ct.crop_type_name,
    v.variety_name,
    s.sensor_type,
    sr.reading_value,
    sr.reading_datetime,
    s.sensor_status
FROM sensor_readings sr
JOIN sensors s ON sr.sensor_id = s.sensor_id
JOIN farm_crops fc ON sr.farm_crop_id = fc.farm_crop_id
JOIN farms f ON fc.farm_id = f.farm_id
JOIN crop_types ct ON fc.crop_type_id = ct.crop_type_id
JOIN varieties v ON fc.variety_id = v.variety_id
ORDER BY sr.reading_datetime;

-- 2. Total production by farm
SELECT 
    f.farm_name,
    f.region,
    SUM(fc.production_tons) as total_production
FROM farms f
JOIN farm_crops fc ON f.farm_id = fc.farm_id
GROUP BY f.farm_id, f.farm_name, f.region
ORDER BY total_production DESC;

-- 3. Sensors requiring maintenance (more than 30 days)
SELECT 
    s.sensor_id,
    s.sensor_type,
    s.sensor_status,
    s.maintenance_date,
    DATEDIFF(CURDATE(), s.maintenance_date) as days_without_maintenance
FROM sensors s
WHERE DATEDIFF(CURDATE(), s.maintenance_date) > 30
ORDER BY days_without_maintenance DESC;

-- 4. Organic crops by region
SELECT 
    f.region,
    ct.crop_type_name,
    COUNT(*) as organic_crops_count,
    AVG(fc.production_tons) as average_production
FROM farm_crops fc
JOIN farms f ON fc.farm_id = f.farm_id
JOIN crop_types ct ON fc.crop_type_id = ct.crop_type_id
WHERE fc.is_organic = 'Yes'
GROUP BY f.region, ct.crop_type_name
ORDER BY f.region, organic_crops_count DESC;

-- 5. Technicians and their workload
SELECT 
    t.technician_name,
    COUNT(fc.farm_crop_id) as assigned_crops,
    SUM(fc.production_tons) as total_supervised_production
FROM technicians t
JOIN farm_crops fc ON t.technician_id = fc.technician_id
GROUP BY t.technician_id, t.technician_name
ORDER BY assigned_crops DESC;

-- 6. Production summary by crop type
SELECT 
    ct.crop_type_name,
    COUNT(fc.farm_crop_id) as total_crops,
    SUM(fc.production_tons) as total_production,
    AVG(fc.production_tons) as average_production,
    COUNT(CASE WHEN fc.is_organic = 'Yes' THEN 1 END) as organic_crops
FROM crop_types ct
JOIN farm_crops fc ON ct.crop_type_id = fc.crop_type_id
GROUP BY ct.crop_type_id, ct.crop_type_name
ORDER BY total_production DESC;

-- 7. Sensor readings analysis
SELECT 
    s.sensor_type,
    COUNT(sr.reading_id) as total_readings,
    AVG(sr.reading_value) as average_value,
    MIN(sr.reading_value) as min_value,
    MAX(sr.reading_value) as max_value
FROM sensors s
JOIN sensor_readings sr ON s.sensor_id = sr.sensor_id
GROUP BY s.sensor_type
ORDER BY total_readings DESC;
