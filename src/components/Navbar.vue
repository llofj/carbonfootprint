<template>
  <nav class="navbar">
    <div class="navbar-brand">
      <router-link to="/" class="logo">EcoPaw</router-link>
    </div>
    <div class="navbar-menu">
      <router-link to="/calculator" class="nav-item">碳计算器</router-link>
      <a @click.prevent="handleAuthRequired('/pet')" class="nav-item" :class="{ 'disabled': !isLoggedIn }">虚拟宠物</a>
      <a @click.prevent="handleAuthRequired('/achievements')" class="nav-item" :class="{ 'disabled': !isLoggedIn }">成就系统</a>
      <a @click.prevent="handleAuthRequired('/ranking')" class="nav-item" :class="{ 'disabled': !isLoggedIn }">排名系统</a>
    </div>
    <div class="navbar-end">
      <div v-if="!isLoggedIn" @click="$router.push('/login')" class="user-icon">
        <i class="fas fa-user"></i>
      </div>
      <div v-else class="username">
        {{ username }}
        <button @click="handleLogout" class="logout-btn">退出</button>
      </div>
    </div>
  </nav>
</template>

<script>
import axios from 'axios';
import { API_URLS, axiosConfig } from '../config/api';

// 创建 axios 实例
const api = axios.create(axiosConfig);

export default {
  name: 'Navbar',
  data() {
    return {
      isLoggedIn: false,
      username: ''
    };
  },
  methods: {
    handleAuthRequired(path) {
      if (!this.isLoggedIn) {
        this.$router.push({
          path: '/login',
          query: { redirect: path }
        });
      } else {
        this.$router.push(path);
      }
    },
    checkLoginStatus() {
      const token = localStorage.getItem('token');
      this.isLoggedIn = !!token;
      if (this.isLoggedIn) {
        this.username = localStorage.getItem('username') || '用户';
      }
    },
    handleLogout() {
      localStorage.removeItem('token');
      localStorage.removeItem('username');
      this.isLoggedIn = false;
      this.username = '';
      this.$router.push('/');
    },
    handleStorageChange(event) {
      if (event.key === 'token' || event.key === 'username') {
        this.checkLoginStatus();
      }
    }
  },
  created() {
    this.checkLoginStatus();
    window.addEventListener('storage', this.handleStorageChange);
  },
  beforeUnmount() {
    window.removeEventListener('storage', this.handleStorageChange);
  }
};
</script>

<style scoped>
.navbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem 2rem;
  background-color: #ffffff;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  z-index: 1000;
}

.navbar-brand .logo {
  font-size: 1.5rem;
  font-weight: bold;
  color: #1e3d59;
  text-decoration: none;
}

.navbar-menu {
  display: flex;
  gap: 2rem;
}

.nav-item {
  color: #2c3e50;
  text-decoration: none;
  font-weight: 500;
  transition: color 0.3s ease;
  cursor: pointer;
}

.nav-item.disabled {
  color: #999;
  cursor: not-allowed;
}

.nav-item:not(.disabled):hover {
  color: #17a2b8;
}

.navbar-end {
  display: flex;
  align-items: center;
}

.user-icon {
  cursor: pointer;
  padding: 0.5rem;
  border-radius: 50%;
  background-color: #f0f0f0;
  width: 2rem;
  height: 2rem;
  display: flex;
  align-items: center;
  justify-content: center;
}

.username {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 0.5rem 1rem;
  background-color: #f0f0f0;
  border-radius: 20px;
  font-weight: 500;
}

.logout-btn {
  padding: 0.25rem 0.75rem;
  border: none;
  background-color: #dc3545;
  color: white;
  border-radius: 15px;
  cursor: pointer;
  font-size: 0.9rem;
  transition: background-color 0.3s ease;
}

.logout-btn:hover {
  background-color: #c82333;
}
</style>