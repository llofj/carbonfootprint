<template>
  <div class="calculator-page">
    <Navbar />
    <div class="calculator-container">
      <div class="back-to-home">
        <button @click="goHome" class="back-btn">
          <i class="fas fa-home"></i> 返回主页
        </button>
      </div>
      <div class="page-content">
        <h1 class="page-title">碳排放计算器</h1>
        <p class="description">通过记录日常活动，了解您的碳排放量</p>
        
        <div class="switch-calculator">
          <button class="switch-btn" @click="switchToReductionCalculator">
            <i class="fas fa-exchange-alt"></i>
            切换到减碳计算器
          </button>
        </div>
      
        <!-- 添加碳排放系数查看按钮 -->
        <div class="emission-factors-button" @click="showEmissionFactors = true">
          <i class="fas fa-info-circle"></i>
          <span>查看碳排放系数</span>
        </div>
        
        <!-- 碳排放系数弹窗 -->
        <div class="emission-factors-modal" v-if="showEmissionFactors" @click.self="showEmissionFactors = false">
          <div class="modal-content">
            <div class="modal-header">
              <h2>碳排放系数表</h2>
              <button class="close-button" @click="showEmissionFactors = false">×</button>
            </div>
            <div class="modal-body">
              <div v-for="(category, categoryName) in categories" :key="categoryName" class="category-section">
                <h3>{{ categoryName }}</h3>
                <table class="factors-table">
                  <thead>
                    <tr>
                      <th>项目</th>
                      <th>系数 (kgCO₂e)</th>
                      <th>单位</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr v-for="item in category" :key="item.name">
                      <td>{{ item.name }}</td>
                      <td>{{ item.factor }}</td>
                      <td>{{ item.unit }}</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
        
        <div class="calculator-content">
          <!-- 左侧分类选择区 -->
          <div class="categories-section">
            <div class="category-header">
              <span>类型</span>
            </div>

            <div class="category-list">
              <!-- 衣 -->
              <div class="category-item" :class="{ active: activeCategory === '衣' }" @click="setActiveCategory('衣')">
                <span class="category-icon">衣</span>
                <div class="category-options">
                  <div class="option-item" v-for="(item, index) in categories['衣']" :key="'衣'+index"
                    @click.stop="selectItem('衣', item)">
                    <div class="option-icon">
                      <span class="icon-text">{{ item.name.charAt(0) }}</span>
                    </div>
                    <span>{{ item.name }}</span>
                  </div>
                </div>
              </div>

              <!-- 食 -->
              <div class="category-item" :class="{ active: activeCategory === '食' }" @click="setActiveCategory('食')">
                <span class="category-icon">食</span>
                <div class="category-options">
                  <div class="option-item" v-for="(item, index) in categories['食']" :key="'食'+index"
                    @click.stop="selectItem('食', item)">
                    <div class="option-icon">
                      <span class="icon-text">{{ item.name.charAt(0) }}</span>
                    </div>
                    <span>{{ item.name }}</span>
                  </div>
                </div>
              </div>

              <!-- 住 -->
              <div class="category-item" :class="{ active: activeCategory === '住' }" @click="setActiveCategory('住')">
                <span class="category-icon">住</span>
                <div class="category-options">
                  <div class="option-item" v-for="(item, index) in categories['住']" :key="'住'+index"
                    @click.stop="selectItem('住', item)">
                    <div class="option-icon">
                      <span class="icon-text">{{ item.name.charAt(0) }}</span>
                    </div>
                    <span>{{ item.name }}</span>
                  </div>
                </div>
              </div>

              <!-- 行 -->
              <div class="category-item" :class="{ active: activeCategory === '行' }" @click="setActiveCategory('行')">
                <span class="category-icon">行</span>
                <div class="category-options">
                  <div class="option-item" v-for="(item, index) in categories['行']" :key="'行'+index"
                    @click.stop="selectItem('行', item)">
                    <div class="option-icon">
                      <span class="icon-text">{{ item.name.charAt(0) }}</span>
                    </div>
                    <span>{{ item.name }}</span>
                  </div>
                </div>
              </div>

              <!-- 用 -->
              <div class="category-item" :class="{ active: activeCategory === '用' }" @click="setActiveCategory('用')">
                <span class="category-icon">用</span>
                <div class="category-options">
                  <div class="option-item" v-for="(item, index) in categories['用']" :key="'用'+index"
                    @click.stop="selectItem('用', item)">
                    <div class="option-icon">
                      <span class="icon-text">{{ item.name.charAt(0) }}</span>
                    </div>
                    <span>{{ item.name }}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- 右侧计算区 -->
          <div class="calculation-section">
            <div class="calculation-header">
              <span class="header-left">排放源</span>
              <span class="header-right">排放量</span>
            </div>

            <div class="calculation-note">
              <span>*输入数据最多可支持三位数(单位:kgCO₂e)</span>
            </div>
            
            <div class="calculation-list">
              <!-- 已添加的计算项 -->
              <div v-for="(item, index) in calculationItems" :key="index" class="calculation-item">
                <div class="item-category">{{ item.category }}</div>
                <div class="item-name">{{ item.name }}</div>
                <div class="item-value">
                  <input 
                    type="number" 
                    v-model="item.value" 
                    min="0" 
                    max="999"
                    @input="calculateTotal"
                  />
                  <span class="item-unit">{{ item.unit }}</span>
                </div>
                <div class="item-emission">{{ item.emission }}</div>
                <button class="remove-btn" @click="removeItem(index)">×</button>
              </div>
            </div>

            <div class="calculation-total">
              <div class="total-label">总排放量</div>
              <div class="total-value">{{ totalEmission }}kgCO₂e</div>
            </div>

            <div class="offset-message" v-if="totalEmission > 0">
              您需要种植 <span class="tree-count">{{ offsetTrees }}</span> 棵树
              <div class="offset-note">抵消这些碳排放，实现碳中和</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import Navbar from '@/components/Navbar.vue';
