<template>
  <div class="calculator-page">
    <Navbar />
    <div class="calculator-container">
      <div class="nav-controls">
      <div class="back-to-home">
        <button @click="goHome" class="back-btn">
            <i class="fas fa-home"></i>
            <span>返回主页</span>
        </button>
      </div>
        <div class="switch-calculator">
          <button class="switch-btn" @click="switchToReductionCalculator">
            <i class="fas fa-exchange-alt"></i>
            切换到减碳计算器
          </button>
        </div>
        </div>
      <div class="page-content">
        <h1 class="page-title">碳排放计算器</h1>
        <p class="description">通过记录日常活动，了解您的碳排放量</p>
        
        <!-- 游客模式提示 -->
        <div class="guest-mode-banner">
          <div class="guest-banner-content">
            <div class="guest-icon">
              <i class="fas fa-calculator"></i>
            </div>
            <div class="guest-message">
              <h3>计算工具模式</h3>
              <p>本计算器可直接使用，无需登录，仅用于计算碳排放量，不会保存您的数据。<router-link to="/login" class="login-link">登录</router-link>以解锁更多功能！</p>
            </div>
          </div>
        </div>
        
        <!-- 使用CarbonCalculator组件 -->
        <CarbonCalculator />
      </div>
    </div>
  </div>
</template>

<script>
import Navbar from '@/components/Navbar.vue';
import CarbonCalculator from '@/components/CarbonCalculator.vue';
import { useRouter } from 'vue-router'

export default {
  components: {
    Navbar,
    CarbonCalculator
  },
  setup() {
    const router = useRouter()

    const switchToReductionCalculator = () => {
      router.push('/carbon-reduction')
    }
    
    const goHome = () => {
      router.push('/')
    }

    return {
      switchToReductionCalculator,
      goHome
    }
  }
}
</script>

<style scoped>
.calculator-page {
  min-height: 100vh;
  background-image: url('../assets/carbon_6.jpg');
  background-size: cover;
  background-position: center;
  background-attachment: fixed;
  padding-top: 80px; /* 为固定的导航栏留出空间 */
  position: relative;
  display: flex;
  flex-direction: column;
}

.calculator-page::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(255, 255, 255, 0.8);
  z-index: 1;
}

.calculator-container {
  max-width: 1300px;
  width: 100%;
  margin: 0 auto;
  padding: 1rem;
  position: relative;
  z-index: 2;
  flex: 1;
  display: flex;
  flex-direction: column;
}

.nav-controls {
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 100%;
  margin-bottom: 15px;
}

.back-to-home {
  position: static;
}

.back-btn {
  background-color: #4CAF50;
  color: white;
  border: none;
  border-radius: 20px;
  padding: 8px 16px;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 14px;
  transition: all 0.3s ease;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
}

.back-btn:hover {
  background-color: #388E3C;
  transform: translateY(-2px);
  box-shadow: 0 4px 8px rgba(0,0,0,0.15);
}

.switch-calculator {
  margin: 0;
}

.switch-btn {
  display: flex;
  align-items: center;
  padding: 10px 20px;
  background: linear-gradient(135deg, #e74c3c, #c0392b);
  border: none;
  border-radius: 25px;
  color: white;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 3px 8px rgba(231, 76, 60, 0.3);
}

.switch-btn:hover {
  background: linear-gradient(135deg, #c0392b, #a93226);
  transform: translateY(-2px);
  box-shadow: 0 5px 12px rgba(231, 76, 60, 0.4);
}

.switch-btn i {
  margin-right: 8px;
  animation: spin 7s infinite linear;
  opacity: 0.9;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  25% { transform: rotate(90deg); }
  50% { transform: rotate(180deg); }
  75% { transform: rotate(270deg); }
  100% { transform: rotate(360deg); }
}

.page-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  flex: 1;
  margin-top: 10px;
}

.page-title {
  color: #2c3e50;
  text-align: center;
  margin-bottom: 0.2rem;
  font-size: 38px;
  font-weight: 700;
  text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.1);
  background: linear-gradient(135deg, #1e3d59, #4CAF50);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  animation: fadeIn 0.8s ease-out;
}

@keyframes fadeIn {
  from { opacity: 0; transform: translateY(-10px); }
  to { opacity: 1; transform: translateY(0); }
}

.description {
  text-align: center;
  color: #444;
  margin-bottom: 1rem;
  font-size: 16px;
  max-width: 600px;
}

/* CarbonCalculator组件容器 */
:deep(.carbon-calculator) {
  width: 100%;
  flex: 1;
  display: flex;
  flex-direction: column;
}

/* 游客模式提示样式 */
.guest-mode-banner {
  width: 90%;
  max-width: 800px;
  background: linear-gradient(135deg, rgba(33, 150, 243, 0.1), rgba(3, 169, 244, 0.2));
  border: 1px solid rgba(33, 150, 243, 0.3);
  border-radius: 12px;
  padding: 16px;
  margin-bottom: 20px;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.05);
  position: relative;
  overflow: hidden;
  animation: fadeIn 0.8s ease-out;
}

.guest-banner-content {
  display: flex;
  align-items: center;
  gap: 16px;
}

.guest-icon {
  flex-shrink: 0;
  width: 48px;
  height: 48px;
  border-radius: 50%;
  background: rgba(33, 150, 243, 0.15);
  display: flex;
  align-items: center;
  justify-content: center;
}

.guest-icon i {
  font-size: 24px;
  color: #2196F3;
}

.guest-message {
  flex: 1;
}

.guest-message h3 {
  font-size: 18px;
  margin: 0 0 4px 0;
  color: #1976D2;
}

.guest-message p {
  margin: 0;
  color: #555;
  font-size: 14px;
  line-height: 1.4;
}

.login-link {
  color: #1976D2;
  font-weight: 500;
  text-decoration: underline;
  cursor: pointer;
  padding: 0 2px;
}

.login-link:hover {
  color: #0D47A1;
}

@media (max-width: 768px) {
  .calculator-container {
    padding: 0.5rem;
  }
  
  .page-title {
    font-size: 32px;
  }
  
  .nav-controls {
    flex-direction: column;
    gap: 10px;
  }
  
  .back-to-home, .switch-calculator {
    width: 100%;
  }
  
  .back-btn, .switch-btn {
    width: 100%;
    justify-content: center;
  }
  
  .guest-mode-banner {
    width: 95%;
    padding: 12px;
  }
  
  .guest-banner-content {
    flex-direction: column;
    text-align: center;
  }
  
  .guest-icon {
    margin-bottom: 10px;
  }
}
</style>