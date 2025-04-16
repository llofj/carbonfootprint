<template>
  <transition name="fade">
    <div v-if="show" class="message-box" :class="type">
      <div class="message-content">
        <i :class="iconClass"></i>
        <span>{{ message }}</span>
      </div>
    </div>
  </transition>
</template>

<script>
export default {
  name: 'MessageBox',
  props: {
    show: {
      type: Boolean,
      default: false
    },
    message: {
      type: String,
      default: ''
    },
    type: {
      type: String,
      default: 'info',
      validator: value => ['success', 'error', 'warning', 'info'].includes(value)
    }
  },
  computed: {
    iconClass() {
      const icons = {
        success: 'fas fa-check-circle',
        error: 'fas fa-times-circle',
        warning: 'fas fa-exclamation-circle',
        info: 'fas fa-info-circle'
      }
      return icons[this.type]
    }
  }
}
</script>

<style scoped>
.message-box {
  position: fixed;
  top: 20px;
  right: 20px;
  padding: 15px 25px;
  border-radius: 12px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  z-index: 9999;
  min-width: 300px;
  max-width: 500px;
  backdrop-filter: blur(8px);
  border: 1px solid rgba(255, 255, 255, 0.2);
  animation: slideIn 0.3s ease-out;
}

@keyframes slideIn {
  from {
    transform: translateX(100%);
    opacity: 0;
  }
  to {
    transform: translateX(0);
    opacity: 1;
  }
}

.message-content {
  display: flex;
  align-items: center;
  gap: 12px;
  font-size: 14px;
  font-weight: 500;
}

.message-content i {
  font-size: 20px;
}

.success {
  background: linear-gradient(135deg, rgba(103, 194, 58, 0.95), rgba(139, 195, 74, 0.95));
  color: white;
  border: 1px solid rgba(103, 194, 58, 0.3);
}

.error {
  background: linear-gradient(135deg, rgba(245, 108, 108, 0.95), rgba(251, 196, 196, 0.95));
  color: white;
  border: 1px solid rgba(245, 108, 108, 0.3);
}

.warning {
  background: linear-gradient(135deg, rgba(230, 162, 60, 0.95), rgba(253, 246, 236, 0.95));
  color: white;
  border: 1px solid rgba(230, 162, 60, 0.3);
}

.info {
  background: linear-gradient(135deg, rgba(144, 147, 153, 0.95), rgba(211, 212, 214, 0.95));
  color: white;
  border: 1px solid rgba(144, 147, 153, 0.3);
}

.fade-enter-active, .fade-leave-active {
  transition: all 0.3s ease;
}

.fade-enter-from, .fade-leave-to {
  opacity: 0;
  transform: translateX(100%);
}

/* 添加悬停效果 */
.message-box:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 16px rgba(0, 0, 0, 0.2);
  transition: all 0.3s ease;
}

/* 为不同类型的消息添加特定的悬停效果 */
.success:hover {
  background: linear-gradient(135deg, rgba(103, 194, 58, 1), rgba(139, 195, 74, 1));
}

.error:hover {
  background: linear-gradient(135deg, rgba(245, 108, 108, 1), rgba(251, 196, 196, 1));
}

.warning:hover {
  background: linear-gradient(135deg, rgba(230, 162, 60, 1), rgba(253, 246, 236, 1));
}

.info:hover {
  background: linear-gradient(135deg, rgba(144, 147, 153, 1), rgba(211, 212, 214, 1));
}
</style> 