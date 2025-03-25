// backend/controllers/petController.js
const VirtualPet = require('../models/VirtualPet');

// 每1000步可减少的碳排放量(kg CO2)
const CARBON_REDUCTION_PER_1000_STEPS = 0.1;
// 每减少1kg CO2可获得的金币数
const COINS_PER_KG_CARBON = 10;
// 升级所需的金币数
const COINS_FOR_LEVEL_UP = 100;
// 喂食消耗的金币数
const FEEDING_COST = 10;
// 训练消耗的金币数
const TRAINING_COST = 20;

exports.getPet = async (req, res) => {
  try {
    const userId = req.user.id;
    let pet = await VirtualPet.getByUserId(userId);
    
    // 如果用户没有宠物，创建一个新的
    if (!pet) {
      pet = await VirtualPet.create(userId);
    }
    
    res.json(pet);
  } catch (error) {
    console.error('Error getting pet:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.updatePet = async (req, res) => {
  try {
    const userId = req.user.id;
    const { name, level, health, coins } = req.body;
    
    let pet = await VirtualPet.getByUserId(userId);
    
    if (!pet) {
      return res.status(404).json({ message: 'Pet not found' });
    }
    
    const updatedPet = await VirtualPet.update(pet.id, name, level, health, coins);
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
    
    // 计算减少的碳排放量和奖励的金币数
    const carbonReduction = (steps / 1000) * CARBON_REDUCTION_PER_1000_STEPS;
    const coinsEarned = Math.round(carbonReduction * COINS_PER_KG_CARBON);
    
    // 更新宠物金币
    let pet = await VirtualPet.getByUserId(userId);
    
    if (!pet) {
      pet = await VirtualPet.create(userId);
    }
    
    const updatedPet = await VirtualPet.updateCoins(userId, coinsEarned);
    
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
      return res.status(404).json({ message: 'Pet not found' });
    }
    
    if (pet.coins < FEEDING_COST) {
      return res.status(400).json({ message: '金币不足，无法喂食' });
    }
    
    // 喂食消耗金币，提升宠物健康状态
    const updatedPet = await VirtualPet.update(
      pet.id,
      pet.name,
      pet.level,
      '健康',
      pet.coins - FEEDING_COST
    );
    
    res.json({
      pet: updatedPet,
      message: '喂食成功！宠物的健康状态提升了。'
    });
  } catch (error) {
    console.error('Error feeding pet:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.trainPet = async (req, res) => {
  try {
    const userId = req.user.id;
    let pet = await VirtualPet.getByUserId(userId);
    
    if (!pet) {
      return res.status(404).json({ message: 'Pet not found' });
    }
    
    if (pet.coins < TRAINING_COST) {
      return res.status(400).json({ message: '金币不足，无法训练' });
    }
    
    // 训练消耗金币，提升宠物等级
    const newCoins = pet.coins - TRAINING_COST;
    const updatedPet = await VirtualPet.update(
      pet.id,
      pet.name,
      pet.level + 1,
      pet.health,
      newCoins
    );
    
    res.json({
      pet: updatedPet,
      message: '训练成功！宠物升级了。'
    });
  } catch (error) {
    console.error('Error training pet:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.levelUpWithCoins = async (req, res) => {
  try {
    const userId = req.user.id;
    let pet = await VirtualPet.getByUserId(userId);
    
    if (!pet) {
      return res.status(404).json({ message: 'Pet not found' });
    }
    
    if (pet.coins < COINS_FOR_LEVEL_UP) {
      return res.status(400).json({ message: `金币不足，升级需要${COINS_FOR_LEVEL_UP}金币` });
    }
    
    // 消耗金币升级宠物
    const updatedPet = await VirtualPet.update(
      pet.id,
      pet.name,
      pet.level + 1,
      pet.health,
      pet.coins - COINS_FOR_LEVEL_UP
    );
    
    res.json({
      pet: updatedPet,
      message: '恭喜！宠物升级了。'
    });
  } catch (error) {
    console.error('Error leveling up pet:', error);
    res.status(500).json({ message: 'Server error' });
  }
};