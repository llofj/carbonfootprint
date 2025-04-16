<template>
  <transition name="fade">
    <div v-if="show" :class="['message', type]">
      {{ content }}
    </div>
  </transition>
</template>

<script>
import { mapState } from 'vuex'

export default {
  name: 'Message',
  computed: {
    ...mapState('message', ['show', 'content', 'type'])
  }
}
</script>

<style scoped>
.message {
  position: fixed;
  top: 20px;
  left: 50%;
  transform: translateX(-50%);
  padding: 10px 20px;
  border-radius: 4px;
  color: white;
  font-size: 14px;
  z-index: 9999;
}

.success {
  background-color: #67C23A;
}

.error {
  background-color: #F56C6C;
}

.warning {
  background-color: #E6A23C;
}

.info {
  background-color: #909399;
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style> 