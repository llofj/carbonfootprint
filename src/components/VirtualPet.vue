<template>
  <div class="virtual-pet-page">
    <h2 class="page-title">我的虚拟宠物</h2>
    
    <div class="pet-container">
      <div class="pet-info-card">
        <div class="pet-name">{{ pet.name }}</div>
        <div class="pet-stats">
          <div class="stat">
            <i class="fa fa-star"></i>
            <span>等级: {{ pet.level }}</span>
          </div>
          <div class="stat">
            <i class="fa fa-heart"></i>
            <span>健康状态: 
              <span :class="['health-status', getHealthStatusClass(pet.health)]">
                {{ pet.health }}
              </span>
            </span>
          </div>
          <div class="stat">
            <i class="fa fa-coins"></i>
            <span>金币: {{ pet.coins }}</span>
          </div>
          <div class="stat">
            <i class="fa fa-chart-line"></i>
            <span>已获得经验值: {{ pet.experience }} </span>
          </div>
        </div>
        <div class="experience-bar">
          <div class="experience-progress" :style="{ width: experiencePercentage + '%' }"></div>
          <div class="experience-text">
            <span class="current-exp">{{ currentLevelExcessExperience }}</span>
            <span class="exp-separator">/</span>
            <span class="next-level-exp">100</span>
            <span class="exp-percentage">({{ experiencePercentage.toFixed(1) }}%)</span>
          </div>
        </div>
      </div>
      
      <div class="pet-animation-container">
        <div class="pet-animation" :class="animationClass">
          <img src="@/assets/nailong.png" alt="奶龙" class="pet-image">
        </div>
      </div>
      
      <div class="pet-actions">
        <button @click="feedPet" :disabled="pet.coins < feedingCost" class="action-btn feed-btn">
          <i class="fa fa-utensils"></i> 喂食 ({{ feedingCost }}金币)
        </button>
        <button @click="trainPet" :disabled="pet.coins < trainingCost || pet.health === '营养不良'" class="action-btn train-btn">
          <i class="fa fa-dumbbell"></i> 训练 ({{ trainingCost }}金币)
        </button>
        <button @click="levelUp" :disabled="pet.coins < levelUpCost || pet.health === '营养不良'" class="action-btn level-up-btn">
          <i class="fa fa-arrow-up"></i> 升级 ({{ levelUpCost }}金币)
        </button>
      </div>
    </div>
    
    <div v-if="pet.health === '营养不良'" class="warning-message">
      <p>⚠️ 警告：宠物处于营养不良状态！</p>
      <p>请先喂食提升健康状态，才能进行训练和升级。</p>
    </div>
    
    <div class="steps-container">
      <h3>微信步数</h3>
      <p class="steps-info">今日步数: {{ steps }} 步</p>
      <p class="carbon-info" v-if="carbonReduction">减少碳排放: {{ carbonReduction.toFixed(2) }} kg CO2</p>
      <p class="coins-info" v-if="coinsEarned">获得金币: {{ coinsEarned }}</p>
      
      <div class="steps-input">
        <input type="number" v-model="simulatedSteps" placeholder="输入步数" min="1000" max="30000" />
        <button @click="submitSteps" class="submit-steps-btn">
          <i class="fa fa-walking"></i> 提交步数
        </button>
      </div>
      
      <div class="steps-note">
        <p>注: 在实际应用中，步数将从微信API获取</p>
      </div>
    </div>
    
    <div v-if="lastAction" class="action-result">
      <p>{{ lastAction.message }}</p>
      <p v-if="lastAction.carbonReduction">
        减少碳排放: {{ lastAction.carbonReduction }}kg CO2
      </p>
      <p v-if="lastAction.coinsEarned">
        获得金币: {{ lastAction.coinsEarned }}
      </p>
      <p v-if="lastAction.experienceGained">
        获得经验值: {{ lastAction.experienceGained }}
      </p>
    </div>
    
    <div class="info-section">
      <h3>步行减排说明</h3>
      <ul>
        <li>每走1000步可减少约0.1kg碳排放</li>
        <li>每减少1kg碳排放可获得10个金币</li>
        <li>金币可用于喂食、训练和直接升级</li>
        <li>喂食可提升宠物健康状态</li>
        <li>花费二十金币训练宠物，根据健康状态获得不同经验值：</li>
        <li class="training-info">
          <div class="health-status">
            <strong>健康状态：</strong>
            <ul>
              <li>健康：20%概率获得1-10经验值，40%概率获得11-30经验值，40%概率获得31-40经验值</li>
              <li>良好：40%概率获得1-10经验值，40%概率获得11-30经验值，20%概率获得31-40经验值</li>
              <li>较差：60%概率获得1-10经验值，20%概率获得11-30经验值，20%概率获得31-40经验值</li>
              <li>营养不良：无法训练以及升级</li>
            </ul>
          </div>
        </li>
        <li>每100经验值可提升1级</li>
        <li>宠物等级越高，减排效果越好</li>
      </ul>
    </div>
  </div>
