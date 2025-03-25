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
  connectionTimeoutMillis: 2000 // 连接超时时间
});

// 测试数据库连接
pool.on('connect', client => {
  console.log('Database connected successfully');
});

// 监听连接错误
pool.on('error', (err, client) => {
  console.error('Unexpected error on idle client', err);
  process.exit(-1);
});

// 导出连接池以供应用使用
module.exports = pool;