import { useRouter } from 'vue-router'

export default {
  components: {
    Navbar
  },
  setup() {
    const router = useRouter()

    const switchToReductionCalculator = () => {
      router.push('/carbon-reduction')
    }
    
    const goHome = () => {
      router.push('/')
    }

    return {
      switchToReductionCalculator,
      goHome
    }
  },
  data() {
    return {
      activeCategory: '衣',
      showEmissionFactors: false,
      categories: {
        '衣': [
          { name: '涤纶织物', icon: 'textile.png', unit: '千克', factor: 25.7 },
          { name: '纯棉T恤', icon: 'tshirt.png', unit: '件', factor: 8.3 },
          { name: '洗衣液', icon: 'detergent.png', unit: '升', factor: 1.5 }
        ],
        '食': [
          { name: '白酒', icon: 'baijiu.png', unit: '斤', factor: 2.4 },
          { name: '啤酒', icon: 'beer.png', unit: '瓶', factor: 0.2 },
          { name: '吸烟', icon: 'smoking.png', unit: '包', factor: 2.1 },
          { name: '羊肉', icon: 'lamb.png', unit: '千克', factor: 39.2 },
          { name: '牛肉', icon: 'beef.png', unit: '千克', factor: 27.0 },
          { name: '猪肉', icon: 'pork.png', unit: '千克', factor: 7.9 },
          { name: '炸鸡', icon: 'chicken.png', unit: '份', factor: 5.8 },
          { name: '鸡蛋', icon: 'egg.png', unit: '个', factor: 0.2 },
          { name: '土豆', icon: 'potato.png', unit: '千克', factor: 0.3 },
          { name: '米饭', icon: 'rice.png', unit: '碗', factor: 0.2 },
          { name: '花生', icon: 'peanut.png', unit: '千克', factor: 2.5 },
          { name: '酸奶', icon: 'yogurt.png', unit: '杯', factor: 0.4 },
          { name: '西兰花', icon: 'broccoli.png', unit: '千克', factor: 2.0 },
          { name: '豆腐', icon: 'tofu.png', unit: '千克', factor: 2.0 },
          { name: '牛奶', icon: 'milk.png', unit: '升', factor: 1.6 },
          { name: '西红柿', icon: 'tomato.png', unit: '千克', factor: 1.5 },
          { name: '扁豆', icon: 'beans.png', unit: '千克', factor: 0.8 }
        ],
        '住': [
          { name: '水', icon: 'water.png', unit: '立方米', factor: 0.9 },
          { name: '电', icon: 'electricity.png', unit: '立方米', factor: 0.7 },
          { name: '天然气', icon: 'natural_gas.png', unit: '立方米', factor: 2.1 }
        ],
        '行': [
          { name: '轮船', icon: 'ship.png', unit: '公里', factor: 0.03 },
          { name: '公交车', icon: 'bus.png', unit: '公里', factor: 0.1 },
          { name: '私家电车', icon: 'electric-car.png', unit: '公里', factor: 0.05 },
          { name: '私家油车', icon: 'gas-car.png', unit: '公里', factor: 0.25 },
          { name: '火车', icon: 'train.png', unit: '公里', factor: 0.06 },
          { name: '飞机', icon: 'plane.png', unit: '公里', factor: 0.25 }
        ],
        '用': [
          { name: '塑料袋', icon: 'plastic.png', unit: '个', factor: 0.02 },
          { name: '纸巾', icon: 'tissue.png', unit: '包(10张)', factor: 0.8 },
          { name: '电子设备', icon: 'device.png', unit: '小时', factor: 1.2 }
        ]
      },
      calculationItems: [],
      totalEmission: 0,
      offsetTrees: 0.3
    };
  },
  created() {
    // 不需要检查用户登录和加载减碳数据
  },
  methods: {
    setActiveCategory(category) {
      this.activeCategory = category;
    },
    selectItem(category, item) {
      // 检查是否已经添加了相同的项目
      const existingIndex = this.calculationItems.findIndex(i => 
        i.category === category && i.name === item.name);
      
      if (existingIndex !== -1) {
        // 如果已存在，提示用户
        alert('此项目已添加，请修改已有的数值或删除后重新添加');
        return;
      }

      // 添加新的计算项
      this.calculationItems.push({
        category: category,
        name: item.name,
        value: 1,
        unit: item.unit,
        factor: item.factor,
        emission: item.factor.toFixed(1)
      });
      
      this.calculateTotal();
    },
    removeItem(index) {
      this.calculationItems.splice(index, 1);
      this.calculateTotal();
    },
    calculateTotal() {
      // 计算每个项目的排放量
      this.calculationItems.forEach(item => {
        item.emission = (item.value * item.factor).toFixed(1);
      });
      
      // 计算总排放量
      const total = this.calculationItems.reduce((sum, item) => 
        sum + parseFloat(item.emission), 0);
      
      this.totalEmission = total.toFixed(1);
      
      // 计算需要种植的树木数量（简单估算：每棵树每年吸收约21公斤二氧化碳）
      this.offsetTrees = Math.max(0.3, (total / 70).toFixed(1));
    }
  }
}
</script>

