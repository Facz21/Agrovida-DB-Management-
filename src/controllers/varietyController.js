const Variety = require('../models/Variety');

class VarietyController {
    // GET /api/varieties - Get all varieties
    static async getAllVarieties(req, res) {
        try {
            const varieties = await Variety.findAll();
            res.json({
                success: true,
                data: varieties,
                count: varieties.length
            });
        } catch (error) {
            res.status(500).json({
                success: false,
                message: 'Error fetching varieties',
                error: error.message
            });
        }
    }

    // GET /api/varieties/:id - Get variety by ID
    static async getVarietyById(req, res) {
        try {
            const { id } = req.params;
            const variety = await Variety.findById(id);

            if (!variety) {
                return res.status(404).json({
                    success: false,
                    message: 'Variety not found'
                });
            }

            res.json({
                success: true,
                data: variety
            });
        } catch (error) {
            res.status(500).json({
                success: false,
                message: 'Error fetching variety',
                error: error.message
            });
        }
    }

    // GET /api/varieties/crop-type/:cropTypeId - Get varieties by crop type
    static async getVarietiesByCropType(req, res) {
        try {
            const { cropTypeId } = req.params;
            const varieties = await Variety.findByCropType(cropTypeId);

            res.json({
                success: true,
                data: varieties,
                count: varieties.length
            });
        } catch (error) {
            res.status(500).json({
                success: false,
                message: 'Error fetching varieties by crop type',
                error: error.message
            });
        }
    }

    // POST /api/varieties - Create new variety
    static async createVariety(req, res) {
        try {
            const { variety_name, crop_type_id } = req.body;

            // Validation
            if (!variety_name || !crop_type_id) {
                return res.status(400).json({
                    success: false,
                    message: 'Variety name and crop type ID are required'
                });
            }

            if (variety_name.trim().length < 2) {
                return res.status(400).json({
                    success: false,
                    message: 'Variety name must be at least 2 characters long'
                });
            }

            const variety = await Variety.create({
                variety_name: variety_name.trim(),
                crop_type_id: parseInt(crop_type_id)
            });

            res.status(201).json({
                success: true,
                message: 'Variety created successfully',
                data: variety
            });
        } catch (error) {
            res.status(400).json({
                success: false,
                message: 'Error creating variety',
                error: error.message
            });
        }
    }

    // PUT /api/varieties/:id - Update variety
    static async updateVariety(req, res) {
        try {
            const { id } = req.params;
            const { variety_name, crop_type_id } = req.body;

            // Validation
            if (!variety_name || !crop_type_id) {
                return res.status(400).json({
                    success: false,
                    message: 'Variety name and crop type ID are required'
                });
            }

            if (variety_name.trim().length < 2) {
                return res.status(400).json({
                    success: false,
                    message: 'Variety name must be at least 2 characters long'
                });
            }

            const updatedVariety = await Variety.update(id, {
                variety_name: variety_name.trim(),
                crop_type_id: parseInt(crop_type_id)
            });

            res.json({
                success: true,
                message: 'Variety updated successfully',
                data: updatedVariety
            });
        } catch (error) {
            if (error.message === 'Variety not found') {
                return res.status(404).json({
                    success: false,
                    message: error.message
                });
            }

            res.status(400).json({
                success: false,
                message: 'Error updating variety',
                error: error.message
            });
        }
    }

    // DELETE /api/varieties/:id - Delete variety
    static async deleteVariety(req, res) {
        try {
            const { id } = req.params;
            const deleted = await Variety.delete(id);

            if (!deleted) {
                return res.status(404).json({
                    success: false,
                    message: 'Variety not found'
                });
            }

            res.json({
                success: true,
                message: 'Variety deleted successfully'
            });
        } catch (error) {
            if (error.message === 'Variety not found') {
                return res.status(404).json({
                    success: false,
                    message: error.message
                });
            }

            res.status(400).json({
                success: false,
                message: 'Error deleting variety',
                error: error.message
            });
        }
    }

