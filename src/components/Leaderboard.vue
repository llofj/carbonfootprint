<template>
  <div class="leaderboard-page">
    <h2 class="page-title">碳减排排行榜</h2>
    
    <div v-if="errorMessage" class="error-message">
      <i class="fas fa-exclamation-circle"></i>
      {{ errorMessage }}
    </div>
    
    <!-- 用户自己的排名信息卡片，更美观的展示 -->
    <div class="user-rank-card">
      <div class="user-rank-header">
        <div class="user-avatar-and-info">
          <div class="user-avatar">
            <span v-if="username">{{ getInitials(username) }}</span>
            <span v-else><i class="fas fa-user"></i></span>
          </div>
          <div class="user-info">
            <h3>{{ username || '未能获取用户名' }}</h3>
            <div class="user-status">您当前的碳减排状态</div>
            <div class="user-badges" v-if="userRank">
              <span v-if="userRank.rank <= 3" class="badge top-badge" title="排名前三">
                <i class="fas fa-crown"></i>
              </span>
              <span v-if="userRank.carbon_reduction >= 100" class="badge century-badge" title="减排量超过100kg">
                <i class="fas fa-medal"></i>
              </span>
              <span v-if="userRank.carbon_reduction >= 50" class="badge progress-badge" title="减排量超过50kg">
                <i class="fas fa-award"></i>
              </span>
              <span v-if="isNewUser" class="badge newcomer-badge" title="新用户">
                <i class="fas fa-seedling"></i>
              </span>
            </div>
          </div>
        </div>
        <div v-if="userRank" class="rank-badge" :class="getRankColorClass(userRank.rank)">
          #{{ userRank.rank }}
        </div>
        <div v-else class="rank-badge loading-rank">
          <span>#{{ currentUserRank || '?' }}</span>
        </div>
      </div>
      
      <div class="user-stats">
        <div class="stat-item">
          <div class="stat-value carbon-value">
            {{ userRank ? Number(userRank.carbon_reduction).toFixed(1) : (currentUserCarbonReduction || '加载中...') }}
          </div>
          <div class="stat-label">减排量 (kg CO₂)</div>
        </div>
        
        <div class="stat-item">
          <div class="stat-value">
            <i v-if="userRank" class="fas fa-trophy" :class="getRankIconClass(userRank.rank)"></i>
            <i v-else class="fas fa-trophy text-normal"></i>
          </div>
          <div class="stat-label">{{ userRank ? getRankDescription(userRank.rank) : '活跃减排者' }}</div>
        </div>
        
        <div class="stat-divider"></div>
        
        <div class="stat-item">
          <div class="stat-value achievement">
            <span class="percentage">{{ userRank ? getPercentile(userRank.rank) : '81' }}%</span>
          </div>
          <div class="stat-label">击败了其他用户</div>
        </div>
      </div>
    </div>
    
    <div class="leaderboard-controls">
      <div class="update-section">
        <button @click="updateLeaderboard" class="update-btn" :disabled="loading">
          <i class="fas fa-sync-alt" :class="{ 'fa-spin': loading }"></i>
          {{ loading ? '更新中...' : '更新排名' }}
        </button>
      </div>
      
      <div class="filter-section">
        <select v-model="limit" @change="loadLeaderboard" class="filter-select">
          <option :value="10">显示10名</option>
          <option :value="20">显示20名</option>
          <option :value="50">显示50名</option>
          <option :value="100">显示100名</option>
        </select>
      </div>
    </div>
    
    <div class="leaderboard-container">
      <div class="leaderboard-table">
        <table>
          <thead>
            <tr>
              <th class="rank-cell">排名</th>
              <th>用户</th>
              <th>减排量 (kg CO₂)</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(entry, index) in displayedLeaderboard" :key="index" 
                :class="{ 'current-user': isCurrentUser(entry.user_id) }"
                :style="{ '--row-index': index }">
              <td class="rank-cell">
                <div class="rank-number" :class="getRankClass(entry.rank)">
                  <template v-if="entry.rank <= 3">
                    <span>{{ entry.rank }}</span>
                  </template>
                  <template v-else>
                    {{ entry.rank }}
                  </template>
                </div>
              </td>
              <td>
                <div class="user-info-row">
                  <div class="user-avatar-small" :class="{ 'current-user': isCurrentUser(entry.user_id) }">
                    {{ getInitials(entry.username) }}
                  </div>
                  <span>{{ entry.username }}</span>
                  <span v-if="isCurrentUser(entry.user_id)" class="current-user-tag">当前用户</span>
                </div>
              </td>
              <td>{{ Number(entry.carbon_reduction).toFixed(1) }}</td>
            </tr>
          </tbody>
        </table>
      </div>
      
      <div v-if="leaderboard.length === 0" class="no-data">
        暂无排行数据
      </div>
    </div>
    
    <!-- 分页控件 -->
    <div class="pagination" v-if="leaderboard.length > 0">
      <button 
        @click="changePage(currentPage - 1)" 
        :disabled="currentPage === 1"
        class="pagination-btn"
      >
        <i class="fas fa-chevron-left"></i>
      </button>
      
      <div class="page-info">
        第 {{ currentPage }} 页 / 共 {{ totalPages }} 页
      </div>
      
      <button 
        @click="changePage(currentPage + 1)" 
        :disabled="currentPage === totalPages"
        class="pagination-btn"
      >
        <i class="fas fa-chevron-right"></i>
      </button>
    </div>
    
    <div class="total-entries" v-if="leaderboard.length > 0">
      展示第 {{ (currentPage - 1) * pageSize + 1 }} - {{ Math.min(currentPage * pageSize, leaderboard.length) }} 条，
      共 {{ leaderboard.length }} 条记录
    </div>
    
    <div class="leaderboard-tips">
      <h3>如何提高排名?</h3>
      <ul>
        <li><i class="fas fa-walking"></i> 多步行减少碳排放</li>
        <li><i class="fas fa-calculator"></i> 通过碳排放计算器记录您的低碳行为</li>
        <li><i class="fas fa-paw"></i> 喂养并升级您的虚拟宠物</li>
        <li><i class="fas fa-award"></i> 完成成就任务获得额外奖励</li>
      </ul>
    </div>
  </div>
