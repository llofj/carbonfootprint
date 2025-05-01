<template>
  <div>
    <Navbar />
    <div class="content achievements-page">
      <div class="back-to-home">
        <button @click="goHome" class="back-btn">
          <i class="fas fa-home"></i>
          <span>返回主页</span>
        </button>
      </div>
      <Achievements />
    </div>
  </div>
</template>

<script>
import Navbar from '../components/Navbar.vue';
import Achievements from '../components/Achievements.vue';
import '../assets/css/homeButton.css';

export default {
  components: {
    Navbar,
    Achievements
  },
  methods: {
    goHome() {
      this.$router.push('/');
    }
  }
};
</script>

<style scoped>
.content {
  min-height: 100vh;
  padding-top: 70px;
  position: relative;
}

.content::before {
  display: none;
}

.achievements-page {
  z-index: 2;
  position: relative;
  padding-bottom: 60px;
  max-width: 1100px;
  margin: 0 auto;
}

.back-to-home {
  position: absolute;
  top: 80px;
  left: 20px;
  z-index: 10;
}

@media (max-width: 768px) {
  .content {
    padding-top: 90px;
  }
  
  .back-to-home {
    top: 70px;
    left: 15px;
  }
}
</style>