</template>

<script>
import axios from 'axios';

export default {
  data() {
    return {
      pet: {
        name: '奶龙',
        level: 1,
        health: '健康',
        coins: 0,
        experience: 0
      },
      steps: 0,
      simulatedSteps: 8000,
      carbonReduction: 0,
      coinsEarned: 0,
      animationClass: '',
      animationTimeout: null,
      experienceToNextLevel: 100,
      feedingCost: 10,
      trainingCost: 20,
      levelUpCost: 100,
      lastAction: null,
      healthCheckInterval: null,
      lastHealth: '健康',
      isLevelingUp: false,
      tempExperiencePercentage: 0
    };
  },
  computed: {
    nextLevelExperience() {
      return this.pet.level * 100;
    },
    experiencePercentage() {
      if (this.isLevelingUp) {
        return this.tempExperiencePercentage;
      }
      return (this.currentLevelExcessExperience / 100) * 100;
    },
    currentLevelExcessExperience() {
      const baseExperience = (this.pet.level - 1) * 100;
      return this.pet.experience - baseExperience;
    }
  },
  async created() {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        this.$router.push('/');
        return;
      }
      
      // 获取宠物信息
      const response = await axios.get('http://localhost:5000/api/pet', {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      // 保存后端数据但确保宠物名称为"奶龙"
      this.pet = {
        ...response.data,
        name: '奶龙'
      };
      this.lastHealth = this.pet.health;
      this.experienceToNextLevel = response.data.experienceToNextLevel;
      
      // 启动健康状态检查
      this.startHealthCheck();
    } catch (error) {
      console.error('Error fetching pet data:', error);
    }
  },
  beforeUnmount() {
    // 组件销毁前清除定时器
    if (this.healthCheckInterval) {
      clearInterval(this.healthCheckInterval);
    }
  },
  methods: {
    getHealthStatusClass(health) {
      return {
        'health-healthy': health === '健康',
        'health-good': health === '良好',
        'health-poor': health === '较差',
        'health-malnourished': health === '营养不良'
      }
    },
    async submitSteps() {
      try {
        if (this.simulatedSteps < 1000) {
          this.$store.dispatch('message/showMessage', {
            content: '步数太少，请至少输入1000步',
            type: 'warning'
          });
          return;
        }
        
        const token = localStorage.getItem('token');
        const response = await axios.post('http://localhost:5000/api/pet/steps', {
          steps: this.simulatedSteps
        }, {
          headers: { Authorization: `Bearer ${token}` }
        });
        
        // 确保宠物名称保持为"奶龙"
        this.pet = {
          ...response.data.pet,
          name: '奶龙'
        };
        this.steps = response.data.stepsProcessed;
        this.carbonReduction = response.data.carbonReduction;
        this.coinsEarned = response.data.coinsEarned;
        
        // 触发获得金币的动画
        this.playAnimation('bounce');
        
        // 显示成功消息
        this.$store.dispatch('message/showMessage', {
          content: `步数提交成功！减少了${response.data.carbonReduction.toFixed(2)}kg碳排放，获得了${response.data.coinsEarned}金币！`,
          type: 'success'
        });
        
        this.lastAction = response.data;
      } catch (error) {
        console.error('Error submitting steps:', error);
        this.$store.dispatch('message/showMessage', {
          content: '提交步数失败，请重试',
          type: 'error'
        });
      }
    },
    async feedPet() {
      try {
        if (this.pet.coins < this.feedingCost) {
          this.$store.dispatch('message/showMessage', {
            content: '金币不足，无法喂食',
            type: 'error'
          });
          return;
        }
        
        const token = localStorage.getItem('token');
        const response = await axios.post('http://localhost:5000/api/pet/feed', {}, {
          headers: { Authorization: `Bearer ${token}` }
        });
        
        // 更新宠物数据和健康状态，确保名称保持为"奶龙"
        this.pet = {
          ...response.data.pet,
          name: '奶龙'
        };
        this.lastHealth = this.pet.health;
        
        // 触发喂食动画
        this.playAnimation('wiggle');
        
        this.$store.dispatch('message/showMessage', {
          content: response.data.message,
          type: 'success'
        });
        
        this.lastAction = response.data;
      } catch (error) {
        console.error('Error feeding pet:', error);
        this.$store.dispatch('message/showMessage', {
          content: '喂食失败，请重试',
          type: 'error'
        });
      }
    },
    async trainPet() {
      try {
        if (this.pet.coins < this.trainingCost || this.pet.health === '营养不良') {
          this.$store.dispatch('message/showMessage', {
            content: '金币不足或健康状态不佳，无法训练',
            type: 'error'
          });
          return;
        }
        
        const token = localStorage.getItem('token');
        const response = await axios.post('http://localhost:5000/api/pet/train', {}, {
          headers: { Authorization: `Bearer ${token}` }
        });
        
        // 更新宠物数据，确保名称保持为"奶龙"
        this.pet = {
          ...response.data.pet,
          name: '奶龙'
        };
        this.experienceToNextLevel = response.data.experienceToNextLevel;
        
        this.playAnimation('shake');
        
        this.$store.dispatch('message/showMessage', {
          content: `训练成功！获得${response.data.experienceGained}经验值，距离下一级还需${this.experienceToNextLevel}经验值`,
          type: 'success'
        });
        
        this.lastAction = response.data;
      } catch (error) {
        console.error('Error training pet:', error);
        this.$store.dispatch('message/showMessage', {
          content: '训练失败，请重试',
          type: 'error'
        });
      }
    },
    async levelUp() {
      try {
        if (this.pet.coins < this.levelUpCost || this.pet.health === '营养不良') {
          this.$store.dispatch('message/showMessage', {
            content: '金币不足或健康状态不佳，无法升级',
            type: 'error'
          });
          return;
        }
        
        const token = localStorage.getItem('token');
        const response = await axios.post('http://localhost:5000/api/pet/level-up', {}, {
          headers: { Authorization: `Bearer ${token}` }
        });
        
        // 开始升级动画
        this.isLevelingUp = true;
        this.tempExperiencePercentage = this.experiencePercentage;
        
        // 动画：先填满到100%
        await this.animateExperience(100, 500);
        
        // 短暂停顿
        await new Promise(resolve => setTimeout(resolve, 200));
        
        // 重置到新等级的起始位置
        this.tempExperiencePercentage = 0;
        await new Promise(resolve => setTimeout(resolve, 100));
        
        // 更新宠物数据，确保名称保持为"奶龙"
        this.pet = {
          ...response.data.pet,
          name: '奶龙'
        };
        this.experienceToNextLevel = response.data.experienceToNextLevel;
        
        // 结束升级动画
        this.isLevelingUp = false;
        
        this.playAnimation('grow');
        
        this.$store.dispatch('message/showMessage', {
          content: `升级成功！当前等级：${this.pet.level}，获得${response.data.experienceGained}经验值，距离下一级还需${this.experienceToNextLevel}经验值`,
          type: 'success'
        });
        
        this.lastAction = response.data;
      } catch (error) {
        console.error('Error leveling up pet:', error);
        this.$store.dispatch('message/showMessage', {
          content: '升级失败，请重试',
          type: 'error'
        });
        this.isLevelingUp = false;
      }
    },
    
    async animateExperience(targetPercentage, duration) {
      const startPercentage = this.tempExperiencePercentage;
      const startTime = performance.now();
      
      return new Promise(resolve => {
        const animate = (currentTime) => {
          const elapsed = currentTime - startTime;
          const progress = Math.min(elapsed / duration, 1);
          
          // 使用缓动函数使动画更自然
          const easeProgress = this.easeOutQuad(progress);
          
          this.tempExperiencePercentage = startPercentage + (targetPercentage - startPercentage) * easeProgress;
          
          if (progress < 1) {
            requestAnimationFrame(animate);
          } else {
            resolve();
          }
        };
        
        requestAnimationFrame(animate);
      });
    },
    
    easeOutQuad(t) {
      return t * (2 - t);
    },
    playAnimation(animationType) {
      // 清除之前的动画
      if (this.animationTimeout) {
        clearTimeout(this.animationTimeout);
      }
      
      // 设置新动画
      this.animationClass = animationType;
      
      // 设置定时器移除动画类
      this.animationTimeout = setTimeout(() => {
        this.animationClass = '';
      }, 1500);
    },
    startHealthCheck() {
      // 每30秒检查一次健康状态
      this.healthCheckInterval = setInterval(async () => {
        try {
          const token = localStorage.getItem('token');
          const response = await axios.get('http://localhost:5000/api/pet', {
            headers: { Authorization: `Bearer ${token}` }
          });
          
          const newHealth = response.data.health;
          
          // 更新宠物数据，确保名称保持为"奶龙"
          this.pet = {
            ...response.data,
            name: '奶龙'
          };
          
          // 检查健康状态是否发生变化
          if (newHealth !== this.lastHealth) {
            // 健康状态发生变化，显示提示
            let message = '';
            let type = 'warning';
            
            if (newHealth === '营养不良') {
              message = '警告：宠物处于营养不良状态！请及时喂食。';
              type = 'error';
            } else if (newHealth === '较差') {
              message = '提示：宠物健康状态下降，建议喂食。';
              type = 'warning';
            } else if (newHealth === '良好') {
              message = '提示：宠物健康状态良好，继续保持。';
              type = 'info';
            } else if (newHealth === '健康') {
              message = '提示：宠物健康状态极佳！';
              type = 'success';
            }
            
            this.$store.dispatch('message/showMessage', {
              content: message,
              type: type
            });
            
            // 更新上一次的健康状态
            this.lastHealth = newHealth;
            
            // 如果状态变为营养不良，立即禁用相关按钮
            if (newHealth === '营养不良') {
              this.pet.health = '营养不良';
            }
          }
        } catch (error) {
          console.error('Error checking pet health:', error);
        }
      }, 30000); // 30秒检查一次
    }
  }
};
</script>

