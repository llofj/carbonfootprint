// backend/controllers/petController.js
const { VirtualPet, HEALTH_STATUS, HEALTH_LEVELS } = require('../models/VirtualPet');
const pool = require('../config/db');

// 每1000步可减少的碳排放量(kg CO2)
const CARBON_REDUCTION_PER_1000_STEPS = 0.1;
// 每1000步直接获得的碳币数
const COINS_PER_1000_STEPS = 10;
// 升级所需的碳币数
const COINS_FOR_LEVEL_UP = 100;
// 喂食消耗的碳币数
const FEEDING_COST = 10;
// 训练消耗的碳币数
const TRAINING_COST = 20;
// 使用碳币升级获得的经验值
const EXPERIENCE_FOR_LEVEL_UP = 100;
// 健康状态检查间隔（毫秒）
const HEALTH_CHECK_INTERVAL = 30000;

// 训练经验值配置
const TRAINING_EXPERIENCE_CONFIG = {
  [HEALTH_STATUS.HEALTHY]: {
    low: { probability: 0.2, min: 1, max: 10 },
    medium: { probability: 0.4, min: 11, max: 30 },
    high: { probability: 0.4, min: 31, max: 40 }
  },
  [HEALTH_STATUS.GOOD]: {
    low: { probability: 0.4, min: 1, max: 10 },
    medium: { probability: 0.4, min: 11, max: 30 },
    high: { probability: 0.2, min: 31, max: 40 }
  },
  [HEALTH_STATUS.POOR]: {
    low: { probability: 0.6, min: 1, max: 10 },
    medium: { probability: 0.2, min: 11, max: 30 },
    high: { probability: 0.2, min: 31, max: 40 }
  }
};

// 启动健康状态检查定时器
let healthCheckTimer = null;

function startHealthCheck() {
  if (healthCheckTimer) {
    clearInterval(healthCheckTimer);
  }
  
  healthCheckTimer = setInterval(async () => {
    try {
      const result = await pool.query('SELECT * FROM virtual_pets');
      for (const pet of result.rows) {
        const oldHealth = pet.health;
        await VirtualPet.decreaseHealth(pet.user_id);
        
        // 获取更新后的宠物信息
        const updatedPet = await VirtualPet.getByUserId(pet.user_id);
        
        // 如果健康状态发生变化，发送通知
        if (oldHealth !== updatedPet.health) {
          // 这里我们通过WebSocket或者轮询机制来通知前端
          // 暂时先通过API响应来传递这个信息
          // 在实际应用中，建议使用WebSocket来实现实时通知
          console.log(`宠物健康状态从 ${oldHealth} 变为 ${updatedPet.health}`);
        }
      }
      console.log('健康状态检查完成');
    } catch (error) {
      console.error('健康状态检查错误:', error);
    }
  }, HEALTH_CHECK_INTERVAL);
}

// 导出健康状态检查函数
exports.startHealthCheck = startHealthCheck;

// 获取随机经验值
function getRandomExperience(health) {
  const config = TRAINING_EXPERIENCE_CONFIG[health];
  const random = Math.random();
  
  if (random < config.low.probability) {
    return Math.floor(Math.random() * (config.low.max - config.low.min + 1)) + config.low.min;
  } else if (random < config.low.probability + config.medium.probability) {
    return Math.floor(Math.random() * (config.medium.max - config.medium.min + 1)) + config.medium.min;
  } else {
    return Math.floor(Math.random() * (config.high.max - config.high.min + 1)) + config.high.min;
  }
}

