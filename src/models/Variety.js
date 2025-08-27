const db = require('../config/database');

class Variety {
    constructor(variety_id, variety_name, crop_type_id) {
        this.variety_id = variety_id;
        this.variety_name = variety_name;
        this.crop_type_id = crop_type_id;
    }

    // Create a new variety
    static async create(varietyData) {
        const { variety_name, crop_type_id } = varietyData;
        
        // Validate required fields
        if (!variety_name || !crop_type_id) {
            throw new Error('Variety name and crop type ID are required');
        }

        // Check if crop type exists
        if (!(await this.cropTypeExists(crop_type_id))) {
            throw new Error('Crop type does not exist');
        }

        // Check for duplicate variety name within the same crop type
        const [existing] = await db.execute(
            'SELECT variety_id FROM varieties WHERE variety_name = ? AND crop_type_id = ?',
            [variety_name, crop_type_id]
        );

        if (existing.length > 0) {
            throw new Error('Variety already exists for this crop type');
        }

        const [result] = await db.execute(
            'INSERT INTO varieties (variety_name, crop_type_id) VALUES (?, ?)',
            [variety_name, crop_type_id]
        );

        return new Variety(result.insertId, variety_name, crop_type_id);
    }

    // Get all varieties with crop type information
    static async findAll() {
        const [rows] = await db.execute(`
            SELECT v.variety_id, v.variety_name, v.crop_type_id, ct.crop_type_name
            FROM varieties v
            JOIN crop_types ct ON v.crop_type_id = ct.crop_type_id
            ORDER BY ct.crop_type_name, v.variety_name
        `);
        return rows;
    }

    // Get variety by ID
    static async findById(variety_id) {
        const [rows] = await db.execute(`
            SELECT v.variety_id, v.variety_name, v.crop_type_id, ct.crop_type_name
            FROM varieties v
            JOIN crop_types ct ON v.crop_type_id = ct.crop_type_id
            WHERE v.variety_id = ?
        `, [variety_id]);

        if (rows.length === 0) {
            return null;
        }

        return rows[0];
    }

    // Get varieties by crop type
    static async findByCropType(crop_type_id) {
        const [rows] = await db.execute(`
            SELECT v.variety_id, v.variety_name, v.crop_type_id, ct.crop_type_name
            FROM varieties v
            JOIN crop_types ct ON v.crop_type_id = ct.crop_type_id
            WHERE v.crop_type_id = ?
            ORDER BY v.variety_name
        `, [crop_type_id]);
        return rows;
    }

    // Update variety
    static async update(variety_id, updateData) {
        const { variety_name, crop_type_id } = updateData;

        // Validate required fields
        if (!variety_name || !crop_type_id) {
            throw new Error('Variety name and crop type ID are required');
        }

        // Check if variety exists
        const existing = await this.findById(variety_id);
        if (!existing) {
            throw new Error('Variety not found');
        }

        // Check if crop type exists
        if (!(await this.cropTypeExists(crop_type_id))) {
            throw new Error('Crop type does not exist');
        }

        // Check for duplicate variety name within the same crop type (excluding current variety)
        const [duplicates] = await db.execute(
            'SELECT variety_id FROM varieties WHERE variety_name = ? AND crop_type_id = ? AND variety_id != ?',
            [variety_name, crop_type_id, variety_id]
        );

        if (duplicates.length > 0) {
            throw new Error('Variety already exists for this crop type');
        }

        await db.execute(
            'UPDATE varieties SET variety_name = ?, crop_type_id = ? WHERE variety_id = ?',
            [variety_name, crop_type_id, variety_id]
        );

        return await this.findById(variety_id);
    }

    // Delete variety
    static async delete(variety_id) {
        // Check if variety exists
        const existing = await this.findById(variety_id);
        if (!existing) {
            throw new Error('Variety not found');
        }

        // Check if variety is being used in farm_crops
        const [farmCrops] = await db.execute(
            'SELECT farm_crop_id FROM farm_crops WHERE variety_id = ?',
            [variety_id]
        );

        if (farmCrops.length > 0) {
            throw new Error('Cannot delete variety: it is being used in farm crops');
        }

        const [result] = await db.execute(
            'DELETE FROM varieties WHERE variety_id = ?',
            [variety_id]
        );

        return result.affectedRows > 0;
    }

    // Helper method to check if crop type exists
    static async cropTypeExists(crop_type_id) {
        const [rows] = await db.execute(
            'SELECT 1 FROM crop_types WHERE crop_type_id = ?',
            [crop_type_id]
        );
        return rows.length > 0;
    }

