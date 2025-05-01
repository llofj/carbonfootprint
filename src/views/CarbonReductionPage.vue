<template>
  <div class="carbon-reduction-page">
    <div class="calculator-container">
      <div class="nav-controls">
      <div class="back-to-home">
        <button @click="goHome" class="back-btn">
            <i class="fas fa-home"></i>
            <span>返回主页</span>
        </button>
      </div>
        <div class="switch-calculator">
          <button class="switch-btn" @click="switchToEmissionCalculator">
            <i class="fas fa-exchange-alt"></i>
            切换到碳排放计算器
          </button>
        </div>
      </div>
      <div class="page-content">
        <h1 class="page-title">减碳计算器</h1>
        <p class="description">记录您的减碳行为，为环保贡献力量</p>
        
        <!-- 未登录用户提示框 -->
        <div class="guest-info-banner" v-if="!isLoggedIn">
          <div class="guest-banner-content">
            <div class="guest-icon">
              <i class="fas fa-info-circle"></i>
            </div>
            <div class="guest-message">
              <h3>游客模式</h3>
              <p>您当前未登录，可以使用计算器但无法保存减碳记录。<a @click="goToLogin" class="login-link">点击登录</a>以保存您的环保成果！</p>
            </div>
          </div>
        </div>
        
        <!-- 用户信息横向长条卡片 -->
        <div class="user-info-banner" v-if="isLoggedIn" ref="userInfoCard">
          <div class="banner-glow"></div>
          <div class="banner-content">
            <div class="user-section">
              <div class="user-avatar">
                <i class="fas fa-user-circle pulse"></i>
                <div class="avatar-ring"></div>
              </div>
              <div class="user-name">{{ username }}</div>
            </div>
            
            <div class="metrics-section">
              <div class="metric-item">
                <div class="metric-icon">
                  <i class="fas fa-leaf" :class="{'leaf-animation': !isRefreshing, 'refresh-spin': isRefreshing}"></i>
                </div>
                <div class="metric-data">
                  <div class="metric-value count-up">{{ userCarbonReduction.toFixed(1) }}</div>
                  <div class="metric-label">kgCO₂e 减碳量</div>
                </div>
              </div>
              
              <div class="metric-divider"></div>
              
              <div class="metric-item">
                <div class="metric-icon">
                  <i class="fas fa-tree" :class="{'tree-animation': !isRefreshing, 'refresh-spin': isRefreshing}"></i>
                </div>
                <div class="metric-data">
                  <div class="metric-value count-up">{{ treeEquivalent }}</div>
                  <div class="metric-label">棵树等效</div>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        <CarbonReductionCalculator @reduction-saved="onReductionSaved" />
      </div>
    </div>
  </div>
</template>

<script>
import CarbonReductionCalculator from '@/components/CarbonReductionCalculator.vue'
import { useRouter } from 'vue-router'

