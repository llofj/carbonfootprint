<template>
  <div class="achievements-page">
    <h2>我的成就</h2>
    
    <div class="achievement-summary">
      <div class="summary-card">
        <h3>成就总数</h3>
        <div class="summary-count">{{ userAchievements.length }} / {{ achievementTypes.length }}</div>
      </div>
      
      <div class="summary-card">
        <h3>减排总量</h3>
        <div class="summary-count">{{ carbonReduction.toFixed(1) }} kg CO₂</div>
      </div>
      
      <div class="summary-card">
        <h3>排行榜排名</h3>
        <div class="summary-count">#{{ userRank ? userRank.rank : 'N/A' }}</div>
      </div>
    </div>
    
    <div class="achievement-container">
      <div v-for="achievement in achievementTypes" :key="achievement.id" 
           class="achievement-card" 
           :class="{ 'unlocked': isUnlocked(achievement.id) }">
        <div class="achievement-icon">
          <i :class="['fas', achievement.icon]"></i>
        </div>
        <div class="achievement-info">
          <h3>{{ achievement.name }}</h3>
          <p>{{ achievement.description }}</p>
          <div v-if="isUnlocked(achievement.id)" class="unlock-date">
            解锁于: {{ getUnlockDate(achievement.id) }}
          </div>
          <div v-else class="locked-badge">
            未解锁
          </div>
        </div>
      </div>
    </div>
    
    <div class="check-achievements">
      <button @click="checkNewAchievements" class="check-btn">
        <i class="fas fa-sync-alt"></i> 检查新成就
      </button>
    </div>
    
    <div v-if="newAchievements.length > 0" class="new-achievements">
      <h3>新解锁成就</h3>
      <div class="achievement-list">
        <div v-for="achievement in newAchievements" :key="achievement.id" class="new-achievement">
          <i :class="['fas', achievement.icon]"></i>
          <span>{{ achievement.achievement_name }}</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import axios from 'axios';

export default {
  data() {
    return {
      achievementTypes: [],
      userAchievements: [],
      newAchievements: [],
      carbonReduction: 0,
      userRank: null
    };
  },
  async created() {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        this.$router.push('/login');
        return;
      }
      
      await this.loadAchievementTypes();
      await this.loadUserAchievements();
      await this.loadCarbonReduction();
      await this.loadUserRank();
    } catch (error) {
      console.error('Error loading achievements data:', error);
    }
  },
  methods: {
    async loadAchievementTypes() {
      try {
        const response = await axios.get('http://localhost:5000/api/achievement/types');
        this.achievementTypes = response.data;
      } catch (error) {
        console.error('Error loading achievement types:', error);
      }
    },
    
    async loadUserAchievements() {
      try {
        const token = localStorage.getItem('token');
        const response = await axios.get('http://localhost:5000/api/achievement/user', {
          headers: { Authorization: `Bearer ${token}` }
        });
        this.userAchievements = response.data;
      } catch (error) {
        console.error('Error loading user achievements:', error);
      }
    },
    
    async loadCarbonReduction() {
      try {
        const token = localStorage.getItem('token');
        const response = await axios.get('http://localhost:5000/api/achievement/carbon-reduction', {
          headers: { Authorization: `Bearer ${token}` }
        });
        this.carbonReduction = response.data.carbon_reduction || 0;
      } catch (error) {
        console.error('Error loading carbon reduction:', error);
      }
    },
    
    async loadUserRank() {
      try {
        const token = localStorage.getItem('token');
        const response = await axios.get('http://localhost:5000/api/leaderboard/user', {
          headers: { Authorization: `Bearer ${token}` }
        });
        this.userRank = response.data;
      } catch (error) {
        console.error('Error loading user rank:', error);
      }
    },
    
    isUnlocked(achievementId) {
      return this.userAchievements.some(a => a.achievement_id === achievementId);
    },
    
    getUnlockDate(achievementId) {
      const achievement = this.userAchievements.find(a => a.achievement_id === achievementId);
      if (achievement) {
        return new Date(achievement.date).toLocaleDateString();
      }
      return '';
    },
    
    async checkNewAchievements() {
      try {
        const token = localStorage.getItem('token');
        const response = await axios.get('http://localhost:5000/api/achievement/check', {
          headers: { Authorization: `Bearer ${token}` }
        });
        
        this.newAchievements = response.data.newAchievements;
        
        if (this.newAchievements.length > 0) {
          alert('恭喜！您解锁了新成就');
          // 重新加载用户成就
          await this.loadUserAchievements();
          // 更新排行榜数据
          await axios.post('http://localhost:5000/api/leaderboard/update', {}, {
            headers: { Authorization: `Bearer ${token}` }
          });
          await this.loadUserRank();
          await this.loadCarbonReduction();
        } else {
          alert('暂未解锁新成就，继续努力！');
        }
      } catch (error) {
        console.error('Error checking achievements:', error);
      }
    }
  }
};
</script>

<style scoped>
.achievements-page {
  max-width: 800px;
  margin: 0 auto;
  padding: 20px;
  font-family: 'Arial', sans-serif;
}

.achievement-summary {
  display: flex;
  gap: 20px;
  margin-bottom: 30px;
}

.summary-card {
  flex: 1;
  background-color: #f5f5f5;
  border-radius: 8px;
  padding: 15px;
  text-align: center;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
}

.summary-card h3 {
  margin-top: 0;
  color: #555;
  font-size: 14px;
}

.summary-count {
  font-size: 24px;
  font-weight: bold;
  color: #2196F3;
}

.achievement-container {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
  gap: 20px;
  margin-bottom: 30px;
}

.achievement-card {
  background-color: #f9f9f9;
  border-radius: 8px;
  padding: 15px;
  display: flex;
  align-items: center;
  gap: 15px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
  transition: transform 0.3s ease;
}

.achievement-card:hover {
  transform: translateY(-5px);
}

.achievement-card.unlocked {
  background-color: #e8f5e9;
  border-left: 4px solid #4CAF50;
}

.achievement-icon {
  width: 40px;
  height: 40px;
  background-color: #e0e0e0;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
}

.achievement-card.unlocked .achievement-icon {
  background-color: #4CAF50;
  color: white;
}

.achievement-icon i {
  font-size: 20px;
}

.achievement-info {
  flex: 1;
}

.achievement-info h3 {
  margin: 0 0 5px 0;
  font-size: 16px;
}

.achievement-info p {
  margin: 0 0 10px 0;
  font-size: 12px;
  color: #666;
}

.unlock-date {
  font-size: 12px;
  color: #4CAF50;
}

.locked-badge {
  font-size: 12px;
  color: #9e9e9e;
  font-style: italic;
}

.check-achievements {
  text-align: center;
  margin-bottom: 30px;
}

.check-btn {
  background-color: #2196F3;
  color: white;
  border: none;
  padding: 10px 20px;
  border-radius: 4px;
  cursor: pointer;
  font-size: 14px;
  transition: background-color 0.3s;
}

.check-btn:hover {
  background-color: #0d8bf0;
}

.new-achievements {
  background-color: #f5f5f5;
  border-radius: 8px;
  padding: 15px;
  margin-top: 20px;
}

.new-achievements h3 {
  margin-top: 0;
  color: #333;
  font-size: 18px;
}

.achievement-list {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
}

.new-achievement {
  background-color: #e8f5e9;
  border-radius: 4px;
  padding: 8px 12px;
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 14px;
}

.new-achievement i {
  color: #4CAF50;
}
</style>