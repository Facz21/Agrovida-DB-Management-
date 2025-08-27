# AgroVida Database Management System

## Project Overview

A complete agricultural data management system that includes database normalization, REST API, web dashboard, and advanced data analysis. Built as a performance test applying the first three normal forms (1NF, 2NF, 3NF).

## Goals Achieved

- **Manual Normalization**: Applied 1NF, 2NF and 3NF to the original Excel file
- **Relational Model**: Designed normalized database structure
- **SQL Database**: Complete schema creation and implementation
- **Bulk Loading**: Scripts to import data from CSV files
- **Advanced CRUD System**: REST API with search, pagination, bulk operations
- **Web Dashboard**: Functional frontend for administration
- **Advanced Queries**: 18 complex queries for data analysis
- **Query Utils**: Command-line tools for database analysis

## Project Structure

```
/
├── Info y rubrica/             # Project documentation and requirements
│   ├── Enunciado Prueba de Desempeño - C3.1 BAQ.pdf
│   ├── Guía Prueba de Desempeño - M4 Bases de datos.pdf
│   ├── Rubrica DLRB_BQC3.1AM_ Módulo 4 - Prueba de desempeno.pdf
│   └── agrovida_español.xlsx   # Original Excel file
├── database/                   # Database files and data
│   ├── data/                   # Normalized CSV files
│   │   ├── farms.csv
│   │   ├── technicians.csv
│   │   ├── crop_types.csv
│   │   ├── varieties.csv
│   │   ├── sensors.csv
│   │   ├── farm_crops.csv
│   │   ├── sensor_readings.csv
│   │   └── agrovida_español.csv
│   ├── migrations/             # Database migration files
│   ├── advanced_queries.sql    # Advanced analysis queries
│   ├── agrovida_normalized_schema.sql
│   └── database_schema_english.sql
├── docs/                       # Documentation
│   ├── README.md              # This file
│   └── README_normalization.md # Normalization process details
├── src/                        # Source code
│   ├── config/
│   │   └── database.js        # Database configuration
│   ├── controllers/
│   │   └── varietyController.js # Advanced CRUD controller
│   ├── models/
│   │   └── Variety.js         # Data model with advanced methods
│   ├── routes/
│   │   └── varietyRoutes.js   # API routes with new endpoints
│   └── utils/
│       └── query_utils.js     # Command-line query utilities
├── scripts/                    # Utility scripts
│   ├── load_csv_data.py       # Python data loading script
│   └── setup.js               # Environment validation script
├── public/                     # Frontend files
│   ├── index.html             # Web dashboard
│   └── app.js                 # Frontend JavaScript
├── server.js                  # Express server
├── package.json               # Node.js dependencies
├── .env                       # Environment variables
└── node_modules/              # Dependencies
```

## Database Model

### Main Tables

1. **farms** - Farm information
2. **technicians** - Responsible technicians
3. **crop_types** - Crop types
4. **varieties** - Crop varieties (weak entity)
5. **sensors** - Monitoring sensors
6. **farm_crops** - Farm-crop relationship with details
7. **sensor_readings** - Sensor readings

### Key Relationships

- `varieties` depends on `crop_types` (weak entity)
- `farm_crops` connects farms with crops and technicians
- `sensor_readings` links sensors with specific crops

## Installation and Setup

### 1. Prerequisites

```bash
# Node.js and npm
node --version  # v14+
npm --version   # v6+

# MySQL Server
mysql --version # v8.0+

# Python (optional, for data loading)
python3 --version # v3.8+
```

### 2. Install Dependencies

```bash
# Install Node.js dependencies
npm install

# Install Python dependencies (for data loading)
pip install python-dotenv --break-system-packages
pip install mysql-connector-python --break-system-packages
```

### 3. Database Configuration

**Default Credentials (configured in .env):**

```bash
DB_HOST=localhost
DB_USER=agrovida_user
DB_PASSWORD=agrovida_password
DB_NAME=agrovida_database
DB_PORT=3306
AGROVIDA_PORT=8080
```

**Create MySQL User and Database:**

```sql
-- Connect to MySQL as root
mysql -u root -p

-- Create database and user
CREATE DATABASE agrovida_database;
CREATE USER 'agrovida_user'@'localhost' IDENTIFIED BY 'agrovida_password';
GRANT ALL PRIVILEGES ON agrovida_database.* TO 'agrovida_user'@'localhost';
FLUSH PRIVILEGES;
EXIT;
```

### 4. Database Schema Setup

```bash
# Create tables using the schema
mysql -u agrovida_user -p agrovida_database < database/agrovida_normalized_schema.sql
```

### 5. Load Data

**Option A: Python Script (Recommended)**

```bash
python3 scripts/load_csv_data.py
```

**Option B: SQL Script**

```bash
mysql -u agrovida_user -p agrovida_database --local-infile=1 < database/load_data.sql
```

### 6. Validate Setup

