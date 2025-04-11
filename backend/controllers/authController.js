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

// 验证注册输入
const validateRegisterInput = (username, password, email, captcha) => {
  const errors = {};
  
  if (!username || username.trim() === '') {
    errors.username = '用户名不能为空';
  } else if (username.length < 3) {
    errors.username = '用户名至少需要3个字符';
  }
  
  if (!email || email.trim() === '') {
    errors.email = '邮箱不能为空';
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    errors.email = '邮箱格式不正确';
  }
  
  if (!password) {
    errors.password = '密码不能为空';
  } else if (password.length < 6) {
    errors.password = '密码至少需要6个字符';
  }
  
  // 保持验证码固定为0000
  if (!captcha || captcha !== '0000') {
    errors.captcha = '验证码错误';
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
    const { username, password, email, captcha } = req.body;
    
    debugLog('注册请求数据:', { username, email });
    
    // 验证输入
    const { isValid, errors } = validateRegisterInput(username, password, email, captcha);
    if (!isValid) {
      return res.status(400).json({ message: Object.values(errors)[0], errors });
    }
    
    // 检查用户名是否已存在
    const existingUser = await User.findByUsername(username);
    if (existingUser) {
      return res.status(409).json({ message: '用户名已存在' });
    }
    
    // 对密码进行加密
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    
    // 创建新用户
    const user = await User.create(username, hashedPassword, email);
    
    // 返回成功响应，不包含密码
    res.status(201).json({
      message: '注册成功',
      user: {
        id: user.id,
        username: user.username,
        email: user.email
      }
    });
  } catch (error) {
    console.error('注册错误:', error);
    res.status(500).json({ message: '服务器错误', error: error.message });
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
            username: testUser.username
          }
        });
      }
      
      return res.status(401).json({ message: '用户名或密码错误' });
    }
    
    // 5. 验证密码
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({ message: '用户名或密码错误' });
    }
    
    // 6. 更新最后登录时间
    await User.updateLastLogin(user.id);
    
    // 7. 生成JWT令牌
    const token = jwt.sign(
      { 
        id: user.id,
        username: user.username
      }, 
      process.env.JWT_SECRET || 'your-secret-key',
      { expiresIn: '24h' }
    );
    
    // 8. 返回成功响应
    res.json({ 
      success: true,
      token,
      user: {
        id: user.id,
        username: user.username
      }
    });
  } catch (error) {
    console.error('登录错误:', error);
    res.status(500).json({ message: '服务器错误', error: error.message });
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