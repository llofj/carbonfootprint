<template>
  <div class="home">
    <Navbar />
    
    <div class="hero-section">
      <div class="hero-content">
        <h1 class="hero-title">计算您的碳足迹</h1>
        <p class="hero-subtitle">减碳，让时光更轻盈</p>
        <router-link to="/calculator" class="cta-button">
          <span>开始计算</span>
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

    <!-- 新增页脚部分 -->
    <div class="footer">
      <div class="footer-content">
        <div class="footer-logo">EcoPaw</div>
        <p class="footer-text">
          携手共建绿色未来，让每一个环保行动都成为点亮地球的星光。
        </p>
        <div class="social-icons">
          <a href="https://www.deepseek.com/" target="_blank" class="social-icon" title="DeepSeek"><i class="fas fa-brain"></i></a>
          <a href="https://www.carbonmonitor.org.cn/" target="_blank" class="social-icon" title="Carbon Monitor"><i class="fas fa-chart-line"></i></a>
        </div>
        <div class="copyright">
          &copy; {{ new Date().getFullYear() }} EcoPaw. 保留所有权利.
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
/* 样式已移至全局CSS文件 */
</style>