export default {
  name: 'CarbonReductionPage',
  components: {
    CarbonReductionCalculator
  },
  data() {
    return {
      isLoggedIn: false,
      username: '',
      userCarbonReduction: 0,
      isRefreshing: false
    }
  },
  computed: {
    treeEquivalent() {
      // 每棵树平均每年吸收约21kg CO2
      return Math.max(1, Math.round(this.userCarbonReduction / 21));
    }
  },
  created() {
    // 检查用户是否登录
    const token = localStorage.getItem('token');
    if (token) {
      this.isLoggedIn = true;
      this.username = localStorage.getItem('username') || '环保达人';
      this.loadUserCarbonReduction();
    }
  },
  mounted() {
    // 添加动画触发器
    setTimeout(() => {
      this.animationTriggered = true;
      this.animateCountUp();
    }, 500);
  },
  methods: {
    // 接收子组件保存成功的事件
    onReductionSaved(newTotalReduction) {
      console.log('收到子组件保存成功事件，新的总减碳量:', newTotalReduction);
      
      // 显示刷新动画
      this.isRefreshing = true;
      
      // 直接更新当前显示的减碳总量
      if (typeof newTotalReduction === 'number' && !isNaN(newTotalReduction)) {
        const oldValue = this.userCarbonReduction;
        this.userCarbonReduction = newTotalReduction;
        
        // 增加卡片高亮动画
        if (this.$refs.userInfoCard) {
          try {
            this.$refs.userInfoCard.classList.add('highlight-update');
            setTimeout(() => {
              // 再次检查元素是否存在
              if (this.$refs.userInfoCard) {
                this.$refs.userInfoCard.classList.remove('highlight-update');
              }
            }, 2000);
          } catch (error) {
            console.error('无法添加/移除高亮动画类:', error);
          }
        }
      }
      
      // 延迟刷新数据，确保后端数据已更新
      setTimeout(() => {
        this.loadUserCarbonReduction(true);
      }, 1000);
    },
    // 数字增长动画
    animateCountUp() {
      const countElements = document.querySelectorAll('.count-up');
      countElements.forEach(el => {
        const target = parseFloat(el.textContent);
        let current = 0;
        const increment = target / 30; // 分30步完成
        const timer = setInterval(() => {
          current += increment;
          if (current >= target) {
            clearInterval(timer);
            current = target;
          }
          el.textContent = current.toFixed(1);
        }, 30);
      });
    },
    async loadUserCarbonReduction(isRefresh = false) {
      try {
        const token = localStorage.getItem('token');
        if (!token) return;
        
        // 添加时间戳参数避免缓存
        const timestamp = new Date().getTime();
        
        // 首先尝试从carbon-reduction接口获取最新数据
        const response = await fetch(`http://localhost:5000/api/achievement/carbon-reduction?_t=${timestamp}`, {
          headers: {
            'Authorization': `Bearer ${token}`
          },
          cache: 'no-store' // 强制不使用缓存
        });
        
        if (response.ok) {
          const data = await response.json();
          if (data && typeof data.carbon_reduction !== 'undefined') {
            // 确保转换为数字类型
            const newValue = parseFloat(data.carbon_reduction) || 0;
            console.log('获取到的减碳总量:', newValue);
            
            // 如果是刷新数据且值有变化，使用动画过渡
            if (isRefresh && this.userCarbonReduction !== newValue) {
              const oldValue = this.userCarbonReduction;
              this.userCarbonReduction = newValue;
              
              // 增加卡片高亮动画
              if (this.$refs.userInfoCard) {
                try {
                  this.$refs.userInfoCard.classList.add('highlight-update');
                  setTimeout(() => {
                    // 再次检查元素是否存在
                    if (this.$refs.userInfoCard) {
                      this.$refs.userInfoCard.classList.remove('highlight-update');
                    }
                  }, 2000);
                } catch (error) {
                  console.error('无法添加/移除高亮动画类:', error);
                }
              }
              
              // 重新触发数字动画
              this.animateCountUp();
            } else if (!isRefresh) {
              // 首次加载直接设置
              this.userCarbonReduction = newValue;
            }
          }
        } else {
          console.error('获取减碳数据失败:', response.status, response.statusText);
          // 只在首次加载时提示错误，刷新时不提示
          if (!isRefresh) {
            // 这里可以添加错误提示UI
          }
        }
      } catch (error) {
        console.error('获取用户减碳数据失败:', error);
        if (!isRefresh) {
          this.userCarbonReduction = 0; // 只在首次加载错误时重置为0
        }
      } finally {
        // 无论结果如何，都结束刷新状态
        this.isRefreshing = false;
      }
    },
    switchToEmissionCalculator() {
      this.$router.push('/calculator')
    },
    goHome() {
      this.$router.push('/')
    },
    goToLogin() {
      this.$router.push('/login')
    }
  }
}
</script>

