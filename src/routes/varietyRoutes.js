const express = require('express');
const router = express.Router();
const VarietyController = require('../controllers/varietyController');

// GET /api/varieties - Get all varieties
router.get('/', VarietyController.getAllVarieties);

// GET /api/varieties/search - Advanced search with filters and pagination
router.get('/search', VarietyController.searchVarieties);

// GET /api/varieties/stats - Get variety statistics
router.get('/stats', VarietyController.getVarietyStats);

// GET /api/varieties/:id - Get variety by ID
router.get('/:id', VarietyController.getVarietyById);

// GET /api/varieties/crop-type/:cropTypeId - Get varieties by crop type
router.get('/crop-type/:cropTypeId', VarietyController.getVarietiesByCropType);

// POST /api/varieties - Create new variety
router.post('/', VarietyController.createVariety);

// POST /api/varieties/bulk - Create multiple varieties
router.post('/bulk', VarietyController.createBulkVarieties);

// PUT /api/varieties/:id - Update variety
router.put('/:id', VarietyController.updateVariety);

// PUT /api/varieties/bulk - Update multiple varieties
router.put('/bulk', VarietyController.updateBulkVarieties);

// DELETE /api/varieties/:id - Delete variety
router.delete('/:id', VarietyController.deleteVariety);

// DELETE /api/varieties/bulk - Delete multiple varieties
router.delete('/bulk', VarietyController.deleteBulkVarieties);

module.exports = router;