<style scoped>
.virtual-pet-page {
  max-width: 900px;
  margin: 0 auto;
  padding: 20px;
  font-family: 'Arial', sans-serif;
}

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
    font-size: 28px;
  }
  .pet-stats {
    gap: 15px;
  }
  
  .stat {
    padding: 8px 12px;
    font-size: 14px;
  }
  
  .pet-actions {
    flex-direction: column;
    align-items: stretch;
  }
  
  .steps-input {
    flex-direction: column;
  }
  
  .submit-steps-btn {
    align-self: flex-end;
  }
}

.pet-container {
  background: rgba(255, 255, 255, 0.9);
  border-radius: 20px;
  padding: 30px;
  margin-bottom: 30px;
  display: flex;
  flex-direction: column;
  align-items: center;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.15);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.5);
  position: relative;
  overflow: hidden;
}

.pet-container::before {
  display: none;
}

.pet-info-card {
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-bottom: 20px;
}

.pet-name {
  font-size: 30px;
  font-weight: bold;
  margin-bottom: 15px;
  color: #2c3e50;
  position: relative;
  display: inline-block;
}

.pet-name::after {
  content: '';
  position: absolute;
  bottom: -5px;
  left: 0;
  width: 100%;
  height: 2px;
  background: linear-gradient(to right, #4CAF50, #2196F3);
  border-radius: 2px;
}

.pet-stats {
  display: flex;
  gap: 25px;
  flex-wrap: wrap;
  justify-content: center;
  margin: 20px 0;
}

.stat {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 15px;
  background: rgba(255, 255, 255, 0.8);
  border-radius: 50px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.07);
  transition: all 0.3s ease;
  border: 1px solid rgba(0, 0, 0, 0.05);
}

