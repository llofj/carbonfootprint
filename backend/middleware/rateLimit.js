// backend/middleware/rateLimit.js
// 简单的内存限流中间件，用于防止登录尝试过多

// 存储用户登录请求的记录
const loginAttempts = new Map();

// 清理过期的登录尝试记录
setInterval(() => {
  const now = Date.now();
  for (const [ip, data] of loginAttempts.entries()) {
    if (now - data.lastAttempt > 10 * 60 * 1000) { // 10分钟后清除记录
      loginAttempts.delete(ip);
    }
  }
}, 60 * 1000); // 每分钟清理一次

/**
 * 登录请求限流中间件
 * 每个IP在5分钟内最多允许10次登录尝试
 */
exports.loginRateLimit = (req, res, next) => {
  // 获取用户IP
  const ip = req.ip || req.connection.remoteAddress;
  
  // 获取当前时间
  const now = Date.now();
  
  // 检查用户之前的登录尝试记录
  if (!loginAttempts.has(ip)) {
    // 首次登录尝试
    loginAttempts.set(ip, {
      count: 1,
      firstAttempt: now,
      lastAttempt: now
    });
    return next();
  }
  
  // 获取用户的登录尝试记录
  const attempts = loginAttempts.get(ip);
  
  // 如果超过5分钟，重置计数
  if (now - attempts.firstAttempt > 5 * 60 * 1000) {
    loginAttempts.set(ip, {
      count: 1,
      firstAttempt: now,
      lastAttempt: now
    });
    return next();
  }
  
  // 如果在5分钟内尝试超过10次
  if (attempts.count >= 10) {
    return res.status(429).json({
      message: '登录尝试次数过多，请稍后再试',
      retryAfter: Math.ceil((attempts.firstAttempt + 5 * 60 * 1000 - now) / 1000)
    });
  }
  
  // 更新尝试次数
  attempts.count += 1;
  attempts.lastAttempt = now;
  loginAttempts.set(ip, attempts);
  
  next();
}; 