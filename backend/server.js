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
const petController = require('./controllers/petController');

// 创建数据库连接池
const pool = new Pool({
  user: 'postgres',
  host: 'localhost',
  database: 'carbon_footprint',
  password: 'CC123',
  port: 5432,  // 使用3306端口
});

const app = express();

// 确定环境
const isDevelopment = process.env.NODE_ENV !== 'production';

// CORS配置 - 更灵活地处理跨域请求
app.use(cors({
  origin: function(origin, callback) {
    // 开发环境允许所有源访问
    if (isDevelopment) {
      callback(null, true);
      return;
    }
    
    // 生产环境下的允许域名列表
    const allowedOrigins = [
      'https://ecopaw.com', 
      'https://www.ecopaw.com'
    ];
    
    // 如果请求没有Origin头（如本地请求）或在允许列表中则允许
    if (!origin || allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      console.log(`CORS拒绝来自${origin}的请求`);
      callback(new Error('CORS策略不允许此源访问'), false);
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'Accept', 'Origin', 'X-Requested-With']
}));
app.use(express.json());

// 添加预检请求处理
app.options('*', cors());

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
    
    // 启动健康状态检查
    petController.startHealthCheck();
    console.log('健康状态检查已启动');
  } catch (error) {
    console.error('启动过程中出错:', error);
  }
});