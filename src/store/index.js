// src/store/index.js
import { createStore } from 'vuex';

export default createStore({
  state: {
    user: null,
    pet: {
      name: '小绿',
      level: 1,
      health: '健康'
    },
    achievements: [],
    leaderboard: []
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
    }
  }
});