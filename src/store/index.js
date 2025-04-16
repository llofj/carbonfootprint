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