// backend/controllers/carbonController.js
const CarbonEmission = require('../models/CarbonEmission');

// 碳排放系数
const emissionFactors = {
  '衣': {
    '涤纶织物': 25.7,
    '纯棉T恤': 5.5,
    '洗衣液': 2.0
  },
  '食': {
    '白酒': 3.0,
    '啤酒': 0.2,
    '吸烟': 1.5,
    '羊肉': 23.8,
    '牛肉': 27.0,
    '猪肉': 7.6,
    '炸鸡': 6.3,
    '鸡蛋': 2.7,
    '土豆': 0.3,
    '米饭': 2.5,
    '花生': 0.9,
    '酸奶': 1.4,
    '西兰花': 2.0,
    '豆腐': 1.1,
    '牛奶': 3.2,
    '西红柿': 0.4,
    '扁豆': 0.8
  },
  '住': {
    '用水': 0.9,
    '用电': 0.7,
    '天然气': 2.1
  },
  '行': {
    '轮船': 0.03,
    '公交车': 0.1,
    '私家电车': 0.05,
    '私家油车': 0.25,
    '火车': 0.06,
    '飞机': 0.25
  },
  '用': {
    '塑料袋': 0.02,
    '纸巾': 0.8,
    '电子设备': 1.2
  }
};

// 单位映射
const unitMap = {
  '涤纶织物': '千克',
  '纯棉T恤': '件',
  '洗衣液': '瓶',
  '白酒': '瓶',
  '啤酒': '瓶',
  '吸烟': '根',
  '羊肉': '千克',
  '牛肉': '千克',
  '猪肉': '千克',
  '炸鸡': '块',
  '鸡蛋': '个',
  '土豆': '千克',
  '米饭': '碗',
  '花生': '袋',
  '酸奶': '杯',
  '西兰花': '千克',
  '豆腐': '块',
  '牛奶': '盒',
  '西红柿': '千克',
  '扁豆': '千克',
  '用水': '立方米',
  '用电': '度',
  '天然气': '立方米',
  '轮船': '公里',
  '公交车': '公里',
  '私家电车': '公里',
  '私家油车': '公里',
  '火车': '公里',
  '飞机': '公里',
  '塑料袋': '个',
  '纸巾': '包(10张左右)',
  '电子设备': '小时'
};

exports.calculateEmissions = async (req, res) => {
  const { emissions } = req.body;
  const userId = req.user.id;
  
  if (!Array.isArray(emissions) || emissions.length === 0) {
    return res.status(400).json({ message: 'Invalid emissions data' });
  }
  
  const date = new Date().toISOString().split('T')[0]; // 今天的日期
  const results = [];
  let totalAmount = 0;
  
  for (const item of emissions) {
    const { category, subCategory, value } = item;
    
    // 检查类别和子类别是否存在
    if (!emissionFactors[category] || !emissionFactors[category][subCategory]) {
      return res.status(400).json({ message: `Invalid category or sub-category: ${category} - ${subCategory}` });
    }
    
    // 计算碳排放量
    const factor = emissionFactors[category][subCategory];
    const amount = factor * value;
    totalAmount += amount;
    
    // 保存碳排放记录
    const emission = await CarbonEmission.create(userId, category, subCategory, amount, date);
    results.push(emission);
  }
  
  // 计算需要种植的树木数量（根据图片约为每28.8kg CO2需要种0.3棵树）
  const treesToPlant = (totalAmount / 28.8 * 0.3).toFixed(1);
  
  res.status(201).json({ 
    emissions: results, 
    totalAmount: totalAmount.toFixed(1),
    treesToPlant 
  });
};

exports.getUserEmissions = async (req, res) => {
  const userId = req.user.id;
  try {
    const emissions = await CarbonEmission.getByUserId(userId);
    res.json(emissions);
  } catch (error) {
    console.error('Error getting user emissions:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.getUserDailyEmissions = async (req, res) => {
  const userId = req.user.id;
  const { date } = req.query;
  
  if (!date) {
    return res.status(400).json({ message: 'Date is required' });
  }
  
  try {
    const emissions = await CarbonEmission.getByUserIdAndDate(userId, date);
    res.json(emissions);
  } catch (error) {
    console.error('Error getting user daily emissions:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.getTotalEmission = async (req, res) => {
  const userId = req.user.id;
  try {
    const total = await CarbonEmission.getTotalByUserId(userId);
    res.json({ total });
  } catch (error) {
    console.error('Error getting total emission:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.getEmissionFactors = (req, res) => {
  res.json({ factors: emissionFactors, units: unitMap });
};

// 导出用于测试的常量
exports.constants = {
  emissionFactors,
  unitMap
};