    // GET /api/crop-types - Get all crop types for dropdown
    static async getCropTypes(req, res) {
        try {
            const cropTypes = await Variety.getCropTypes();
            res.json({
                success: true,
                data: cropTypes
            });
        } catch (error) {
            res.status(500).json({
                success: false,
                message: 'Error fetching crop types',
                error: error.message
            });
        }
    }

    // GET /api/varieties/search?name=cacao&crop_type=4&page=1&limit=10
    static async searchVarieties(req, res) {
        try {
            const { 
                name = '', 
                crop_type = '', 
                page = 1, 
                limit = 10,
                sort_by = 'variety_name',
                sort_order = 'ASC'
            } = req.query;

            const offset = (parseInt(page) - 1) * parseInt(limit);
            
            const results = await Variety.searchVarieties({
                name: name.trim(),
                crop_type: crop_type ? parseInt(crop_type) : null,
                limit: parseInt(limit),
                offset: offset,
                sort_by,
                sort_order: sort_order.toUpperCase()
            });

            res.json({
                success: true,
                data: results.varieties,
                pagination: {
                    page: parseInt(page),
                    limit: parseInt(limit),
                    total: results.total,
                    pages: Math.ceil(results.total / parseInt(limit))
                }
            });
        } catch (error) {
            res.status(500).json({
                success: false,
                message: 'Error searching varieties',
                error: error.message
            });
        }
    }

    // GET /api/varieties/stats - Get variety statistics
    static async getVarietyStats(req, res) {
        try {
            const stats = await Variety.getStatistics();
            res.json({
                success: true,
                data: stats
            });
        } catch (error) {
            res.status(500).json({
                success: false,
                message: 'Error fetching variety statistics',
                error: error.message
            });
        }
    }

    // POST /api/varieties/bulk - Create multiple varieties
    static async createBulkVarieties(req, res) {
        try {
            const { varieties } = req.body;

            if (!Array.isArray(varieties) || varieties.length === 0) {
                return res.status(400).json({
                    success: false,
                    message: 'Varieties array is required and must not be empty'
                });
            }

            // Validate each variety
            for (let i = 0; i < varieties.length; i++) {
                const variety = varieties[i];
                if (!variety.variety_name || !variety.crop_type_id) {
                    return res.status(400).json({
                        success: false,
                        message: `Variety at index ${i}: variety_name and crop_type_id are required`
                    });
                }
            }

            const results = await Variety.createBulk(varieties);
            
            res.status(201).json({
                success: true,
                message: `${results.created} varieties created successfully`,
                data: {
                    created: results.created,
                    skipped: results.skipped,
                    errors: results.errors
                }
            });
        } catch (error) {
            res.status(400).json({
                success: false,
                message: 'Error creating bulk varieties',
                error: error.message
            });
        }
    }

    // PUT /api/varieties/bulk - Update multiple varieties
    static async updateBulkVarieties(req, res) {
        try {
            const { varieties } = req.body;

            if (!Array.isArray(varieties) || varieties.length === 0) {
                return res.status(400).json({
                    success: false,
                    message: 'Varieties array is required and must not be empty'
                });
            }

            const results = await Variety.updateBulk(varieties);
            
            res.json({
                success: true,
                message: `Bulk update completed`,
                data: {
                    updated: results.updated,
                    failed: results.failed,
                    errors: results.errors
                }
            });
        } catch (error) {
            res.status(400).json({
                success: false,
                message: 'Error updating bulk varieties',
                error: error.message
            });
        }
    }

    // DELETE /api/varieties/bulk - Delete multiple varieties
    static async deleteBulkVarieties(req, res) {
        try {
            const { ids } = req.body;

            if (!Array.isArray(ids) || ids.length === 0) {
                return res.status(400).json({
                    success: false,
                    message: 'IDs array is required and must not be empty'
                });
            }

            const results = await Variety.deleteBulk(ids);
            
            res.json({
                success: true,
                message: `${results.deleted} varieties deleted successfully`,
                data: {
                    deleted: results.deleted,
                    failed: results.failed,
                    errors: results.errors
                }
            });
        } catch (error) {
            res.status(400).json({
                success: false,
                message: 'Error deleting bulk varieties',
                error: error.message
            });
        }
    }
}

module.exports = VarietyController;
