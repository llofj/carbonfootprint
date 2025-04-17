<template>
  <div class="carbon-reduction-calculator">
    <div class="calculator-container">
      <!-- 左侧分类列表 -->
      <div class="category-list">
        <div
          v-for="category in categories"
          :key="category.id"
          class="category-item"
          :class="{ active: activeCategory === category.id }"
          @click="setActiveCategory(category.id)"
        >
          <i :class="category.icon"></i>
          <span>{{ category.name }}</span>
        </div>
      </div>

      <!-- 中间活动列表 -->
      <div class="activity-list">
        <div
          v-for="activity in filteredActivities"
          :key="activity.id"
          class="activity-item"
          :class="{ selected: isActivitySelected(activity.id) }"
          @click="toggleActivity(activity)"
        >
          <div class="activity-icon">
            <i :class="activity.icon"></i>
          </div>
          <div class="activity-info">
            <h3>{{ activity.name }}</h3>
            <p>{{ activity.description }}</p>
            <div class="activity-factor">
              <span>减碳系数：</span>
              <span class="factor-value">{{ activity.factor }} kgCO₂e/{{ activity.unit }}</span>
            </div>
          </div>
        </div>
      </div>

      <!-- 右侧计算面板 -->
      <div class="calculation-panel">
        <div class="selected-activities">
          <h3>已选减碳活动</h3>
          <div v-if="selectedActivities.length === 0" class="no-activities">
            <i class="fas fa-info-circle"></i>
            <p>请从左侧选择减碳活动</p>
          </div>
          <div v-else class="activity-inputs">
            <div v-for="activity in selectedActivities" :key="activity.id" class="activity-input">
              <div class="activity-header">
                <span>{{ activity.name }}</span>
                <button class="remove-btn" @click="removeActivity(activity.id)">
                  <i class="fas fa-times"></i>
                </button>
              </div>
              <div class="input-group">
                <input
                  type="number"
                  v-model="activity.amount"
                  :placeholder="'输入' + activity.unit"
                  min="0"
                  @input="calculateTotalReduction"
                />
                <span class="unit">{{ activity.unit }}</span>
              </div>
              <div class="reduction-amount">
                减碳量：{{ (activity.amount * activity.factor).toFixed(2) }} kgCO₂e
              </div>
            </div>
          </div>
        </div>

        <div class="total-reduction">
          <div class="total-header">
            <h3>总减碳量</h3>
            <span class="total-value">{{ totalReduction.toFixed(2) }} kgCO₂e</span>
          </div>
          <div class="tree-equivalent">
            <i class="fas fa-tree"></i>
            <span>相当于种植了 {{ (totalReduction / 18).toFixed(1) }} 棵树</span>
          </div>
        </div>

        <button
          class="save-btn"
          :disabled="!canSave || isSaving"
          @click="saveReduction"
        >
          <i class="fas fa-save" v-if="!isSaving"></i>
          <i class="fas fa-spinner fa-spin" v-else></i>
          {{ isSaving ? '保存中...' : '保存减碳记录' }}
        </button>
      </div>
    </div>

    <!-- 保存成功提示 -->
    <div v-if="showSuccess" class="success-message success">
      <i class="fas fa-check-circle"></i>
      <div class="message-content">
        <div class="message-title">减碳记录保存成功！</div>
      </div>
      <button class="close-message-btn" @click="showSuccess = false">
        <i class="fas fa-times"></i>
      </button>
    </div>
    
    <!-- 保存失败提示 -->
    <div v-if="showError" class="success-message error">
      <i class="fas fa-exclamation-circle"></i>
      <div class="message-content">
        <div class="message-title">保存失败</div>
        <div class="message-detail">{{ errorMessage }}</div>
      </div>
      <button class="close-message-btn" @click="showError = false">
        <i class="fas fa-times"></i>
      </button>
    </div>
  </div>
</template>

<script>
import { ref, computed } from 'vue'
import { useStore } from 'vuex'
import { useRouter } from 'vue-router'
import { getAPI } from '@/config/api'

