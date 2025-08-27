#!/usr/bin/env python3
"""
Bulk CSV Data Loader for AgroVida Database
This script loads normalized CSV data into the MySQL database
"""

import mysql.connector
import csv
import os
from datetime import datetime

# Database configuration
import os
from dotenv import load_dotenv

load_dotenv()

DB_CONFIG = {
    'host': os.getenv('DB_HOST', 'localhost'),
    'user': os.getenv('DB_USER', 'agrovida_user'),
    'password': os.getenv('DB_PASSWORD', 'agrovida_password'),
    'database': os.getenv('DB_NAME', 'agrovida_database'),
    'port': int(os.getenv('DB_PORT', 3306)),
    'ssl_disabled': True,
    'autocommit': False
}

CSV_DIR = './database/data'

def connect_database():
    """Connect to MySQL database"""
    try:
        connection = mysql.connector.connect(**DB_CONFIG)
        return connection
    except mysql.connector.Error as e:
        print(f"Error connecting to database: {e}")
        return None

def load_csv_to_table(connection, csv_file, table_name, columns):
    """Load CSV data into specified table"""
    cursor = connection.cursor()
    
    try:
        # Read CSV file
        csv_path = os.path.join(CSV_DIR, csv_file)
        with open(csv_path, 'r', encoding='utf-8') as file:
            csv_reader = csv.DictReader(file)
            
            # Prepare INSERT statement
            placeholders = ', '.join(['%s'] * len(columns))
            insert_query = f"INSERT INTO {table_name} ({', '.join(columns)}) VALUES ({placeholders})"
            
            # Insert data
            rows_inserted = 0
            for row in csv_reader:
                values = [row[col] for col in columns]
                cursor.execute(insert_query, values)
                rows_inserted += 1
            
            connection.commit()
            print(f" {table_name}: {rows_inserted} records loaded successfully")
            
    except Exception as e:
        print(f"Error loading {table_name}: {e}")
        connection.rollback()
    
    finally:
        cursor.close()

def main():
    """Main function to load all CSV data"""
    print("Starting AgroVida Database Data Loading...")
    print("=" * 50)
    
    # Connect to database
    connection = connect_database()
    if not connection:
        print("Failed to connect to database. Exiting.")
        return
    
    # Disable foreign key checks
    cursor = connection.cursor()
    cursor.execute("SET FOREIGN_KEY_CHECKS = 0")
    
    # Load data in correct order (respecting foreign keys)
    load_operations = [
        ('farms.csv', 'farms', ['farm_id', 'farm_name', 'region']),
        ('technicians.csv', 'technicians', ['technician_id', 'technician_name']),
        ('crop_types.csv', 'crop_types', ['crop_type_id', 'crop_type_name']),
        ('varieties.csv', 'varieties', ['variety_id', 'variety_name', 'crop_type_id']),
        ('sensors.csv', 'sensors', ['sensor_id', 'sensor_type', 'sensor_status', 'maintenance_date']),
        ('farm_crops.csv', 'farm_crops', [
            'farm_crop_id', 'farm_id', 'crop_type_id', 'variety_id', 
            'production_tons', 'soil_type', 'irrigation_system', 
            'fertilizer_used', 'is_organic', 'technician_id'
        ]),
        ('sensor_readings.csv', 'sensor_readings', [
            'reading_id', 'sensor_id', 'farm_crop_id', 'reading_value', 'reading_datetime'
        ])
    ]
    
    # Execute load operations
    for csv_file, table_name, columns in load_operations:
        load_csv_to_table(connection, csv_file, table_name, columns)
    
    # Re-enable foreign key checks
    cursor.execute("SET FOREIGN_KEY_CHECKS = 1")
    
    # Verify data loading
    print("\nData Loading Summary:")
    print("-" * 30)
    
    verification_queries = [
        ("farms", "SELECT COUNT(*) FROM farms"),
        ("technicians", "SELECT COUNT(*) FROM technicians"),
        ("crop_types", "SELECT COUNT(*) FROM crop_types"),
        ("varieties", "SELECT COUNT(*) FROM varieties"),
        ("sensors", "SELECT COUNT(*) FROM sensors"),
        ("farm_crops", "SELECT COUNT(*) FROM farm_crops"),
        ("sensor_readings", "SELECT COUNT(*) FROM sensor_readings")
    ]
    
    for table_name, query in verification_queries:
        cursor.execute(query)
        count = cursor.fetchone()[0]
        print(f"{table_name}: {count} records")
    
    cursor.close()
    connection.close()
    
    print("\nData loading completed successfully!")
    print(f"Completed at: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")

if __name__ == "__main__":
    main()
