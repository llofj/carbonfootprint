// backend/models/CarbonEmission.js
const pool = require('../config/db');

const CarbonEmission = {
  async create(userId, category, subCategory, amount, date) {
    const result = await pool.query(
      'INSERT INTO carbon_emissions (user_id, category, sub_category, amount, date) VALUES ($1, $2, $3, $4, $5) RETURNING *',
      [userId, category, subCategory, amount, date]
    );
    return result.rows[0];
  },

  async getByUserId(userId) {
    const result = await pool.query(
      'SELECT * FROM carbon_emissions WHERE user_id = $1 ORDER BY date DESC',
      [userId]
    );
    return result.rows;
  },

  async getByUserIdAndDate(userId, date) {
    const result = await pool.query(
      'SELECT * FROM carbon_emissions WHERE user_id = $1 AND date = $2',
      [userId, date]
    );
    return result.rows;
  },

  async getTotalByUserId(userId) {
    const result = await pool.query(
      'SELECT SUM(amount) as total FROM carbon_emissions WHERE user_id = $1',
      [userId]
    );
    return result.rows[0].total || 0;
  }
};

module.exports = CarbonEmission;