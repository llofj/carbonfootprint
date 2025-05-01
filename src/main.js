// src/main.js
import { createApp } from 'vue';
import App from './App.vue';
import router from './router';
import store from './store';
import '@fortawesome/fontawesome-free/css/all.css'
import './assets/css/homeButton.css'; // 导入通用返回主页按钮样式
import './assets/css/navbar.css'; // 导入美化的导航栏样式
import './assets/css/homepage.css'; // 导入美化的主页样式
import axios from 'axios';
import { requestInterceptor, responseInterceptor } from './config/api';

// 配置全局请求拦截器
axios.interceptors.request.use(requestInterceptor);
axios.interceptors.response.use(
  responseInterceptor.success, 
  responseInterceptor.error
);

const app = createApp(App);
app.use(router);
app.use(store);
app.mount('#app');