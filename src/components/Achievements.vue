<template>
  <div class="achievements-page">
    <h2>我的成就</h2>
    
    <!-- 错误提示 -->
    <div v-if="error" class="error-message">
      <i class="fas fa-exclamation-circle"></i>
      {{ error }}
    </div>
    
    <!-- 加载中提示 -->
    <div v-if="loading && !checkingAchievements" class="loading-container">
      <div class="loading-message">
        <i class="fas fa-spinner fa-spin"></i>
        <p>加载成就数据中...</p>
      </div>
    </div>
    
    <!-- 检查成就提示 -->
    <div v-if="checkingAchievements" class="checking-achievements-modal">
      <div class="checking-content">
        <i class="fas fa-spinner fa-spin"></i>
        <p>正在检查新成就...</p>
        <div v-if="checkCompleted && !hasNewAchievements" class="check-result">
          <i class="fas fa-info-circle"></i>
          <p>暂未解锁新成就，继续努力！</p>
          <button @click="dismissCheckResult" class="dismiss-btn">返回</button>
        </div>
        <div v-if="checkCompleted && hasNewAchievements" class="check-result success">
          <i class="fas fa-trophy"></i>
          <p>恭喜！您解锁了新成就！</p>
          <div class="new-achievements-list">
            <div v-for="achievement in newAchievements" :key="achievement.id" class="new-achievement-item">
              <i :class="['fas', achievement.icon]"></i>
              <span>{{ achievement.achievement_name }}</span>
            </div>
          </div>
          <button @click="dismissCheckResult" class="dismiss-btn success">查看成就</button>
        </div>
      </div>
    </div>
    
    <!-- 成就内容 - 仅在加载完成且无错误时显示 -->
    <div v-if="!loading && !error && !checkingAchievements">
      <div class="achievement-summary">
        <div class="summary-card">
          <h3>成就总数</h3>
          <div class="summary-count">{{ getUnlockedAchievementsCount() }} / {{ achievementTypes && achievementTypes.length || 0 }}</div>
        </div>
        
        <div class="summary-card">
          <h3>减排总量</h3>
          <div class="summary-count carbon-value">{{ userRank && userRank.carbon_reduction ? Number(userRank.carbon_reduction).toFixed(1) : carbonReduction.toFixed(1) }} kg CO₂</div>
        </div>
        
        <div class="summary-card">
          <h3>排行榜排名</h3>
          <div class="summary-count rank-value">#{{ userRank && userRank.rank ? userRank.rank : 'N/A' }}</div>
        </div>
      </div>
      
      <div v-if="achievementTypes && achievementTypes.length > 0">
        <div class="achievements-status">
          <p v-if="getUnlockedAchievementsCount() > 0" class="status-message unlocked-message">
            <i class="fas fa-medal"></i> 您已解锁 {{ getUnlockedAchievementsCount() }} 项成就，继续努力！
          </p>
          <p v-else class="status-message locked-message">
            <i class="fas fa-lock"></i> 您尚未解锁任何成就，立即开始减碳行动吧！
          </p>
        </div>
        
        <!-- 已解锁成就 -->
        <div v-if="unlockedAchievements.length > 0">
          <h3 class="section-title">
            <i class="fas fa-unlock-alt"></i> 已解锁的成就
          </h3>
          
          <div class="achievement-container">
            <div v-for="achievement in unlockedAchievements" :key="achievement.id" 
                 class="achievement-card unlocked"
                 :data-achievement-id="achievement.id">
              <div class="achievement-icon">
                <i :class="['fas', achievement.icon]" style="color: white;"></i>
              </div>
              <div class="achievement-info">
                <h3>{{ achievement.name }}</h3>
                <p>{{ achievement.description }}</p>
                <div class="unlock-date">
                  解锁于: {{ getUnlockDate(achievement.id) }}
                </div>
              </div>
            </div>
          </div>
        </div>
        
        <!-- 未解锁成就 -->
        <h3 class="section-title">
          <i class="fas fa-lock"></i> 待解锁的成就
        </h3>
        
        <div class="achievement-container">
          <div v-for="achievement in lockedAchievements" :key="'locked-'+achievement.id" 
               class="achievement-card locked"
               :data-achievement-id="achievement.id">
            <div class="achievement-icon">
              <i :class="['fas', achievement.icon]"></i>
            </div>
            <div class="achievement-info">
              <h3>{{ achievement.name }}</h3>
              <p>{{ achievement.description }}</p>
              <div class="locked-badge">
                <i class="fas fa-lock"></i> 未解锁
              </div>
              <div class="unlock-hint">
                {{ getUnlockHint(achievement) }}
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <div v-else-if="!loading" class="empty-state">
        <i class="fas fa-award empty-icon"></i>
        <p>暂无可用成就</p>
        <p class="empty-description">系统尚未配置任何成就，请稍后再试</p>
      </div>
      
      <div class="check-achievements">
        <button @click="checkNewAchievements" class="check-btn" :disabled="!achievementTypes || achievementTypes.length === 0 || loading">
          <i class="fas fa-sync-alt" :class="{'fa-spin': checkingAchievements}"></i> 检查新成就
        </button>
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
      userRank: null,
      loading: true,
      error: null,
      checkingAchievements: false,
      checkCompleted: false, 
      hasNewAchievements: false
    };
  },
  computed: {
    unlockedAchievements() {
      if (!this.achievementTypes || !this.userAchievements) return [];
      
      return this.achievementTypes.filter(achievement => 
        achievement && achievement.id && this.isUnlocked(achievement.id)
      );
    },
    lockedAchievements() {
      if (!this.achievementTypes || !this.userAchievements) return [];
      
      return this.achievementTypes.filter(achievement => 
        achievement && achievement.id && !this.isUnlocked(achievement.id)
      );
    },
    sortedAchievements() {
      // 检查achievementTypes是否存在且为数组
      if (!this.achievementTypes || !Array.isArray(this.achievementTypes) || this.achievementTypes.length === 0) {
        return [];
      }
      
      return [...this.achievementTypes].sort((a, b) => {
        // 确保a和b对象都有id属性
        if (!a || !b || !a.id || !b.id) return 0;
        
        const isUnlockedA = this.isUnlocked(a.id);
        const isUnlockedB = this.isUnlocked(b.id);
        
        if (isUnlockedA && !isUnlockedB) return -1;
        if (!isUnlockedA && isUnlockedB) return 1;
        
        return a.id.localeCompare(b.id);
      });
    }
  },
  async created() {
    try {
      this.loading = true;
      this.error = null;
      
      const token = localStorage.getItem('token');
      if (!token) {
        this.$router.push('/login');
        return;
      }
      
      // 先获取排行榜数据
      await this.loadUserRank();
      // 获取成就类型
      await this.loadAchievementTypes();
      // 获取用户成就
      await this.loadUserAchievements();
      // 最后获取碳减排量，优先使用排行榜数据
      if (!this.userRank || !this.userRank.carbon_reduction) {
        await this.loadCarbonReduction();
      } else {
        this.carbonReduction = this.userRank.carbon_reduction;
      }
    } catch (error) {
      console.error('Error loading achievements data:', error);
      this.error = '加载成就数据失败，请稍后再试';
    } finally {
      this.loading = false;
    }
  },
  methods: {
    async loadAchievementTypes() {
      try {
        const response = await axios.get('http://localhost:5000/api/achievement/types');
        
        // 确保响应数据是一个数组且数组中的每个项目都有id属性
        if (response.data && Array.isArray(response.data)) {
          // 深度复制数据以避免引用问题
          const validAchievements = response.data
            .filter(item => item && item.id)
            .map(item => ({...item}));
            
          // 确保复制后的数据仍然有效
          if (validAchievements.length > 0) {
            this.achievementTypes = validAchievements;
          } else {
            console.error('No valid achievement types found in response');
            this.achievementTypes = [];
          }
        } else {
          console.error('Achievement types data is not an array or is empty:', response.data);
          this.achievementTypes = [];
        }
      } catch (error) {
        console.error('Error loading achievement types:', error);
        this.achievementTypes = [];
        throw error; // 重新抛出错误以便上层处理
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
        const rankResponse = await axios.get('http://localhost:5000/api/leaderboard/user', {
          headers: { Authorization: `Bearer ${token}` }
        });
        
        if (rankResponse.data && rankResponse.data.carbon_reduction) {
          this.carbonReduction = rankResponse.data.carbon_reduction;
        } else {
          const carbonResponse = await axios.get('http://localhost:5000/api/achievement/carbon-reduction', {
            headers: { Authorization: `Bearer ${token}` }
          });
          this.carbonReduction = carbonResponse.data.carbon_reduction || 0;
        }
      } catch (error) {
        console.error('Error loading carbon reduction:', error);
        this.carbonReduction = 0;
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
      // 确保userAchievements存在且为数组
      if (!achievementId || !this.userAchievements || !Array.isArray(this.userAchievements)) {
        return false;
      }
      return this.userAchievements.some(a => a && a.achievement_id === achievementId);
    },
    
    getUnlockDate(achievementId) {
      if (!achievementId || !this.userAchievements || !Array.isArray(this.userAchievements)) {
        return '';
      }
      const achievement = this.userAchievements.find(a => a && a.achievement_id === achievementId);
      if (achievement && achievement.date) {
        return new Date(achievement.date).toLocaleDateString();
      }
      return '';
    },
    
    getUnlockedAchievementsCount() {
      if (!this.userAchievements || !Array.isArray(this.userAchievements) || 
          !this.achievementTypes || !Array.isArray(this.achievementTypes)) {
        return 0;
      }
      return this.userAchievements.filter(a => 
        a && a.achievement_id && this.achievementTypes.some(type => type && type.id === a.achievement_id)
      ).length;
    },
    
    // 获取解锁成就的提示信息
    getUnlockHint(achievement) {
      if (!achievement) return '';
      
      const hints = {
        'green_commuter': '多步行减少碳排放，累计超过5kg CO₂',
        'carbon_saver': '单日减少碳排放量达到10kg',
        'pet_lover': '升级您的虚拟宠物至5级',
        'eco_warrior': '累计碳减排量达到50kg CO₂',
        'stepping_master': '单日行走步数超过20000步',
        'diet_hero': '减少肉类消费减排量达到10kg CO₂',
        'pet_trainer': '通过训练获得1000经验值',
        'pet_expert': '宠物等级达到10级',
        'pet_master': '宠物等级达到20级',
        'experience_collector': '累计获得5000经验值'
      };
      
      return hints[achievement.id] || '继续减碳行动解锁此成就';
    },
    
    async checkNewAchievements() {
      try {
        this.checkingAchievements = true;
        this.checkCompleted = false;
        this.hasNewAchievements = false;
        this.error = null;
        
        const token = localStorage.getItem('token');
        if (!token) {
          this.$router.push('/login');
          return;
        }
        
        const response = await axios.get('http://localhost:5000/api/achievement/check', {
          headers: { Authorization: `Bearer ${token}` }
        });
        
        if (!response || !response.data) {
          throw new Error('服务器返回无效响应');
        }
        
        this.newAchievements = Array.isArray(response.data.newAchievements) 
          ? response.data.newAchievements.filter(a => a && a.id) 
          : [];
        
        this.checkCompleted = true;
        this.hasNewAchievements = this.newAchievements.length > 0;
        
        if (this.hasNewAchievements) {
          // 重新加载用户成就
          await this.loadUserAchievements();
          // 更新排行榜数据
          await axios.post('http://localhost:5000/api/leaderboard/update', {}, {
            headers: { Authorization: `Bearer ${token}` }
          });
          await this.loadUserRank();
          await this.loadCarbonReduction();
        }
      } catch (error) {
        console.error('Error checking achievements:', error);
        this.error = '检查新成就失败，请稍后再试';
        this.checkCompleted = true;
      }
    },
    
    // 关闭检查结果模态框
    dismissCheckResult() {
      this.checkingAchievements = false;
      this.checkCompleted = false;
      this.hasNewAchievements = false;
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
  position: relative;
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
  transition: transform 0.3s ease, box-shadow 0.3s ease;
}

.summary-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 6px 12px rgba(0,0,0,0.1);
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

.carbon-value {
  background: linear-gradient(135deg, #4CAF50, #8BC34A);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  font-size: 26px;
  font-weight: bold;
}

.rank-value {
  background: linear-gradient(135deg, #2196F3, #03A9F4);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  font-size: 26px;
  font-weight: bold;
}

.section-title {
  margin: 30px 0 15px;
  padding-bottom: 10px;
  border-bottom: 2px solid #f0f0f0;
  color: #424242;
}

.section-title i {
  margin-right: 8px;
  color: #4CAF50;
}

.achievements-status {
  margin-top: 20px;
  text-align: center;
}

.status-message {
  padding: 10px 15px;
  border-radius: 8px;
  display: inline-block;
}

.unlocked-message {
  background-color: rgba(76, 175, 80, 0.1);
  color: #2E7D32;
}

.locked-message {
  background-color: rgba(158, 158, 158, 0.1);
  color: #616161;
}

.status-message i {
  margin-right: 8px;
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
  transition: all 0.3s ease;
  border-left: 4px solid transparent;
}

.achievement-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 8px 15px rgba(0,0,0,0.1);
}

.achievement-card.unlocked {
  background: linear-gradient(to right, rgba(76, 175, 80, 0.1), rgba(255, 255, 255, 0.8));
  border-left: 4px solid #4CAF50;
}

.achievement-card.locked {
  background-color: #f5f5f5;
  opacity: 0.9;
  border-left: 4px solid #e0e0e0;
}

.achievement-icon {
  width: 50px;
  height: 50px;
  background-color: #e0e0e0;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.2rem;
  transition: all 0.3s ease;
  box-shadow: 0 2px 5px rgba(0,0,0,0.1);
}

.achievement-card.unlocked .achievement-icon {
  background: linear-gradient(135deg, #4CAF50, #8BC34A);
  box-shadow: 0 4px 8px rgba(76,175,80,0.3);
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
  display: inline-block;
  padding: 4px 8px;
  background-color: rgba(76,175,80,0.2);
  color: #2E7D32;
  border-radius: 4px;
  font-size: 12px;
  margin-top: 8px;
}

.locked-badge {
  display: inline-block;
  padding: 4px 8px;
  background-color: #e0e0e0;
  color: #757575;
  border-radius: 4px;
  font-size: 12px;
  margin-top: 8px;
}

.unlock-hint {
  font-size: 12px;
  color: #9e9e9e;
  margin-top: 10px;
  font-style: italic;
  line-height: 1.4;
}

.check-achievements {
  text-align: center;
  margin-bottom: 30px;
}

.check-btn {
  background: linear-gradient(135deg, #2196F3, #03A9F4);
  color: white;
  border: none;
  padding: 12px 24px;
  border-radius: 25px;
  cursor: pointer;
  font-size: 14px;
  transition: all 0.3s ease;
  box-shadow: 0 3px 6px rgba(33, 150, 243, 0.3);
  display: inline-flex;
  align-items: center;
  gap: 8px;
}

.check-btn:hover {
  background: linear-gradient(135deg, #1976D2, #0288D1);
  transform: translateY(-2px);
  box-shadow: 0 5px 15px rgba(33, 150, 243, 0.4);
}

.check-btn:disabled {
  background: linear-gradient(135deg, #B0BEC5, #90A4AE);
  cursor: not-allowed;
  transform: none;
  box-shadow: none;
}

.error-message {
  background-color: #ffebee;
  color: #c62828;
  padding: 15px;
  border-radius: 8px;
  margin-bottom: 20px;
  display: flex;
  align-items: center;
  gap: 10px;
  font-size: 14px;
  border-left: 4px solid #c62828;
}

.error-message i {
  font-size: 20px;
}

.empty-state {
  text-align: center;
  padding: 40px 20px;
  background-color: #f5f5f5;
  border-radius: 8px;
  margin: 30px 0;
}

.empty-icon {
  font-size: 50px;
  color: #bdbdbd;
  margin-bottom: 15px;
}

.empty-state p {
  margin: 5px 0;
  color: #616161;
}

.empty-description {
  font-size: 14px;
  color: #9e9e9e;
}

.loading-container {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 200px;
  margin: 30px 0;
}

.loading-message {
  text-align: center;
  color: #757575;
}

.loading-message i {
  font-size: 40px;
  color: #2196F3;
  margin-bottom: 15px;
  display: block;
}

/* 检查成就模态框 */
.checking-achievements-modal {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.7);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
}

.checking-content {
  background-color: #fff;
  border-radius: 12px;
  padding: 30px;
  width: 90%;
  max-width: 500px;
  box-shadow: 0 5px 25px rgba(0, 0, 0, 0.2);
  text-align: center;
}

.checking-content i.fa-spinner {
  font-size: 50px;
  color: #2196F3;
  margin-bottom: 20px;
  display: block;
}

.checking-content p {
  font-size: 18px;
  color: #424242;
  margin-bottom: 20px;
}

.check-result {
  margin-top: 20px;
  padding: 20px;
  border-radius: 8px;
  background-color: #f5f5f5;
}

.check-result.success {
  background-color: #E8F5E9;
}

.check-result i {
  font-size: 30px;
  color: #607D8B;
  margin-bottom: 10px;
}

.check-result.success i {
  color: #4CAF50;
}

.dismiss-btn {
  background-color: #607D8B;
  color: white;
  border: none;
  padding: 10px 20px;
  border-radius: 25px;
  cursor: pointer;
  font-size: 14px;
  margin-top: 15px;
  transition: all 0.3s ease;
}

.dismiss-btn:hover {
  background-color: #455A64;
}

.dismiss-btn.success {
  background-color: #4CAF50;
}

.dismiss-btn.success:hover {
  background-color: #388E3C;
}

.new-achievements-list {
  margin: 15px 0;
}

.new-achievement-item {
  display: flex;
  align-items: center;
  gap: 10px;
  margin: 10px 0;
  padding: 10px;
  background-color: rgba(76, 175, 80, 0.1);
  border-radius: 6px;
  font-size: 14px;
}

.new-achievement-item i {
  color: #4CAF50;
  font-size: 16px;
  margin: 0;
}
</style>