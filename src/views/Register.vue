<template>
  <div class="register-page">
    <RegisterForm />
  </div>
</template>

<script>
import RegisterForm from '../components/RegisterForm.vue';

export default {
  components: {
    RegisterForm
  }
};
</script>

<style scoped>
.register-page {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100vh;
  background-color: #f5f5f5;
}
</style> 