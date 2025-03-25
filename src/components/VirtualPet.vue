<template>
  <div class="virtual-pet-page">
    <h2>我的虚拟宠物</h2>
    
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
            <span>健康: {{ pet.health }}</span>
          </div>
          <div class="stat">
            <i class="fa fa-coins"></i>
            <span>金币: {{ pet.coins }}</span>
          </div>
        </div>
      </div>
      
      <div class="pet-animation-container">
        <div class="pet-animation" :class="animationClass">
          <img src="@/assets/nailong.png" alt="奶龙" class="pet-image">
        </div>
      </div>
      
      <div class="pet-actions">
        <button @click="feedPet" :disabled="pet.coins < 10" class="action-btn feed-btn">
          <i class="fa fa-utensils"></i> 喂食 (10金币)
        </button>
        <button @click="trainPet" :disabled="pet.coins < 20" class="action-btn train-btn">
          <i class="fa fa-dumbbell"></i> 训练 (20金币)
        </button>
        <button @click="levelUp" :disabled="pet.coins < 100" class="action-btn level-up-btn">
          <i class="fa fa-arrow-up"></i> 升级 (100金币)
        </button>
      </div>
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
    
    <div class="info-section">
      <h3>步行减排说明</h3>
      <ul>
        <li>每走1000步可减少约0.1kg碳排放</li>
        <li>每减少1kg碳排放可获得10个金币</li>
        <li>金币可用于喂食、训练和升级宠物</li>
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
        coins: 0
      },
      steps: 0,
      simulatedSteps: 8000,
      carbonReduction: 0,
      coinsEarned: 0,
      animationClass: '',
      animationTimeout: null
    };
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
      
      this.pet = response.data;
    } catch (error) {
      console.error('Error fetching pet data:', error);
    }
  },
  methods: {
    async submitSteps() {
      try {
        if (this.simulatedSteps < 1000) {
          alert('步数太少，请至少输入1000步');
          return;
        }
        
        const token = localStorage.getItem('token');
        const response = await axios.post('http://localhost:5000/api/pet/steps', {
          steps: this.simulatedSteps
        }, {
          headers: { Authorization: `Bearer ${token}` }
        });
        
        this.pet = response.data.pet;
        this.steps = response.data.stepsProcessed;
        this.carbonReduction = response.data.carbonReduction;
        this.coinsEarned = response.data.coinsEarned;
        
        // 触发获得金币的动画
        this.playAnimation('bounce');
        
        // 显示成功消息
        alert(`步数提交成功！减少了${response.data.carbonReduction.toFixed(2)}kg碳排放，获得了${response.data.coinsEarned}金币！`);
      } catch (error) {
        console.error('Error submitting steps:', error);
        alert('提交步数失败，请重试');
      }
    },
    async feedPet() {
      try {
        if (this.pet.coins < 10) {
          alert('金币不足，无法喂食');
          return;
        }
        
        const token = localStorage.getItem('token');
        const response = await axios.post('http://localhost:5000/api/pet/feed', {}, {
          headers: { Authorization: `Bearer ${token}` }
        });
        
        this.pet = response.data.pet;
        
        // 触发喂食动画
        this.playAnimation('wiggle');
        
        alert(response.data.message);
      } catch (error) {
        console.error('Error feeding pet:', error);
        alert('喂食失败，请重试');
      }
    },
    async trainPet() {
      try {
        if (this.pet.coins < 20) {
          alert('金币不足，无法训练');
          return;
        }
        
        const token = localStorage.getItem('token');
        const response = await axios.post('http://localhost:5000/api/pet/train', {}, {
          headers: { Authorization: `Bearer ${token}` }
        });
        
        this.pet = response.data.pet;
        
        // 触发训练动画
        this.playAnimation('shake');
        
        alert(response.data.message);
      } catch (error) {
        console.error('Error training pet:', error);
        alert('训练失败，请重试');
      }
    },
    async levelUp() {
      try {
        if (this.pet.coins < 100) {
          alert('金币不足，升级需要100金币');
          return;
        }
        
        const token = localStorage.getItem('token');
        const response = await axios.post('http://localhost:5000/api/pet/level-up', {}, {
          headers: { Authorization: `Bearer ${token}` }
        });
        
        this.pet = response.data.pet;
        
        // 触发升级动画
        this.playAnimation('grow');
        
        alert(response.data.message);
      } catch (error) {
        console.error('Error leveling up pet:', error);
        alert('升级失败，请重试');
      }
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
    }
  }
};
</script>

<style scoped>
.virtual-pet-page {
  max-width: 800px;
  margin: 0 auto;
  padding: 20px;
  font-family: 'Arial', sans-serif;
}

.pet-container {
  background-color: #f8f9fa;
  border-radius: 10px;
  padding: 20px;
  margin-bottom: 20px;
  display: flex;
  flex-direction: column;
  align-items: center;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
}

.pet-info-card {
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-bottom: 20px;
}

.pet-name {
  font-size: 24px;
  font-weight: bold;
  margin-bottom: 10px;
}

.pet-stats {
  display: flex;
  gap: 20px;
}

.stat {
  display: flex;
  align-items: center;
  gap: 5px;
}

.pet-animation-container {
  width: 80px;
  height: 80px;
  position: relative;
  margin: 20px 0;
  perspective: 1000px;
}

.pet-image {
  width: 100%;
  height: auto;
  transition: transform 0.3s ease;
}

/* 动画类 */
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

.pet-actions {
  display: flex;
  gap: 10px;
  margin-top: 10px;
  flex-wrap: wrap;
  justify-content: center;
}

.action-btn {
  padding: 8px 15px;
  border: none;
  border-radius: 20px;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 5px;
  transition: background-color 0.3s;
  font-weight: bold;
}

.action-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.feed-btn {
  background-color: #4caf50;
  color: white;
}

.train-btn {
  background-color: #2196f3;
  color: white;
}

.level-up-btn {
  background-color: #f44336;
  color: white;
}

.steps-container {
  background-color: #f0f4ff;
  border-radius: 10px;
  padding: 20px;
  margin-bottom: 20px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
}

.steps-info, .carbon-info, .coins-info {
  margin: 5px 0;
}

.carbon-info {
  color: #4caf50;
}

.coins-info {
  color: #ff9800;
}

.steps-input {
  display: flex;
  gap: 10px;
  margin: 15px 0;
}

.steps-input input {
  flex-grow: 1;
  padding: 8px;
  border: 1px solid #ccc;
  border-radius: 4px;
}

.submit-steps-btn {
  background-color: #00bcd4;
  color: white;
  border: none;
  border-radius: 4px;
  padding: 8px 15px;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 5px;
}

.steps-note {
  font-size: 12px;
  color: #888;
  margin-top: 10px;
}

.info-section {
  background-color: #fafafa;
  border-radius: 10px;
  padding: 20px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
}

.info-section ul {
  padding-left: 20px;
}

.info-section li {
  margin-bottom: 8px;
}
</style>