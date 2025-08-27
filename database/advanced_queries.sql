-- Advanced Queries for AgroVida Database
-- These queries demonstrate complex data analysis capabilities

USE agrovida_database;

-- 1. Production Analysis by Region and Crop Type
SELECT 
    f.region,
    ct.crop_type_name,
    COUNT(fc.farm_crop_id) as total_crops,
    SUM(fc.production_tons) as total_production,
    AVG(fc.production_tons) as avg_production_per_crop,
    COUNT(CASE WHEN fc.is_organic = 'Yes' THEN 1 END) as organic_crops,
    ROUND((COUNT(CASE WHEN fc.is_organic = 'Yes' THEN 1 END) * 100.0 / COUNT(fc.farm_crop_id)), 2) as organic_percentage
FROM farm_crops fc
JOIN farms f ON fc.farm_id = f.farm_id
JOIN crop_types ct ON fc.crop_type_id = ct.crop_type_id
GROUP BY f.region, ct.crop_type_name
ORDER BY total_production DESC;

-- 2. Sensor Performance and Maintenance Analysis
SELECT 
    s.sensor_type,
    s.sensor_status,
    COUNT(s.sensor_id) as sensor_count,
    AVG(DATEDIFF(CURDATE(), s.maintenance_date)) as avg_days_since_maintenance,
    COUNT(sr.reading_id) as total_readings,
    ROUND(AVG(sr.reading_value), 2) as avg_reading_value,
    MIN(sr.reading_value) as min_reading,
    MAX(sr.reading_value) as max_reading
FROM sensors s
LEFT JOIN sensor_readings sr ON s.sensor_id = sr.sensor_id
GROUP BY s.sensor_type, s.sensor_status
ORDER BY s.sensor_type, s.sensor_status;

-- 3. Technician Workload and Performance Analysis
SELECT 
    t.technician_name,
    COUNT(fc.farm_crop_id) as crops_managed,
    COUNT(DISTINCT f.farm_id) as farms_managed,
    SUM(fc.production_tons) as total_production_supervised,
    AVG(fc.production_tons) as avg_production_per_crop,
    COUNT(CASE WHEN fc.is_organic = 'Yes' THEN 1 END) as organic_crops_managed,
    GROUP_CONCAT(DISTINCT f.region ORDER BY f.region) as regions_covered
FROM technicians t
JOIN farm_crops fc ON t.technician_id = fc.technician_id
JOIN farms f ON fc.farm_id = f.farm_id
GROUP BY t.technician_id, t.technician_name
ORDER BY total_production_supervised DESC;

-- 4. Crop Variety Performance by Soil Type and Irrigation
SELECT 
    v.variety_name,
    ct.crop_type_name,
    fc.soil_type,
    fc.irrigation_system,
    COUNT(fc.farm_crop_id) as crop_instances,
    AVG(fc.production_tons) as avg_production,
    SUM(fc.production_tons) as total_production,
    CASE 
        WHEN AVG(fc.production_tons) >= 10 THEN 'High'
        WHEN AVG(fc.production_tons) >= 5 THEN 'Medium'
        ELSE 'Low'
    END as performance_category
FROM farm_crops fc
JOIN varieties v ON fc.variety_id = v.variety_id
JOIN crop_types ct ON fc.crop_type_id = ct.crop_type_id
WHERE fc.soil_type IS NOT NULL AND fc.irrigation_system IS NOT NULL
GROUP BY v.variety_name, ct.crop_type_name, fc.soil_type, fc.irrigation_system
HAVING crop_instances >= 1
ORDER BY avg_production DESC;

-- 5. Sensor Reading Trends and Anomaly Detection
SELECT 
    s.sensor_id,
    s.sensor_type,
    DATE(sr.reading_datetime) as reading_date,
    COUNT(sr.reading_id) as daily_readings,
    AVG(sr.reading_value) as avg_daily_value,
    MIN(sr.reading_value) as min_daily_value,
    MAX(sr.reading_value) as max_daily_value,
    STDDEV(sr.reading_value) as value_std_deviation,
    CASE 
        WHEN STDDEV(sr.reading_value) > 20 THEN 'High Variance'
        WHEN STDDEV(sr.reading_value) > 10 THEN 'Medium Variance'
        ELSE 'Low Variance'
    END as variance_category
FROM sensor_readings sr
JOIN sensors s ON sr.sensor_id = s.sensor_id
GROUP BY s.sensor_id, s.sensor_type, DATE(sr.reading_datetime)
ORDER BY reading_date DESC, s.sensor_type;

-- 6. Farm Productivity Ranking with Multiple Metrics
SELECT 
    f.farm_name,
    f.region,
    COUNT(fc.farm_crop_id) as total_crops,
    COUNT(DISTINCT fc.crop_type_id) as crop_diversity,
    SUM(fc.production_tons) as total_production,
    AVG(fc.production_tons) as avg_production_per_crop,
    COUNT(CASE WHEN fc.is_organic = 'Yes' THEN 1 END) as organic_crops,
    COUNT(DISTINCT fc.technician_id) as technicians_involved,
    -- Productivity Score (weighted combination of metrics)
    ROUND(
        (SUM(fc.production_tons) * 0.4) + 
        (COUNT(DISTINCT fc.crop_type_id) * 2) + 
        (COUNT(CASE WHEN fc.is_organic = 'Yes' THEN 1 END) * 1.5)
    , 2) as productivity_score
