<template>
    <div class="virtual-pet-page">
      <VirtualPet />
    </div>
  </template>
  
  <script>
  import VirtualPet from '../components/VirtualPet.vue';
  
  export default {
    components: {
      VirtualPet
    }
  };
  </script>
  
  <style scoped>
  .virtual-pet-page {
    padding: 20px;
  }
  </style>