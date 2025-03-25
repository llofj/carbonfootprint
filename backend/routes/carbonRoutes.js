// backend/routes/carbonRoutes.js
const express = require('express');
const router = express.Router();
const carbonController = require('../controllers/carbonController');
const authMiddleware = require('../middleware/auth');

// 确保导入的 carbonController 中有所有需要的方法
console.log('Available methods in carbonController:', Object.keys(carbonController));

// 添加认证中间件
router.use(authMiddleware);

// 确保这些方法在 carbonController 中已定义
router.post('/calculate', carbonController.calculateEmissions);
router.get('/user', carbonController.getUserEmissions);
router.get('/user/daily', carbonController.getUserDailyEmissions);
router.get('/user/total', carbonController.getTotalEmission);
router.get('/factors', carbonController.getEmissionFactors);

module.exports = router;