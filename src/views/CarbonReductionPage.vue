<template>
  <div class="carbon-reduction-page">
    <div class="calculator-container">
      <div class="back-to-home">
        <button @click="goHome" class="back-btn">
          <i class="fas fa-home"></i> 返回主页
        </button>
      </div>
      <div class="page-content">
        <h1 class="page-title">减碳计算器</h1>
        <p class="description">记录您的减碳行为，为环保贡献力量</p>
        <div class="switch-calculator">
          <button class="switch-btn" @click="switchToEmissionCalculator">
            <i class="fas fa-exchange-alt"></i>
            切换到碳排放计算器
          </button>
        </div>
        <CarbonReductionCalculator />
      </div>
    </div>
  </div>
</template>

<script>
import CarbonReductionCalculator from '@/components/CarbonReductionCalculator.vue'
import { useRouter } from 'vue-router'

export default {
  name: 'CarbonReductionPage',
  components: {
    CarbonReductionCalculator
  },
  setup() {
    const router = useRouter()

    const switchToEmissionCalculator = () => {
      router.push('/calculator')
    }

    const goHome = () => {
      router.push('/')
    }

    return {
      switchToEmissionCalculator,
      goHome
    }
  }
}
</script>

<style scoped>
.carbon-reduction-page {
  min-height: 100vh;
  background-color: #f8f9fa;
  padding-top: 20px;
}

.calculator-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 1rem;
  position: relative;
}

.page-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-top: 30px;
}

.page-title {
  color: #1e3d59;
  text-align: center;
  margin-bottom: 0.5rem;
  font-size: 28px;
}

.description {
  text-align: center;
  color: #666;
  margin-bottom: 1rem;
}

.back-to-home {
  position: absolute;
  top: 20px;
  left: 20px;
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

.switch-calculator {
  margin: 0 0 1.5rem 0;
}

.switch-btn {
  display: flex;
  align-items: center;
  padding: 10px 20px;
  background: linear-gradient(135deg, #3498db, #1abc9c);
  border: none;
  border-radius: 25px;
  color: white;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 3px 8px rgba(26, 188, 156, 0.3);
}

.switch-btn:hover {
  background: linear-gradient(135deg, #2980b9, #16a085);
  transform: translateY(-2px);
  box-shadow: 0 5px 12px rgba(26, 188, 156, 0.4);
}

.switch-btn i {
  margin-right: 8px;
  animation: spin 7s infinite linear;
  opacity: 0.9;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  25% { transform: rotate(90deg); }
  50% { transform: rotate(180deg); }
  75% { transform: rotate(270deg); }
  100% { transform: rotate(360deg); }
}
</style> 