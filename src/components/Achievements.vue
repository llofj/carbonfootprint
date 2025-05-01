<template>
  <div class="achievements-page">
    <h2 class="page-title">我的成就</h2>
    
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
          <div class="summary-card-content">
            <div class="card-title">成就总数</div>
            <div class="summary-count">{{ getUnlockedAchievementsCount() }} / {{ achievementTypes && achievementTypes.length || 0 }}</div>
          </div>
        </div>
        
        <div class="summary-card">
          <div class="summary-card-content">
            <div class="card-title">减排总量</div>
            <div class="summary-count carbon-value">{{ userRank && userRank.carbon_reduction ? Number(userRank.carbon_reduction).toFixed(1) : carbonReduction.toFixed(1) }} kg CO₂</div>
          </div>
        </div>
        
        <div class="summary-card">
          <div class="summary-card-content">
            <div class="card-title">排行榜排名</div>
            <div class="summary-count rank-value">#{{ userRank && userRank.rank ? userRank.rank : 'N/A' }}</div>
          </div>
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
  max-width: 1050px;
  min-height: 80vh;
  margin: 0 auto;
  padding: 30px 35px;
  font-family: 'Arial', sans-serif;
  position: relative;
  background-color: rgba(255, 255, 255, 0.85);
  border-radius: 20px;
  box-shadow: 0 15px 50px rgba(0, 0, 0, 0.2);
  backdrop-filter: blur(12px);
  border: 1px solid rgba(255, 255, 255, 0.6);
  overflow: hidden;
  z-index: 2;
}

/* 添加壁纸背景效果 */
.achievements-page::before {
  content: '';
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-image: url('../assets/carbon_5.jpg');
  background-size: cover;
  background-position: center;
  background-attachment: fixed;
  filter: brightness(0.9) saturate(1.1) contrast(1.1);
  z-index: -1;
  opacity: 0.9;
}

/* 添加装饰元素 */
.achievements-page::after {
  content: '🏆';
  position: absolute;
  top: 20px;
  right: 20px;
  font-size: 40px;
  opacity: 0.1;
  transform: rotate(15deg);
  filter: blur(2px);
  animation: float 6s ease-in-out infinite;
  z-index: -1;
}

@keyframes float {
  0%, 100% { transform: translateY(0) rotate(15deg); }
  50% { transform: translateY(-15px) rotate(12deg); }
}

/* 修改页面标题样式，与虚拟宠物页面保持一致 */
.page-title {
  color: #1e3d59;
  text-align: center;
  margin-bottom: 0.5rem;
  font-size: 32px;
  font-weight: 600;
  text-shadow: 1px 1px 2px rgba(0, 0, 0, 0.1);
}

@media (max-width: 768px) {
  .page-title {
    font-size: 32px;
  }
  
  .achievement-summary {
    flex-direction: column;
    gap: 20px;
  }
  
  .summary-card {
    padding: 18px;
  }
  
  .summary-count, .carbon-value, .rank-value {
    font-size: 36px;
  }
}

.page-actions {
  display: none;
}

/* 统一数据卡片样式 */
.achievement-summary {
  display: flex;
  gap: 20px;
  margin-bottom: 40px;
  perspective: 1000px;
  padding: 10px 5px;
}

.summary-card {
  flex: 1;
  background: rgba(255, 255, 255, 0.85);
  border-radius: 20px;
  padding: 20px 15px;
  text-align: center;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.15);
  transition: all 0.4s cubic-bezier(0.165, 0.84, 0.44, 1);
  position: relative;
  overflow: hidden;
  animation: cardAppear 0.6s forwards;
  animation-delay: calc(var(--i, 0) * 0.15s);
  opacity: 0;
  transform: translateY(15px) rotateX(10deg);
  backdrop-filter: blur(5px);
  border: 1px solid rgba(255, 255, 255, 0.6);
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  min-height: 150px;
}

