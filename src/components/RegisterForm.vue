<template>
  <div class="register-form">
    <h2>注册新用户</h2>
    <form @submit.prevent="handleSubmit">
      <div class="form-group">
        <label for="username">用户名:</label>
        <input 
          type="text" 
          id="username" 
          v-model.trim="username" 
          required 
          :disabled="isLoading"
          @input="clearError"
          placeholder="请输入用户名"
        />
      </div>
      <div class="form-group">
        <label for="email">邮箱:</label>
        <input 
          type="email" 
          id="email" 
          v-model.trim="email" 
          required 
          :disabled="isLoading"
          @input="clearError"
          placeholder="请输入邮箱"
        />
      </div>
      <div class="form-group">
        <label for="password">密码:</label>
        <div class="password-input">
          <input 
            :type="showPassword ? 'text' : 'password'" 
            id="password" 
            v-model="password" 
            required 
            :disabled="isLoading"
            @input="clearError"
            placeholder="请输入密码"
          />
          <i 
            class="fas" 
            :class="showPassword ? 'fa-eye-slash' : 'fa-eye'"
            @click="togglePassword"
          ></i>
        </div>
      </div>
      <div class="form-group">
        <label for="confirmPassword">确认密码:</label>
        <div class="password-input">
          <input 
            :type="showConfirmPassword ? 'text' : 'password'" 
            id="confirmPassword" 
            v-model="confirmPassword" 
            required 
            :disabled="isLoading"
            @input="clearError"
            placeholder="请再次输入密码"
          />
          <i 
            class="fas" 
            :class="showConfirmPassword ? 'fa-eye-slash' : 'fa-eye'"
            @click="toggleConfirmPassword"
          ></i>
        </div>
      </div>
      <div class="form-group">
        <label for="captcha">验证码:</label>
        <div class="captcha-group">
          <div class="captcha-input">
            <input 
              type="text" 
              id="captcha" 
              v-model.trim="captcha" 
              required 
              :disabled="isLoading"
              @input="clearError"
              maxlength="4"
              placeholder="请输入验证码 (0000)"
            />
          </div>
          <div class="captcha-code">
            0000
          </div>
        </div>
      </div>
      <button type="submit" :disabled="isLoading || !isFormValid">
        <span v-if="isLoading">
          <i class="fas fa-spinner fa-spin"></i> 注册中...
        </span>
        <span v-else>注册</span>
      </button>
      <div v-if="errorMessage" class="error-container">
        <i class="fas fa-exclamation-circle"></i>
        {{ errorMessage }}
      </div>
      <div class="login-link">
        已有账号? <router-link to="/login">点击登录</router-link>
      </div>
    </form>
  </div>
</template>

<script>
import axios from 'axios';
import { API_URLS, axiosConfig } from '../config/api';

const api = axios.create(axiosConfig);

export default {
  data() {
    return {
      username: '',
      email: '',
      password: '',
      confirmPassword: '',
      captcha: '0000',
      errorMessage: '',
      isLoading: false,
      showPassword: false,
      showConfirmPassword: false
    };
  },
  computed: {
    isFormValid() {
      return this.username.trim() && 
             this.email.trim() && 
             this.password && 
             this.password === this.confirmPassword &&
             this.captcha.trim() === '0000';
    }
  },
  methods: {
    clearError() {
      this.errorMessage = '';
    },
    togglePassword() {
      this.showPassword = !this.showPassword;
    },
    toggleConfirmPassword() {
      this.showConfirmPassword = !this.showConfirmPassword;
    },
    async handleSubmit() {
      if (!this.isFormValid) {
        if (this.password !== this.confirmPassword) {
          this.errorMessage = '两次输入的密码不一致';
          return;
        }
        if (this.captcha.trim() !== '0000') {
          this.errorMessage = '验证码错误，请输入0000';
          return;
        }
        return;
      }
      
      this.isLoading = true;
      this.errorMessage = '';
      
      try {
        const registerData = {
          username: this.username.trim(),
          email: this.email.trim(),
          password: this.password.trim(),
          captcha: this.captcha.trim()
        };
        
        console.log('正在发送注册请求:', {
          url: `${axiosConfig.baseURL}${API_URLS.register}`,
          username: registerData.username,
          email: registerData.email
        });
        
        const response = await api.post(API_URLS.register, registerData);
        
        console.log('服务器响应:', response.data);
        
        if (response.data && response.data.message === '注册成功') {
          // 注册成功，跳转到登录页
          this.$router.push('/login?registered=true');
          return;
        }
        
        // 如果没有成功消息但服务器返回了消息
        if (response.data && response.data.message) {
          this.errorMessage = response.data.message;
          return;
        }
      } catch (error) {
        console.error('注册过程中发生错误:', error);
        
        // 处理API错误响应
        if (error.response) {
          const status = error.response.status;
          const errorData = error.response.data;
          
          switch (status) {
            case 400:
              this.errorMessage = errorData.message || '注册信息有误，请检查输入';
              break;
            case 409:
              this.errorMessage = '用户名已存在，请选择其他用户名';
              break;
            case 500:
              this.errorMessage = '服务器错误，请稍后重试';
              break;
            default:
              this.errorMessage = errorData?.message || '注册失败，请稍后重试';
          }
        } else {
          this.errorMessage = '无法连接到服务器，请检查网络连接';
        }
      } finally {
        this.isLoading = false;
      }
    }
  }
};
</script>

<style scoped>
.register-form {
  background-color: white;
  padding: 2rem;
  border-radius: 8px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  width: 100%;
  max-width: 400px;
}

h2 {
  text-align: center;
  margin-bottom: 1.5rem;
  color: #333;
}

.form-group {
  margin-bottom: 1rem;
}

label {
  display: block;
  margin-bottom: 0.5rem;
  font-weight: 500;
  color: #555;
}

input {
  width: 100%;
  padding: 0.75rem;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 1rem;
  transition: border-color 0.3s;
}

input:focus {
  border-color: #4CAF50;
  outline: none;
}

.password-input {
  position: relative;
}

.password-input i {
  position: absolute;
  right: 10px;
  top: 50%;
  transform: translateY(-50%);
  cursor: pointer;
  color: #777;
}

.captcha-group {
  display: flex;
  gap: 10px;
}

.captcha-input {
  flex: 1;
}

.captcha-code {
  background-color: #f0f0f0;
  padding: 0.75rem;
  border-radius: 4px;
  font-family: monospace;
  font-weight: bold;
  color: #333;
  min-width: 80px;
  text-align: center;
}

button {
  width: 100%;
  padding: 0.75rem;
  background-color: #4CAF50;
  color: white;
  border: none;
  border-radius: 4px;
  font-size: 1rem;
  cursor: pointer;
  transition: background-color 0.3s;
  margin-top: 1rem;
}

button:hover {
  background-color: #45a049;
}

button:disabled {
  background-color: #cccccc;
  cursor: not-allowed;
}

.error-container {
  margin-top: 1rem;
  padding: 0.75rem;
  background-color: #ffebee;
  color: #c62828;
  border-radius: 4px;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.login-link {
  margin-top: 1rem;
  text-align: center;
  font-size: 0.9rem;
}

.login-link a {
  color: #4CAF50;
  text-decoration: none;
}

.login-link a:hover {
  text-decoration: underline;
}
</style> 