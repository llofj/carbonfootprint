<template>
  <div>
    <Navbar />
    <div class="content">
      <Achievements />
    </div>
  </div>
</template>

<script>
import Navbar from '../components/Navbar.vue';
import Achievements from '../components/Achievements.vue';

export default {
  components: {
    Navbar,
    Achievements
  }
};
</script>

<style scoped>
.content {
  padding-top: 70px;
}
</style>