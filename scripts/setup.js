#!/usr/bin/env node
/**
 * AgroVida Setup and Configuration Validator
 * This script validates all configurations and sets up the environment
 */

const fs = require('fs');
const path = require('path');
const mysql = require('mysql2/promise');
require('dotenv').config();

const CONFIG = {
    DB_HOST: process.env.DB_HOST || 'localhost',
    DB_USER: process.env.DB_USER || 'root',
    DB_PASSWORD: process.env.DB_PASSWORD || '',
    DB_NAME: process.env.DB_NAME || 'agrovida_database',
    DB_PORT: process.env.DB_PORT || 3306,
    AGROVIDA_PORT: process.env.AGROVIDA_PORT || 8080
};

console.log('AgroVida Setup & Configuration Validator');
console.log('=' .repeat(50));

async function validateEnvironment() {
    console.log('\nValidating Environment Configuration...');
    
    // Check .env file exists
    const envPath = path.join(__dirname, '.env');
    if (!fs.existsSync(envPath)) {
        console.log('.env file not found');
        return false;
    }
    console.log('.env file found');

    // Validate required environment variables
    const requiredVars = ['DB_HOST', 'DB_USER', 'DB_NAME', 'AGROVIDA_PORT'];
    for (const varName of requiredVars) {
        if (!process.env[varName]) {
            console.log(`Missing environment variable: ${varName}`);
            return false;
        }
        console.log(`${varName}: ${process.env[varName]}`);
    }

    return true;
}

async function validateDatabase() {
    console.log('\n Validating Database Connection...');
    
    try {
        // Test connection without database
        const connection = await mysql.createConnection({
            host: CONFIG.DB_HOST,
            user: CONFIG.DB_USER,
            password: CONFIG.DB_PASSWORD,
            port: CONFIG.DB_PORT
        });

        console.log('MySQL connection successful');

        // Check if database exists
        const [databases] = await connection.execute('SHOW DATABASES');
        const dbExists = databases.some(db => db.Database === CONFIG.DB_NAME);
        
        if (dbExists) {
            console.log(`Database '${CONFIG.DB_NAME}' exists`);
            
            // Connect to the specific database
            await connection.changeUser({ database: CONFIG.DB_NAME });
            
            // Check tables
            const [tables] = await connection.execute('SHOW TABLES');
            const expectedTables = ['farms', 'technicians', 'crop_types', 'varieties', 'sensors', 'farm_crops', 'sensor_readings'];
            
            console.log(` Found ${tables.length} tables:`);
            expectedTables.forEach(tableName => {
                const exists = tables.some(table => Object.values(table)[0] === tableName);
                console.log(`${exists ? 'YES' : 'NO'} ${tableName}`);
            });
            
        } else {
            console.log(`Database '${CONFIG.DB_NAME}' does not exist`);
            console.log('Run: npm run setup-db');
        }

        await connection.end();
        return dbExists;
        
    } catch (error) {
        console.log('Database connection failed:', error.message);
        return false;
    }
}

async function validateFiles() {
    console.log('\n📁 Validating Project Files...');
    
    const requiredFiles = [
        'server.js',
        'package.json',
        'database_schema_english.sql',
        'load_csv_data.py',
        'config/database.js',
        'models/Variety.js',
        'controllers/varietyController.js',
        'routes/varietyRoutes.js',
        'public/index.html',
        'public/app.js'
    ];

    let allFilesExist = true;
    
    for (const filePath of requiredFiles) {
        const fullPath = path.join(__dirname, filePath);
        if (fs.existsSync(fullPath)) {
            console.log(`✅ ${filePath}`);
        } else {
            console.log(`❌ ${filePath}`);
            allFilesExist = false;
        }
    }

    return allFilesExist;
}

async function validateCSVFiles() {
    console.log('\n📊 Validating CSV Files...');
    
    const csvDir = path.join(__dirname, 'csv_normalizados');
    const requiredCSVs = [
        'farms.csv',
        'technicians.csv', 
        'crop_types.csv',
        'varieties.csv',
        'sensors.csv',
        'farm_crops.csv',
        'sensor_readings.csv'
    ];

    if (!fs.existsSync(csvDir)) {
        console.log('❌ csv_normalizados directory not found');
        return false;
    }

    let allCSVsExist = true;
    
    for (const csvFile of requiredCSVs) {
        const csvPath = path.join(csvDir, csvFile);
        if (fs.existsSync(csvPath)) {
            const stats = fs.statSync(csvPath);
            console.log(`✅ ${csvFile} (${stats.size} bytes)`);
        } else {
            console.log(`❌ ${csvFile}`);
            allCSVsExist = false;
        }
    }

    return allCSVsExist;
}

async function validatePort() {
    console.log('\n🔌 Validating Port Configuration...');
    
    const net = require('net');
    
    return new Promise((resolve) => {
        const server = net.createServer();
        
        server.listen(CONFIG.AGROVIDA_PORT, () => {
            console.log(`✅ Port ${CONFIG.AGROVIDA_PORT} is available`);
            server.close();
            resolve(true);
        });
        
        server.on('error', (err) => {
            if (err.code === 'EADDRINUSE') {
                console.log(`❌ Port ${CONFIG.AGROVIDA_PORT} is already in use`);
                console.log('💡 Try changing AGROVIDA_PORT in .env file');
            } else {
                console.log(`❌ Port error: ${err.message}`);
            }
            resolve(false);
        });
    });
}

async function generateSummary(results) {
    console.log('\n📋 Configuration Summary');
    console.log('=' .repeat(30));
    
    const { env, db, files, csv, port } = results;
    
    console.log(`Environment Config: ${env ? '✅' : '❌'}`);
    console.log(`Database Setup: ${db ? '✅' : '❌'}`);
    console.log(`Project Files: ${files ? '✅' : '❌'}`);
    console.log(`CSV Data Files: ${csv ? '✅' : '❌'}`);
    console.log(`Port Available: ${port ? '✅' : '❌'}`);
    
    const allGood = env && db && files && csv && port;
    
    console.log('\n' + '=' .repeat(50));
    if (allGood) {
        console.log('🎉 All configurations are valid!');
        console.log('🚀 Ready to start AgroVida system:');
        console.log('   npm start');
        console.log(`   Dashboard: http://localhost:${CONFIG.AGROVIDA_PORT}`);
    } else {
        console.log('⚠️  Some configurations need attention');
        console.log('📖 Check the validation results above');
        
        if (!db) {
            console.log('\n🔧 To setup database:');
            console.log('   npm run setup-db');
            console.log('   npm run load-data');
        }
    }
    
    return allGood;
}

async function main() {
    try {
        const results = {
            env: await validateEnvironment(),
            db: await validateDatabase(),
            files: await validateFiles(),
            csv: await validateCSVFiles(),
            port: await validatePort()
        };
        
        await generateSummary(results);
        
        process.exit(results.env && results.files ? 0 : 1);
        
    } catch (error) {
        console.error('❌ Setup validation failed:', error.message);
        process.exit(1);
    }
}

if (require.main === module) {
    main();
}

module.exports = { CONFIG, validateEnvironment, validateDatabase };
