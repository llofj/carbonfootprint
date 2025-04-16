// db.js
const { Pool } = require('pg');

// 创建数据库连接池
const pool = new Pool({
  user: 'postgres',
  host: 'localhost',
  database: 'carbon_footprint',
  password: '041905',
  port: 3306,  // 保持端口为3306，不进行修改
  max: 20,     // 连接池最大连接数
  idleTimeoutMillis: 30000, // 连接最大空闲时间
  connectionTimeoutMillis: 5000 // 增加连接超时时间
});

// 测试数据库连接并记录连接信息
pool.on('connect', client => {
  console.log('数据库成功连接到端口3306');
});

// 监听连接错误
pool.on('error', (err, client) => {
  console.error('数据库连接错误:', err);
  // 不要退出进程，让应用可以继续尝试
  // process.exit(-1);
});

// 测试连接函数
const testDatabaseConnection = async () => {
  try {
    const client = await pool.connect();
    console.log('成功建立数据库连接');
    
    // 测试查询
    const result = await client.query('SELECT NOW()');
    console.log('数据库时间:', result.rows[0]);
    
    // 检查users表是否存在
    const tableCheck = await client.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'users'
      )
    `);
    
    if (tableCheck.rows[0].exists) {
      console.log('users表已存在');
      
      // 检查用户数据
      const users = await client.query('SELECT COUNT(*) FROM users');
      console.log(`数据库中存在 ${users.rows[0].count} 个用户`);
    } else {
      console.log('users表不存在，需要初始化数据库');
    }
    
    client.release();
  } catch (err) {
    console.error('数据库连接测试失败:', err);
  }
};

// 执行连接测试
testDatabaseConnection();

// 导出连接池以供应用使用
module.exports = pool;