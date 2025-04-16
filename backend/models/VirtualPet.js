// backend/models/VirtualPet.js
const pool = require('../config/db');

// 健康状态常量
const HEALTH_STATUS = {
  HEALTHY: '健康',
  GOOD: '良好',
  POOR: '较差',
  MALNOURISHED: '营养不良'
};

// 健康状态等级（从高到低）
const HEALTH_LEVELS = [
  HEALTH_STATUS.HEALTHY,
  HEALTH_STATUS.GOOD,
  HEALTH_STATUS.POOR,
  HEALTH_STATUS.MALNOURISHED
];

const VirtualPet = {
  async create(userId, name = '奶龙', level = 1, health = '健康', coins = 0, experience = 0) {
    const result = await pool.query(
      'INSERT INTO virtual_pets (user_id, name, level, health, coins, experience) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *',
      [userId, name, level, health, coins, experience]
    );
    return result.rows[0];
  },

  async getByUserId(userId) {
    const result = await pool.query('SELECT * FROM virtual_pets WHERE user_id = $1', [userId]);
    return result.rows[0];
  },

  async update(petId, name, level, health, coins, experience) {
    const result = await pool.query(
      'UPDATE virtual_pets SET name = $1, level = $2, health = $3, coins = $4, experience = $5, updated_at = NOW() WHERE id = $6 RETURNING *',
      [name, level, health, coins, experience, petId]
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
  },

  async addExperience(userId, experienceToAdd) {
    // 获取当前宠物信息
    const pet = await this.getByUserId(userId);
    if (!pet) return null;

    // 计算新的经验值
    const newExperience = pet.experience + experienceToAdd;
    
    // 计算新的等级（每100经验值升一级）
    const newLevel = Math.floor(newExperience / 100) + 1;

    // 更新宠物信息
    const result = await pool.query(
      'UPDATE virtual_pets SET experience = $1, level = $2, updated_at = NOW() WHERE user_id = $3 RETURNING *',
      [newExperience, newLevel, userId]
    );
    return result.rows[0];
  },

  async getExperienceToNextLevel(userId) {
    const pet = await this.getByUserId(userId);
    if (!pet) return null;

    const currentLevelExperience = (pet.level - 1) * 100;
    const nextLevelExperience = pet.level * 100;
    return nextLevelExperience - pet.experience;
  },

  async updateHealth(userId, newHealth) {
    if (!HEALTH_LEVELS.includes(newHealth)) {
      throw new Error('无效的健康状态');
    }
    
    const result = await pool.query(
      'UPDATE virtual_pets SET health = $1 WHERE user_id = $2 RETURNING *',
      [newHealth, userId]
    );
    
    return result.rows[0];
  },

  // 降低健康状态
  async decreaseHealth(userId) {
    const pet = await this.getByUserId(userId);
    if (!pet) {
      throw new Error('宠物不存在');
    }
    
    const currentIndex = HEALTH_LEVELS.indexOf(pet.health);
    if (currentIndex < HEALTH_LEVELS.length - 1) {
      const newHealth = HEALTH_LEVELS[currentIndex + 1];
      return await this.updateHealth(userId, newHealth);
    } else if (currentIndex === HEALTH_LEVELS.length - 1) {
      // 如果已经是营养不良状态，也更新一下数据库以保持一致性
      return await this.updateHealth(userId, HEALTH_LEVELS[currentIndex]);
    }
    
    return pet;
  },

  // 提升健康状态
  async increaseHealth(userId) {
    const pet = await this.getByUserId(userId);
    if (!pet) {
      throw new Error('宠物不存在');
    }
    
    const currentIndex = HEALTH_LEVELS.indexOf(pet.health);
    if (currentIndex > 0) {
      const newHealth = HEALTH_LEVELS[currentIndex - 1];
      return await this.updateHealth(userId, newHealth);
    }
    
    return pet;
  }
};

module.exports = {
  VirtualPet,
  HEALTH_STATUS,
  HEALTH_LEVELS
};