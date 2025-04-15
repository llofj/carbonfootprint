<template>
    <div class="virtual-pet-page">
      <Navbar />
      <div class="back-to-home">
        <button @click="goHome" class="back-btn">
          <i class="fas fa-home"></i> 返回主页
        </button>
      </div>
      <VirtualPet />
    </div>
  </template>
  
  <script>
  import VirtualPet from '../components/VirtualPet.vue';
  import Navbar from '../components/Navbar.vue';
  
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
  .virtual-pet-page {
    padding: 20px;
    position: relative;
    padding-top: 70px;
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