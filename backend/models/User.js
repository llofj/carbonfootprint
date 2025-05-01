// backend/models/User.js
const pool = require('../config/db');
const bcrypt = require('bcrypt');

const User = {
  async create(username, password, email) {
    const result = await pool.query(
      'INSERT INTO users (username, password, email) VALUES ($1, $2, $3) RETURNING *',
      [username.trim(), password, email.trim()]  // 密码已经在控制器中加密，这里不需要trim
    );
    return result.rows[0];
  },

  async findByUsername(username) {
    // 添加调试日志
    console.log(`尝试查找用户: "${username}"`);
    
    if (!username) {
      console.log('警告: 尝试查询空用户名');
      return null;
    }
    
    try {
      // 使用不区分大小写的查询并且确保去除空格
      const result = await pool.query(
        'SELECT * FROM users WHERE LOWER(username) = LOWER($1)',
        [username.trim()]
      );
      
      if (result.rows.length > 0) {
        console.log(`找到用户: ${result.rows[0].username}`);
      } else {
        console.log(`未找到用户: ${username}`);
        
        // 尝试以其他方式查询
        const alternativeResult = await pool.query(
          'SELECT * FROM users'
        );
        
        console.log(`数据库中的用户列表: [${alternativeResult.rows.map(u => u.username).join(', ')}]`);
      }
      
      return result.rows[0];
    } catch (error) {
      console.error('查询用户失败:', error);
      return null;
    }
  },
  
  async findById(id) {
    const result = await pool.query('SELECT * FROM users WHERE id = $1', [id]);
    return result.rows[0];
  },
  
  async updateLastLogin(id) {
    try {
      // 首先检查last_login列是否存在
      const columnCheck = await pool.query(`
        SELECT column_name 
        FROM information_schema.columns 
        WHERE table_name = 'users' AND column_name = 'last_login'
      `);
      
      // 如果last_login列不存在，先添加它
      if (columnCheck.rows.length === 0) {
        console.log('Adding last_login column to users table');
        await pool.query('ALTER TABLE users ADD COLUMN last_login TIMESTAMP DEFAULT NULL');
      }
      
      // 更新登录时间
      const result = await pool.query(
        'UPDATE users SET last_login = CURRENT_TIMESTAMP WHERE id = $1 RETURNING *',
        [id]
      );
      return result.rows[0];
    } catch (error) {
      console.error('Error updating last login time:', error);
      return null; // 即使失败也不中断流程
    }
  },
  
  async validatePassword(inputPassword, storedPassword) {
    // 首先尝试使用bcrypt进行比较（处理已加密的密码）
    try {
      return await bcrypt.compare(inputPassword, storedPassword);
    } catch (error) {
      // 如果bcrypt比较失败（可能密码没有被加密），尝试直接比较
      return inputPassword.trim() === storedPassword.trim();
    }
  },
  
  // 用于测试的辅助方法
  async getAllUsers() {
    try {
      const result = await pool.query('SELECT * FROM users');
      return result.rows;
    } catch (error) {
      console.error('获取所有用户失败:', error);
      return [];
    }
  },
  
  // 在需要时创建测试用户
  async createTestUserIfNotExists() {
    try {
      console.log('检查测试用户是否存在...');
      // 检查测试用户是否存在
      const userCheck = await this.findByUsername('test');
      
      // 如果不存在，创建测试用户
      if (!userCheck) {
        console.log('创建测试用户...');
        // 对测试用户密码进行加密
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash('123456', salt);
        console.log('加密密码生成:', hashedPassword.substring(0, 10) + '...');
        const testUser = await this.create('test', hashedPassword, 'test@example.com');
        console.log('测试用户创建成功:', testUser);
        return testUser;
      } else {
        console.log('测试用户已存在，检查密码格式...');
        // 检查现有测试用户的密码是否已加密
        try {
          // 尝试解密密码，如果成功，说明是bcrypt格式
          const isValidBcrypt = userCheck.password.startsWith('$2');
          if (!isValidBcrypt) {
            console.log('更新测试用户密码为加密格式...');
            const salt = await bcrypt.genSalt(10);
            const hashedPassword = await bcrypt.hash('123456', salt);
            await pool.query(
              'UPDATE users SET password = $1 WHERE id = $2',
              [hashedPassword, userCheck.id]
            );
            console.log('测试用户密码已更新为加密格式');
            // 重新获取更新后的用户
            const updatedUser = await this.findById(userCheck.id);
            return updatedUser;
          }
        } catch (error) {
          console.error('检查密码格式失败:', error);
        }
      }
      
      return userCheck;
    } catch (error) {
      console.error('创建测试用户失败:', error);
      return null;
    }
  }
};

module.exports = User;