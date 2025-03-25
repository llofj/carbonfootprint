// backend/models/VirtualPet.js
const pool = require('../config/db');

const VirtualPet = {
  async create(userId, name = '奶龙', level = 1, health = '健康', coins = 0) {
    const result = await pool.query(
      'INSERT INTO virtual_pets (user_id, name, level, health, coins) VALUES ($1, $2, $3, $4, $5) RETURNING *',
      [userId, name, level, health, coins]
    );
    return result.rows[0];
  },

  async getByUserId(userId) {
    const result = await pool.query('SELECT * FROM virtual_pets WHERE user_id = $1', [userId]);
    return result.rows[0];
  },

  async update(petId, name, level, health, coins) {
    const result = await pool.query(
      'UPDATE virtual_pets SET name = $1, level = $2, health = $3, coins = $4, updated_at = NOW() WHERE id = $5 RETURNING *',
      [name, level, health, coins, petId]
    );
    return result.rows[0];
  },

  async updateCoins(userId, coins) {
    const result = await pool.query(
      'UPDATE virtual_pets SET coins = coins + $1, updated_at = NOW() WHERE user_id = $2 RETURNING *',
      [coins, userId]
    );
    return result.rows[0];
  },

  async updateLevel(userId, level) {
    const result = await pool.query(
      'UPDATE virtual_pets SET level = $1, updated_at = NOW() WHERE user_id = $2 RETURNING *',
      [level, userId]
    );
    return result.rows[0];
  }
};

module.exports = VirtualPet;