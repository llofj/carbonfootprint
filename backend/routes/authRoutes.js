// backend/routes/authRoutes.js
const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { loginRateLimit } = require('../middleware/rateLimit');

// 注册路由
router.post('/register', authController.register);

// 登录路由 - 添加速率限制中间件
router.post('/login', loginRateLimit, authController.login);

module.exports = router;