exports.getPet = async (req, res) => {
  try {
    const userId = req.user.id;
    let pet = await VirtualPet.getByUserId(userId);
    
    // 如果用户没有宠物，创建一个新的
    if (!pet) {
      pet = await VirtualPet.create(userId);
    }
    
    // 获取距离下一级所需的经验值
    const experienceToNextLevel = await VirtualPet.getExperienceToNextLevel(userId);
    
    res.json({
      ...pet,
      experienceToNextLevel
    });
  } catch (error) {
    console.error('Error getting pet:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.updatePet = async (req, res) => {
  try {
    const userId = req.user.id;
    const { name, level, health, coins, experience } = req.body;
    
    let pet = await VirtualPet.getByUserId(userId);
    
    if (!pet) {
      return res.status(404).json({ message: 'Pet not found' });
    }
    
    const updatedPet = await VirtualPet.update(pet.id, name, level, health, coins, experience);
    res.json(updatedPet);
  } catch (error) {
    console.error('Error updating pet:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.processSteps = async (req, res) => {
  try {
    const userId = req.user.id;
    const { steps } = req.body;
    
    if (!steps || steps <= 0) {
      return res.status(400).json({ message: 'Invalid steps count' });
    }
    
    // 检查用户今天是否已经提交过步数
    const today = new Date();
    const todayStart = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    
    // 查询用户今日是否已提交步数
    const stepsResult = await pool.query(
      'SELECT * FROM step_records WHERE user_id = $1 AND created_at >= $2',
      [userId, todayStart]
    );
    
    if (stepsResult.rows.length > 0) {
      return res.status(400).json({ 
        message: '今天您已经提交过步数了，请明天再来!',
        alreadySubmitted: true,
        todaySteps: stepsResult.rows[0].steps
      });
    }
    
    // 计算减少的碳排放量和奖励的碳币数
    const carbonReduction = (steps / 1000) * CARBON_REDUCTION_PER_1000_STEPS;
    // 现在直接根据步数计算碳币，每1000步10个碳币
    const coinsEarned = Math.round((steps / 1000) * COINS_PER_1000_STEPS);
    
    // 更新宠物碳币
    let pet = await VirtualPet.getByUserId(userId);
    
    if (!pet) {
      pet = await VirtualPet.create(userId);
    }
    
    const updatedPet = await VirtualPet.updateCoins(userId, coinsEarned);
    
    // 记录步数到step_records表
    await pool.query(
      'INSERT INTO step_records (user_id, steps, carbon_reduction, created_at) VALUES ($1, $2, $3, NOW())',
      [userId, steps, carbonReduction]
    );
    
    res.json({
      pet: updatedPet,
      stepsProcessed: steps,
      carbonReduction,
      coinsEarned
    });
  } catch (error) {
    console.error('Error processing steps:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.feedPet = async (req, res) => {
  try {
    const userId = req.user.id;
    let pet = await VirtualPet.getByUserId(userId);
    
    if (!pet) {
      return res.status(404).json({ message: '宠物不存在' });
    }
    
    if (pet.coins < FEEDING_COST) {
      return res.status(400).json({ message: '碳币不足，无法喂食' });
    }
    
    // 提升健康状态
    const updatedPet = await VirtualPet.increaseHealth(userId);
    
    // 扣除碳币
    const finalPet = await VirtualPet.update(
      updatedPet.id,
      updatedPet.name,
      updatedPet.level,
      updatedPet.health,
      pet.coins - FEEDING_COST,
      updatedPet.experience
    );
    
    res.json({
      pet: finalPet,
      message: '喂食成功！宠物的健康状态提升了。'
    });
  } catch (error) {
    console.error('喂食错误:', error);
    res.status(500).json({ message: '服务器错误' });
  }
};

exports.trainPet = async (req, res) => {
  try {
    const userId = req.user.id;
    let pet = await VirtualPet.getByUserId(userId);
    
    if (!pet) {
      return res.status(404).json({ message: '宠物不存在' });
    }
    
    if (pet.health === HEALTH_STATUS.MALNOURISHED) {
      return res.status(400).json({ message: '宠物处于营养不良状态，请先喂食提升健康状态' });
    }
    
    if (pet.coins < TRAINING_COST) {
      return res.status(400).json({ message: '碳币不足，无法训练' });
    }
    
    // 根据健康状态获取随机经验值
    const experienceGained = getRandomExperience(pet.health);
    
    // 训练消耗碳币，获得经验值
    const newCoins = pet.coins - TRAINING_COST;
    const updatedPet = await VirtualPet.addExperience(userId, experienceGained);
    
    // 更新碳币
    const finalPet = await VirtualPet.update(
      updatedPet.id,
      updatedPet.name,
      updatedPet.level,
      updatedPet.health,
      newCoins,
      updatedPet.experience
    );
    
    // 获取距离下一级所需的经验值
    const experienceToNextLevel = await VirtualPet.getExperienceToNextLevel(userId);
    
    res.json({
      pet: finalPet,
      experienceToNextLevel,
      experienceGained,
      message: `训练成功！宠物获得了${experienceGained}点经验值。`
    });
  } catch (error) {
    console.error('训练错误:', error);
    res.status(500).json({ message: '服务器错误' });
  }
};

exports.levelUpWithCoins = async (req, res) => {
  try {
    const userId = req.user.id;
    let pet = await VirtualPet.getByUserId(userId);
    
    if (!pet) {
      return res.status(404).json({ message: '宠物不存在' });
    }
    
    if (pet.health === HEALTH_STATUS.MALNOURISHED) {
      return res.status(400).json({ message: '宠物处于营养不良状态，请先喂食提升健康状态' });
    }
    
    if (pet.coins < COINS_FOR_LEVEL_UP) {
      return res.status(400).json({ message: `碳币不足，升级需要${COINS_FOR_LEVEL_UP}碳币` });
    }
    
    // 消耗碳币获得经验值
    const updatedPet = await VirtualPet.addExperience(userId, EXPERIENCE_FOR_LEVEL_UP);
    
    // 更新碳币
    const finalPet = await VirtualPet.update(
      updatedPet.id,
      updatedPet.name,
      updatedPet.level,
      updatedPet.health,
      pet.coins - COINS_FOR_LEVEL_UP,
      updatedPet.experience
    );
    
    // 获取距离下一级所需的经验值
    const experienceToNextLevel = await VirtualPet.getExperienceToNextLevel(userId);
    
    res.json({
      pet: finalPet,
      experienceToNextLevel,
      experienceGained: EXPERIENCE_FOR_LEVEL_UP,
      message: `恭喜！宠物获得了${EXPERIENCE_FOR_LEVEL_UP}点经验值。`
    });
  } catch (error) {
    console.error('升级错误:', error);
    res.status(500).json({ message: '服务器错误' });
  }
};

// 获取用户今日是否已提交步数的接口
exports.getTodayStepsStatus = async (req, res) => {
  try {
    const userId = req.user.id;
    
    // 获取今天的日期范围（从今天凌晨开始）
    const today = new Date();
    const todayStart = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    
    // 查询用户今日是否已提交步数
    const stepsResult = await pool.query(
      'SELECT steps, carbon_reduction FROM step_records WHERE user_id = $1 AND created_at >= $2 ORDER BY created_at DESC LIMIT 1',
      [userId, todayStart]
    );
    
    if (stepsResult.rows.length > 0) {
      res.json({
        hasSubmittedToday: true,
        steps: stepsResult.rows[0].steps,
        carbonReduction: stepsResult.rows[0].carbon_reduction
      });
    } else {
      res.json({
        hasSubmittedToday: false,
        steps: 0,
        carbonReduction: 0
      });
    }
  } catch (error) {
    console.error('Error checking today steps status:', error);
    res.status(500).json({ message: 'Server error' });
  }
};