.stat:hover {
  transform: translateY(-3px);
  box-shadow: 0 6px 15px rgba(0, 0, 0, 0.1);
}

.stat i {
  font-size: 18px;
  width: 24px;
  height: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  color: white;
}

.stat:nth-child(1) i {
  background: linear-gradient(135deg, #FF9800, #FF5722);
}

.stat:nth-child(2) i {
  background: linear-gradient(135deg, #F44336, #E91E63);
}

.stat:nth-child(3) i {
  background: linear-gradient(135deg, #FFEB3B, #FFC107);
}

.stat:nth-child(4) i {
  background: linear-gradient(135deg, #4CAF50, #8BC34A);
}

.experience-bar {
  width: 100%;
  height: 28px;
  background-color: rgba(240, 240, 240, 0.5);
  border-radius: 14px;
  margin: 15px 0;
  position: relative;
  overflow: hidden;
  box-shadow: inset 0 2px 4px rgba(0, 0, 0, 0.07);
  border: 1px solid rgba(255, 255, 255, 0.7);
}

.experience-progress {
  height: 100%;
  background: linear-gradient(90deg, #4CAF50, #8BC34A);
  transition: width 0.5s cubic-bezier(0.22, 1, 0.36, 1);
  position: relative;
  overflow: hidden;
}

.experience-progress::after {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(
    90deg,
    rgba(255, 255, 255, 0.1) 0%,
    rgba(255, 255, 255, 0.2) 50%,
    rgba(255, 255, 255, 0.1) 100%
  );
  animation: shimmer 2s infinite;
}

.experience-text {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  color: #333;
  font-size: 14px;
  font-weight: bold;
  text-shadow: 0 0 2px white;
  display: flex;
  align-items: center;
  gap: 4px;
  white-space: nowrap;
}

.pet-animation-container {
  width: 150px;
  height: 180px;
  position: relative;
  margin: 40px 0 60px 0;
  perspective: 1000px;
  z-index: 2;
}

.pet-image {
  width: 150px;
  height: auto;
  transition: transform 0.3s ease;
  filter: drop-shadow(0 5px 15px rgba(0, 0, 0, 0.2));
}

.pet-animation {
  position: relative;
  display: flex;
  justify-content: center;
  align-items: center;
}

.pet-animation::before {
  content: '';
  position: absolute;
  width: 150%;
  height: 20px;
  background: radial-gradient(ellipse at center, rgba(0, 0, 0, 0.2) 0%, rgba(0, 0, 0, 0) 70%);
  bottom: -20px;
  border-radius: 50%;
  z-index: -1;
}

.action-btn {
  padding: 12px 20px;
  border: none;
  border-radius: 50px;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 8px;
  transition: all 0.3s ease;
  font-weight: bold;
  font-size: 15px;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
  position: relative;
  overflow: hidden;
  z-index: 1;
}

.action-btn::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(rgba(255, 255, 255, 0.2), rgba(255, 255, 255, 0));
  z-index: -1;
}

.action-btn:hover {
  transform: translateY(-3px);
  box-shadow: 0 7px 20px rgba(0, 0, 0, 0.15);
}

.action-btn:active {
  transform: translateY(1px);
}

.feed-btn {
  background: linear-gradient(135deg, #4caf50, #388e3c);
  color: white;
}

.train-btn {
  background: linear-gradient(135deg, #2196f3, #1976d2);
  color: white;
}

.level-up-btn {
  background: linear-gradient(135deg, #f44336, #d32f2f);
  color: white;
}

.steps-container {
  background: rgba(255, 255, 255, 0.9);
  border-radius: 20px;
  padding: 30px;
  margin-bottom: 30px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.15);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.5);
  position: relative;
}

.steps-container::before {
  display: none;
}

.steps-container h3 {
  font-size: 22px;
  color: #2c3e50;
  margin-bottom: 15px;
  position: relative;
  display: inline-block;
}

.steps-container h3::after {
  content: '';
  position: absolute;
  bottom: -5px;
  left: 0;
  width: 100%;
  height: 2px;
  background: linear-gradient(to right, #2196F3, #03A9F4);
  border-radius: 2px;
}

.steps-info, .carbon-info, .coins-info {
  margin: 12px 0;
  font-size: 16px;
  display: flex;
  align-items: center;
  gap: 8px;
}

.steps-info::before {
  content: '\f54b'; /* fa-walking */
  font-family: 'Font Awesome 5 Free';
  font-weight: 900;
  color: #2196f3;
}

.carbon-info {
  color: #4caf50;
}

.carbon-info::before {
  content: '\f06c'; /* fa-leaf */
  font-family: 'Font Awesome 5 Free';
  font-weight: 900;
  color: #4caf50;
}

.coins-info {
  color: #ff9800;
}

.coins-info::before {
  content: '\f51e'; /* fa-coins */
  font-family: 'Font Awesome 5 Free';
  font-weight: 900;
  color: #ff9800;
}

.steps-input {
  display: flex;
  gap: 10px;
  margin: 20px 0;
}

.steps-input input {
  flex-grow: 1;
  padding: 12px 15px;
  border: 1px solid rgba(0, 0, 0, 0.1);
  border-radius: 50px;
  background: rgba(255, 255, 255, 0.9);
  font-size: 15px;
  transition: all 0.3s ease;
  box-shadow: inset 0 2px 4px rgba(0, 0, 0, 0.05);
}

.steps-input input:focus {
  outline: none;
  border-color: #2196f3;
  box-shadow: 0 0 0 3px rgba(33, 150, 243, 0.2);
}

.submit-steps-btn {
  background: linear-gradient(135deg, #00bcd4, #0097a7);
  color: white;
  border: none;
  border-radius: 50px;
  padding: 12px 20px;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 8px;
  font-weight: bold;
  transition: all 0.3s ease;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
}

.submit-steps-btn:hover {
  transform: translateY(-3px);
  box-shadow: 0 7px 20px rgba(0, 0, 0, 0.15);
}

.steps-note {
  font-size: 13px;
  color: #888;
  margin-top: 15px;
  padding: 10px;
  background: rgba(0, 0, 0, 0.02);
  border-radius: 8px;
  display: flex;
  align-items: center;
  gap: 8px;
}

.steps-note::before {
  content: '\f05a'; /* fa-info-circle */
  font-family: 'Font Awesome 5 Free';
  font-weight: 900;
  color: #888;
}

.info-section {
  background: rgba(255, 255, 255, 0.9);
  border-radius: 20px;
  padding: 30px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.15);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.5);
  position: relative;
}

.info-section::before {
  display: none;
}

.info-section h3 {
  font-size: 22px;
  color: #2c3e50;
  margin-bottom: 15px;
  position: relative;
  display: inline-block;
}

.info-section h3::after {
  content: '';
  position: absolute;
  bottom: -5px;
  left: 0;
  width: 100%;
  height: 2px;
  background: linear-gradient(to right, #FF9800, #F57C00);
  border-radius: 2px;
}

.info-section ul {
  padding-left: 20px;
  margin-top: 15px;
}

.info-section li {
  margin-bottom: 10px;
  position: relative;
  padding-left: 5px;
}

.info-section li::marker {
  color: #FF9800;
}

.warning-message {
  margin: 20px 0;
  padding: 15px 20px;
  background: linear-gradient(to right, rgba(255, 243, 224, 0.9), rgba(255, 236, 179, 0.9));
  border-left: 4px solid #FFB74D;
  border-radius: 10px;
  color: #E65100;
  display: flex;
  flex-direction: column;
  gap: 5px;
  box-shadow: 0 5px 15px rgba(255, 183, 77, 0.2);
}

.warning-message p:first-child {
  font-weight: bold;
  font-size: 16px;
}

.action-result {
  margin: 20px 0;
  padding: 15px 20px;
  background: linear-gradient(to right, rgba(232, 245, 233, 0.9), rgba(200, 230, 201, 0.9));
  border-left: 4px solid #81C784;
  border-radius: 10px;
  color: #2E7D32;
  box-shadow: 0 5px 15px rgba(129, 199, 132, 0.2);
}

.action-result p {
  margin: 5px 0;
}

/* 动画效果 */
@keyframes shimmer {
  0% { transform: translateX(-100%); }
  100% { transform: translateX(100%); }
}

.current-exp {
  color: #2E7D32;
}

.exp-separator {
  color: #666;
}

.next-level-exp {
  color: #1B5E20;
}

.exp-percentage {
  color: #666;
  font-size: 12px;
  margin-left: 4px;
}

/* 动画类 */
.pet-actions {
  display: flex;
  gap: 15px;
  margin-top: 30px;
  flex-wrap: wrap;
  justify-content: center;
  width: 100%;
}

.action-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
  transform: none;
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.05);
}

.bounce {
  animation: bounce 1.5s ease;
}

.wiggle {
  animation: wiggle 1.5s ease;
}

.shake {
  animation: shake 1.5s ease;
}

.grow {
  animation: grow 1.5s ease;
}

@keyframes bounce {
  0%, 20%, 50%, 80%, 100% {transform: translateY(0);}
  40% {transform: translateY(-30px);}
  60% {transform: translateY(-15px);}
}

@keyframes wiggle {
  0%, 100% {transform: rotate(0deg);}
  25% {transform: rotate(5deg);}
  50% {transform: rotate(0deg);}
  75% {transform: rotate(-5deg);}
}

@keyframes shake {
  0%, 100% {transform: translateX(0);}
  10%, 30%, 50%, 70%, 90% {transform: translateX(-10px);}
  20%, 40%, 60%, 80% {transform: translateX(10px);}
}

@keyframes grow {
  0% {transform: scale(1);}
  50% {transform: scale(1.2);}
  100% {transform: scale(1);}
}

/* 健康状态样式 */
.health-healthy {
  color: #4CAF50;
  font-weight: bold;
}

.health-good {
  color: #2196F3;
  font-weight: bold;
}

.health-poor {
  color: #FFC107;
  font-weight: bold;
}

.health-malnourished {
  color: #F44336;
  font-weight: bold;
}

.training-info {
  margin-top: 10px;
}

.health-status {
  margin-left: 20px;
}

.health-status ul {
  margin-top: 5px;
  margin-bottom: 5px;
}

.health-status li {
  margin-bottom: 5px;
  font-size: 0.9em;
  color: #666;
}
</style>