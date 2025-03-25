// backend/server.js
const express = require('express');
const cors = require('cors');
const { Pool } = require('pg');
const User = require('./models/User');
const authRoutes = require('./routes/authRoutes');
const carbonRoutes = require('./routes/carbonRoutes');
const petRoutes = require('./routes/petRoutes');
const achievementRoutes = require('./routes/achievementRoutes');
const leaderboardRoutes = require('./routes/leaderboardRoutes');

// 创建数据库连接池
const pool = new Pool({
  user: 'postgres',
  host: 'localhost',
  database: 'carbon_footprint',
  password: '041905',
  port: 3306,  // 使用3306端口
});

const app = express();

// CORS配置 - 允许更多的源访问
app.use(cors({
  origin: ['http://localhost:8080', 'http://127.0.0.1:8080', 'http://10.131.222.40:8080'],
  credentials: true
}));
app.use(express.json());

// 简化的请求日志中间件
app.use((req, res, next) => {
  console.log(`${req.method} ${req.url}`);
  next();
});

// 路由注册
app.use('/api/auth', authRoutes);
app.use('/api/carbon', carbonRoutes);
app.use('/api/pet', petRoutes);
app.use('/api/achievement', achievementRoutes);
app.use('/api/leaderboard', leaderboardRoutes);

// 初始化数据库
async function initDatabase() {
  const client = await pool.connect();
  try {
    // 检查用户表是否存在
    const tableCheck = await client.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' AND table_name = 'users'
    `);
    
    // 如果用户表不存在，创建它
    if (tableCheck.rows.length === 0) {
      await client.query(`
        CREATE TABLE users (
          id SERIAL PRIMARY KEY,
          username VARCHAR(50) NOT NULL UNIQUE,
          password VARCHAR(100) NOT NULL,
          email VARCHAR(100),
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          last_login TIMESTAMP
        )
      `);
      console.log('初始化: 创建users表成功');
    }
    
    // 确保测试用户存在
    await User.createTestUserIfNotExists();
  } catch (err) {
    console.error('数据库初始化失败:', err);
  } finally {
    client.release();
  }
}

// 启动服务器 - 监听所有网络接口
app.listen(5000, '0.0.0.0', async () => {
  console.log('服务器启动在端口 5000，监听所有网络接口');
  
  try {
    await initDatabase();
    console.log('数据库初始化完成');
  } catch (error) {
    console.error('启动过程中出错:', error);
  }
});