<style scoped>
.carbon-reduction-page {
  min-height: 100vh;
  background-image: url('../assets/carbon_4.jpg');
  background-size: cover;
  background-position: center;
  background-attachment: fixed;
  padding-top: 20px;
  position: relative;
}

.carbon-reduction-page::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(255, 255, 255, 0.75);
  z-index: 1;
}

.calculator-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 1rem;
  position: relative;
  z-index: 2;
}

.page-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-top: 30px;
}

.page-title {
  color: #1e3d59;
  text-align: center;
  margin-bottom: 0.5rem;
  font-size: 32px;
  font-weight: 600;
  text-shadow: 1px 1px 2px rgba(0, 0, 0, 0.1);
}

.description {
  text-align: center;
  color: #444;
  margin-bottom: 1.5rem;
  font-size: 16px;
  max-width: 600px;
}

/* 用户信息横向长条卡片 */
.user-info-banner {
  width: 95%;
  max-width: 800px;
  height: 100px;
  border-radius: 16px;
  margin: 20px 0;
  position: relative;
  box-shadow: 0 8px 30px rgba(0, 0, 0, 0.15);
  background: linear-gradient(120deg, #111822, #253746);
  overflow: hidden;
  display: flex;
  align-items: center;
  transition: all 0.3s ease;
}

.user-info-banner:hover {
  transform: translateY(-3px);
  box-shadow: 0 12px 30px rgba(0, 0, 0, 0.2);
}

.banner-glow {
  position: absolute;
  width: 150%;
  height: 150%;
  top: -25%;
  left: -25%;
  background: radial-gradient(
    ellipse at center,
    rgba(74, 215, 240, 0.3) 0%,
    rgba(46, 187, 161, 0.1) 40%,
    rgba(0, 0, 0, 0) 70%
  );
  pointer-events: none;
  z-index: 1;
  animation: glow-pulse 5s infinite alternate;
}

@keyframes glow-pulse {
  0% { opacity: 0.4; transform: scale(1); }
  100% { opacity: 0.8; transform: scale(1.2); }
}

.banner-content {
  display: flex;
  align-items: center;
  width: 100%;
  height: 100%;
  padding: 0 25px;
  position: relative;
  z-index: 2;
}

.user-section {
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-right: 25px;
  min-width: 80px;
}

.user-avatar {
  position: relative;
  width: 50px;
  height: 50px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.user-avatar i {
  font-size: 42px;
  color: #4fd1c5;
}

.avatar-ring {
  position: absolute;
  width: 58px;
  height: 58px;
  border-radius: 50%;
  border: 2px solid rgba(79, 209, 197, 0.5);
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  animation: ring-pulse 2s infinite ease-out;
}

@keyframes ring-pulse {
  0% { transform: translate(-50%, -50%) scale(0.8); opacity: 0.8; }
  50% { transform: translate(-50%, -50%) scale(1.1); opacity: 0.2; }
  100% { transform: translate(-50%, -50%) scale(0.8); opacity: 0.8; }
}

.user-name {
  margin-top: 6px;
  color: white;
  font-size: 14px;
  font-weight: 500;
  max-width: 80px;
  text-align: center;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.metrics-section {
  display: flex;
  align-items: center;
  flex: 1;
  height: 100%;
  padding: 0 15px;
}

.metric-item {
  display: flex;
  align-items: center;
  flex: 1;
}

.metric-icon {
  width: 42px;
  height: 42px;
  border-radius: 10px;
  background: rgba(255, 255, 255, 0.1);
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 15px;
  backdrop-filter: blur(5px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1), inset 0 2px 4px rgba(255, 255, 255, 0.1);
}

.metric-icon i {
  font-size: 20px;
}

.leaf-animation {
  color: #4fd1c5;
  animation: leaf-wave 3s infinite ease-in-out;
}

@keyframes leaf-wave {
  0%, 100% { transform: rotate(0deg); }
  25% { transform: rotate(15deg); }
  75% { transform: rotate(-15deg); }
}

.tree-animation {
  color: #68d391;
  animation: tree-grow 4s infinite ease-in-out;
}

@keyframes tree-grow {
  0%, 100% { transform: scale(1); }
  50% { transform: scale(1.2); }
}

.metric-data {
  display: flex;
  flex-direction: column;
}

.metric-value {
  font-size: 20px;
  font-weight: bold;
  color: white;
  line-height: 1.1;
}

.metric-label {
  font-size: 12px;
  color: rgba(255, 255, 255, 0.7);
}

.metric-divider {
  width: 1px;
  height: 50px;
  background: linear-gradient(to bottom, rgba(255, 255, 255, 0), rgba(255, 255, 255, 0.3), rgba(255, 255, 255, 0));
  margin: 0 20px;
}

.pulse {
  animation: pulse 2s infinite;
}

@keyframes pulse {
  0% { transform: scale(1); }
  50% { transform: scale(1.05); }
  100% { transform: scale(1); }
}

.nav-controls {
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 100%;
  margin-bottom: 20px;
}

.back-to-home {
  position: static;
}

.switch-calculator {
  margin: 0;
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
  transition: background-color 0.3s;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
}

.back-btn:hover {
  background-color: #388E3C;
}

.switch-btn {
  display: flex;
  align-items: center;
  padding: 10px 20px;
  background: linear-gradient(135deg, #1e3d59, #4CAF50);
  border: none;
  border-radius: 25px;
  color: white;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 3px 8px rgba(30, 61, 89, 0.3);
}

.switch-btn:hover {
  background: linear-gradient(135deg, #19324a, #3d9140);
  transform: translateY(-2px);
  box-shadow: 0 5px 12px rgba(30, 61, 89, 0.4);
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

/* 响应式调整 */
@media (max-width: 768px) {
  .user-info-banner {
    height: auto;
    flex-direction: column;
    padding: 15px 0;
  }
  
  .banner-content {
    flex-direction: column;
    padding: 10px;
  }
  
  .user-section {
    margin-right: 0;
    margin-bottom: 15px;
  }
  
  .metrics-section {
    flex-direction: column;
    width: 100%;
    gap: 15px;
  }
  
  .metric-divider {
    width: 80%;
    height: 1px;
    margin: 0;
  }
}

/* 数据刷新时的动画 */
@keyframes refresh-spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.refresh-spin {
  animation: refresh-spin 1s infinite linear;
  color: #48bb78;
}

/* 数据更新时的高亮效果 */
@keyframes highlight-pulse {
  0% { box-shadow: 0 8px 24px rgba(0, 0, 0, 0.15); }
  50% { box-shadow: 0 8px 30px rgba(66, 153, 225, 0.6); background: linear-gradient(120deg, #1a2936, #304b60); }
  100% { box-shadow: 0 8px 24px rgba(0, 0, 0, 0.15); }
}

.highlight-update {
  animation: highlight-pulse 2s ease;
}

/* 游客模式提示框样式 */
.guest-info-banner {
  width: 100%;
  background: linear-gradient(135deg, rgba(255, 152, 0, 0.1), rgba(255, 193, 7, 0.2));
  border: 1px solid rgba(255, 152, 0, 0.3);
  border-radius: 12px;
  padding: 16px;
  margin-bottom: 20px;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.05);
  position: relative;
  overflow: hidden;
  animation: fadeInDown 0.5s ease-out;
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
  background: rgba(255, 152, 0, 0.15);
  display: flex;
  align-items: center;
  justify-content: center;
}

.guest-icon i {
  font-size: 24px;
  color: #FF9800;
}

.guest-message {
  flex: 1;
}

.guest-message h3 {
  font-size: 18px;
  margin: 0 0 4px 0;
  color: #F57C00;
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

@keyframes fadeInDown {
  from {
    opacity: 0;
    transform: translateY(-10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
</style> 