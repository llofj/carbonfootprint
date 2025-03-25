// backend/controllers/achievementController.js
const Achievement = require('../models/Achievement');

// 获取所有成就类型
exports.getAllAchievementTypes = async (req, res) => {
  try {
    const achievementTypes = await Achievement.getAllAchievementTypes();
    res.json(achievementTypes);
  } catch (error) {
    console.error('Error getting achievement types:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// 获取用户的成就
exports.getUserAchievements = async (req, res) => {
  try {
    const userId = req.user.id;
    const achievements = await Achievement.getUserAchievements(userId);
    res.json(achievements);
  } catch (error) {
    console.error('Error getting user achievements:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// 检查用户是否解锁了新成就
exports.checkNewAchievements = async (req, res) => {
  try {
    const userId = req.user.id;
    const achievementTypes = await Achievement.getAllAchievementTypes();
    const unlockedAchievements = [];
    
    for (const achievementType of achievementTypes) {
      // 检查用户是否已拥有该成就
      const hasAchievement = await Achievement.hasAchievement(userId, achievementType.id);
      
      if (!hasAchievement) {
        // 检查用户是否满足该成就的条件
        const isEligible = await Achievement.checkAchievementEligibility(userId, achievementType);
        
        if (isEligible) {
          // 添加成就
          const newAchievement = await Achievement.addAchievement(
            userId,
            achievementType.id,
            achievementType.name
          );
          unlockedAchievements.push({
            ...newAchievement,
            icon: achievementType.icon,
            description: achievementType.description
          });
        }
      }
    }
    
    res.json({
      newAchievements: unlockedAchievements,
      message: unlockedAchievements.length > 0 ? '恭喜！您解锁了新成就' : '没有新成就'
    });
  } catch (error) {
    console.error('Error checking achievements:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// 获取用户的碳减排总量
exports.getUserCarbonReduction = async (req, res) => {
  try {
    const userId = req.user.id;
    const reduction = await Achievement.getUserCarbonReduction(userId);
    res.json({ carbon_reduction: reduction });
  } catch (error) {
    console.error('Error getting user carbon reduction:', error);
    res.status(500).json({ message: 'Server error' });
  }
};