<template>
  <div>
    <Navbar />
    <div class="content">
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
  }
};
</script>

<style scoped>
.content {
  padding-top: 70px;
}
</style>