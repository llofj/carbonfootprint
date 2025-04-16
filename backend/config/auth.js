// backend/config/auth.js
// JWT 配置

// 从环境变量中获取密钥，如果不存在则使用默认密钥
// 注意：在生产环境中，应该设置一个强密钥并通过环境变量传递
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

// JWT 令牌有效期（以秒为单位）
const JWT_EXPIRES_IN = 60 * 60 * 24 * 7; // 7天

module.exports = {
  JWT_SECRET,
  JWT_EXPIRES_IN
}; 