FROM farms f
JOIN farm_crops fc ON f.farm_id = fc.farm_id
GROUP BY f.farm_id, f.farm_name, f.region
ORDER BY productivity_score DESC;

-- 7. Fertilizer Effectiveness Analysis
SELECT 
    fc.fertilizer_used,
    ct.crop_type_name,
    COUNT(fc.farm_crop_id) as usage_count,
    AVG(fc.production_tons) as avg_production,
    MIN(fc.production_tons) as min_production,
    MAX(fc.production_tons) as max_production,
    ROUND(STDDEV(fc.production_tons), 2) as production_std_dev,
    COUNT(CASE WHEN fc.is_organic = 'Yes' THEN 1 END) as organic_usage
FROM farm_crops fc
JOIN crop_types ct ON fc.crop_type_id = ct.crop_type_id
WHERE fc.fertilizer_used IS NOT NULL AND fc.fertilizer_used != 'None'
GROUP BY fc.fertilizer_used, ct.crop_type_name
HAVING usage_count >= 1
ORDER BY avg_production DESC;

-- 8. Comprehensive Farm Report (Complex Join Query)
SELECT 
    f.farm_name,
    f.region,
    ct.crop_type_name,
    v.variety_name,
    fc.production_tons,
    fc.soil_type,
    fc.irrigation_system,
    fc.fertilizer_used,
    fc.is_organic,
    t.technician_name,
    s.sensor_type,
    sr.reading_value as latest_sensor_reading,
    sr.reading_datetime as latest_reading_time,
    s.sensor_status,
    DATEDIFF(CURDATE(), s.maintenance_date) as days_since_maintenance
FROM farms f
JOIN farm_crops fc ON f.farm_id = fc.farm_id
JOIN crop_types ct ON fc.crop_type_id = ct.crop_type_id
JOIN varieties v ON fc.variety_id = v.variety_id
JOIN technicians t ON fc.technician_id = t.technician_id
LEFT JOIN sensor_readings sr ON fc.farm_crop_id = sr.farm_crop_id
LEFT JOIN sensors s ON sr.sensor_id = s.sensor_id
WHERE sr.reading_datetime = (
    SELECT MAX(sr2.reading_datetime) 
    FROM sensor_readings sr2 
    WHERE sr2.farm_crop_id = fc.farm_crop_id
) OR sr.reading_datetime IS NULL
ORDER BY f.farm_name, ct.crop_type_name;

-- 9. Monthly Production Trends (Time Series Analysis)
SELECT 
    YEAR(fc.created_at) as production_year,
    MONTH(fc.created_at) as production_month,
    MONTHNAME(fc.created_at) as month_name,
    COUNT(fc.farm_crop_id) as crops_planted,
    SUM(fc.production_tons) as total_production,
    AVG(fc.production_tons) as avg_production,
    COUNT(CASE WHEN fc.is_organic = 'Yes' THEN 1 END) as organic_crops
FROM farm_crops fc
GROUP BY YEAR(fc.created_at), MONTH(fc.created_at), MONTHNAME(fc.created_at)
ORDER BY production_year DESC, production_month DESC;

-- 10. Risk Assessment Query (Sensors needing attention)
SELECT 
    s.sensor_id,
    s.sensor_type,
    s.sensor_status,
    f.farm_name,
    ct.crop_type_name,
    DATEDIFF(CURDATE(), s.maintenance_date) as days_overdue,
    COUNT(sr.reading_id) as recent_readings,
    CASE 
        WHEN s.sensor_status = 'Faulty' THEN 'Critical'
        WHEN DATEDIFF(CURDATE(), s.maintenance_date) > 60 THEN 'High Risk'
        WHEN DATEDIFF(CURDATE(), s.maintenance_date) > 30 THEN 'Medium Risk'
        ELSE 'Low Risk'
    END as risk_level
FROM sensors s
LEFT JOIN sensor_readings sr ON s.sensor_id = sr.sensor_id 
    AND sr.reading_datetime >= DATE_SUB(CURDATE(), INTERVAL 7 DAY)
LEFT JOIN farm_crops fc ON sr.farm_crop_id = fc.farm_crop_id
LEFT JOIN farms f ON fc.farm_id = f.farm_id
LEFT JOIN crop_types ct ON fc.crop_type_id = ct.crop_type_id
GROUP BY s.sensor_id, s.sensor_type, s.sensor_status, f.farm_name, ct.crop_type_name
HAVING risk_level IN ('Critical', 'High Risk', 'Medium Risk')
ORDER BY 
    CASE risk_level 
        WHEN 'Critical' THEN 1 
        WHEN 'High Risk' THEN 2 
        WHEN 'Medium Risk' THEN 3 
    END,
    days_overdue DESC;
