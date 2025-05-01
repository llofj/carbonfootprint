const fs = require('fs');
const path = require('path');
const pool = require('../config/db');

async function seedLeaderboardData() {
  try {
    console.log('开始导入排名数据...');

    // 读取SQL文件
    const sqlFilePath = path.join(__dirname, 'seed_leaderboard_data.sql');
    const sqlScript = fs.readFileSync(sqlFilePath, 'utf8');

    // 执行SQL脚本
    await pool.query(sqlScript);

    console.log('排名数据导入成功!');
    
    // 获取总行数
    const countResult = await pool.query('SELECT COUNT(*) FROM leaderboard');
    console.log(`leaderboard表中现有 ${countResult.rows[0].count} 条数据`);
    
    // 获取前10名数据
    const topUsers = await pool.query(`
      SELECT l.rank, l.carbon_reduction, u.username 
      FROM leaderboard l
      JOIN users u ON l.user_id = u.id
      ORDER BY l.rank
      LIMIT 10
    `);
    
    console.log('排行榜前10名:');
    topUsers.rows.forEach(user => {
      console.log(`${user.rank}. ${user.username}: ${user.carbon_reduction} kgCO₂`);
    });
    
  } catch (error) {
    console.error('导入排名数据失败:', error);
  } finally {
    // 关闭数据库连接
    await pool.end();
  }
}

// 执行导入操作
seedLeaderboardData(); 