```bash
# Run environment validation
node scripts/setup.js
```

### 7. Run the Application

```bash
# Start the server
npm start

# Or with nodemon for development
npm run dev
```

**Application URLs:**

- **Web Dashboard**: `http://localhost:8080`
- **API Base**: `http://localhost:8080/api`
- **Health Check**: `http://localhost:8080/api/health`

## Features

### Web Dashboard

- **URL**: `http://localhost:8080`
- Complete crop variety management
- Responsive interface with Bootstrap
- Real-time data validation
- Dynamic search and filtering

### REST API

**Base URL**: `http://localhost:8080/api`

#### Core CRUD Endpoints

| Method | Endpoint                             | Description                |
| ------ | ------------------------------------ | -------------------------- |
| GET    | `/varieties`                       | Get all varieties          |
| GET    | `/varieties/:id`                   | Get variety by ID          |
| GET    | `/varieties/crop-type/:cropTypeId` | Get varieties by crop type |
| POST   | `/varieties`                       | Create new variety         |
| PUT    | `/varieties/:id`                   | Update variety             |
| DELETE | `/varieties/:id`                   | Delete variety             |

#### Advanced Search & Analytics

| Method | Endpoint              | Description                                 |
| ------ | --------------------- | ------------------------------------------- |
| GET    | `/varieties/search` | Advanced search with filters and pagination |
| GET    | `/varieties/stats`  | Get variety statistics                      |

#### Bulk Operations

| Method | Endpoint            | Description               |
| ------ | ------------------- | ------------------------- |
| POST   | `/varieties/bulk` | Create multiple varieties |
| PUT    | `/varieties/bulk` | Update multiple varieties |
| DELETE | `/varieties/bulk` | Delete multiple varieties |

#### Helper Endpoints

| Method | Endpoint        | Description    |
| ------ | --------------- | -------------- |
| GET    | `/crop-types` | Get crop types |
| GET    | `/health`     | API status     |

### API Usage Examples

#### Basic CRUD Operations

```bash
# Get all varieties
curl http://localhost:8080/api/varieties

# Get variety by ID
curl http://localhost:8080/api/varieties/6

# Get varieties by crop type (Cocoa = 4)
curl http://localhost:8080/api/varieties/crop-type/4

# Create new variety
curl -X POST http://localhost:8080/api/varieties \
  -H "Content-Type: application/json" \
  -d '{"variety_name": "Premium Cacao", "crop_type_id": 4}'

# Update variety
curl -X PUT http://localhost:8080/api/varieties/6 \
  -H "Content-Type: application/json" \
  -d '{"variety_name": "Deluxe Premium", "crop_type_id": 4}'

# Delete variety
curl -X DELETE http://localhost:8080/api/varieties/6
```

#### Advanced Search

```bash
# Search varieties by name with pagination
curl "http://localhost:8080/api/varieties/search?name=cacao&page=1&limit=5"

# Search by crop type with sorting
curl "http://localhost:8080/api/varieties/search?crop_type=4&sort_by=variety_name&sort_order=DESC"

# Combined search with filters
curl "http://localhost:8080/api/varieties/search?name=Del&crop_type=4&page=1&limit=10"
```

#### Bulk Operations

```bash
# Create multiple varieties
curl -X POST http://localhost:8080/api/varieties/bulk \
  -H "Content-Type: application/json" \
  -d '{
    "varieties": [
      {"variety_name": "Trinitario", "crop_type_id": 4},
      {"variety_name": "Forastero", "crop_type_id": 4}
    ]
  }'

# Update multiple varieties
curl -X PUT http://localhost:8080/api/varieties/bulk \
  -H "Content-Type: application/json" \
  -d '{
    "varieties": [
      {"variety_id": 6, "variety_name": "Deluxe Premium", "crop_type_id": 4},
      {"variety_id": 7, "variety_name": "Trinitario Premium", "crop_type_id": 4}
    ]
  }'

# Delete multiple varieties
curl -X DELETE http://localhost:8080/api/varieties/bulk \
  -H "Content-Type: application/json" \
  -d '{"ids": [7, 8, 9]}'
```

#### Statistics

```bash
# Get variety statistics
curl http://localhost:8080/api/varieties/stats

# Get crop types
curl http://localhost:8080/api/crop-types

# Check API health
curl http://localhost:8080/api/health
```

## Query Utils - Command Line Analysis

The system includes a powerful command-line query utility with **18 predefined queries** for advanced data analysis.

### Available Queries

#### Basic Data Queries

- `farms` - All farms information
- `varieties` - All varieties with crop types
- `sensors` - Sensor status and information
- `summary` - System overview statistics

#### Production Analysis

- `production_by_farm` - Production totals by farm
- `production_by_region` - Regional production analysis
- `crops_by_type` - Production by crop type
- `farm_details` - Detailed farm and crop information

#### Advanced Analytics

