// backend/routes/petRoutes.js
const express = require('express');
const router = express.Router();
const petController = require('../controllers/petController');
const authMiddleware = require('../middleware/auth');

// 所有路由都需要认证
router.use(authMiddleware);

// 获取宠物信息
router.get('/', petController.getPet);

// 更新宠物信息
router.put('/', petController.updatePet);

// 处理步数数据
router.post('/steps', petController.processSteps);

// 获取今日步数提交状态
router.get('/steps/today', petController.getTodayStepsStatus);

// 喂食宠物
router.post('/feed', petController.feedPet);

// 训练宠物
router.post('/train', petController.trainPet);

// 用金币升级宠物
router.post('/level-up', petController.levelUpWithCoins);

module.exports = router;