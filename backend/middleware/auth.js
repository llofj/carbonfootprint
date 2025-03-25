// backend/middleware/auth.js
const jwt = require('jsonwebtoken');

module.exports = (req, res, next) => {
  // 从请求头中获取 token
  const token = req.headers.authorization?.split(' ')[1];
  
  if (!token) {
    return res.status(401).json({ message: 'No token, authorization denied' });
  }
  
  try {
    // 验证 token
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');
    req.user = { id: decoded.id };
    next();
  } catch (error) {
    res.status(401).json({ message: 'Token is invalid' });
  }
};