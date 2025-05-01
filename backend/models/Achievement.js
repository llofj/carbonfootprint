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
    try {
      // 直接从leaderboard表获取carbon_reduction字段
      const result = await pool.query(
        'SELECT carbon_reduction FROM leaderboard WHERE user_id = $1',
        [userId]
      );
      
      // 如果在leaderboard表中找到了用户记录
      if (result.rows.length > 0) {
        return parseFloat(result.rows[0].carbon_reduction) || 0;
      }
      
      // 如果用户在leaderboard表中没有记录，则返回0
      // 下次保存减碳记录时会自动创建leaderboard记录
      console.log(`用户${userId}在leaderboard表中没有记录，返回0`);
      return 0;
    } catch (error) {
      console.error('获取用户减碳总量失败:', error);
      return 0; // 发生错误时返回0
    }
  },

  // 检查用户是否达成了特定成就的条件
  async checkAchievementEligibility(userId, achievementType) {
    let result;
    
    switch (achievementType.id) {
      case 'green_commuter':
        // 检查总减碳量是否达到5kg（从leaderboard表获取）
        result = await pool.query(
          'SELECT carbon_reduction FROM leaderboard WHERE user_id = $1',
          [userId]
        );
        return result.rows.length > 0 && (parseFloat(result.rows[0].carbon_reduction) || 0) >= 5;

      case 'carbon_saver':
        // 检查总减碳量是否达到10kg
        result = await pool.query(
          'SELECT carbon_reduction FROM leaderboard WHERE user_id = $1',
          [userId]
        );
        return result.rows.length > 0 && (parseFloat(result.rows[0].carbon_reduction) || 0) >= 10;

      case 'pet_lover':
        // 检查宠物等级
        result = await pool.query(
          'SELECT level FROM virtual_pets WHERE user_id = $1',
          [userId]
        );
        return result.rows.length > 0 && result.rows[0].level >= 5;

      case 'eco_warrior':
        // 检查总减碳量是否达到50kg（从leaderboard表获取）
        result = await pool.query(
          'SELECT carbon_reduction FROM leaderboard WHERE user_id = $1',
          [userId]
        );
        return result.rows.length > 0 && (parseFloat(result.rows[0].carbon_reduction) || 0) >= 50;

      case 'stepping_master':
        // 检查单日最高步数，从step_records表中获取最大步数记录
        result = await pool.query(
          'SELECT MAX(steps) AS max_steps FROM step_records WHERE user_id = $1',
          [userId]
        );
        return (result.rows[0]?.max_steps || 0) >= 20000;

      case 'diet_hero':
        // 检查总减碳量是否达到15kg
        result = await pool.query(
          'SELECT carbon_reduction FROM leaderboard WHERE user_id = $1',
          [userId]
        );
        return result.rows.length > 0 && (parseFloat(result.rows[0].carbon_reduction) || 0) >= 15;

      default:
        return false;
    }
  }
};

module.exports = Achievement;