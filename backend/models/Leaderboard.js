// backend/models/Leaderboard.js
const pool = require('../config/db');
const Achievement = require('./Achievement');

const Leaderboard = {
  // 获取排行榜数据
  async getLeaderboard(limit = 10) {
    try {
      // 限制最大值为200
      const safeLimit = Math.min(limit, 200);
      console.log(`获取排行榜数据，限制: ${safeLimit}条`);
      
      const result = await pool.query(
        `SELECT l.user_id, l.rank, l.carbon_reduction, u.username 
         FROM leaderboard l
         JOIN users u ON l.user_id = u.id
         ORDER BY l.rank ASC
         LIMIT $1`,
        [safeLimit]
      );
      
      // 确保数据格式正确
      const formattedData = result.rows.map(row => ({
        user_id: row.user_id,
        rank: parseInt(row.rank, 10) || 0,
        carbon_reduction: parseFloat(row.carbon_reduction) || 0,
        username: row.username
      }));
      
      return formattedData;
    } catch (error) {
      console.error('Error getting leaderboard:', error);
      return [];
    }
  },

  // 获取用户排名
  async getUserRank(userId) {
    try {
      // 先检查用户是否在排行榜中
      const checkResult = await pool.query(
        'SELECT * FROM leaderboard WHERE user_id = $1',
        [userId]
      );

      // 如果不在排行榜中，先添加
      if (checkResult.rows.length === 0) {
        // 获取用户减排总量
        const totalReduction = await this.getUserTotalReduction(userId);
        await this.updateUserRank(userId, totalReduction);
      }

      // 获取用户排名
      const result = await pool.query(
        `SELECT l.user_id, l.rank, l.carbon_reduction, u.username 
         FROM leaderboard l
         JOIN users u ON l.user_id = u.id
         WHERE l.user_id = $1`,
        [userId]
      );

      if (result.rows.length === 0) {
        return null;
      }

      // 格式化数据
      const userData = result.rows[0];
      return {
        user_id: userData.user_id,
        rank: parseInt(userData.rank, 10) || 0,
        carbon_reduction: parseFloat(userData.carbon_reduction) || 0,
        username: userData.username
      };
    } catch (error) {
      console.error('Error getting user rank:', error);
      return null;
    }
  },

  // 获取用户减排总量
  async getUserTotalReduction(userId) {
    return await Achievement.getUserCarbonReduction(userId);
  },

  // 更新用户排名
  async updateUserRank(userId, totalReduction) {
    try {
      // 先查询该用户是否已在排行榜中
      const checkResult = await pool.query(
        'SELECT * FROM leaderboard WHERE user_id = $1',
        [userId]
      );
      
      const today = new Date();
      
      if (checkResult.rows.length === 0) {
        // 用户不在排行榜中，插入新记录
        await pool.query(
          'INSERT INTO leaderboard (user_id, carbon_reduction, date) VALUES ($1, $2, $3)',
          [userId, totalReduction, today]
        );
      } else {
        // 用户在排行榜中，更新记录
        await pool.query(
          'UPDATE leaderboard SET carbon_reduction = $1, date = $2 WHERE user_id = $3',
          [totalReduction, today, userId]
        );
      }

      // 更新所有用户的排名
      await this.updateAllRanks();

      // 返回更新后的用户排名
      const rankResult = await pool.query(
        'SELECT rank FROM leaderboard WHERE user_id = $1',
        [userId]
      );

      return rankResult.rows[0].rank;
    } catch (error) {
      console.error('Error updating user rank:', error);
      throw error;
    }
  },

  // 更新所有用户的排名
  async updateAllRanks() {
    try {
      // 使用窗口函数为所有用户计算排名
      await pool.query(`
        WITH ranked_users AS (
          SELECT id, user_id, carbon_reduction,
                 RANK() OVER (ORDER BY carbon_reduction DESC) as new_rank
          FROM leaderboard
        )
        UPDATE leaderboard l
        SET rank = ru.new_rank
        FROM ranked_users ru
        WHERE l.id = ru.id
      `);
    } catch (error) {
      console.error('Error updating all ranks:', error);
      throw error;
    }
  }
};

module.exports = Leaderboard;