<template>
  <div class="virtual-pet-page-wrapper">
    <Navbar />
    <div class="content virtual-pet-page">
      <div class="back-to-home">
        <button @click="goHome" class="back-btn">
          <i class="fas fa-home"></i>
          <span>返回主页</span>
        </button>
      </div>
      <VirtualPet />
    </div>
  </div>
</template>

<script>
import VirtualPet from '../components/VirtualPet.vue';
import Navbar from '../components/Navbar.vue';
import '../assets/css/homeButton.css';

export default {
  components: {
    VirtualPet,
    Navbar
  },
  methods: {
    goHome() {
      this.$router.push('/');
    }
  }
};
</script>

<style scoped>
.virtual-pet-page-wrapper {
  min-height: 100vh;
  position: relative;
  background-image: url('../assets/carbon_7.jpg');
  background-size: cover;
  background-position: center;
  background-attachment: fixed;
}

.virtual-pet-page-wrapper::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(135deg, rgba(255, 255, 255, 0.8), rgba(255, 255, 255, 0.7));
  backdrop-filter: blur(3px);
  z-index: 1;
}

.content {
  position: relative;
  z-index: 2;
  padding-top: 80px;
  padding-bottom: 40px;
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
    padding-left: 15px;
    padding-right: 15px;
  }
  
  .back-to-home {
    top: 70px;
    left: 15px;
  }
}
</style>