export default {
  name: 'CarbonReductionCalculator',
  emits: ['reductionSaved'],
  setup(props, { emit }) {
    const store = useStore()
    const router = useRouter()
    const showSuccess = ref(false)
    const showError = ref(false)
    const errorMessage = ref('')
    const isSaving = ref(false)

    // 减碳活动分类
    const categories = [
      { id: 'transport', name: '交通出行', icon: 'fas fa-car' },
      { id: 'energy', name: '能源使用', icon: 'fas fa-bolt' },
      { id: 'food', name: '饮食选择', icon: 'fas fa-utensils' },
      { id: 'waste', name: '垃圾处理', icon: 'fas fa-trash' },
      { id: 'lifestyle', name: '生活方式', icon: 'fas fa-heart' }
    ]

    // 减碳活动列表
    const activities = [
      {
        id: 'bike',
        category: 'transport',
        name: '骑自行车出行',
        description: '使用自行车代替机动车出行',
        icon: 'fas fa-bicycle',
        factor: 0.2,
        unit: '公里'
      },
      {
        id: 'public_transport',
        category: 'transport',
        name: '乘坐公共交通',
        description: '使用公交、地铁等公共交通工具',
        icon: 'fas fa-bus',
        factor: 0.1,
        unit: '公里'
      },
      {
        id: 'walk',
        category: 'transport',
        name: '步行出行',
        description: '选择步行代替其他交通方式',
        icon: 'fas fa-walking',
        factor: 0.05,
        unit: '公里'
      },
      {
        id: 'led_light',
        category: 'energy',
        name: '使用LED灯',
        description: '使用LED节能灯泡',
        icon: 'fas fa-lightbulb',
        factor: 0.02,
        unit: '小时'
      },
      {
        id: 'solar_panel',
        category: 'energy',
        name: '使用太阳能',
        description: '使用太阳能热水器或发电',
        icon: 'fas fa-solar-panel',
        factor: 0.5,
        unit: '千瓦时'
      },
      {
        id: 'vegetarian',
        category: 'food',
        name: '素食饮食',
        description: '选择素食代替肉类',
        icon: 'fas fa-leaf',
        factor: 0.3,
        unit: '餐'
      },
      {
        id: 'local_food',
        category: 'food',
        name: '本地食材',
        description: '选择本地生产的食材',
        icon: 'fas fa-store',
        factor: 0.1,
        unit: '公斤'
      },
      {
        id: 'recycle',
        category: 'waste',
        name: '垃圾分类回收',
        description: '正确分类和回收垃圾',
        icon: 'fas fa-recycle',
        factor: 0.15,
        unit: '公斤'
      },
      {
        id: 'compost',
        category: 'waste',
        name: '厨余堆肥',
        description: '将厨余垃圾进行堆肥处理',
        icon: 'fas fa-seedling',
        factor: 0.2,
        unit: '公斤'
      },
      {
        id: 'reusable_bag',
        category: 'lifestyle',
        name: '使用环保袋',
        description: '使用可重复使用的购物袋',
        icon: 'fas fa-shopping-bag',
        factor: 0.01,
        unit: '次'
      },
      {
        id: 'reusable_bottle',
        category: 'lifestyle',
        name: '使用环保水杯',
        description: '使用可重复使用的水杯',
        icon: 'fas fa-glass-whiskey',
        factor: 0.02,
        unit: '次'
      }
    ]

    const activeCategory = ref('transport')
    const selectedActivities = ref([])
    const totalReduction = ref(0)

    // 根据当前分类筛选活动
    const filteredActivities = computed(() => {
      return activities.filter(activity => activity.category === activeCategory.value)
    })

    // 设置当前活动分类
    const setActiveCategory = (categoryId) => {
      activeCategory.value = categoryId
    }

    // 检查活动是否已选择
    const isActivitySelected = (activityId) => {
      return selectedActivities.value.some(activity => activity.id === activityId)
    }

    // 切换活动选择状态
    const toggleActivity = (activity) => {
      const index = selectedActivities.value.findIndex(item => item.id === activity.id)
      if (index === -1) {
        selectedActivities.value.push({
          ...activity,
          amount: 0
        })
      } else {
        selectedActivities.value.splice(index, 1)
      }
      calculateTotalReduction()
    }

    // 移除已选活动
    const removeActivity = (activityId) => {
      selectedActivities.value = selectedActivities.value.filter(
        activity => activity.id !== activityId
      )
      calculateTotalReduction()
    }

    // 计算总减碳量
    const calculateTotalReduction = () => {
      totalReduction.value = selectedActivities.value.reduce((total, activity) => {
        return total + (activity.amount * activity.factor)
      }, 0)
    }

    // 检查是否可以保存
    const canSave = computed(() => {
      return selectedActivities.value.length > 0 &&
        selectedActivities.value.every(activity => activity.amount > 0)
    })

    // 保存减碳记录
    const saveReduction = async () => {
      if (!canSave.value || isSaving.value) return
      
      isSaving.value = true
      showSuccess.value = false
      showError.value = false
      
      // 检查输入值的有效性
      const invalidActivity = selectedActivities.value.find(activity => 
        !activity.amount || isNaN(activity.amount) || activity.amount <= 0
      )
      
      if (invalidActivity) {
        showError.value = true
        errorMessage.value = `请为「${invalidActivity.name}」输入有效的数量`
        isSaving.value = false
        return
      }

      try {
        // 准备提交的数据，确保reduction是数字类型
        const activitiesData = selectedActivities.value.map(activity => ({
          id: activity.id,
          name: activity.name,
          amount: parseFloat(activity.amount),
          reduction: parseFloat((activity.amount * activity.factor).toFixed(2))
        }))
        
        console.log('发送减碳数据:', activitiesData)
        
        // 检查用户token是否存在
        const token = localStorage.getItem('token')
        if (!token) {
          showError.value = true
          errorMessage.value = '未登录或会话已过期，请重新登录'
          isSaving.value = false
          return
        }
        
        console.log('请求开始，准备发送POST请求到:', '/carbon/reduction')
        
        try {
          // 获取配置好的axios实例
          const api = getAPI()
          
          // 打印请求配置
          console.log('API配置:', {
            baseURL: api.defaults.baseURL,
            timeout: api.defaults.timeout,
            headers: api.defaults.headers
          })
          
          // 发送请求
          const response = await api.post('/carbon/reduction', {
            activities: activitiesData
          })
          
          console.log('请求成功，服务器响应:', response.data)
          
          if (response.data && response.data.success) {
            // 清空已选活动
            selectedActivities.value = []
            // 重置总减碳量
            totalReduction.value = 0
            
            // 显示成功消息
            showSuccess.value = true
            
            // 通知父组件更新用户减碳总量
            const newTotal = response.data.data.newTotalReduction || 0
            console.log('新的减碳总量:', newTotal)
            emit('reductionSaved', newTotal)
            
            // 延迟刷新
            setTimeout(async () => {
              try {
                // 直接刷新当前页面的数据
                await store.dispatch('updateUserCarbonReduction')
                
                // 同步更新排名系统
                await store.dispatch('syncLeaderboardWithCarbonReduction')
                console.log('已同步排名系统数据')
              } catch (refreshError) {
                console.error('刷新数据失败:', refreshError)
              }
            }, 1500)
          } else {
            showError.value = true
            errorMessage.value = response.data?.error || '保存失败，请重试'
            console.error('保存失败，响应中没有success标志:', response.data)
          }
        } catch (apiError) {
          console.error('API调用失败:', apiError)
          throw apiError
        }
      } catch (error) {
        console.error('保存减碳记录失败:', error)
        showError.value = true
        
        // 提取详细的错误信息
        const serverError = error.response?.data?.error || error.response?.data?.message
        const serverDetails = error.response?.data?.details
        
        if (serverError) {
          errorMessage.value = serverDetails 
            ? `${serverError}: ${serverDetails}`
            : serverError
          console.error('服务器返回错误:', serverError, serverDetails)
        } else if (error.request) {
          // 请求发出但没有收到响应
          errorMessage.value = '服务器无响应，请检查网络连接'
          console.error('请求无响应:', error.request)
        } else {
          // 请求设置或发送前出错
          errorMessage.value = '请求发送失败，请稍后重试'
          console.error('请求发送错误:', error.message)
        }
      } finally {
        isSaving.value = false
      }
    }

    return {
      categories,
      activeCategory,
      filteredActivities,
      selectedActivities,
      totalReduction,
      showSuccess,
      showError,
      errorMessage,
      isSaving,
      canSave,
      setActiveCategory,
      isActivitySelected,
      toggleActivity,
      removeActivity,
      calculateTotalReduction,
      saveReduction
    }
  }
}
</script>

