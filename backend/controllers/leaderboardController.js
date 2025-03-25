// backend/controllers/leaderboardController.js
const Leaderboard = require('../models/Leaderboard');

// 获取排行榜
exports.getLeaderboard = async (req, res) => {
  try {
    const limit = req.query.limit ? parseInt(req.query.limit) : 10;
    const leaderboard = await Leaderboard.getLeaderboard(limit);
    
    // 如果用户已登录，获取用户的排名
    let userRank = null;
    if (req.user) {
      userRank = await Leaderboard.getUserRank(req.user.id);
    }
    
    res.json({
      leaderboard,
      userRank
    });
  } catch (error) {
    console.error('Error getting leaderboard:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// 获取用户在排行榜中的排名
exports.getUserRank = async (req, res) => {
  try {
    const userId = req.user.id;
    const userRank = await Leaderboard.getUserRank(userId);
    
    if (!userRank) {
      return res.status(404).json({ message: 'User rank not found' });
    }
    
    res.json(userRank);
  } catch (error) {
    console.error('Error getting user rank:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// 更新用户在排行榜中的数据
exports.updateLeaderboard = async (req, res) => {
  try {
    const userId = req.user.id;
    const totalReduction = await Leaderboard.getUserTotalReduction(userId);
    
    const updatedRank = await Leaderboard.updateUserRank(userId, totalReduction);
    
    res.json({
      rank: updatedRank,
      message: '排行榜数据已更新'
    });
  } catch (error) {
    console.error('Error updating leaderboard:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// 获取排行榜前三名
exports.getTopThree = async (req, res) => {
  try {
    const topThree = await Leaderboard.getLeaderboard(3);
    res.json(topThree);
  } catch (error) {
    console.error('Error getting top three:', error);
    res.status(500).json({ message: 'Server error' });
  }
};