    // Get all crop types for dropdown
    static async getCropTypes() {
        const [rows] = await db.execute(
            'SELECT crop_type_id, crop_type_name FROM crop_types ORDER BY crop_type_name'
        );
        return rows;
    }

    // Advanced search with filters and pagination
    static async searchVarieties(options) {
        const { name, crop_type, limit, offset, sort_by, sort_order } = options;
        
        let whereClause = 'WHERE 1=1';
        const params = [];

        if (name) {
            whereClause += ' AND v.variety_name LIKE ?';
            params.push(`%${name}%`);
        }

        if (crop_type) {
            whereClause += ' AND v.crop_type_id = ?';
            params.push(crop_type);
        }

        // Validate sort_by to prevent SQL injection
        const validSortFields = ['variety_name', 'crop_type_name', 'variety_id', 'crop_type_id'];
        const sortField = validSortFields.includes(sort_by) ? sort_by : 'variety_name';
        const sortDirection = ['ASC', 'DESC'].includes(sort_order) ? sort_order : 'ASC';

        // Get total count
        const [countResult] = await db.execute(`
            SELECT COUNT(*) as total
            FROM varieties v
            JOIN crop_types ct ON v.crop_type_id = ct.crop_type_id
            ${whereClause}
        `, params);

        // Get paginated results
        const orderByClause = sortField === 'crop_type_name' ? `ct.${sortField}` : `v.${sortField}`;
        const [rows] = await db.execute(`
            SELECT v.variety_id, v.variety_name, v.crop_type_id, ct.crop_type_name
            FROM varieties v
            JOIN crop_types ct ON v.crop_type_id = ct.crop_type_id
            ${whereClause}
            ORDER BY ${orderByClause} ${sortDirection}
            LIMIT ? OFFSET ?
        `, [...params, limit, offset]);

        return {
            varieties: rows,
            total: countResult[0].total
        };
    }

    // Get variety statistics
    static async getStatistics() {
        const [stats] = await db.execute(`
            SELECT 
                COUNT(*) as total_varieties,
                COUNT(DISTINCT v.crop_type_id) as crop_types_with_varieties,
                ct.crop_type_name,
                COUNT(v.variety_id) as variety_count
            FROM varieties v
            JOIN crop_types ct ON v.crop_type_id = ct.crop_type_id
            GROUP BY ct.crop_type_id, ct.crop_type_name
            ORDER BY variety_count DESC
        `);

        const [totalStats] = await db.execute(`
            SELECT 
                COUNT(*) as total_varieties,
                COUNT(DISTINCT crop_type_id) as total_crop_types,
                AVG(variety_count) as avg_varieties_per_crop
            FROM (
                SELECT crop_type_id, COUNT(*) as variety_count
                FROM varieties
                GROUP BY crop_type_id
            ) as crop_stats
        `);

        return {
            overview: totalStats[0],
            by_crop_type: stats
        };
    }

    // Create multiple varieties at once
    static async createBulk(varieties) {
        const results = {
            created: 0,
            skipped: 0,
            errors: []
        };

        for (const varietyData of varieties) {
            try {
                await this.create(varietyData);
                results.created++;
            } catch (error) {
                results.skipped++;
                results.errors.push({
                    variety: varietyData,
                    error: error.message
                });
            }
        }

        return results;
    }

    // Update multiple varieties at once
    static async updateBulk(varieties) {
        const results = {
            updated: 0,
            failed: 0,
            errors: []
        };

        for (const varietyData of varieties) {
            try {
                if (!varietyData.variety_id) {
                    throw new Error('variety_id is required for updates');
                }
                await this.update(varietyData.variety_id, varietyData);
                results.updated++;
            } catch (error) {
                results.failed++;
                results.errors.push({
                    variety: varietyData,
                    error: error.message
                });
            }
        }

        return results;
    }

    // Delete multiple varieties at once
    static async deleteBulk(ids) {
        const results = {
            deleted: 0,
            failed: 0,
            errors: []
        };

        for (const id of ids) {
            try {
                const deleted = await this.delete(id);
                if (deleted) {
                    results.deleted++;
                } else {
                    results.failed++;
                    results.errors.push({
                        id: id,
                        error: 'Failed to delete variety'
                    });
                }
            } catch (error) {
                results.failed++;
                results.errors.push({
                    id: id,
                    error: error.message
                });
            }
        }

        return results;
    }
}

module.exports = Variety;
