<template>
  <div class="home">
    <Navbar />
    
    <div class="hero-section">
      <div class="hero-content">
        <h1 class="hero-title">计算您的碳足迹</h1>
        <p class="hero-subtitle">减碳，让时光更轻盈</p>
        <router-link to="/calculator" class="cta-button">
          开始计算
        </router-link>
      </div>
    </div>

    <div class="intro-section">
      <h2 class="intro-title">为什么选择 EcoPaw?</h2>
      <p class="intro-text">
        EcoPaw 是一个创新的碳足迹管理平台，通过游戏化的方式帮助您追踪和减少碳排放。
        我们相信，每个人都可以为环保做出贡献，而且这个过程可以变得有趣而有意义。
      </p>
    </div>

    <div class="features-section">
      <div class="container">
        <h2 class="section-title">功能介绍</h2>
        <div class="features-grid">
          <!-- 碳计算器卡片 - 无需登录 -->
          <div class="feature-card">
            <router-link to="/calculator">
              <i class="fas fa-calculator feature-icon"></i>
              <h3>碳计算器</h3>
              <p>计算您的日常碳足迹</p>
            </router-link>
          </div>
          
          <!-- 需要登录的功能卡片 -->
          <div class="feature-card" :class="{ 'disabled': !isLoggedIn }">
            <a @click.prevent="handleAuthRequired('/pet')">
              <i class="fas fa-paw feature-icon"></i>
              <h3>虚拟宠物</h3>
              <p>培养您的环保小伙伴</p>
              <span v-if="!isLoggedIn" class="login-required">需要登录</span>
            </a>
          </div>
          
          <div class="feature-card" :class="{ 'disabled': !isLoggedIn }">
            <a @click.prevent="handleAuthRequired('/achievements')">
              <i class="fas fa-trophy feature-icon"></i>
              <h3>成就系统</h3>
              <p>解锁环保成就</p>
              <span v-if="!isLoggedIn" class="login-required">需要登录</span>
            </a>
          </div>
          
          <div class="feature-card" :class="{ 'disabled': !isLoggedIn }">
            <a @click.prevent="handleAuthRequired('/ranking')">
              <i class="fas fa-chart-line feature-icon"></i>
              <h3>排名系统</h3>
              <p>查看环保排行榜</p>
              <span v-if="!isLoggedIn" class="login-required">需要登录</span>
            </a>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import Navbar from '@/components/Navbar.vue';

export default {
  name: 'Home',
  components: {
    Navbar
  },
  data() {
    return {
      isLoggedIn: false
    }
  },
  created() {
    this.checkLoginStatus()
    window.addEventListener('storage', this.checkLoginStatus)
  },
  beforeUnmount() {
    window.removeEventListener('storage', this.checkLoginStatus)
  },
  methods: {
    handleAuthRequired(path) {
      if (!this.isLoggedIn) {
        this.$router.push({
          path: '/login',
          query: { redirect: path }
        })
      } else {
        this.$router.push(path)
      }
    },
    checkLoginStatus() {
      this.isLoggedIn = !!localStorage.getItem('token')
    }
  }
};
</script>

<style scoped>
.home {
  min-height: 100vh;
  position: relative;
}

.hero-section {
  height: 100vh;
  background-image: url('@/assets/carbon_2.png');
  background-size: cover;
  background-position: center;
  background-repeat: no-repeat;
  display: flex;
  align-items: center;
  justify-content: flex-start;
  padding-left: 10%;
  position: relative;
}

.hero-section::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(
    to right,
    rgba(0, 0, 0, 0.6) 0%,
    rgba(0, 0, 0, 0.3) 50%,
    rgba(0, 0, 0, 0) 100%
  );
}

.hero-content {
  position: relative;
  z-index: 1;
  max-width: 600px;
  text-align: left;
}

.hero-title {
  font-size: 3.5rem;
  color: #ffffff;
  margin-bottom: 1rem;
  font-weight: bold;
  text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.3);
}

.hero-subtitle {
  font-size: 1.5rem;
  color: #ffffff;
  margin-bottom: 2rem;
  text-shadow: 1px 1px 2px rgba(0, 0, 0, 0.3);
}

.cta-button {
  display: inline-block;
  padding: 1rem 2rem;
  background-color: #17a2b8;
  color: white;
  text-decoration: none;
  border-radius: 30px;
  font-size: 1.2rem;
  font-weight: 500;
  transition: all 0.3s ease;
  border: 2px solid transparent;
}

.cta-button:hover {
  background-color: transparent;
  border-color: #17a2b8;
  transform: translateY(-2px);
}

.intro-section {
  padding: 4rem 2rem;
  background-color: #f8f9fa;
  text-align: center;
}

.intro-title {
  font-size: 2.5rem;
  color: #2196F3;
  margin-bottom: 1.5rem;
  font-weight: 600;
}

.intro-text {
  font-size: 1.2rem;
  color: #666;
  max-width: 800px;
  margin: 0 auto;
  line-height: 1.8;
}

.features-section {
  padding: 4rem 0;
  background-color: #f8f9fa;
}

.container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 1rem;
}

.section-title {
  text-align: center;
  font-size: 2.5rem;
  color: #1e3d59;
  margin-bottom: 3rem;
}

.features-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 2rem;
  padding: 0 1rem;
}

.feature-card {
  background: white;
  border-radius: 10px;
  padding: 2rem;
  text-align: center;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  transition: transform 0.3s ease;
}

.feature-card:not(.disabled):hover {
  transform: translateY(-10px);
}

.feature-card.disabled {
  opacity: 0.7;
  cursor: not-allowed;
}

.feature-card a {
  text-decoration: none;
  color: inherit;
  display: block;
  cursor: pointer;
}

.feature-card.disabled a {
  cursor: not-allowed;
}

.feature-icon {
  font-size: 2.5rem;
  color: #17a2b8;
  margin-bottom: 1rem;
}

.feature-card h3 {
  font-size: 1.5rem;
  color: #1e3d59;
  margin-bottom: 0.5rem;
}

.feature-card p {
  color: #666;
  margin-bottom: 1rem;
}

.login-required {
  display: inline-block;
  padding: 0.25rem 0.75rem;
  background-color: #dc3545;
  color: white;
  border-radius: 15px;
  font-size: 0.8rem;
}

@media (max-width: 768px) {
  .hero-title {
    font-size: 2.5rem;
  }
  
  .hero-subtitle {
    font-size: 1.2rem;
  }
  
  .features-grid {
    grid-template-columns: 1fr;
  }
}
</style>