.summary-card h3 {
  margin: 0 0 15px 0;
  color: #1e3d59;
  font-size: 16px;
  font-weight: 500;
  position: relative;
  display: block;
  letter-spacing: 0.5px;
  z-index: 2;
  opacity: 0.7;
  text-align: center;
}

.summary-count {
  font-size: 42px;
  font-weight: 700;
  margin: 10px 0 0 0;
  position: relative;
  display: block;
  color: #1e3d59;
  background: linear-gradient(135deg, #1e3d59, #64B5F6);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  text-shadow: 0 3px 5px rgba(0,0,0,0.05);
  z-index: 2;
  line-height: 1.2;
}

.carbon-value, .rank-value {
  background: linear-gradient(135deg, #1e3d59, #64B5F6);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  font-size: 42px;
  font-weight: 700;
  line-height: 1.2;
  margin: 10px 0 0 0;
  display: block;
}

/* 调整卡片内部布局 */
.summary-card-content {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  width: 100%;
}

/* 将绿色系改为蓝色系 */
.section-title {
  margin: 40px 0 25px;
  padding-bottom: 12px;
  border-bottom: 1px solid rgba(0,0,0,0.08);
  color: #1e3d59;
  font-size: 22px;
  position: relative;
  animation: fadeIn 0.6s ease-out;
  animation-delay: 0.3s;
  opacity: 0;
  animation-fill-mode: forwards;
  font-weight: 600;
  letter-spacing: 0.5px;
}

.section-title::after {
  content: '';
  position: absolute;
  bottom: -1px;
  left: 0;
  width: 100px;
  height: 3px;
  border-radius: 1.5px;
}

.section-title:nth-of-type(1)::after {
  background: linear-gradient(90deg, #1e3d59, #64B5F6);
}

.section-title:nth-of-type(2)::after {
  background: linear-gradient(90deg, #e74c3c, #c0392b);
}

.section-title i {
  margin-right: 12px;
  position: relative;
  top: 1px;
}

.section-title:nth-of-type(1) i {
  color: #1e3d59;
}

.section-title:nth-of-type(2) i {
  color: #e74c3c;
}

.achievements-status {
  margin: 35px 0;
  text-align: center;
}

.status-message {
  padding: 16px 28px;
  border-radius: 50px;
  display: inline-block;
  font-size: 16px;
  font-weight: 500;
  box-shadow: 0 8px 20px rgba(0,0,0,0.1);
  animation: fadeIn 0.6s ease-out;
  animation-delay: 0.3s;
  opacity: 0;
  animation-fill-mode: forwards;
  position: relative;
  overflow: hidden;
  backdrop-filter: blur(4px);
}

.status-message::before {
  content: '';
  position: absolute;
  top: -10px;
  left: -10px;
  right: -10px;
  bottom: -10px;
  background: linear-gradient(45deg, rgba(255,255,255,0) 0%, rgba(255,255,255,0.1) 50%, rgba(255,255,255,0) 100%);
  transform: rotate(25deg) translateX(-200%);
  animation: shimmer 3s infinite;
}

@keyframes shimmer {
  to { transform: rotate(25deg) translateX(200%); }
}

@keyframes fadeIn {
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
}

.unlocked-message {
  background-color: rgba(33, 150, 243, 0.12);
  color: #044a87;
  border: 1px solid rgba(33, 150, 243, 0.3);
}

.locked-message {
  background-color: rgba(158, 158, 158, 0.12);
  color: #424242;
  border: 1px solid rgba(158, 158, 158, 0.3);
}

.status-message i {
  margin-right: 10px;
  font-size: 18px;
}

.achievement-container {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
  gap: 25px;
  margin-bottom: 40px;
  border-top: none;
  padding-top: 5px;
  perspective: 1000px;
}

.achievement-card {
  background: rgba(255, 255, 255, 0.9);
  border-radius: 16px;
  padding: 22px;
  display: flex;
  align-items: center;
  gap: 22px;
  box-shadow: 0 10px 30px rgba(0,0,0,0.08);
  transition: all 0.4s cubic-bezier(0.165, 0.84, 0.44, 1);
  border-left: 5px solid transparent;
  position: relative;
  overflow: hidden;
  animation: cardFadeIn 0.6s forwards;
  animation-delay: calc(var(--j, 0) * 0.1s);
  opacity: 0;
  transform: translateY(15px);
  backdrop-filter: blur(4px);
}

.achievement-card:nth-child(3n+1) { --j: 1; }
.achievement-card:nth-child(3n+2) { --j: 2; }
.achievement-card:nth-child(3n+3) { --j: 3; }

@keyframes cardFadeIn {
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.achievement-card::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: radial-gradient(circle at top right, rgba(255,255,255,0.8), transparent 70%);
  opacity: 0;
  transition: opacity 0.3s ease;
}

.achievement-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 15px 35px rgba(30, 61, 89, 0.2);
}

.achievement-card:hover::before {
  opacity: 1;
}

.achievement-card.unlocked {
  background: linear-gradient(to right, rgba(30, 61, 89, 0.08), rgba(255, 255, 255, 0.9));
  border-left: 5px solid #1e3d59;
}

.achievement-card.locked {
  background: rgba(250, 250, 250, 0.85);
  opacity: 0.9;
  border-left: 5px solid #bdbdbd;
}

.achievement-icon {
  width: 65px;
  height: 65px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 24px;
  transition: all 0.5s ease;
  box-shadow: 0 8px 20px rgba(0,0,0,0.15);
  flex-shrink: 0;
  position: relative;
  z-index: 2;
}

.achievement-card.unlocked .achievement-icon {
  background: linear-gradient(135deg, #1e3d59, #64B5F6);
  box-shadow: 0 10px 25px rgba(30, 61, 89, 0.4);
  transform: scale(1.05);
}

.achievement-card.unlocked:hover .achievement-icon {
  animation: pulse 2s infinite;
}

.achievement-info {
  flex: 1;
}

.achievement-info h3 {
  margin: 0 0 8px 0;
  font-size: 18px;
  color: #2c3e50;
  font-weight: 600;
  position: relative;
}

.achievement-card.unlocked .achievement-info h3 {
  background: linear-gradient(135deg, #2196F3, #1976D2);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
}

.achievement-info p {
  margin: 0 0 12px 0;
  font-size: 14px;
  color: #555;
  line-height: 1.5;
}

.unlock-date, .locked-badge {
  display: inline-block;
  padding: 6px 14px;
  border-radius: 50px;
  font-size: 12px;
  margin-top: 10px;
  font-weight: 500;
  letter-spacing: 0.5px;
  position: relative;
  z-index: 2;
  backdrop-filter: blur(2px);
  box-shadow: 0 3px 10px rgba(0,0,0,0.06);
}

.unlock-date {
  background-color: rgba(30, 61, 89, 0.1);
  color: #1e3d59;
  border: 1px solid rgba(30, 61, 89, 0.2);
}

.locked-badge {
  background-color: rgba(224, 224, 224, 0.5);
  color: #616161;
  border: 1px solid rgba(224, 224, 224, 0.8);
}

.unlock-hint {
  font-size: 13px;
  color: #757575;
  margin-top: 12px;
  font-style: italic;
  line-height: 1.5;
  padding-left: 10px;
  border-left: 3px solid #e0e0e0;
  transition: all 0.3s ease;
  background-color: rgba(250, 250, 250, 0.5);
  padding: 8px 12px;
  border-radius: 0 8px 8px 0;
}

.achievement-card:hover .unlock-hint {
  border-left-color: #1e3d59;
  color: #4e4e4e;
  background-color: rgba(250, 250, 250, 0.8);
}

.check-achievements {
  text-align: center;
  margin: 40px 0 10px;
}

/* 修改按钮颜色为蓝色系 */
.check-btn {
  background: linear-gradient(135deg, #1e3d59, #64B5F6);
  color: white;
  border: none;
  padding: 14px 30px;
  border-radius: 50px;
  cursor: pointer;
  font-size: 16px;
  font-weight: 600;
  transition: all 0.3s ease;
  box-shadow: 0 10px 30px rgba(30, 61, 89, 0.3);
  display: inline-flex;
  align-items: center;
  gap: 12px;
  position: relative;
  overflow: hidden;
  letter-spacing: 0.5px;
}

.check-btn:hover {
  background: linear-gradient(135deg, #15324a, #42A5F5);
  transform: translateY(-5px);
  box-shadow: 0 15px 35px rgba(30, 61, 89, 0.4);
}

.check-btn:active {
  transform: translateY(-2px);
}

.check-btn:disabled {
  background: linear-gradient(135deg, #B0BEC5, #90A4AE);
  cursor: not-allowed;
  transform: none;
  box-shadow: 0 3px 10px rgba(176,190,197,0.3);
}

.error-message {
  background-color: #fff5f5;
  color: #e53935;
  padding: 20px;
  border-radius: 12px;
  margin-bottom: 30px;
  display: flex;
  align-items: center;
  gap: 15px;
  font-size: 15px;
  border-left: 5px solid #e53935;
  box-shadow: 0 8px 25px rgba(229,57,53,0.15);
  animation: shake 0.5s ease-in-out;
}

@keyframes shake {
  0%, 100% { transform: translateX(0); }
  10%, 30%, 50%, 70%, 90% { transform: translateX(-5px); }
  20%, 40%, 60%, 80% { transform: translateX(5px); }
}

.error-message i {
  font-size: 24px;
}

.empty-state {
  text-align: center;
  padding: 70px 30px;
  background-color: rgba(249, 249, 249, 0.6);
  border-radius: 15px;
  margin: 50px 0;
  border: 1px dashed #e0e0e0;
  animation: fadeIn 0.6s ease-out;
}

.empty-icon {
  font-size: 70px;
  color: #bdbdbd;
  margin-bottom: 20px;
  animation: bounceIn 1s ease-out;
}

@keyframes bounceIn {
  0% { transform: scale(0.5); opacity: 0; }
  50% { transform: scale(1.2); }
  100% { transform: scale(1); opacity: 1; }
}

.empty-state p {
  margin: 10px 0;
  color: #424242;
  font-size: 20px;
}

.empty-description {
  font-size: 15px;
  color: #757575;
  max-width: 500px;
  margin: 0 auto;
  line-height: 1.6;
}

.loading-container {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 300px;
  margin: 40px 0;
}

.loading-message {
  text-align: center;
  color: #424242;
}

.loading-message i {
  font-size: 50px;
  color: #2196F3;
  margin-bottom: 20px;
  display: block;
  animation: spin 1.5s infinite linear;
}

@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

.loading-message p {
  font-size: 18px;
  font-weight: 500;
}

/* 检查成就模态框 */
.checking-achievements-modal {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.75);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
  animation: fadeIn 0.3s ease-out;
  backdrop-filter: blur(5px);
}

.checking-content {
  background-color: #fff;
  border-radius: 20px;
  padding: 40px 30px;
  width: 95%;
  max-width: 500px;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
  text-align: center;
  animation: modalSlideUp 0.5s cubic-bezier(0.165, 0.84, 0.44, 1);
  border: 1px solid rgba(255, 255, 255, 0.2);
}

@keyframes modalSlideUp {
  from { transform: translateY(50px); opacity: 0; }
  to { transform: translateY(0); opacity: 1; }
}

.checking-content i.fa-spinner {
  font-size: 70px;
  color: #2196F3;
  margin-bottom: 30px;
  display: block;
  animation: spin 1.5s infinite linear;
}

.checking-content p {
  font-size: 22px;
  color: #1e3d59;
  margin-bottom: 25px;
  font-weight: 500;
}

.check-result {
  margin-top: 30px;
  padding: 30px;
  border-radius: 15px;
  background-color: #f5f5f5;
  animation: fadeIn 0.5s ease-out;
  box-shadow: inset 0 2px 10px rgba(0,0,0,0.05);
}

.check-result.success {
  background-color: #E8F5E9;
}

.check-result i {
  font-size: 50px;
  color: #607D8B;
  margin-bottom: 20px;
}

.check-result.success i {
  color: #4CAF50;
  animation: trophy 1s ease-out;
}

@keyframes trophy {
  0% { transform: scale(0.8) rotate(-15deg); opacity: 0; }
  50% { transform: scale(1.2) rotate(10deg); }
  100% { transform: scale(1) rotate(0); opacity: 1; }
}

.check-result p {
  font-size: 20px;
  margin-bottom: 20px;
  color: #424242;
}

.dismiss-btn {
  background-color: #607D8B;
  color: white;
  border: none;
  padding: 12px 40px;
  border-radius: 50px;
  cursor: pointer;
  font-size: 16px;
  font-weight: 600;
  margin-top: 25px;
  transition: all 0.3s ease;
  box-shadow: 0 8px 20px rgba(96,125,139,0.3);
  position: relative;
  overflow: hidden;
}

.dismiss-btn::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: linear-gradient(to right, transparent, rgba(255, 255, 255, 0.2), transparent);
  transform: translateX(-100%);
  transition: transform 0.6s ease;
}

.dismiss-btn:hover {
  background-color: #455A64;
  transform: translateY(-3px);
  box-shadow: 0 12px 30px rgba(96,125,139,0.4);
}

.dismiss-btn:hover::before {
  transform: translateX(100%);
}

.dismiss-btn.success {
  background-color: #2196F3;
  box-shadow: 0 8px 25px rgba(33, 150, 243, 0.3);
}

.dismiss-btn.success:hover {
  background-color: #1976D2;
  box-shadow: 0 12px 30px rgba(33, 150, 243, 0.4);
}

.new-achievements-list {
  margin: 25px 0;
}

.new-achievement-item {
  display: flex;
  align-items: center;
  gap: 15px;
  margin: 15px 0;
  padding: 18px;
  background-color: rgba(33, 150, 243, 0.08);
  border-radius: 12px;
  font-size: 16px;
  border-left: 3px solid #2196F3;
  text-align: left;
  animation: slideIn 0.5s ease-out;
  animation-delay: calc(var(--k, 0) * 0.2s);
  opacity: 0;
  transform: translateX(-20px);
  animation-fill-mode: forwards;
  box-shadow: 0 4px 15px rgba(33, 150, 243, 0.15);
}

.new-achievement-item:nth-child(1) { --k: 1; }
.new-achievement-item:nth-child(2) { --k: 2; }
.new-achievement-item:nth-child(3) { --k: 3; }

@keyframes slideIn {
  to { transform: translateX(0); opacity: 1; }
}

.new-achievement-item i {
  color: #2196F3;
  font-size: 22px;
  margin: 0;
  width: 40px;
  height: 40px;
  background: rgba(33, 150, 243, 0.1);
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
}

/* 恢复卡片动画相关代码 */
.summary-card:nth-child(1) { --i: 1; }
.summary-card:nth-child(2) { --i: 2; }
.summary-card:nth-child(3) { --i: 3; }

@keyframes cardAppear {
  to {
    opacity: 1;
    transform: translateY(0) rotateX(0);
  }
}

/* 修改脉冲动画使用蓝色 */
@keyframes pulse {
  0% { transform: scale(1.05); }
  50% { transform: scale(1.15); box-shadow: 0 10px 30px rgba(30, 61, 89, 0.6); }
  100% { transform: scale(1.05); }
}

/* 添加卡片标题的样式 */
.card-title {
  color: #1e3d59;
  font-size: 16px;
  font-weight: 500;
  opacity: 0.7;
  margin-bottom: 15px;
  text-align: center;
}
</style>