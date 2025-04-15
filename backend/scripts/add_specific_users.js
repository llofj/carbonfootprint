const fs = require('fs');
const path = require('path');
const pool = require('../config/db');

async function addSpecificUsers() {
  try {
    console.log('开始为特定用户添加排名数据...');

    // 读取SQL文件
    const sqlFilePath = path.join(__dirname, 'add_specific_users.sql');
    const sqlScript = fs.readFileSync(sqlFilePath, 'utf8');

    // 执行SQL脚本
    await pool.query(sqlScript);

    console.log('特定用户排名数据添加成功!');
    
    // 获取用户llofj的排名
    const llofj = await pool.query(`
      SELECT l.user_id, l.rank, l.carbon_reduction, u.username 
      FROM leaderboard l
      JOIN users u ON l.user_id = u.id
      WHERE u.username = 'llofj'
    `);
    
    if (llofj.rows.length > 0) {
      console.log('用户llofj的排名信息:');
      console.log(`排名: ${llofj.rows[0].rank}`);
      console.log(`减排量: ${llofj.rows[0].carbon_reduction} kgCO₂`);
    }
    
    // 获取用户test的排名
    const test = await pool.query(`
      SELECT l.user_id, l.rank, l.carbon_reduction, u.username 
      FROM leaderboard l
      JOIN users u ON l.user_id = u.id
      WHERE u.username = 'test'
    `);
    
    if (test.rows.length > 0) {
      console.log('用户test的排名信息:');
      console.log(`排名: ${test.rows[0].rank}`);
      console.log(`减排量: ${test.rows[0].carbon_reduction} kgCO₂`);
    }
    
    // 获取排行榜前10名
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
    console.error('为特定用户添加排名数据失败:', error);
  } finally {
    // 关闭数据库连接
    await pool.end();
  }
}

// 执行导入操作
addSpecificUsers(); 