<template>
  <div class="leaderboard-page">
    <h2>碳减排排行榜</h2>
    
    <div class="leaderboard-header">
      <div class="update-section">
        <button @click="updateLeaderboard" class="update-btn">
          <i class="fas fa-sync-alt"></i> 更新排名
        </button>
      </div>
      
      <div class="filter-section">
        <select v-model="limit" @change="loadLeaderboard">
          <option :value="5">显示前5名</option>
          <option :value="10">显示前10名</option>
          <option :value="20">显示前20名</option>
        </select>
      </div>
    </div>
    
    <div class="my-rank" v-if="userRank">
      <div class="rank-badge">#{{ userRank.rank }}</div>
      <div class="rank-details">
        <div class="rank-username">{{ username }}</div>
        <div class="rank-reduction">减排量: {{ userRank.carbon_reduction.toFixed(1) }} kg CO₂</div>
      </div>
    </div>
    
    <div class="leaderboard-container">
      <div class="leaderboard-row header">
        <div class="rank-column">排名</div>
        <div class="user-column">用户</div>
        <div class="reduction-column">减排量 (kg CO₂)</div>
      </div>
      
      <div v-for="(entry, index) in leaderboard" :key="index" 
           class="leaderboard-row" 
           :class="{ 'highlighted': isCurrentUser(entry.user_id) }">
        <div class="rank-column">
          <div class="rank-number" :class="getRankClass(entry.rank)">{{ entry.rank }}</div>
        </div>
        <div class="user-column">{{ entry.username }}</div>
        <div class="reduction-column">{{ entry.carbon_reduction.toFixed(1) }}</div>
      </div>
      
      <div v-if="leaderboard.length === 0" class="no-data">
        暂无排行数据
      </div>
    </div>
    
    <div class="leaderboard-tips">
      <h3>如何提高排名?</h3>
      <ul>
        <li>多步行减少碳排放</li>
        <li>通过碳排放计算器记录您的低碳行为</li>
        <li>喂养并升级您的虚拟宠物</li>
        <li>完成成就任务获得额外奖励</li>
      </ul>
    </div>
  </div>
</template>

<script>
import axios from 'axios';

export default {
  data() {
    return {
      leaderboard: [],
      userRank: null,
      username: '',
      limit: 10
    };
  },
  async created() {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        this.$router.push('/');
        return;
      }
      
      // 获取用户信息
      const userResponse = await axios.get('http://localhost:5000/api/auth/user', {
        headers: { Authorization: `Bearer ${token}` }
      });
      this.username = userResponse.data.username;
      
      await this.loadLeaderboard();
    } catch (error) {
      console.error('Error loading leaderboard data:', error);
    }
  },
  methods: {
    async loadLeaderboard() {
      try {
        const token = localStorage.getItem('token');
        const response = await axios.get(`http://localhost:5000/api/leaderboard?limit=${this.limit}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        
        this.leaderboard = response.data.leaderboard;
        this.userRank = response.data.userRank;
      } catch (error) {
        console.error('Error loading leaderboard:', error);
      }
    },
    
    async updateLeaderboard() {
      try {
        const token = localStorage.getItem('token');
        await axios.post('http://localhost:5000/api/leaderboard/update', {}, {
          headers: { Authorization: `Bearer ${token}` }
        });
        
        await this.loadLeaderboard();
        alert('排行榜已更新');
      } catch (error) {
        console.error('Error updating leaderboard:', error);
      }
    },
    
    isCurrentUser(userId) {
      return this.userRank && this.userRank.user_id === userId;
    },
    
    getRankClass(rank) {
      if (rank === 1) return 'gold';
      if (rank === 2) return 'silver';
      if (rank === 3) return 'bronze';
      return '';
    }
  }
};
</script>

<style scoped>
.leaderboard-page {
  max-width: 800px;
  margin: 0 auto;
  padding: 20px;
  font-family: 'Arial', sans-serif;
}

.leaderboard-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.update-btn {
  background-color: #2196F3;
  color: white;
  border: none;
  border-radius: 20px;
  padding: 8px 16px;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 8px;
  transition: background-color 0.3s;
}

.update-btn:hover {
  background-color: #1976D2;
}

.filter-section select {
  padding: 8px;
  border-radius: 4px;
  border: 1px solid #ddd;
}

.my-rank {
  background-color: #e3f2fd;
  border-radius: 8px;
  padding: 15px;
  display: flex;
  align-items: center;
  gap: 15px;
  margin-bottom: 20px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
}

.rank-badge {
  background-color: #2196F3;
  color: white;
  width: 40px;
  height: 40px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: bold;
}

.rank-details {
  flex: 1;
}

.rank-username {
  font-weight: bold;
  font-size: 16px;
}

.rank-reduction {
  color: #4CAF50;
  font-size: 14px;
}

.leaderboard-container {
  background-color: #fff;
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
  margin-bottom: 30px;
}

.leaderboard-row {
  display: flex;
  padding: 12px 15px;
  border-bottom: 1px solid #eee;
}

.leaderboard-row:last-child {
  border-bottom: none;
}

.leaderboard-row.header {
  background-color: #f5f5f5;
  font-weight: bold;
  color: #555;
}

.leaderboard-row.highlighted {
  background-color: #e8f5e9;
}

.rank-column {
  width: 70px;
  display: flex;
  align-items: center;
}

.user-column {
  flex: 1;
  display: flex;
  align-items: center;
}

.reduction-column {
  width: 150px;
  display: flex;
  align-items: center;
  justify-content: flex-end;
  color: #4CAF50;
  font-weight: bold;
}

.rank-number {
  width: 30px;
  height: 30px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  background-color: #eee;
  font-size: 14px;
}

.rank-number.gold {
  background-color: #FFD700;
  color: #fff;
}

.rank-number.silver {
  background-color: #C0C0C0;
  color: #fff;
}

.rank-number.bronze {
  background-color: #CD7F32;
  color: #fff;
}

.no-data {
  padding: 30px;
  text-align: center;
  color: #999;
  font-style: italic;
}

.leaderboard-tips {
  background-color: #f9f9f9;
  border-radius: 8px;
  padding: 15px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
}

.leaderboard-tips h3 {
  margin-top: 0;
  color: #555;
}

.leaderboard-tips ul {
  margin: 0;
  padding-left: 20px;
}

.leaderboard-tips li {
  margin-bottom: 8px;
  color: #666;
}
</style>