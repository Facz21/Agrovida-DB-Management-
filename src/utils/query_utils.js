#!/usr/bin/env node
// AgroVida Query Utilities
const db = require('../config/database');

const queries = {
    // Basic data queries
    farms: 'SELECT * FROM farms ORDER BY farm_name',
    varieties: 'SELECT v.*, ct.crop_type_name FROM varieties v JOIN crop_types ct ON v.crop_type_id = ct.crop_type_id ORDER BY ct.crop_type_name, v.variety_name',
    sensors: 'SELECT * FROM sensors ORDER BY sensor_type, sensor_id',
    
    // Production analysis
    production_by_farm: `
        SELECT f.farm_name, f.region, SUM(fc.production_tons) as total_production
        FROM farms f 
        JOIN farm_crops fc ON f.farm_id = fc.farm_id 
        GROUP BY f.farm_id, f.farm_name, f.region 
        ORDER BY total_production DESC`,
    
    production_by_region: `
        SELECT f.region, COUNT(f.farm_id) as farm_count, SUM(fc.production_tons) as total_production
        FROM farms f 
        JOIN farm_crops fc ON f.farm_id = fc.farm_id 
        GROUP BY f.region 
        ORDER BY total_production DESC`,
    
    // Crop analysis
    crops_by_type: `
        SELECT ct.crop_type_name, COUNT(fc.farm_crop_id) as farm_count, SUM(fc.production_tons) as total_production
        FROM crop_types ct 
        JOIN farm_crops fc ON ct.crop_type_id = fc.crop_type_id 
        GROUP BY ct.crop_type_id, ct.crop_type_name 
        ORDER BY total_production DESC`,
    
    // Sensor monitoring
    sensor_status: `
        SELECT sensor_status, COUNT(*) as count 
        FROM sensors 
        GROUP BY sensor_status`,
    
    // Farm details
    farm_details: `
        SELECT f.farm_name, f.region, ct.crop_type_name, v.variety_name, 
               fc.production_tons, fc.soil_type, fc.irrigation_system, fc.is_organic
        FROM farms f
        JOIN farm_crops fc ON f.farm_id = fc.farm_id
        JOIN crop_types ct ON fc.crop_type_id = ct.crop_type_id
        JOIN varieties v ON fc.variety_id = v.variety_id
        ORDER BY f.farm_name, ct.crop_type_name`,
    
    // Summary stats
    summary: `
        SELECT 
            (SELECT COUNT(*) FROM farms) as total_farms,
            (SELECT COUNT(*) FROM varieties) as total_varieties,
            (SELECT COUNT(*) FROM sensors) as total_sensors,
            (SELECT SUM(production_tons) FROM farm_crops) as total_production,
            (SELECT COUNT(*) FROM farm_crops WHERE is_organic = 'Yes') as organic_crops`,

    // Advanced variety analysis
    variety_stats: `
        SELECT 
            ct.crop_type_name,
            COUNT(v.variety_id) as variety_count,
            ROUND(COUNT(v.variety_id) * 100.0 / (SELECT COUNT(*) FROM varieties), 2) as percentage
        FROM crop_types ct
        LEFT JOIN varieties v ON ct.crop_type_id = v.crop_type_id
        GROUP BY ct.crop_type_id, ct.crop_type_name
        ORDER BY variety_count DESC`,

    // Variety production analysis
    variety_production: `
        SELECT 
            v.variety_name,
            ct.crop_type_name,
            COUNT(fc.farm_crop_id) as farms_using,
            SUM(fc.production_tons) as total_production,
            AVG(fc.production_tons) as avg_production,
            MAX(fc.production_tons) as max_production
        FROM varieties v
        JOIN crop_types ct ON v.crop_type_id = ct.crop_type_id
        LEFT JOIN farm_crops fc ON v.variety_id = fc.variety_id
        GROUP BY v.variety_id, v.variety_name, ct.crop_type_name
        ORDER BY total_production DESC`,

    // Top performing varieties
    top_varieties: `
        SELECT 
            v.variety_name,
            ct.crop_type_name,
            SUM(fc.production_tons) as total_production,
            COUNT(fc.farm_crop_id) as farm_count,
            ROUND(AVG(fc.production_tons), 2) as avg_production_per_farm
        FROM varieties v
        JOIN crop_types ct ON v.crop_type_id = ct.crop_type_id
        JOIN farm_crops fc ON v.variety_id = fc.variety_id
        GROUP BY v.variety_id, v.variety_name, ct.crop_type_name
        HAVING total_production > 0
        ORDER BY total_production DESC
        LIMIT 5`,

    // Organic vs conventional analysis
    organic_analysis: `
        SELECT 
            v.variety_name,
            ct.crop_type_name,
            SUM(CASE WHEN fc.is_organic = 'Yes' THEN fc.production_tons ELSE 0 END) as organic_production,
            SUM(CASE WHEN fc.is_organic = 'No' THEN fc.production_tons ELSE 0 END) as conventional_production,
            COUNT(CASE WHEN fc.is_organic = 'Yes' THEN 1 END) as organic_farms,
            COUNT(CASE WHEN fc.is_organic = 'No' THEN 1 END) as conventional_farms
        FROM varieties v
        JOIN crop_types ct ON v.crop_type_id = ct.crop_type_id
        LEFT JOIN farm_crops fc ON v.variety_id = fc.variety_id
        GROUP BY v.variety_id, v.variety_name, ct.crop_type_name
        ORDER BY (organic_production + conventional_production) DESC`,

    // Regional variety distribution
    regional_varieties: `
        SELECT 
            f.region,
            ct.crop_type_name,
            v.variety_name,
            COUNT(fc.farm_crop_id) as farm_count,
            SUM(fc.production_tons) as total_production
        FROM farms f
        JOIN farm_crops fc ON f.farm_id = fc.farm_id
        JOIN varieties v ON fc.variety_id = v.variety_id
        JOIN crop_types ct ON v.crop_type_id = ct.crop_type_id
        GROUP BY f.region, ct.crop_type_name, v.variety_name
        ORDER BY f.region, total_production DESC`,

    // Variety diversity by region
    region_diversity: `
        SELECT 
            f.region,
            COUNT(DISTINCT v.variety_id) as unique_varieties,
            COUNT(DISTINCT ct.crop_type_id) as crop_types,
            SUM(fc.production_tons) as total_production
        FROM farms f
        JOIN farm_crops fc ON f.farm_id = fc.farm_id
        JOIN varieties v ON fc.variety_id = v.variety_id
        JOIN crop_types ct ON v.crop_type_id = ct.crop_type_id
        GROUP BY f.region
        ORDER BY unique_varieties DESC`,

    // Cacao specific analysis
    cacao_analysis: `
        SELECT 
            v.variety_name,
            f.farm_name,
            f.region,
            fc.production_tons,
            fc.soil_type,
            fc.irrigation_system,
            fc.is_organic
        FROM varieties v
        JOIN crop_types ct ON v.crop_type_id = ct.crop_type_id
        JOIN farm_crops fc ON v.variety_id = fc.variety_id
        JOIN farms f ON fc.farm_id = f.farm_id
        WHERE ct.crop_type_name = 'Cocoa'
        ORDER BY fc.production_tons DESC`,

    // Underutilized varieties
    underutilized_varieties: `
        SELECT 
            v.variety_name,
            ct.crop_type_name,
            COALESCE(COUNT(fc.farm_crop_id), 0) as farms_using,
            COALESCE(SUM(fc.production_tons), 0) as total_production
        FROM varieties v
        JOIN crop_types ct ON v.crop_type_id = ct.crop_type_id
        LEFT JOIN farm_crops fc ON v.variety_id = fc.variety_id
        GROUP BY v.variety_id, v.variety_name, ct.crop_type_name
        HAVING farms_using <= 1
        ORDER BY farms_using ASC, ct.crop_type_name`
};

async function runQuery(queryName, params = []) {
    try {
        if (!queries[queryName]) {
            console.error(`Query '${queryName}' not found`);
            console.log('Available queries:', Object.keys(queries).join(', '));
            return;
        }

        console.log(`Running query: ${queryName}`);
        console.log('=====================================');
        
        const [rows] = await db.execute(queries[queryName], params);
        
        if (rows.length === 0) {
            console.log('No results found');
            return;
        }

        // Format output as table
        console.table(rows);
        console.log(`\nTotal records: ${rows.length}`);
        
    } catch (error) {
        console.error('Query failed:', error.message);
    }
}

async function listQueries() {
    console.log('Available Queries:');
    console.log('====================');
    Object.keys(queries).forEach(key => {
        console.log(`• ${key}`);
    });
    console.log('\nUsage: node query_utils.js <query_name>');
}

// Command line interface
async function main() {
    const args = process.argv.slice(2);
    
    if (args.length === 0 || args[0] === 'help' || args[0] === '--help') {
        await listQueries();
        return;
    }
    
    const queryName = args[0];
    await runQuery(queryName);
    await db.end();
}

// Export for use as module
module.exports = { queries, runQuery };

// Run if called directly
if (require.main === module) {
    main().catch(console.error);
}