</template>

<script>
import axios from 'axios';
import { API_URLS, axiosConfig, requestInterceptor, responseInterceptor } from '../config/api';

// 创建API实例
const api = axios.create(axiosConfig);

// 添加请求拦截器
api.interceptors.request.use(requestInterceptor, error => Promise.reject(error));

// 添加响应拦截器
api.interceptors.response.use(
  responseInterceptor.success, 
  responseInterceptor.error
);

// 获取API基础URL
const getBaseUrl = () => {
  const host = window.location.hostname;
  const port = '5000';
  const protocol = window.location.protocol;
  
  if (host === 'localhost' || host === '127.0.0.1') {
    return `http://localhost:${port}/api`;
  } else {
    return `${protocol}//${host}:${port}/api`;
  }
};

export default {
  data() {
    return {
      leaderboard: [],
      userRank: null,
      username: '',
      limit: 100,
      currentPage: 1,
      pageSize: 10,
      loading: false,
      errorMessage: '',
      apiBaseUrl: getBaseUrl(),
      totalUserCount: 200, // 估计的用户总数，可以从后端获取
      isNewUser: false,
      registrationDate: null,
      currentUserRank: null,
      currentUserCarbonReduction: null
    };
  },
  computed: {
    totalPages() {
      return Math.ceil(this.leaderboard.length / this.pageSize);
    },
    displayedLeaderboard() {
      const start = (this.currentPage - 1) * this.pageSize;
      const end = start + this.pageSize;
      return this.leaderboard.slice(start, end);
    }
  },
  async created() {
    try {
      console.log('API基础URL:', this.apiBaseUrl);
      
      const token = localStorage.getItem('token');
      if (!token) {
        this.$router.push('/login');
        return;
      }
      
      // 获取用户信息
      const userResponse = await axios.get(`${this.apiBaseUrl}/auth/user`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      if (userResponse.data && userResponse.data.username) {
        this.username = userResponse.data.username;
        console.log('成功获取用户信息:', this.username);
      } else {
        console.error('未能获取到用户名:', userResponse.data);
        this.username = localStorage.getItem('username') || '';
      }

      if (userResponse.data.created_at) {
        this.registrationDate = new Date(userResponse.data.created_at);
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
        this.isNewUser = this.registrationDate > thirtyDaysAgo;
      }
      
      // 尝试从URL参数获取排名信息
      const urlParams = new URLSearchParams(window.location.search);
      const rankParam = urlParams.get('rank');
      const reductionParam = urlParams.get('reduction');
      
      if (rankParam) {
        this.currentUserRank = rankParam;
      }
      
      if (reductionParam) {
        this.currentUserCarbonReduction = reductionParam;
      }
      
      // 加载排行榜数据
      await this.loadLeaderboard();

      // 如果排行榜加载成功但还没有用户名，尝试从排行榜数据中获取
      if (!this.username && this.userRank) {
        this.username = this.userRank.username;
      }
    } catch (error) {
      console.error('Error loading user data:', error);
      // 如果API调用失败，尝试从localStorage获取用户名
      this.username = localStorage.getItem('username') || '';
      this.handleError(error, '加载用户数据失败');
    }
  },
  methods: {
    // 获取用户名的首字母作为头像
    getInitials(name) {
      if (!name) return '?';
      
      // 对于双字节字符（如中文），只取第一个字符
      if (name.charCodeAt(0) > 127) {
        return name.charAt(0);
      }
      
      // 对于英文等单字节字符，取首字母
      return name.charAt(0).toUpperCase();
    },
    
    // 获取排名描述
    getRankDescription(rank) {
      if (rank <= 10) return '优秀减排者';
      if (rank <= 50) return '活跃减排者';
      if (rank <= 100) return '进步减排者';
      return '环保新手';
    },
    
    // 获取百分比
    getPercentile(rank) {
      // 计算击败了多少百分比的用户
      // 例如：如果总用户数是200，当前排名是20，则击败了(200-20)/200 * 100 = 90%的用户
      const percentile = Math.floor(((this.totalUserCount - rank) / this.totalUserCount) * 100);
      return Math.max(0, Math.min(99, percentile));
    },
    
    // 获取排名图标类
    getRankIconClass(rank) {
      if (rank <= 3) return 'text-gold';
      if (rank <= 10) return 'text-silver';
      if (rank <= 50) return 'text-bronze';
      return 'text-normal';
    },
    
    // 获取排名颜色类
    getRankColorClass(rank) {
      if (rank <= 3) return 'rank-top';
      if (rank <= 10) return 'rank-excellent';
      if (rank <= 50) return 'rank-good';
      return 'rank-normal';
    },
    
    // 处理错误的通用方法
    handleError(error, defaultMessage) {
      let errorMsg = defaultMessage;
      
      if (error.response && error.response.data && error.response.data.message) {
        errorMsg = error.response.data.message;
      } else if (error.message) {
        errorMsg = `${defaultMessage}: ${error.message}`;
      }
      
      this.errorMessage = errorMsg;
      console.error(errorMsg, error);
    },
    
    async loadLeaderboard() {
      try {
        this.loading = true;
        this.errorMessage = '';
        
        const token = localStorage.getItem('token');
        if (!token) {
          this.$router.push('/login');
          return;
        }
        
        // 添加时间戳防止缓存
        const timestamp = new Date().getTime();
        console.log('正在加载排行榜数据，限制:', this.limit, '时间戳:', timestamp);
        
        // 直接使用axios
        const response = await axios.get(`${this.apiBaseUrl}/leaderboard?limit=${this.limit}&_t=${timestamp}`, {
          headers: { 
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });
        
        console.log('排行榜数据:', response.data);
        
        if (response.data && response.data.leaderboard) {
          this.leaderboard = response.data.leaderboard;
          this.userRank = response.data.userRank;
          
          // 如果用户排名信息为null或carbon_reduction为0，尝试强制更新，但不修改原始值
          if (!this.userRank || this.userRank.carbon_reduction === 0) {
            console.log('用户排名数据为空或减排量为0，尝试获取最新排名...');
            await this.getUserRankOnly();
          }
          
          // 确保数据排序正确
          this.leaderboard.sort((a, b) => a.rank - b.rank);
          
          // 获取总用户数量
          if (response.data.totalUserCount) {
            this.totalUserCount = response.data.totalUserCount;
            console.log('获取到总用户数:', this.totalUserCount);
          }
          
          // 重置为第一页
          this.currentPage = 1;
        } else {
          console.error('返回的数据格式不正确:', response.data);
          this.errorMessage = '返回数据格式不正确，请稍后再试';
          this.leaderboard = [];
        }
      } catch (error) {
        this.handleError(error, '加载排行榜失败');
        this.leaderboard = [];
      } finally {
        this.loading = false;
      }
    },
    
    // 仅获取用户排名，不修改减碳总量
    async getUserRankOnly() {
      try {
        const token = localStorage.getItem('token');
        if (!token) return;
        
        console.log('仅获取用户排名数据...');
        
        // 获取最新的用户排名
        const userRankResponse = await axios.get(`${this.apiBaseUrl}/leaderboard/user`, {
          headers: { 
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });
        
        if (userRankResponse.data) {
          console.log('获取到的用户排名:', userRankResponse.data);
          this.userRank = userRankResponse.data;
        }
      } catch (error) {
        console.error('获取用户排名失败:', error);
      }
    },
    
    changePage(pageNumber) {
      if (pageNumber >= 1 && pageNumber <= this.totalPages) {
        this.currentPage = pageNumber;
      }
    },
    
    async updateLeaderboard() {
      try {
        this.loading = true;
        this.errorMessage = '';
        
        const token = localStorage.getItem('token');
        if (!token) {
          this.$router.push('/login');
          return;
        }
        
        console.log('开始更新排行榜，将刷新用户排名信息...');
        
        // 直接使用axios更新排名（不会修改减碳总量）
        const updateResponse = await axios.post(`${this.apiBaseUrl}/leaderboard/update`, {}, {
          headers: { 
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json' 
          }
        });
        
        console.log('排名更新响应:', updateResponse.data);
        
        if (updateResponse.data && updateResponse.data.rank) {
          console.log(`用户排名已更新为第 ${updateResponse.data.rank} 名`);
          
          if (this.userRank) {
            // 只更新排名，保持减碳量不变
            this.userRank.rank = updateResponse.data.rank;
          }
          
          // 重新加载排行榜数据
        await this.loadLeaderboard();
        } else {
          // 如果更新失败，也重新加载最新数据
          await this.loadLeaderboard();
        }
        
        this.errorMessage = '';
        this.showSuccessNotification('排行榜更新成功');
      } catch (error) {
        this.handleError(error, '更新排行榜失败');
      } finally {
        this.loading = false;
      }
    },
    
    // 显示成功通知
    showSuccessNotification(message) {
      // 如果组件有相关的通知系统，可以在这里实现
      console.log('成功:', message);
    },
    
    isCurrentUser(userId) {
      return this.userRank && this.userRank.user_id === userId;
    },
    
    getRankClass(rank) {
      if (rank === 1) return 'rank-1';
      if (rank === 2) return 'rank-2';
      if (rank === 3) return 'rank-3';
      return '';
    }
  }
};
</script>

<style scoped>
.leaderboard-page {
  max-width: 800px;
  margin: 0 auto;
  padding: 20px;
  font-family: 'Arial', sans-serif;
  position: relative;
}

/* 添加新的背景样式 */
.leaderboard-page::before {
  content: '';
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-image: url('../assets/carbon_7.jpg');
  background-size: cover;
  background-position: center;
  background-attachment: fixed;
  filter: brightness(0.9) saturate(1.1);
  z-index: -1;
  opacity: 0.9;
}

.page-title {
  color: #1e3d59;
  text-align: center;
  margin-bottom: 0.5rem;
  font-size: 32px;
  font-weight: 600;
  text-shadow: 1px 1px 2px rgba(0, 0, 0, 0.1);
}

.main-title {
  display: none;
}

.user-rank-card {
  background: linear-gradient(135deg, rgba(187, 222, 251, 0.85) 0%, rgba(227, 242, 253, 0.85) 100%);
  border-radius: 10px;
  overflow: hidden;
  margin-bottom: 20px;
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.15);
  border: 1px solid rgba(255, 255, 255, 0.3);
  animation: slideInFromTop 0.8s ease-out;
  width: 100%;
  margin: 0 auto 20px auto;
  backdrop-filter: blur(5px);
}

@keyframes slideInFromTop {
  0% {
    opacity: 0;
    transform: translateY(-30px);
  }
  100% {
    opacity: 1;
    transform: translateY(0);
  }
}

.user-rank-header {
  padding: 15px 20px;
  display: flex;
  align-items: center;
  border-bottom: 1px solid rgba(0, 0, 0, 0.05);
  background-color: rgba(255, 255, 255, 0.2);
  position: relative;
  justify-content: space-between;
}

.user-avatar-and-info {
  display: flex;
  align-items: center;
}

.user-info {
  margin-left: 15px;
}

.user-avatar {
  width: 50px;
  height: 50px;
  border-radius: 50%;
  background: linear-gradient(135deg, #2196F3, #03A9F4);
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.5rem;
  font-weight: bold;
  box-shadow: 0 3px 10px rgba(33, 150, 243, 0.5);
  text-transform: uppercase;
  position: relative;
  overflow: hidden;
  transition: transform 0.3s ease, box-shadow 0.3s ease;
  animation: pulse 2s infinite;
}

.user-avatar:hover {
  transform: scale(1.05);
  box-shadow: 0 5px 15px rgba(33, 150, 243, 0.7);
}

.user-info h3 {
  margin: 0 0 4px 0; /* 减小下边距 */
  font-size: 1.2rem; /* 减小字体大小 */
  color: #333;
  font-weight: 600;
}

.user-status {
  color: #555;
  font-size: 0.8rem; /* 减小字体大小 */
  margin-bottom: 3px; /* 减小下边距 */
}

.user-badges {
  display: flex;
  gap: 5px;
}

.badge {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 22px;
  height: 22px;
  border-radius: 50%;
  font-size: 0.7rem;
  box-shadow: 0 2px 5px rgba(0,0,0,0.1);
  position: relative;
  overflow: hidden;
  margin-right: 4px;
  transition: transform 0.3s ease, box-shadow 0.3s ease;
}

.badge:hover {
  transform: scale(1.2);
  box-shadow: 0 3px 8px rgba(0,0,0,0.15);
}

.top-badge {
  background: linear-gradient(135deg, #FFD700, #FFA500);
  color: white;
}

.century-badge {
  background: linear-gradient(135deg, #2196F3, #03A9F4);
  color: white;
}

.progress-badge {
  background: linear-gradient(135deg, #4CAF50, #8BC34A);
  color: white;
}

.newcomer-badge {
  background: linear-gradient(135deg, #9C27B0, #E040FB);
  color: white;
}

/* 增加排名徽章的动画效果 */
.rank-badge {
  transition: transform 0.3s ease, box-shadow 0.3s ease;
}

.rank-badge:hover {
  transform: translateY(-3px);
  box-shadow: 0 5px 15px rgba(0,0,0,0.2);
}

.loading-rank {
  background: linear-gradient(135deg, #9E9E9E, #757575);
}

@keyframes pulse {
  0% {
    box-shadow: 0 0 0 0 rgba(33, 150, 243, 0.4);
  }
  70% {
    box-shadow: 0 0 0 10px rgba(33, 150, 243, 0);
  }
  100% {
    box-shadow: 0 0 0 0 rgba(33, 150, 243, 0);
  }
}

.rank-badge {
  font-size: 1.8rem; /* 增大字体大小 */
  font-weight: bold;
  padding: 6px 12px;
  border-radius: 8px;
  color: white;
  box-shadow: 0 3px 8px rgba(0,0,0,0.15);
  margin-left: auto; /* 推向右侧 */
  background: linear-gradient(135deg, #1976D2, #2196F3); /* 调整颜色使其更突出 */
  position: relative;
  overflow: hidden;
}

.rank-badge::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: linear-gradient(135deg, rgba(255,255,255,0.3), rgba(255,255,255,0));
  opacity: 0.6;
}

.rank-top {
  background: linear-gradient(135deg, #F57C00, #FF9800);
  box-shadow: 0 3px 10px rgba(255, 152, 0, 0.5);
}

.rank-excellent {
  background: linear-gradient(135deg, #1976D2, #2196F3);
  box-shadow: 0 3px 10px rgba(33, 150, 243, 0.5);
}

.rank-good {
  background: linear-gradient(135deg, #388E3C, #4CAF50);
  box-shadow: 0 3px 10px rgba(76, 175, 80, 0.5);
}

.rank-normal {
  background: linear-gradient(135deg, #5E35B1, #7E57C2);
  box-shadow: 0 3px 10px rgba(126, 87, 194, 0.5);
}

.user-stats {
  display: flex;
  padding: 10px 12px; /* 减小内边距 */
  background-color: rgba(255,255,255,0.7);
  justify-content: space-around;
}

.stat-item {
  flex: 1;
  text-align: center;
  padding: 10px 8px; /* 减小内边距 */
}

.stat-value {
  font-size: 1.3rem; /* 减小字体大小 */
  font-weight: bold;
  color: #2196F3;
  margin-bottom: 5px; /* 减小下边距 */
}

.carbon-value {
  font-size: 1.6rem; /* 减小字体大小 */
  background: linear-gradient(135deg, #2196F3, #03A9F4);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  animation: floatAnimation 4s ease-in-out infinite;
  display: inline-block;
}

.stat-label {
  font-size: 0.75rem; /* 减小字体大小 */
  color: #555;
  font-weight: 500;
}

.stat-divider {
  width: 1px;
  background-color: rgba(0,0,0,0.1);
  margin: 8px 4px;
}

.text-gold {
  color: #F57C00;
}

.text-silver {
  color: #607D8B;
}

.text-bronze {
  color: #795548;
}

.leaderboard-controls {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px; /* 减小下边距 */
  background-color: rgba(255, 255, 255, 0.85); /* 调整为半透明背景以配合新背景图片 */
  padding: 12px 18px; /* 减小内边距 */
  border-radius: 12px;
  box-shadow: 0 4px 12px rgba(0,0,0,0.05);
  backdrop-filter: blur(5px);
}

.error-message {
  background-color: #ffebee;
  color: #d32f2f;
  padding: 12px;
  border-radius: 8px;
  margin-bottom: 20px;
  display: flex;
  align-items: center;
  gap: 10px;
}

.error-message i {
  font-size: 20px;
}

.update-btn {
  background: linear-gradient(135deg, #2196F3, #03A9F4);
  color: white;
  border: none;
  border-radius: 25px;
  padding: 10px 20px;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 10px;
  transition: all 0.3s;
  font-weight: 500;
  box-shadow: 0 3px 8px rgba(33,150,243,0.3);
  font-size: 0.95rem;
}

.update-btn:hover:not(:disabled) {
  background: linear-gradient(135deg, #1976D2, #0288D1);
  transform: translateY(-2px);
  box-shadow: 0 5px 12px rgba(33,150,243,0.4);
}

.filter-select {
  padding: 10px 15px;
  border-radius: 25px;
  border: 1px solid #e0e0e0;
  background-color: white;
  font-size: 0.95rem;
  box-shadow: 0 2px 5px rgba(0,0,0,0.05);
  cursor: pointer;
  min-width: 130px;
  color: #424242;
  transition: all 0.3s;
}

.filter-select:hover {
  border-color: #2196F3;
  box-shadow: 0 2px 8px rgba(33,150,243,0.2);
}

.leaderboard-container {
  background-color: rgba(255, 255, 255, 0.85); /* 调整为半透明背景以配合新背景图片 */
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 4px 16px rgba(0,0,0,0.1);
  margin-bottom: 25px;
  min-height: 300px;
  position: relative;
  width: 100%;
  backdrop-filter: blur(5px);
}

.leaderboard-table {
  width: 100%;
  border-spacing: 0;
  border-collapse: separate;
  background-color: #fff;
  border-radius: 12px;
  overflow: hidden;
}

.leaderboard-table table {
  width: 100%;
}

.leaderboard-table th {
  text-align: left;
  padding: 18px 22px;
  color: #424242;
  font-weight: 600;
  font-size: 0.9rem;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  background-color: rgba(246, 248, 250, 0.85);
  border-bottom: 1px solid #E6EBF1;
}

.leaderboard-table td {
  padding: 16px 22px;
  border-bottom: 1px solid #E6EBF1;
  color: #24292F;
  font-size: 1rem;
  background-color: rgba(255, 255, 255, 0.75);
}

.user-info-row {
  display: flex;
  align-items: center;
  gap: 12px;
}

.user-avatar-small {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  background: linear-gradient(135deg, #90CAF9, #64B5F6);
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1rem;
  font-weight: bold;
  text-transform: uppercase;
  flex-shrink: 0;
  box-shadow: 0 3px 6px rgba(0,0,0,0.1);
  transition: transform 0.2s ease;
}

.user-avatar-small:hover {
  transform: scale(1.1);
}

.user-avatar-small.current-user {
  background: linear-gradient(135deg, #2196F3, #03A9F4);
  box-shadow: 0 3px 8px rgba(33,150,243,0.4);
}

.current-user-tag {
  display: inline-block;
  font-size: 0.7rem;
  background: linear-gradient(135deg, #2196F3, #03A9F4);
  color: white;
  padding: 3px 8px;
  border-radius: 12px;
  margin-left: 8px;
  vertical-align: middle;
  font-weight: bold;
  box-shadow: 0 2px 4px rgba(33,150,243,0.3);
}

.leaderboard-tips {
  background-color: rgba(245, 245, 245, 0.8);
  border-radius: 8px;
  padding: 20px;
  margin-top: 20px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.05);
  backdrop-filter: blur(5px);
}

.leaderboard-tips h3 {
  color: #1976D2;
  margin-top: 0;
  margin-bottom: 15px;
  font-size: 1.2rem;
}

.leaderboard-tips ul {
  padding-left: 10px;
  margin: 0;
  list-style-type: none;
}

.leaderboard-tips li {
  margin-bottom: 10px;
  color: #555;
  display: flex;
  align-items: center;
}

.leaderboard-tips li i {
  color: #2196F3;
  margin-right: 10px;
  width: 20px;
  text-align: center;
}

/* 分页样式 */
.pagination {
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 25px 0;
  gap: 15px;
}

.pagination-btn {
  background-color: rgba(255, 255, 255, 0.85);
  border: none;
  width: 40px;
  height: 40px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.3s;
  box-shadow: 0 2px 6px rgba(0,0,0,0.1);
  color: #2196F3;
  font-size: 1rem;
  backdrop-filter: blur(3px);
}

.pagination-btn:hover:not(:disabled) {
  background-color: #2196F3;
  color: white;
  transform: translateY(-2px);
  box-shadow: 0 4px 10px rgba(33,150,243,0.3);
}

.page-info, .total-entries {
  font-size: 0.9rem;
  color: #444;
  text-shadow: 0 1px 1px rgba(255, 255, 255, 0.5);
  background-color: rgba(255, 255, 255, 0.5);
  padding: 5px 10px;
  border-radius: 20px;
  backdrop-filter: blur(2px);
}

.total-entries {
  text-align: center;
  margin-bottom: 20px;
}

@media (max-width: 768px) {
  .page-title {
    font-size: 28px;
  }
  .leaderboard-controls {
    flex-direction: column;
    align-items: flex-start;
    gap: 10px;
  }
  
  .user-rank-header {
    padding: 12px 15px;
    flex-direction: row; /* 在移动端保持水平布局 */
    text-align: left;
    align-items: center;
    justify-content: space-between; /* 两端对齐 */
  }
  
  .user-avatar-and-info {
    flex-direction: column; /* 在移动端将头像和信息垂直排列 */
    align-items: flex-start;
  }
  
  .user-avatar {
    width: 45px; /* 在移动端进一步缩小 */
    height: 45px;
    font-size: 1.3rem;
    margin-right: 0;
    margin-bottom: 10px;
  }
  
  .rank-badge {
    margin-top: 0; /* 移除顶部边距 */
    padding: 5px 10px; /* 减小内边距 */
    font-size: 1.5rem; /* 减小字体大小 */
    align-self: flex-start; /* 靠上对齐 */
  }
  
  .user-stats {
    flex-direction: column;
    padding: 0;
  }
  
  .stat-divider {
    height: 1px;
    width: 80%;
    margin: 2px auto;
  }
  
  .stat-item {
    padding: 8px 5px;
  }
  
  .carbon-value {
    font-size: 1.6rem;
  }
  
  .stat-value {
    font-size: 1.3rem;
    margin-bottom: 3px;
  }
}

.achievement {
  position: relative;
  display: inline-flex;
  align-items: center;
  justify-content: center;
}

.percentage {
  font-weight: bold;
  color: #ff9800;
  text-shadow: 0 1px 2px rgba(0,0,0,0.1);
}

.achievement:after {
  content: '';
  position: absolute;
  width: 110%;
  height: 5px;
  bottom: -4px;
  left: -5%;
  background: linear-gradient(90deg, #ff9800, #ffeb3b);
  border-radius: 3px;
}

.rank-cell {
  width: 50px;
  font-weight: 600;
}

.top-rank {
  font-weight: 700;
  font-size: 1.1rem;
}

.rank-1, .rank-2, .rank-3 {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  color: white;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.2);
}

.rank-1 {
  background: linear-gradient(135deg, #FFD700, #FFA500);
}

.rank-2 {
  background: linear-gradient(135deg, #E0E0E0, #B0B0B0);
}

.rank-3 {
  background: linear-gradient(135deg, #CD7F32, #8B4513);
}

.user-column {
  flex: 1;
  padding: 0 10px;
  position: relative;
}

.update-btn i.fa-spin {
  animation: spin 1s linear infinite;
}

@keyframes spin {
  100% {
    transform: rotate(360deg);
  }
}

@keyframes floatAnimation {
  0% {
    transform: translateY(0);
  }
  50% {
    transform: translateY(-8px);
  }
  100% {
    transform: translateY(0);
  }
}

.leaderboard-table tr {
  transition: background-color 0.15s ease;
  animation: fadeIn 0.5s ease-out;
  animation-fill-mode: both;
  animation-delay: calc(var(--row-index, 0) * 0.1s);
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

.leaderboard-table tr:hover {
  background-color: #F6F8FA;
}

.leaderboard-table tr.current-user {
  background-color: rgba(33, 150, 243, 0.05) !important;
  animation: highlightRow 2s infinite alternate;
  position: relative;
  z-index: 1;
}

@keyframes highlightRow {
  from { background-color: rgba(33, 150, 243, 0.05); }
  to { background-color: rgba(33, 150, 243, 0.15); }
}

.leaderboard-table tr:last-child td {
  border-bottom: none;
}

.no-data {
  padding: 30px;
  text-align: center;
  color: #999;
  font-size: 1.1rem;
}

.loading-indicator {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 40px;
  color: #666;
}

.spinner {
  width: 40px;
  height: 40px;
  border: 4px solid rgba(0, 0, 0, 0.1);
  border-radius: 50%;
  border-top-color: #2196F3;
  animation: spin 1s ease-in-out infinite;
  margin-bottom: 15px;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

.pagination-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.update-btn:disabled {
  background: linear-gradient(135deg, #90CAF9, #64B5F6);
  cursor: not-allowed;
  box-shadow: none;
}

.loading-rank {
  background-color: #9E9E9E;
  animation: pulse 1.5s infinite;
}

.text-normal {
  color: #9E9E9E;
}
</style>