<style scoped>
.carbon-reduction-calculator {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 20px;
}

.calculator-header {
  text-align: center;
  margin-bottom: 30px;
  display: none; /* 隐藏重复的标题 */
}

.calculator-container {
  display: flex;
  gap: 20px;
  background: #fff;
  border-radius: 10px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
  padding: 20px;
}

.category-list {
  width: 200px;
  border-right: 1px solid #eee;
  padding-right: 20px;
}

.category-item {
  display: flex;
  align-items: center;
  padding: 12px 15px;
  margin-bottom: 10px;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.3s ease;
}

.category-item:hover {
  background: #f5f5f5;
}

.category-item.active {
  background: #e3f2fd;
  color: #1976d2;
}

.category-item i {
  margin-right: 10px;
  font-size: 18px;
}

.activity-list {
  flex: 1;
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
  gap: 15px;
  padding: 0 20px;
  max-height: 600px;
  overflow-y: auto;
}

.activity-item {
  background: #fff;
  border: 1px solid #eee;
  border-radius: 8px;
  padding: 15px;
  cursor: pointer;
  transition: all 0.3s ease;
}

.activity-item:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.activity-item.selected {
  border-color: #4caf50;
  background: #f1f8e9;
}

.activity-icon {
  width: 40px;
  height: 40px;
  background: #f5f5f5;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 10px;
}

