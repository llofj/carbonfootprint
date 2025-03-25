// API 基础配置
const isDevelopment = process.env.NODE_ENV === 'development';

// 获取当前主机地址，用于动态设置API服务器地址
const getApiBaseUrl = () => {
  // 获取当前主机名
  const currentHost = window.location.hostname;
  
  if (isDevelopment) {
    if (currentHost === 'localhost' || currentHost === '127.0.0.1') {
      return 'http://localhost:5000/api';
    } else {
      // 如果是通过IP地址访问的，使用相同IP地址的后端API
      return `http://${currentHost}:5000/api`;
    }
  }
  
  return 'https://api.ecopaw.com'; // 生产环境
};

// 设置基础URL
const baseURL = getApiBaseUrl();
console.log('API基础URL:', baseURL);

// API 端点
export const API_URLS = {
  login: '/auth/login',
  logout: '/auth/logout',
  register: '/auth/register',
  captcha: '/auth/captcha',
  profile: '/user/profile',
  calculator: '/carbon/calculate',
  pet: '/pet',
  achievements: '/achievement',
  ranking: '/leaderboard'
};

// axios 配置
export const axiosConfig = {
  baseURL,
  timeout: 15000,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json, image/svg+xml'
  }
};

// 请求拦截器配置
export const requestInterceptor = (config) => {
  console.log('请求拦截器处理请求:', config.url);
  
  // 如果是获取验证码的请求，修改 headers
  if (config.url === API_URLS.captcha) {
    config.headers['Accept'] = 'image/svg+xml';
    config.responseType = 'text';
    return config;
  }
  
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  
  // 添加调试log
  if (config.data) {
    try {
      // 清理敏感信息后的日志
      const logData = { ...config.data };
      if (logData.password) {
        logData.password = '******';
      }
      console.log('请求数据:', logData);
    } catch (e) {
      console.error('请求日志记录失败:', e);
    }
  }
  
  return config;
};

// 响应拦截器配置
export const responseInterceptor = {
  success: (response) => {
    console.log('响应拦截器接收到响应:', {
      url: response.config.url,
      status: response.status,
      statusText: response.statusText
    });
    return response;
  },
  error: (error) => {
    console.error('API Error:', error);
    
    // 如果有响应
    if (error.response) {
      console.log('错误响应信息:', {
        status: error.response.status,
        statusText: error.response.statusText,
        data: error.response.data
      });
      
      // 处理401错误（未授权）
      if (error.response.status === 401) {
        localStorage.removeItem('token');
        localStorage.removeItem('username');
        if (window.location.pathname !== '/login') {
          window.location.href = '/login';
        }
      }
    } else if (error.request) {
      // 请求已发送但没有收到响应
      console.log('没有收到响应:', error.request);
    } else {
      // 设置请求时发生错误
      console.log('请求设置错误:', error.message);
    }
    
    return Promise.reject(error);
  }
}; 