// backend/routes/achievementRoutes.js
const express = require('express');
const router = express.Router();
const achievementController = require('../controllers/achievementController');
const authMiddleware = require('../middleware/auth');

// 获取所有成就类型 - 公开路由
router.get('/types', achievementController.getAllAchievementTypes);

// 以下路由需要认证
router.use(authMiddleware);

// 获取用户的成就
router.get('/user', achievementController.getUserAchievements);

// 检查新成就
router.get('/check', achievementController.checkNewAchievements);

// 获取用户碳减排总量
router.get('/carbon-reduction', achievementController.getUserCarbonReduction);

module.exports = router;