<style scoped>
.calculator-page {
  min-height: 100vh;
  background-color: #f8f9fa;
  padding-top: 80px; /* 为固定的导航栏留出空间 */
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
  margin: 20px 0;
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

.calculator-content {
  display: flex;
  flex-wrap: wrap;
  gap: 1rem;
  width: 100%;
}

/* 左侧分类区 */
.categories-section {
  flex: 1;
  min-width: 300px;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  overflow: hidden;
  background-color: white;
}

.category-header {
  padding: 1rem;
  font-size: 1.2rem;
  font-weight: bold;
  color: #17a2b8;
  border-bottom: 1px solid #e0e0e0;
}

.category-list {
  display: flex;
  flex-direction: column;
}

.category-item {
  padding: 1rem;
  display: flex;
  align-items: center;
  border-bottom: 1px solid #f0f0f0;
  cursor: pointer;
  transition: all 0.3s ease;
}

.category-item:hover {
  background-color: #f8f9fa;
}

.category-item.active {
  background-color: #e6f7f9;
}

.category-icon {
  font-size: 2rem;
  font-weight: bold;
  color: #17a2b8;
  margin-right: 1rem;
}

.category-options {
  display: flex;
  flex-wrap: wrap;
  gap: 1rem;
  max-height: 0;
  overflow: hidden;
  transition: max-height 0.3s ease;
}

.category-item.active .category-options {
  max-height: 500px;
  margin-top: 1rem;
}

.option-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 80px;
  cursor: pointer;
  padding: 0.5rem;
  border-radius: 8px;
  transition: all 0.3s ease;
}

.option-item:hover {
  background-color: #def2f4;
}

.option-icon {
  width: 60px;
  height: 60px;
  border-radius: 50%;
  background-color: #17a2b8;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 0.5rem;
  color: white;
}

.icon-text {
  font-size: 1.5rem;
  font-weight: bold;
}

/* 右侧计算区 */
.calculation-section {
  flex: 2;
  min-width: 450px;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  overflow: hidden;
  background-color: white;
}