.activity-icon i {
  font-size: 20px;
  color: #666;
}

.activity-info h3 {
  font-size: 16px;
  margin-bottom: 5px;
  color: #2c3e50;
}

.activity-info p {
  font-size: 14px;
  color: #666;
  margin-bottom: 10px;
}

.activity-factor {
  font-size: 14px;
  color: #666;
}

.factor-value {
  color: #4caf50;
  font-weight: bold;
}

.calculation-panel {
  width: 300px;
  border-left: 1px solid #eee;
  padding-left: 20px;
}

.selected-activities {
  margin-bottom: 20px;
}

.selected-activities h3 {
  font-size: 18px;
  margin-bottom: 15px;
  color: #2c3e50;
}

.no-activities {
  text-align: center;
  padding: 20px;
  color: #999;
}

.no-activities i {
  font-size: 24px;
  margin-bottom: 10px;
}

.activity-inputs {
  max-height: 300px;
  overflow-y: auto;
}

.activity-input {
  background: #f5f5f5;
  border-radius: 8px;
  padding: 15px;
  margin-bottom: 10px;
}

.activity-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 10px;
}

.remove-btn {
  background: none;
  border: none;
  color: #999;
  cursor: pointer;
  padding: 5px;
}

.remove-btn:hover {
  color: #f44336;
}

.input-group {
  display: flex;
  align-items: center;
  margin-bottom: 10px;
}

.input-group input {
  flex: 1;
  padding: 8px 12px;
  border: 1px solid #ddd;
  border-radius: 4px;
  margin-right: 10px;
}

.unit {
  color: #666;
  font-size: 14px;
}

.reduction-amount {
  font-size: 14px;
  color: #4caf50;
}

.total-reduction {
  background: #e8f5e9;
  border-radius: 8px;
  padding: 20px;
  margin-bottom: 20px;
}

.total-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 10px;
}

.total-value {
  font-size: 24px;
  font-weight: bold;
  color: #4caf50;
}

.tree-equivalent {
  display: flex;
  align-items: center;
  color: #666;
}

.tree-equivalent i {
  margin-right: 10px;
  color: #4caf50;
}

.save-btn {
  width: 100%;
  padding: 12px;
  background: #4caf50;
  color: white;
  border: none;
  border-radius: 4px;
  font-size: 16px;
  cursor: pointer;
  transition: background 0.3s ease;
}

.save-btn:hover {
  background: #43a047;
}

.save-btn:disabled {
  background: #cccccc;
  cursor: not-allowed;
}

.save-btn i {
  margin-right: 8px;
}

.success-message {
  position: fixed;
  top: 20px;
  right: 20px;
  color: white;
  padding: 15px 25px;
  border-radius: 4px;
  display: flex;
  align-items: flex-start;
  animation: slideIn 0.3s ease;
  z-index: 1000;
  min-width: 300px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.success-message.success {
  background: #4caf50;
}

.success-message.error {
  background: #f44336;
}

.success-message i {
  margin-right: 15px;
  font-size: 24px;
}

.message-content {
  flex: 1;
}

.message-title {
  font-weight: bold;
  margin-bottom: 5px;
}

.message-detail {
  font-size: 14px;
  opacity: 0.9;
}

.close-message-btn {
  background: none;
  border: none;
  color: white;
  opacity: 0.7;
  cursor: pointer;
  font-size: 16px;
  padding: 0;
  margin-left: 10px;
  transition: opacity 0.2s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 24px;
  height: 24px;
}

.close-message-btn:hover {
  opacity: 1;
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

/* 按钮加载中状态 */
.fa-spinner {
  animation: spin 1s infinite linear;
}

@keyframes spin {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}
</style> 