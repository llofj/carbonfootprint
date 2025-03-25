// backend/controllers/authController.js
const User = require('../models/User');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

// Helper function to validate input
const validateLoginInput = (username, password, captcha) => {
  const errors = {};
  
  if (!username || username.trim() === '') {
    errors.username = 'Username is required';
  }
  
  if (!password) {
    errors.password = 'Password is required';
  }
  
  // 保持验证码固定为0000
  if (!captcha || captcha !== '0000') {
    errors.captcha = 'Invalid captcha';
  }
  
  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
};

// 调试辅助函数
const debugLog = (message, data) => {
  console.log(`[DEBUG] ${message}`, data || '');
};

exports.register = async (req, res) => {
  try {
    const { username, password, email } = req.body;
    
    debugLog('注册请求数据:', { username, email });
    
    // Check if user already exists
    const existingUser = await User.findByUsername(username);
    if (existingUser) {
      return res.status(400).json({ message: 'Username already exists' });
    }
    
    // 直接使用明文密码（不安全，仅用于测试）
    const user = await User.create(username, password, email);
    res.status(201).json(user);
  } catch (error) {
    console.error('Register error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

exports.login = async (req, res) => {
  try {
    const { username, password, captcha } = req.body;
    
    debugLog('登录请求数据:', { username, captcha });
    
    // 1. 验证表单数据
    if (!username || !password) {
      return res.status(400).json({ 
        message: '用户名和密码不能为空' 
      });
    }
    
    // 2. 验证码检查 - 始终为0000
    if (captcha !== '0000') {
      return res.status(400).json({ message: '验证码错误' });
    }
    
    // 尝试创建测试用户（如果不存在）
    await User.createTestUserIfNotExists();
    
    // 3. 从数据库查询用户 - 确保使用trim去除空格
    const user = await User.findByUsername(username.trim());
    
    // 4. 检查用户是否存在
    if (!user) {
      debugLog('用户不存在:', username);
      
      // 特殊情况：如果用户输入test/123456但数据库中没有找到，自动创建
      if (username.trim().toLowerCase() === 'test' && password.trim() === '123456') {
        const testUser = await User.create('test', '123456', 'test@example.com');
        debugLog('自动创建测试用户:', testUser);
        
        // 生成JWT令牌
        const token = jwt.sign(
          { 
            id: testUser.id,
            username: testUser.username
          }, 
          process.env.JWT_SECRET || 'your-secret-key',
          { expiresIn: '24h' }
        );
        
        return res.json({ 
          success: true,
          token,
          user: {
            id: testUser.id,
            username: testUser.username,
            email: testUser.email
          }
        });
      }
      
      return res.status(401).json({ message: '用户名或密码错误' });
    }
    
    debugLog('找到用户:', { id: user.id, username: user.username });
    
    // 5. 密码验证 - 明文对比，确保比较前也进行trim
    const isPasswordValid = await User.validatePassword(password, user.password);
    
    debugLog('密码验证结果:', isPasswordValid);
    debugLog('输入密码:', `"${password.trim()}"`, '存储密码:', `"${user.password.trim()}"`);
    
    if (!isPasswordValid) {
      console.log(`登录失败: 用户 ${username} 输入的密码不正确`);
      return res.status(401).json({ message: '用户名或密码错误' });
    }
    
    // 6. 尝试更新最后登录时间
    try {
      await User.updateLastLogin(user.id);
    } catch (error) {
      // 即使更新失败也继续登录流程
      console.error('更新最后登录时间失败:', error);
    }
    
    // 7. 生成JWT令牌
    const token = jwt.sign(
      { 
        id: user.id,
        username: user.username
      }, 
      process.env.JWT_SECRET || 'your-secret-key',
      { expiresIn: '24h' }
    );
    
    // 8. 返回登录成功响应
    debugLog('登录成功, 生成的Token:', { token: token.substring(0, 20) + '...' });
    
    res.json({ 
      success: true,
      token,
      user: {
        id: user.id,
        username: user.username,
        email: user.email
      }
    });
  } catch (error) {
    console.error('登录处理错误:', error);
    res.status(500).json({ 
      message: '服务器错误，请稍后再试',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// 临时添加一个测试接口
exports.testUsers = async (req, res) => {
  try {
    const users = await User.getAllUsers();
    res.json({ users });
  } catch (error) {
    console.error('获取用户列表错误:', error);
    res.status(500).json({ message: '服务器错误' });
  }
};