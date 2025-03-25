<template>
  <div class="carbon-calculator">
    <div class="calculator-container">
      <div class="left-panel">
        <h2>类型</h2>
        
        <div v-for="(items, category) in emissionFactors" :key="category" class="category-section">
          <div class="category-title">{{ category }}</div>
          
          <div class="subcategory-grid">
            <div 
              v-for="(factor, subCategory) in items" 
              :key="subCategory" 
              class="subcategory-item"
              :class="{ selected: isSelected(category, subCategory) }"
              @click="selectSubcategory(category, subCategory)"
            >
              <div class="subcategory-icon">
                <!-- 这里可以根据子类别添加对应的图标 -->
                <span>{{ subCategory.charAt(0) }}</span>
              </div>
              <div class="subcategory-name">{{ subCategory }}</div>
            </div>
          </div>
        </div>
      </div>
      
      <div class="right-panel">
        <h2>排放源</h2>
        <p class="hint">*输入数据最多可支持三位数(单位:kgCO₂e)</p>
        
        <div v-for="(item, index) in selectedItems" :key="index" class="emission-item">
          <div class="emission-category">{{ item.category }}</div>
          <div class="emission-details">
            <div class="emission-name">{{ item.subCategory }}</div>
            <div class="emission-input">
              <input 
                type="number" 
                v-model.number="item.value" 
                min="0.1" 
                step="0.1"
                @input="calculateTotal"
              />
              <span class="unit">{{ getUnit(item.subCategory) }}</span>
            </div>
            <div class="emission-value">{{ getEmissionValue(item) }}</div>
            <button class="remove-btn" @click="removeItem(index)">×</button>
          </div>
        </div>
        
        <div class="total-section">
          <h2>总排放量</h2>
          <div class="total-value">{{ totalEmission }}kgCO₂e</div>
          <div class="trees-needed">
            您需要种植 <span class="tree-count">{{ treesToPlant }}</span> 棵树<br>
            抵消这些碳排放，实现碳中和
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
      emissionFactors: {},
      unitMap: {},
      selectedItems: [],
      totalEmission: 0,
      treesToPlant: 0
    };
  },
  async created() {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        this.$router.push('/');
        return;
      }
      
      // 获取碳排放系数
      const response = await axios.get('http://localhost:5000/api/carbon/factors', {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      this.emissionFactors = response.data.factors;
      this.unitMap = response.data.units;
    } catch (error) {
      console.error('Error:', error);
    }
  },
  methods: {
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
    removeItem(index) {
      this.selectedItems.splice(index, 1);
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
    async saveEmissions() {
      try {
        if (this.selectedItems.length === 0) {
          alert('请至少选择一项排放源');
          return;
        }
        
        const emissions = this.selectedItems.map(item => ({
          category: item.category,
          subCategory: item.subCategory,
          value: item.value
        }));
        
        const token = localStorage.getItem('token');
        await axios.post('http://localhost:5000/api/carbon/calculate', {
          emissions
        }, {
          headers: { Authorization: `Bearer ${token}` }
        });
        
        alert('碳排放数据已保存');
      } catch (error) {
        console.error('Error:', error);
        alert('保存数据时发生错误');
      }
    }
  }
};
</script>

<style scoped>
.carbon-calculator {
  font-family: Arial, sans-serif;
}

.calculator-container {
  display: flex;
  gap: 20px;
  max-width: 1200px;
  margin: 0 auto;
}

.left-panel, .right-panel {
  background-color: #f9f9f9;
  border-radius: 8px;
  padding: 20px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
}

.left-panel {
  flex: 1;
}

.right-panel {
  flex: 1;
}

h2 {
  color: #333;
  border-bottom: 1px solid #eee;
  padding-bottom: 10px;
  margin-top: 0;
}

.hint {
  color: #888;
  font-size: 0.8rem;
  margin-bottom: 20px;
}

.category-section {
  margin-bottom: 30px;
}

.category-title {
  font-size: 24px;
  font-weight: bold;
  margin-bottom: 10px;
  color: #333;
}

.subcategory-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(80px, 1fr));
  gap: 15px;
}

.subcategory-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  cursor: pointer;
  padding: 10px;
  border-radius: 8px;
  transition: background-color 0.3s;
}

.subcategory-item:hover {
  background-color: #f0f0f0;
}

.subcategory-item.selected {
  background-color: #e1f5fe;
}

.subcategory-icon {
  width: 50px;
  height: 50px;
  background-color: #e0e0e0;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 5px;
}

.subcategory-name {
  font-size: 12px;
  text-align: center;
}

.emission-item {
  margin-bottom: 15px;
  border-bottom: 1px solid #eee;
  padding-bottom: 10px;
}

.emission-category {
  font-size: 20px;
  font-weight: bold;
  margin-bottom: 5px;
}

.emission-details {
  display: flex;
  align-items: center;
  gap: 10px;
}

.emission-name {
  flex: 2;
}

.emission-input {
  flex: 2;
  display: flex;
  align-items: center;
}

.emission-input input {
  width: 60px;
  padding: 5px;
  border: 1px solid #ccc;
  border-radius: 4px;
  text-align: center;
}

.unit {
  margin-left: 5px;
  color: #666;
}

.emission-value {
  flex: 1;
  color: #4caf50;
  font-weight: bold;
}

.remove-btn {
  background: none;
  border: none;
  color: #f44336;
  font-size: 18px;
  cursor: pointer;
  padding: 0 5px;
}

.total-section {
  margin-top: 30px;
  background-color: #e8f5e9;
  padding: 15px;
  border-radius: 8px;
  text-align: center;
}

.total-value {
  font-size: 26px;
  font-weight: bold;
  color: #4caf50;
  margin: 10px 0;
}

.trees-needed {
  font-size: 14px;
  color: #555;
  line-height: 1.5;
}

.tree-count {
  font-weight: bold;
  color: #2e7d32;
}
</style>