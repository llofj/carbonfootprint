const pool = require('../config/db');

async function checkTestUser() {
  try {
    console.log('开始检查test用户数据...');

    // 获取test用户信息
    const userResult = await pool.query(
      'SELECT id, username, email FROM users WHERE username = $1',
      ['test']
    );
    
    if (userResult.rows.length === 0) {
      console.log('未找到test用户');
      return;
    }
    
    const user = userResult.rows[0];
    console.log('test用户信息:', user);
    
    // 获取排名信息
    const rankResult = await pool.query(
      'SELECT * FROM leaderboard WHERE user_id = $1',
      [user.id]
    );
    
    if (rankResult.rows.length === 0) {
      console.log('test用户在leaderboard表中没有数据');
    } else {
      console.log('test用户在leaderboard表中的数据:', rankResult.rows[0]);
    }
    
    // 插入或更新test用户的减排数据
    console.log('尝试更新test用户的减排数据...');
    
    // 先删除已有记录
    await pool.query('DELETE FROM leaderboard WHERE user_id = $1', [user.id]);
    
    // 插入新记录
    const insertResult = await pool.query(
      'INSERT INTO leaderboard (user_id, carbon_reduction, date) VALUES ($1, $2, CURRENT_DATE) RETURNING *',
      [user.id, 920.8]
    );
    
    console.log('插入的新记录:', insertResult.rows[0]);
    
    // 更新排名
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
    
    // 再次获取排名信息进行验证
    const updatedRankResult = await pool.query(
      'SELECT * FROM leaderboard WHERE user_id = $1',
      [user.id]
    );
    
    if (updatedRankResult.rows.length > 0) {
      console.log('更新后的test用户排名数据:', updatedRankResult.rows[0]);
    }
    
  } catch (error) {
    console.error('检查test用户数据时出错:', error);
  } finally {
    await pool.end();
  }
}

// 执行检查
checkTestUser(); 