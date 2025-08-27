/**
 * AgroVida Agricultural Data Management System - Main Server
 * 
 * This is the main Express.js server that handles:
 * - REST API endpoints for variety management
 * - Static file serving for the web dashboard
 * - Database connection management
 * - CORS and middleware configuration
 * 
 * @author Andrés Cortés
 * @version 1.0.0
 */

const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const path = require('path');
require('dotenv').config();

// Import route handlers and controllers
const varietyRoutes = require('./src/routes/varietyRoutes');
const VarietyController = require('./src/controllers/varietyController');

// Initialize Express application
const app = express();
const PORT = process.env.AGROVIDA_PORT || 8080;

// Middleware Configuration
app.use(cors()); // Enable Cross-Origin Resource Sharing
app.use(bodyParser.json()); // Parse JSON request bodies
app.use(bodyParser.urlencoded({ extended: true })); // Parse URL-encoded bodies
app.use(express.static('public')); // Serve static files from public directory

// API Route Configuration
app.use('/api/varieties', varietyRoutes); // Variety CRUD operations
app.get('/api/crop-types', VarietyController.getCropTypes); // Get crop types for dropdowns

// Dashboard Route - Serve main web interface
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Health Check Endpoint - Monitor API status
app.get('/api/health', (req, res) => {
    res.json({
        success: true,
        message: 'AgroVida API is running',
        timestamp: new Date().toISOString()
    });
});

// Global Error Handler Middleware
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({
        success: false,
        message: 'Something went wrong!',
        error: process.env.NODE_ENV === 'development' ? err.message : 'Internal server error'
    });
});

// 404 Route Handler - Handle undefined routes
app.use('*', (req, res) => {
    res.status(404).json({
        success: false,
        message: 'Route not found'
    });
});

// Start Server
app.listen(PORT, () => {
    console.log(`🚀 AgroVida API Server running on port ${PORT}`);
    console.log(`📊 Dashboard: http://localhost:${PORT}`);
    console.log(`🔗 API Base URL: http://localhost:${PORT}/api`);
});
