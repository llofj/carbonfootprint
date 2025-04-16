// src/store/index.js
import { createStore } from 'vuex';
import { getAPI } from '@/config/api';
import message from './modules/message';

export default createStore({
  state: {
    user: null,
    pet: {
      name: '小绿',
      level: 1,
      health: '健康'
    },
    achievements: [],
    leaderboard: [],
    userCarbonReduction: 0
  },
  mutations: {
    setUser(state, user) {
      state.user = user;
    },
    updatePet(state, pet) {
      state.pet = pet;
    },
    setAchievements(state, achievements) {
      state.achievements = achievements;
    },
    setLeaderboard(state, leaderboard) {
      state.leaderboard = leaderboard;
    },
    setUserCarbonReduction(state, amount) {
      state.userCarbonReduction = amount;
    }
  },
  actions: {
    login({ commit }, user) {
      // 模拟登录
      commit('setUser', user);
    },
    fetchAchievements({ commit }) {
      // 模拟获取成就
      const achievements = ['绿色饮食达人', '低碳通勤者'];
      commit('setAchievements', achievements);
    },
    fetchLeaderboard({ commit }) {
      // 模拟获取排行榜
      const leaderboard = [
        { name: '用户A', reduction: 5.2 },
        { name: '用户B', reduction: 4.8 }
      ];
      commit('setLeaderboard', leaderboard);
    },
    async fetchUserCarbonReduction({ commit }) {
      try {
        const response = await getAPI().get('/achievement/carbon-reduction');
        if (response.data && response.data.carbon_reduction !== undefined) {
          commit('setUserCarbonReduction', response.data.carbon_reduction);
        }
      } catch (error) {
        console.error('获取用户减碳总量失败:', error);
      }
    },
    
    // 更新用户减碳总量，确保不从缓存获取数据
    async updateUserCarbonReduction({ commit }) {
      try {
        // 为了防止缓存，添加随机参数
        const timestamp = new Date().getTime();
        const response = await getAPI().get(`/achievement/carbon-reduction?_t=${timestamp}`);
        
        if (response.data && response.data.carbon_reduction !== undefined) {
          commit('setUserCarbonReduction', response.data.carbon_reduction);
          console.log('已更新用户减碳总量:', response.data.carbon_reduction);
          return response.data.carbon_reduction;
        }
        return 0;
      } catch (error) {
        console.error('更新用户减碳总量失败:', error);
        return 0;
      }
    },
    
    // 同步排名系统与用户减碳总量
    async syncLeaderboardWithCarbonReduction({ dispatch }) {
      try {
        console.log('开始同步排名系统与减碳总量...');
        
        // 1. 先获取最新的用户减碳总量
        const carbonReduction = await dispatch('updateUserCarbonReduction');
        console.log('获取到最新减碳总量:', carbonReduction);
        
        // 2. 调用排名更新接口，确保使用最新的减碳总量
        const response = await getAPI().post('/leaderboard/update');
        console.log('排名同步完成:', response.data);
        
        return true;
      } catch (error) {
        console.error('同步排名系统失败:', error);
        return false;
      }
    }
  },
  getters: {
    isLoggedIn(state) {
      return !!state.user;
    },
    currentUserCarbonReduction(state) {
      return state.userCarbonReduction;
    }
  },
  modules: {
    message
  }
});