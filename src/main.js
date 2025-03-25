// src/main.js
import { createApp } from 'vue';
import App from './App.vue';
import router from './router';
import store from './store';
import '@fortawesome/fontawesome-free/css/all.css'
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