.calculation-header {
  display: flex;
  justify-content: space-between;
  padding: 1rem;
  font-size: 1.2rem;
  font-weight: bold;
  color: #17a2b8;
  border-bottom: 1px solid #e0e0e0;
}

.calculation-note {
  padding: 0.5rem 1rem;
  font-size: 0.8rem;
  color: #999;
  background-color: #f8f9fa;
}

.calculation-list {
  padding: 1rem;
  min-height: 200px;
}

.calculation-item {
  display: flex;
  align-items: center;
  padding: 0.5rem 0;
  border-bottom: 1px solid #f0f0f0;
}

.item-category {
  font-size: 1.5rem;
  font-weight: bold;
  color: #17a2b8;
  width: 40px;
  text-align: center;
}

.item-name {
  flex: 1;
  padding: 0 1rem;
}

.item-value {
  display: flex;
  align-items: center;
  width: 150px;
}

.item-value input {
  width: 80px;
  padding: 0.5rem;
  border: 1px solid #ddd;
  border-radius: 4px;
  text-align: center;
}

.item-unit {
  margin-left: 0.5rem;
  color: #666;
}

.item-emission {
  width: 60px;
  text-align: right;
  color: #17a2b8;
  font-weight: bold;
}

.remove-btn {
  width: 24px;
  height: 24px;
  border-radius: 50%;
  background-color: #dc3545;
  color: white;
  border: none;
  margin-left: 1rem;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1rem;
}

.calculation-total {
  display: flex;
  justify-content: space-between;
  padding: 1rem;
  border-top: 2px solid #e0e0e0;
  background-color: #f8f9fa;
}

.total-label {
  font-size: 1.2rem;
  font-weight: bold;
  color: #333;
}

.total-value {
  font-size: 1.2rem;
  font-weight: bold;
  color: #17a2b8;
}

.offset-message {
  padding: 1rem;
  text-align: center;
  background-color: #e6f7f9;
  color: #333;
}

.tree-count {
  font-weight: bold;
  color: #17a2b8;
}

.offset-note {
  font-size: 0.9rem;
  color: #666;
  margin-top: 0.5rem;
}

/* 碳排放系数按钮样式 */
.emission-factors-button {
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: #17a2b8;
  color: white;
  padding: 0.5rem 1rem;
  border-radius: 4px;
  cursor: pointer;
  margin: 0 auto 1rem;
  width: fit-content;
  transition: background-color 0.3s;
}

.emission-factors-button:hover {
  background-color: #138496;
}

.emission-factors-button i {
  margin-right: 0.5rem;
}

/* 弹窗样式 */
.emission-factors-modal {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
}

.modal-content {
  background-color: white;
  border-radius: 8px;
  width: 80%;
  max-width: 800px;
  max-height: 80vh;
  overflow-y: auto;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem;
  border-bottom: 1px solid #e0e0e0;
}

.modal-header h2 {
  margin: 0;
  color: #17a2b8;
}

.close-button {
  background: none;
  border: none;
  font-size: 1.5rem;
  cursor: pointer;
  color: #666;
}

.modal-body {
  padding: 1rem;
}

.category-section {
  margin-bottom: 1.5rem;
}

.category-section h3 {
  color: #17a2b8;
  margin-bottom: 0.5rem;
  padding-bottom: 0.5rem;
  border-bottom: 1px solid #e0e0e0;
}

.factors-table {
  width: 100%;
  border-collapse: collapse;
  margin-bottom: 1rem;
}

.factors-table th, .factors-table td {
  padding: 0.5rem;
  text-align: left;
  border-bottom: 1px solid #f0f0f0;
}

.factors-table th {
  background-color: #f8f9fa;
  font-weight: bold;
}

.factors-table tr:hover {
  background-color: #f8f9fa;
}

@media (max-width: 768px) {
  .calculator-content {
    flex-direction: column;
  }
  
  .categories-section,
  .calculation-section {
    min-width: 100%;
  }
  
  .option-item {
    width: 70px;
  }
  
  .option-icon {
    width: 50px;
    height: 50px;
  }
  
  .icon-text {
    font-size: 1.2rem;
  }
  
  .modal-content {
    width: 95%;
  }
  
  .factors-table th, .factors-table td {
    padding: 0.3rem;
    font-size: 0.9rem;
  }
}
</style>