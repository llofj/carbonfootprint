// backend/controllers/carbonController.js
const CarbonEmission = require('../models/CarbonEmission');

// 碳排放系数
const emissionFactors = {
  '衣': {
    '涤纶织物': 30.0,
    '纯棉T恤': 7.0,
    '洗衣液': 2.5
  },
  '食': {
    '白酒': 3.5,
    '啤酒': 0.3,
    '吸烟': 2.0,
    '羊肉': 25.0,
    '牛肉': 30.0,
    '猪肉': 8.0,
    '炸鸡': 7.0,
    '鸡蛋': 3.0,
    '土豆': 0.5,
    '米饭': 3.0,
    '花生': 1.2,
    '酸奶': 2.0,
    '西兰花': 1.0,
    '豆腐': 1.5,
    '牛奶': 4.0,
    '西红柿': 0.6,
    '扁豆': 1.0
  },
  '住': {
    '用水': 1.2,
    '用电': 0.8,
    '天然气': 2.5
  },
  '行': {
    '轮船': 0.05,
    '公交车': 0.12,
    '私家电车': 0.06,
    '私家油车': 0.30,
    '火车': 0.08,
    '飞机': 0.35
  },
  '用': {
    '塑料袋': 0.05,
    '纸巾': 1.0,
    '电子设备': 1.5
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

exports.saveReduction = async (req, res) => {
  console.log('开始处理saveReduction请求:', req.path);
  console.log('请求头:', req.headers);
  console.log('用户ID:', req.user?.id);
  
  try {
    if (!req.user || !req.user.id) {
      console.error('未找到用户ID, 可能是用户未登录或认证失败');
      return res.status(401).json({ 
        error: '认证失败，请重新登录', 
        details: '无法获取用户ID'
      });
    }
    
    const userId = req.user.id;
    console.log(`处理用户${userId}的减碳保存请求`);
    
    const { activities } = req.body;
    console.log('接收到的activities数据:', JSON.stringify(activities));
    
    if (!activities || !Array.isArray(activities) || activities.length === 0) {
      console.error('缺少必要参数:', {
        isArray: Array.isArray(activities),
        length: activities ? activities.length : 0
      });
      return res.status(400).json({ error: '缺少必要参数' });
    }

    // 计算当前保存的减碳量（确保转换为数字类型）
    const totalReduction = activities.reduce((sum, activity) => {
      const reduction = parseFloat(activity.reduction) || 0;
      return sum + reduction;
    }, 0);

    if (totalReduction <= 0) {
      console.error('提交的减碳量必须大于0, 实际:', totalReduction);
      return res.status(400).json({ error: '减碳量必须大于0' });
    }

    console.log(`用户${userId}提交的减碳活动:`, activities);
    console.log(`计算的总减碳量: ${totalReduction}kg`);

    try {
      // 使用事务处理，确保数据一致性
      const pool = require('../config/db');
      console.log('获取数据库连接池');
      
      let client;
      try {
        console.log('尝试获取数据库客户端');
        client = await pool.connect();
        console.log('成功获取数据库客户端');
      } catch (dbConnError) {
        console.error('数据库连接失败:', dbConnError);
        throw new Error('数据库连接失败: ' + dbConnError.message);
      }
  
      try {
        // 开始事务
        console.log('开始数据库事务');
        await client.query('BEGIN');
        
        // 直接查询用户当前在leaderboard表中的记录
        console.log(`查询用户${userId}在leaderboard表中的记录`);
        const leaderboardResult = await client.query(
          'SELECT * FROM leaderboard WHERE user_id = $1',
          [userId]
        );
        console.log('查询结果:', leaderboardResult.rows);
        
        let newTotalReduction = totalReduction;
        let currentReduction = 0;
        
        if (leaderboardResult.rows.length === 0) {
          // 用户不在排行榜中，插入新记录
          console.log(`用户${userId}不在排行榜中，创建新记录`);
          await client.query(
            'INSERT INTO leaderboard (user_id, carbon_reduction, date, rank) VALUES ($1, $2, $3, 1)',
            [userId, totalReduction, new Date()]
          );
          console.log(`为用户${userId}创建新排行榜记录，初始减碳量为${totalReduction}kg`);
        } else {
          // 用户在排行榜中，更新记录（当前减碳量 + 新减碳量）
          currentReduction = parseFloat(leaderboardResult.rows[0].carbon_reduction) || 0;
          newTotalReduction = currentReduction + totalReduction;
          
          console.log(`用户${userId}已在排行榜中，更新记录`);
          console.log(`当前减碳量: ${currentReduction}kg, 新增: ${totalReduction}kg, 总计: ${newTotalReduction}kg`);
          
          await client.query(
            'UPDATE leaderboard SET carbon_reduction = $1, date = $2 WHERE user_id = $3',
            [newTotalReduction, new Date(), userId]
          );
          console.log(`更新用户${userId}的排行榜记录，减碳总量从${currentReduction}kg增加到${newTotalReduction}kg`);
        }
        
        // 更新排名
        console.log('开始更新所有用户排名');
        await client.query(`
          UPDATE leaderboard AS l
          SET rank = r.rnk
          FROM (
            SELECT id, RANK() OVER (ORDER BY carbon_reduction DESC) AS rnk
            FROM leaderboard
          ) AS r
          WHERE l.id = r.id
        `);
        console.log('所有用户排名更新完成');
        
        // 提交事务
        console.log('提交数据库事务');
        await client.query('COMMIT');
        console.log('事务提交成功');
        
        // 构造返回数据
        const responseData = {
          success: true,
          data: {
            // 这次保存的减碳量
            totalReduction: totalReduction,
            // 当前的总减碳量
            currentReduction: currentReduction,
            // 更新后的总减碳量
            newTotalReduction: newTotalReduction
          },
          message: '减碳记录保存成功'
        };
        
        console.log('返回数据:', responseData);
        
        // 返回简单且清晰的响应结构
        return res.status(200).json(responseData);
      } catch (error) {
        // 回滚事务
        console.error('数据库操作失败，回滚事务:', error);
        await client.query('ROLLBACK');
        console.log('事务已回滚');
        throw error;
      } finally {
        // 释放客户端
        if (client) {
          console.log('释放数据库客户端');
          client.release();
        }
      }
    } catch (error) {
      console.error('保存减碳记录失败 (数据库错误):', error);
      return res.status(500).json({ 
        error: '保存减碳记录失败', 
        details: error.message,
        stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
      });
    }
  } catch (error) {
    console.error('保存减碳记录失败 (一般错误):', error);
    return res.status(500).json({ 
      error: '保存减碳记录失败', 
      details: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
};

// 导出用于测试的常量
exports.constants = {
  emissionFactors,
  unitMap
};