# AgroVida Database Normalization

## Process Overview

Complete normalization (1NF, 2NF, 3NF) was applied to the original AgroVida table to eliminate redundancies and improve data integrity.

## Original vs Normalized Structure

### Original Table

- **Problem**: Single table with 16 columns and multiple redundancies
- **Redundancies**: Farm, technician, sensor and crop information repeated
- **Inconsistencies**: Same farms appeared in different regions

### Normalized Structure (7 tables)

1. **farms.csv** - Basic farm information

   - `farm_id`, `farm_name`, `region`
2. **technicians.csv** - Technician catalog

   - `technician_id`, `technician_name`
3. **crop_types.csv** - Available crop types

   - `crop_type_id`, `crop_type_name`
4. **varieties.csv** - Varieties by crop type

   - `variety_id`, `variety_name`, `crop_type_id`
5. **sensors.csv** - Sensor information

   - `sensor_id`, `sensor_type`, `sensor_status`, `maintenance_date`
6. **farm_crops.csv** - Farm-crop relationship with details

   - `farm_crop_id`, `farm_id`, `crop_type_id`, `variety_id`, `production_tons`, `soil_type`, `irrigation_system`, `fertilizer_used`, `is_organic`, `technician_id`
7. **sensor_readings.csv** - Sensor readings by crop

   - `reading_id`, `sensor_id`, `farm_crop_id`, `value`, `timestamp`

## Normalization Benefits

**Redundancy elimination** - Each data point stored only once
**Data consistency** - No contradictory information
**Referential integrity** - Relationships defined with foreign keys
**Easy maintenance** - Updates in one place only
**Better performance** - More efficient queries with indexes
**Scalability** - Easy to add new data without duplication

## Generated Files

- `farms.csv` - 5 unique farm records
- `technicians.csv` - 5 technicians
- `crop_types.csv` - 4 crop types
- `varieties.csv` - 5 varieties with type relationships
- `sensors.csv` - 15 sensors with their status
- `farm_crops.csv` - 15 farm-crop combinations
- `sensor_readings.csv` - 15 sensor readings
- `agrovida_normalized_schema.sql` - Table creation script
- `consultas_ejemplo.sql` - Example queries

## Usage

1. Run `agrovida_normalized_schema.sql` to create the structure
2. Import CSV files to their respective tables
3. Use example queries as reference
