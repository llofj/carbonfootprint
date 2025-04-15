<template>
  <div>
    <Navbar />
    <div class="content">
      <div class="back-to-home">
        <button @click="goHome" class="back-btn">
          <i class="fas fa-home"></i> 返回主页
        </button>
      </div>
      <Leaderboard />
    </div>
  </div>
</template>

<script>
import Navbar from '../components/Navbar.vue';
import Leaderboard from '../components/Leaderboard.vue';

export default {
  components: {
    Navbar,
    Leaderboard
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
  padding-top: 70px;
  position: relative;
}

.back-to-home {
  position: absolute;
  top: 80px;
  left: 20px;
  z-index: 10;
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
</style>