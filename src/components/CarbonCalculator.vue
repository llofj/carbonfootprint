<template>
  <div class="carbon-calculator">
    <div class="calculator-container">
      <!-- 左侧分类列表 -->
      <div class="category-list">
        <div
          v-for="category in sortedCategories"
          :key="category"
          class="category-item"
          :class="{ active: activeCategory === category }"
          @click="setActiveCategory(category)"
        >
          <i :class="getCategoryIcon(category)"></i>
          <span>{{ category }}</span>
        </div>
      </div>

      <!-- 中间排放源列表 -->
      <div class="emission-list">
        <div class="emission-list-header">
          <h3>排放源</h3>
          <p class="emission-hint">点击添加到计算器</p>
        </div>
        
        <div class="emission-items-wrapper">
          <div
            v-for="(factor, subCategory) in filteredEmissions"
            :key="subCategory"
            class="emission-item-card"
            :class="{ selected: isSelected(activeCategory, subCategory) }"
            @click="selectSubcategory(activeCategory, subCategory)"
          >
            <div class="emission-icon">
              <i :class="getCategoryIcon(activeCategory, subCategory)"></i>
            </div>
            <div class="emission-info">
              <h3>{{ subCategory }}</h3>
              <div class="emission-factor">
                <span>排放系数：</span>
                <span class="factor-value">{{ factor }} kgCO₂e/{{ getUnit(subCategory) }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- 右侧计算面板 -->
      <div class="calculation-panel">
        <div class="selected-emissions">
          <div class="panel-header">
            <h3>已选排放源</h3>
            <button 
              v-if="selectedItems.length > 0" 
              class="clear-all-btn" 
              @click="clearAllItems"
              title="清空所有选择的排放源"
            >
              <i class="fas fa-trash-alt"></i>
              <span>清空</span>
            </button>
          </div>
          
          <div v-if="selectedItems.length === 0" class="no-emissions">
            <i class="fas fa-info-circle"></i>
            <p>请从左侧选择排放源</p>
          </div>
          
          <div v-else class="emission-inputs">
            <div class="input-limit-hint">
              <i class="fas fa-info-circle"></i>
              <span>输入数据最多支持三位数(单位:kgCO₂e)</span>
            </div>
            
            <div v-for="(groupItems, category) in groupedSelectedItems" :key="category" class="category-group">
              <div class="category-group-header">
                <i :class="getCategoryIcon(category)"></i>
                <span>{{ category }}</span>
              </div>
              
              <div v-for="item in groupItems" :key="`${item.category}-${item.subCategory}`" class="emission-input-item">
                <div class="emission-header">
                  <span>
                    <i :class="getCategoryIcon(item.category, item.subCategory)"></i>
                    {{ item.subCategory }}
                  </span>
                  <button class="remove-btn" @click="removeItem(item)" title="移除项目">
                    <i class="fas fa-times"></i>
                  </button>
                </div>
                <div class="input-group">
                  <input
                    type="number"
                    v-model.number="item.value"
                    min="0.1"
                    step="0.1"
                    @input="calculateTotal"
                    :placeholder="'输入' + getUnit(item.subCategory)"
                  />
                  <span class="unit">{{ getUnit(item.subCategory) }}</span>
                </div>
                <div class="emission-amount">
                  排放量：<span class="emission-value">{{ getEmissionValue(item) }}</span> kgCO₂e
                </div>
              </div>
            </div>
          </div>
        </div>

        <div class="total-emission">
          <div class="total-header">
            <h3>总排放量</h3>
            <span class="total-value">{{ totalEmission }} kgCO₂e</span>
          </div>
          <div class="tree-equivalent">
            <i class="fas fa-tree tree-icon"></i>
            <span>需要种植 <span class="tree-count">{{ treesToPlant }}</span> 棵树抵消这些碳排放</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import axios from 'axios';

export default {
  data() {
    return {
      activeCategory: '',
      emissionFactors: {},
      unitMap: {},
      selectedItems: [],
      totalEmission: 0,
      treesToPlant: 0,
      categoryOrder: ['衣', '食', '住', '行', '用'] // 定义类别排序
    };
  },
  async created() {
    try {
      // 无论用户是否登录，都尝试获取碳排放系数
      const token = localStorage.getItem('token');
      
      let headers = { 'Content-Type': 'application/json' };
      if (token) {
        headers.Authorization = `Bearer ${token}`;
      }
      
      // 获取碳排放系数
      const response = await axios.get('http://localhost:5000/api/carbon/factors', {
        headers: headers
      });
      
      this.emissionFactors = response.data.factors;
      this.unitMap = response.data.units;
      
      // 设置默认选中第一个分类
      if (Object.keys(this.emissionFactors).length > 0) {
        this.activeCategory = this.sortedCategories[0];
      }
    } catch (error) {
      console.error('Error:', error);
    }
  },
  computed: {
    // 按照衣食住行用的顺序排序分类
    sortedCategories() {
      const categories = Object.keys(this.emissionFactors);
      return categories.sort((a, b) => {
        const indexA = this.categoryOrder.indexOf(a);
        const indexB = this.categoryOrder.indexOf(b);
        return indexA - indexB;
      });
    },
    filteredEmissions() {
      return this.emissionFactors[this.activeCategory] || {};
    },
    // 将选中的项目按类别分组
    groupedSelectedItems() {
      const grouped = {};
      
      // 首先确保按照衣食住行用的顺序创建空数组
      this.categoryOrder.forEach(category => {
        if (this.selectedItems.some(item => item.category === category)) {
          grouped[category] = [];
        }
      });
      
      // 然后填充数据，保持选择顺序
      this.selectedItems.forEach(item => {
        if (!grouped[item.category]) {
          grouped[item.category] = [];
        }
        grouped[item.category].push(item);
      });
      
      return grouped;
    }
  },
  methods: {
    setActiveCategory(category) {
      this.activeCategory = category;
    },
    isSelected(category, subCategory) {
      return this.selectedItems.some(item => 
        item.category === category && item.subCategory === subCategory
      );
    },
    selectSubcategory(category, subCategory) {
      // 检查是否已经选择了该子类别
      if (this.isSelected(category, subCategory)) {
        return;
      }
      
      // 添加到选择列表
      this.selectedItems.push({
        category,
        subCategory,
        value: 1,
        factor: this.emissionFactors[category][subCategory]
      });
      
      this.calculateTotal();
    },
    removeItem(item) {
      const index = this.selectedItems.findIndex(
        i => i.category === item.category && i.subCategory === item.subCategory
      );
      if (index !== -1) {
        this.selectedItems.splice(index, 1);
        this.calculateTotal();
      }
    },
    clearAllItems() {
      // 添加确认动画
      const panel = document.querySelector('.calculation-panel');
      if (panel) {
        panel.classList.add('shake-effect');
        setTimeout(() => {
          panel.classList.remove('shake-effect');
        }, 500);
      }
      
      this.selectedItems = [];
      this.calculateTotal();
    },
    getUnit(subCategory) {
      return this.unitMap[subCategory] || '单位';
    },
    getEmissionValue(item) {
      const value = (item.factor * item.value).toFixed(1);
      return value;
    },
    calculateTotal() {
      let total = 0;
      for (const item of this.selectedItems) {
        total += item.factor * item.value;
      }
      this.totalEmission = total.toFixed(1);
      this.treesToPlant = (total / 28.8 * 0.3).toFixed(1);
    },
    getCategoryIcon(category, subCategory) {
      const mainIconMap = {
        '衣': 'fas fa-tshirt',
        '食': 'fas fa-utensils',
        '住': 'fas fa-home',
        '行': 'fas fa-car',
        '用': 'fas fa-shopping-basket'
      };
      
      if (!subCategory) {
        return mainIconMap[category] || 'fas fa-leaf';
      }
      
      const iconMap = {
        '衣': {
          '涤纶织物': 'fas fa-tshirt',
          '纯棉T恤': 'fas fa-tshirt',
          '洗衣液': 'fas fa-soap'
        },
        '食': {
          '白酒': 'fas fa-wine-bottle',
          '啤酒': 'fas fa-beer',
          '吸烟': 'fas fa-smoking',
          '羊肉': 'fas fa-drumstick-bite',
          '牛肉': 'fas fa-hamburger',
          '猪肉': 'fas fa-bacon',
          '炸鸡': 'fas fa-drumstick-bite',
          '鸡蛋': 'fas fa-egg',
          '土豆': 'fas fa-seedling',
          '米饭': 'fas fa-seedling',
          '花生': 'fas fa-seedling',
          '酸奶': 'fas fa-wine-glass'
        },
        '住': {
          '水': 'fas fa-water',
          '电': 'fas fa-bolt',
          '天然气': 'fas fa-fire'
        },
        '行': {
          '轮船': 'fas fa-ship',
          '公交车': 'fas fa-bus',
          '私家电车': 'fas fa-car',
          '私家油车': 'fas fa-car-side',
          '火车': 'fas fa-train',
          '飞机': 'fas fa-plane'
        },
        '用': {
          '塑料袋': 'fas fa-shopping-bag',
          '纸巾': 'fas fa-box-tissue',
          '电子设备': 'fas fa-laptop'
        }
      };
      
      return (iconMap[category] && iconMap[category][subCategory]) || 'fas fa-leaf';
    }
  }
};
</script>

<style scoped>
.carbon-calculator {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 20px;
}

.calculator-container {
  display: grid;
  grid-template-columns: 180px minmax(300px, 1fr) minmax(350px, 1fr);
  gap: 20px;
  background: #fff;
  border-radius: 10px;
  box-shadow: 0 5px 20px rgba(0, 0, 0, 0.1);
  padding: 20px;
  height: calc(90vh - 180px);
  min-height: 600px;
  overflow: hidden;
}

.category-list {
  border-right: 1px solid #eee;
  padding-right: 15px;
  overflow-y: auto;
  max-height: 100%;
}

.category-item {
  display: flex;
  align-items: center;
  padding: 12px 15px;
  margin-bottom: 10px;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.3s ease;
  position: relative;
  overflow: hidden;
}

.category-item:before {
  content: '';
  position: absolute;
  left: 0;
  bottom: 0;
  height: 2px;
  width: 0;
  background: linear-gradient(90deg, #e74c3c, #c0392b);
  transition: width 0.3s ease;
}

.category-item:hover {
  background: #f5f5f5;
  transform: translateY(-2px);
}

.category-item:hover:before {
  width: 100%;
}

.category-item.active {
  background: #e3f2fd;
  color: #1976d2;
  box-shadow: 0 2px 8px rgba(25, 118, 210, 0.1);
}

.category-item.active:before {
  width: 100%;
  background: linear-gradient(90deg, #1976d2, #64b5f6);
}

.category-item i {
  margin-right: 10px;
  font-size: 18px;
}

.emission-list {
  display: flex;
  flex-direction: column;
  padding: 0 15px;
  overflow-y: auto;
  max-height: 100%;
  border-right: 1px solid #eee;
}

.emission-list-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 15px;
  padding-bottom: 8px;
  border-bottom: 1px solid #eee;
  position: sticky;
  top: 0;
  background-color: #fff;
  z-index: 5;
}

.emission-list-header h3 {
  color: #2c3e50;
  margin: 0;
  font-size: 18px;
}

.emission-hint {
  font-size: 12px;
  color: #777;
  font-style: italic;
}

.emission-items-wrapper {
  overflow-y: auto;
  padding-right: 5px;
  flex: 1;
}

.emission-item-card {
  background: #fff;
  border: 1px solid #eee;
  border-radius: 8px;
  padding: 12px;
  cursor: pointer;
  transition: all 0.3s ease;
  position: relative;
  overflow: hidden;
  display: flex;
  align-items: center;
  margin-bottom: 10px;
}

.emission-item-card::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: linear-gradient(135deg, rgba(231, 76, 60, 0.05), rgba(192, 57, 43, 0.02));
  opacity: 0;
  transition: opacity 0.3s ease;
  z-index: 0;
}

.emission-item-card:hover {
  transform: translateY(-3px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.emission-item-card:hover::before {
  opacity: 1;
}

.emission-item-card.selected {
  background: #fff;
  border-color: rgba(231, 76, 60, 0.5);
  box-shadow: 0 4px 12px rgba(231, 76, 60, 0.15);
}

.emission-item-card.selected::after {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 5px;
  background: linear-gradient(90deg, #e74c3c, #c0392b);
}

.emission-icon {
  width: 36px;
  height: 36px;
  background: linear-gradient(135deg, #e74c3c, #c0392b);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 12px;
  color: white;
  position: relative;
  z-index: 1;
  transition: all 0.3s ease;
  flex-shrink: 0;
}

.emission-item-card:hover .emission-icon {
  transform: scale(1.05);
}

.emission-item-card.selected .emission-icon {
  background: linear-gradient(135deg, #e74c3c, #d35400);
  animation: pulse 2s infinite;
}

.emission-info {
  flex: 1;
}

.emission-info h3 {
  font-size: 16px;
  margin-bottom: 5px;
  margin-top: 0;
  color: #2c3e50;
  position: relative;
  z-index: 1;
}

.emission-factor {
  font-size: 14px;
  color: #666;
  position: relative;
  z-index: 1;
}

.factor-value {
  color: #e74c3c;
  font-weight: bold;
}

.calculation-panel {
  display: flex;
  flex-direction: column;
  position: relative;
  transition: all 0.3s ease;
  overflow: hidden;
}

.calculation-panel.shake-effect {
  animation: shake 0.5s ease-in-out;
}

.panel-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 15px;
  padding-bottom: 10px;
  border-bottom: 1px solid #eee;
  position: sticky;
  top: 0;
  background-color: #fff;
  z-index: 5;
}

.panel-header h3 {
  font-size: 18px;
  color: #2c3e50;
  margin: 0;
}

.clear-all-btn {
  background: linear-gradient(135deg, #e74c3c, #c0392b);
  color: white;
  border: none;
  border-radius: 6px;
  padding: 6px 12px;
  display: flex;
  align-items: center;
  cursor: pointer;
  transition: all 0.3s ease;
  font-size: 14px;
  box-shadow: 0 2px 5px rgba(231, 76, 60, 0.2);
}

.clear-all-btn:hover {
  background: linear-gradient(135deg, #c0392b, #a93226);
  transform: translateY(-2px);
  box-shadow: 0 4px 8px rgba(231, 76, 60, 0.3);
}

.clear-all-btn i {
  margin-right: 5px;
  font-size: 14px;
}

.selected-emissions {
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.input-limit-hint {
  display: flex;
  align-items: center;
  padding: 8px 12px;
  background-color: #f8f9fa;
  border-radius: 6px;
  margin-bottom: 15px;
  border-left: 3px solid #ffc107;
}

.input-limit-hint i {
  color: #ffc107;
  margin-right: 8px;
}

.input-limit-hint span {
  font-size: 12px;
  color: #666;
}

.no-emissions {
  text-align: center;
  padding: 40px 20px;
  color: #999;
  background-color: #f8f9fa;
  border-radius: 8px;
  border: 1px dashed #ddd;
  margin-bottom: auto;
}

.no-emissions i {
  font-size: 32px;
  margin-bottom: 15px;
  color: #e74c3c;
  animation: pulse 2s infinite;
}

.emission-inputs {
  flex: 1;
  overflow-y: auto;
  padding-right: 5px;
}

.emission-inputs::-webkit-scrollbar {
  width: 5px;
}

.emission-inputs::-webkit-scrollbar-track {
  background: #f1f1f1;
  border-radius: 10px;
}

.emission-inputs::-webkit-scrollbar-thumb {
  background: #c0c0c0;
  border-radius: 10px;
}

.emission-inputs::-webkit-scrollbar-thumb:hover {
  background: #a0a0a0;
}

.category-group {
  margin-bottom: 15px;
}

.category-group-header {
  display: flex;
  align-items: center;
  padding: 8px 12px;
  background: linear-gradient(90deg, rgba(231, 76, 60, 0.1), rgba(231, 76, 60, 0.05));
  border-radius: 8px;
  margin-bottom: 10px;
  font-weight: 500;
  color: #2c3e50;
  position: sticky;
  top: 0;
  z-index: 4;
}

.category-group-header i {
  margin-right: 8px;
  color: #e74c3c;
}

.emission-input-item {
  background: #f5f5f5;
  border-radius: 8px;
  padding: 15px;
  margin-bottom: 10px;
  animation: fadeIn 0.5s ease-out;
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.05);
  transition: all 0.3s ease;
}

.emission-input-item:hover {
  box-shadow: 0 3px 8px rgba(0, 0, 0, 0.1);
}

.emission-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 10px;
  font-weight: 500;
  color: #2c3e50;
}

.emission-header i {
  margin-right: 8px;
  color: #e74c3c;
}

.remove-btn {
  background: none;
  border: none;
  color: #999;
  cursor: pointer;
  padding: 5px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease;
  width: 28px;
  height: 28px;
}

.remove-btn:hover {
  color: #e74c3c;
  background-color: rgba(231, 76, 60, 0.1);
  transform: scale(1.1);
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
  transition: all 0.3s ease;
  font-size: 14px;
}

.input-group input:focus {
  border-color: #e74c3c;
  box-shadow: 0 0 0 3px rgba(231, 76, 60, 0.2);
  outline: none;
}

.unit {
  color: #666;
  font-size: 14px;
  background-color: #f0f0f0;
  padding: 4px 8px;
  border-radius: 4px;
  min-width: 40px;
  text-align: center;
}

.emission-amount {
  font-size: 14px;
  color: #666;
}

.emission-value {
  color: #e74c3c;
  font-weight: bold;
}

.total-emission {
  background: linear-gradient(135deg, #e74c3c, #c0392b);
  border-radius: 8px;
  padding: 20px;
  margin-top: auto;
  margin-bottom: 0;
  position: relative;
  overflow: hidden;
  box-shadow: 0 5px 15px rgba(231, 76, 60, 0.2);
}

.total-emission::before {
  content: '';
  position: absolute;
  top: -50%;
  left: -50%;
  width: 200%;
  height: 200%;
  background: radial-gradient(circle, rgba(255,255,255,0.1) 0%, transparent 60%);
  opacity: 0.5;
  animation: rotate 30s linear infinite;
  pointer-events: none;
}

.total-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 10px;
  position: relative;
  z-index: 1;
}

.total-header h3 {
  color: white;
  margin: 0;
  font-size: 18px;
  font-weight: 600;
}

.total-value {
  font-size: 24px;
  font-weight: bold;
  color: white;
  text-shadow: 0 1px 2px rgba(0,0,0,0.1);
}

.tree-equivalent {
  display: flex;
  align-items: center;
  color: rgba(255, 255, 255, 0.9);
  background-color: rgba(255, 255, 255, 0.1);
  padding: 12px;
  border-radius: 8px;
  margin-top: 10px;
  position: relative;
  z-index: 1;
  transition: all 0.3s ease;
  border: 1px solid rgba(255, 255, 255, 0.2);
}

.tree-equivalent:hover {
  background-color: rgba(255, 255, 255, 0.15);
  transform: translateY(-2px);
}

.tree-icon {
  color: #2ecc71;
  margin-right: 8px;
  animation: bounce 2s infinite;
  font-size: 18px;
}

.tree-count {
  font-weight: bold;
  font-size: 18px;
  color: #ffffff;
  text-shadow: 0 1px 2px rgba(0,0,0,0.1);
  margin: 0 5px;
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes pulse {
  0% {
    transform: scale(1);
    opacity: 0.8;
  }
  50% {
    transform: scale(1.1);
    opacity: 1;
  }
  100% {
    transform: scale(1);
    opacity: 0.8;
  }
}

@keyframes rotate {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}

@keyframes bounce {
  0%, 100% {
    transform: translateY(0);
  }
  50% {
    transform: translateY(-5px);
  }
}

@keyframes shake {
  0% { transform: translateX(0); }
  20% { transform: translateX(-8px); }
  40% { transform: translateX(8px); }
  60% { transform: translateX(-5px); }
  80% { transform: translateX(5px); }
  100% { transform: translateX(0); }
}

@media (max-width: 1200px) {
  .calculator-container {
    grid-template-columns: 180px 1fr 350px;
  }
}

@media (max-width: 992px) {
  .calculator-container {
    grid-template-columns: 150px 1fr 280px;
  }
}

@media (max-width: 768px) {
  .calculator-container {
    grid-template-columns: 1fr;
    height: auto;
    min-height: auto;
  }
  
  .category-list {
    border-right: none;
    border-bottom: 1px solid #eee;
    padding-right: 0;
    padding-bottom: 15px;
    margin-bottom: 15px;
    display: flex;
    flex-wrap: wrap;
    gap: 10px;
    overflow-x: auto;
    max-height: 100px;
  }
  
  .category-item {
    margin-bottom: 0;
    flex-shrink: 0;
  }
  
  .emission-list {
    border-right: none;
    border-bottom: 1px solid #eee;
    padding-bottom: 15px;
    margin-bottom: 15px;
    max-height: 300px;
  }

  .calculation-panel {
    max-height: 500px;
    overflow-y: auto;
  }
}
</style>