- `variety_stats` - Variety distribution statistics
- `variety_production` - Production analysis by variety
- `top_varieties` - Top 5 performing varieties
- `organic_analysis` - Organic vs conventional comparison
- `regional_varieties` - Variety distribution by region
- `region_diversity` - Crop diversity by region
- `cacao_analysis` - Specific cacao variety analysis
- `underutilized_varieties` - Varieties with low usage
- `sensor_status` - Sensor monitoring status

### Usage Examples

```bash
# List all available queries
node src/utils/query_utils.js

# Run specific queries
node src/utils/query_utils.js summary
node src/utils/query_utils.js variety_stats
node src/utils/query_utils.js top_varieties
node src/utils/query_utils.js cacao_analysis
node src/utils/query_utils.js region_diversity

# Get help
node src/utils/query_utils.js help
```

### Sample Output

```bash
# Example: Variety Statistics
node src/utils/query_utils.js variety_stats
┌─────────┬────────────────┬───────────────┬────────────┐
│ (index) │ crop_type_name │ variety_count │ percentage │
├─────────┼────────────────┼───────────────┼────────────┤
│ 0       │ 'Banana'       │ 2             │ '33.33'    │
│ 1       │ 'Corn'         │ 2             │ '33.33'    │
│ 2       │ 'Cocoa'        │ 1             │ '16.67'    │
│ 3       │ 'Coffee'       │ 1             │ '16.67'    │
└─────────┴────────────────┴───────────────┴────────────┘
```

## Advanced SQL Queries

The `database/advanced_queries.sql` file includes additional complex queries for direct SQL execution:

### Run SQL Queries Directly

```bash
mysql -u agrovida_user -p agrovida_database < database/advanced_queries.sql
```

## Technologies Used

### Backend

- **Node.js** - JavaScript runtime
- **Express.js** - Web framework
- **MySQL2** - Database driver
- **dotenv** - Environment variable management

### Frontend

- **HTML5/CSS3** - Structure and styles
- **Bootstrap 5** - CSS framework
- **JavaScript ES6+** - Client-side logic
- **Font Awesome** - Icons

### Database

- **MySQL 8.0** - Database management system
- **3NF Normalization** - Optimized design

### Tools

- **Python 3** - Data loading scripts
- **CSV** - Data exchange format

## Normalization Process

### Original Table

- **Problem**: 16 columns with multiple redundancies
- **Inconsistencies**: Same farms in different regions
- **Dependencies**: Multiple mixed functional dependencies

### Normal Forms Application

**1NF (First Normal Form)**

- Elimination of repeating groups
- Each cell contains atomic values
- Primary key identification

**2NF (Second Normal Form)**

- Elimination of partial dependencies
- Separation of independent entities
- Creation of tables: farms, technicians, crop_types

**3NF (Third Normal Form)**

- Elimination of transitive dependencies
- Separation of varieties as weak entity
- Optimization of table relationships

### Benefits Achieved

- **Redundancy elimination**: 95% reduction in data duplication
- **Referential integrity**: Consistency guaranteed by foreign keys
- **Scalability**: Structure prepared for growth
- **Maintainability**: Centralized updates

## Implemented Validations

### Backend Validations

- Required fields mandatory
- Minimum name length (2 characters)
- Foreign key existence
- Duplicate prevention by crop type
- Dependency verification before deletion

### Frontend Validations

- Native HTML5 validation
- Custom JavaScript validation
- Descriptive error messages
- Deletion confirmation
- Data input sanitization

## Security Considerations

- **SQL Injection Prevention**: Use of prepared statements
- **Input Validation**: Sanitization in frontend and backend
- **HTML Escaping**: XSS prevention in frontend
- **Environment Variables**: Protected credentials
- **Error Handling**: No sensitive information exposure

## Project Metrics

- **Tables created**: 7
- **Relationships defined**: 6 foreign keys
- **Test records**: 67 total
- **API endpoints**: 7
- **Advanced queries**: 10
- **Lines of code**: ~2,500
- **Generated files**: 20+

## Troubleshooting

### MySQL Connection Error

```bash
# Check if MySQL is running
sudo systemctl status mysql

# Verify credentials in .env
cat .env
```

### Data Loading Error

```bash
# Check local file permissions
mysql -u root -p -e "SHOW VARIABLES LIKE 'local_infile';"

# Enable local_infile if needed
mysql -u root -p -e "SET GLOBAL local_infile = 1;"
```

### Port in Use

```bash
# Change port in .env
echo "AGROVIDA_PORT=8081" >> .env

# Or kill existing process
lsof -ti:8080 | xargs kill -9
```

## Additional Documentation

- **ER Model**: Create diagram in draw.io using `database_schema_english.sql`
- **API Documentation**: Endpoints documented in code
- **Database Schema**: Detailed comments in SQL files

## License

Free use.

---

**Developed by**: Andrés Cortés
**Date**: August 2025
**Version**: 1.0.0
