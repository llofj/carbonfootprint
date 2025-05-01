const axios = require('axios');
const jwt = require('jsonwebtoken');

// 创建测试用户token
const createTestToken = () => {
  const payload = {
    id: 1, // 假设ID为1的用户存在
    username: 'test'
  };
  
  return jwt.sign(
    payload, 
    process.env.JWT_SECRET || 'your-secret-key',
    { expiresIn: '1h' }
  );
};

// 测试排行榜API
const testLeaderboardAPI = async () => {
  try {
    const token = createTestToken();
    console.log('使用测试token:', token);
    
    // 测试获取排行榜
    console.log('\n测试获取排行榜API:');
    const leaderboardResponse = await axios.get('http://localhost:5000/api/leaderboard?limit=10', {
      headers: { Authorization: `Bearer ${token}` }
    });
    
    console.log('状态码:', leaderboardResponse.status);
    console.log('返回数据:', JSON.stringify(leaderboardResponse.data, null, 2));
    
    // 测试获取用户排名
    console.log('\n测试获取用户排名API:');
    const userRankResponse = await axios.get('http://localhost:5000/api/leaderboard/user', {
      headers: { Authorization: `Bearer ${token}` }
    });
    
    console.log('状态码:', userRankResponse.status);
    console.log('返回数据:', JSON.stringify(userRankResponse.data, null, 2));
    
    // 测试更新排名
    console.log('\n测试更新排名API:');
    const updateResponse = await axios.post('http://localhost:5000/api/leaderboard/update', {}, {
      headers: { Authorization: `Bearer ${token}` }
    });
    
    console.log('状态码:', updateResponse.status);
    console.log('返回数据:', JSON.stringify(updateResponse.data, null, 2));
    
  } catch (error) {
    console.error('API测试失败:', error.message);
    if (error.response) {
      console.error('错误状态码:', error.response.status);
      console.error('错误数据:', error.response.data);
    }
  }
};

// 运行测试
testLeaderboardAPI(); 