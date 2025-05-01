// backend/middleware/auth.js
const jwt = require('jsonwebtoken');
const { JWT_SECRET } = require('../config/auth');

const authMiddleware = (req, res, next) => {
  console.log('开始处理认证中间件');
  console.log('请求路径:', req.path);
  
  // 获取Authorization头部
  const authHeader = req.headers.authorization;
  console.log('Authorization头部:', authHeader ? '存在' : '不存在');
  
  if (!authHeader) {
    console.error('认证失败: 没有Authorization头部');
    return res.status(401).json({ 
      error: '未授权', 
      details: '缺少认证令牌，请登录'
    });
  }
  
  // 提取token
  const tokenParts = authHeader.split(' ');
  if (tokenParts.length !== 2 || tokenParts[0] !== 'Bearer') {
    console.error('认证失败: 无效的Authorization格式', tokenParts);
    return res.status(401).json({ 
      error: '未授权', 
      details: '无效的认证格式'
    });
  }
  
  const token = tokenParts[1];
  
  try {
    // 验证token
    console.log('开始验证令牌');
    const decoded = jwt.verify(token, JWT_SECRET);
    console.log('令牌验证成功，用户ID:', decoded.id);
    
    // 将用户信息添加到请求对象
    req.user = {
      id: decoded.id,
      username: decoded.username
    };
    
    // 继续下一个中间件
    next();
  } catch (error) {
    console.error('验证令牌失败:', error.message);
    
    // 根据错误类型返回不同的消息
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ 
        error: '认证失败', 
        details: '令牌已过期，请重新登录'
      });
    } else if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({ 
        error: '认证失败', 
        details: '无效的令牌'
      });
    } else {
      return res.status(401).json({ 
        error: '认证失败', 
        details: error.message
      });
  }
  }
};

module.exports = authMiddleware;