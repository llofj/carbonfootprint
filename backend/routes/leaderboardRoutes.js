// backend/routes/leaderboardRoutes.js
const express = require('express');
const router = express.Router();
const leaderboardController = require('../controllers/leaderboardController');
const authMiddleware = require('../middleware/auth');

// 公开路由
// 获取排行榜前三名
router.get('/top', leaderboardController.getTopThree);

// 需要认证的路由
router.use(authMiddleware);

// 获取排行榜
router.get('/', leaderboardController.getLeaderboard);

// 获取用户排名
router.get('/user', leaderboardController.getUserRank);

// 更新用户排名
router.post('/update', leaderboardController.updateLeaderboard);

module.exports = router;