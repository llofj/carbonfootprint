// backend/models/Achievement.js
const pool = require('../config/db');

const Achievement = {
  // 获取所有成就类型定义
  async getAllAchievementTypes() {
    return [
      {
        id: 'green_commuter',
        name: '绿色通勤者',
        description: '累计步行减排超过5kg CO2',
        condition: 'carbon_reduction >= 5',
        icon: 'fa-walking'
      },
      {
        id: 'carbon_saver',
        name: '碳排放节约者',
        description: '单日碳排放量减少10kg',
        condition: 'daily_reduction >= 10',
        icon: 'fa-leaf'
      },
      {
        id: 'pet_lover',
        name: '宠物爱好者',
        description: '宠物等级达到5级',
        condition: 'pet_level >= 5',
        icon: 'fa-paw'
      },
      {
        id: 'eco_warrior',
        name: '生态战士',
        description: '累计减排超过50kg CO2',
        condition: 'carbon_reduction >= 50',
        icon: 'fa-shield-alt'
      },
      {
        id: 'stepping_master',
        name: '步数大师',
        description: '单日步数超过20000步',
        condition: 'daily_steps >= 20000',
        icon: 'fa-shoe-prints'
      },
      {
        id: 'diet_hero',
        name: '饮食英雄',
        description: '通过减少肉类消费减排10kg CO2',
        condition: 'food_reduction >= 10',
        icon: 'fa-utensils'
      }
    ];
  },

  // 获取用户所有已解锁的成就
  async getUserAchievements(userId) {
    const result = await pool.query(
      'SELECT * FROM achievements WHERE user_id = $1 ORDER BY date DESC',
      [userId]
    );
    return result.rows;
  },

  // 添加新的成就
  async addAchievement(userId, achievementId, achievementName, date = new Date()) {
    try {
      const result = await pool.query(
        'INSERT INTO achievements (user_id, achievement_id, achievement_name, date) VALUES ($1, $2, $3, $4) RETURNING *',
        [userId, achievementId, achievementName, date]
      );
      return result.rows[0];
    } catch (error) {
      console.error('Error adding achievement:', error);
      throw error;
    }
  },

  // 检查用户是否已获得特定成就
  async hasAchievement(userId, achievementId) {
    const result = await pool.query(
      'SELECT * FROM achievements WHERE user_id = $1 AND achievement_id = $2',
      [userId, achievementId]
    );
    return result.rows.length > 0;
  },

  // 获取用户的碳减排总量
  async getUserCarbonReduction(userId) {
    // 从步行记录中获取减排量
    const stepResult = await pool.query(
      'SELECT COALESCE(SUM(carbon_reduction), 0) AS total FROM step_records WHERE user_id = $1',
      [userId]
    );
    
    // 从碳排放记录中获取负值(减排)
    const emissionResult = await pool.query(
      'SELECT COALESCE(SUM(amount), 0) AS total FROM carbon_emissions WHERE user_id = $1 AND amount < 0',
      [userId]
    );
    
    const stepReduction = parseFloat(stepResult.rows[0].total) || 0;
    const emissionReduction = Math.abs(parseFloat(emissionResult.rows[0].total) || 0);
    
    return stepReduction + emissionReduction;
  },

  // 检查用户是否达成了特定成就的条件
  async checkAchievementEligibility(userId, achievementType) {
    let result;
    
    switch (achievementType.id) {
      case 'green_commuter':
        // 检查累计步行减排
        result = await pool.query(
          'SELECT SUM(carbon_reduction) AS total FROM step_records WHERE user_id = $1',
          [userId]
        );
        return (result.rows[0].total || 0) >= 5;

      case 'carbon_saver':
        // 检查单日减排
        result = await pool.query(
          'SELECT MAX(total_reduction) AS max_reduction FROM (SELECT date, SUM(carbon_reduction) AS total_reduction FROM step_records WHERE user_id = $1 GROUP BY date) AS daily_reductions',
          [userId]
        );
        return (result.rows[0].max_reduction || 0) >= 10;

      case 'pet_lover':
        // 检查宠物等级
        result = await pool.query(
          'SELECT level FROM virtual_pets WHERE user_id = $1',
          [userId]
        );
        return result.rows.length > 0 && result.rows[0].level >= 5;

      case 'eco_warrior':
        // 检查累计总减排
        result = await pool.query(
          'SELECT SUM(carbon_reduction) AS total FROM step_records WHERE user_id = $1',
          [userId]
        );
        return (result.rows[0].total || 0) >= 50;

      case 'stepping_master':
        // 检查单日最高步数
        result = await pool.query(
          'SELECT MAX(steps) AS max_steps FROM step_records WHERE user_id = $1',
          [userId]
        );
        return (result.rows[0].max_steps || 0) >= 20000;

      case 'diet_hero':
        // 检查食物减排
        result = await pool.query(
          'SELECT SUM(amount) AS total_reduction FROM carbon_emissions WHERE user_id = $1 AND category = \'食\' AND amount < 0',
          [userId]
        );
        return Math.abs(result.rows[0].total_reduction || 0) >= 10;

      default:
        return false;
    }
  }
};

module.exports = Achievement;