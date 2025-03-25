<template>
  <div class="login-form">
    <h2>登录</h2>
    <form @submit.prevent="handleSubmit">
      <div class="form-group">
        <label for="username">账号:</label>
        <input 
          type="text" 
          id="username" 
          v-model.trim="username" 
          required 
          :disabled="isLoading"
          @input="clearError"
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
          />
          <i 
            class="fas" 
            :class="showPassword ? 'fa-eye-slash' : 'fa-eye'"
            @click="togglePassword"
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
          <i class="fas fa-spinner fa-spin"></i> 登录中...
        </span>
        <span v-else>登录</span>
      </button>
      <div v-if="errorMessage" class="error-container">
        <i class="fas fa-exclamation-circle"></i>
        {{ errorMessage }}
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
      password: '',
      captcha: '0000',
      errorMessage: '',
      isLoading: false,
      showPassword: false
    };
  },
  computed: {
    isFormValid() {
      return this.username.trim() && 
             this.password && 
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
    async handleSubmit() {
      if (!this.isFormValid) {
        if (this.captcha.trim() !== '0000') {
          this.errorMessage = '验证码错误，请输入0000';
          return;
        }
        return;
      }
      
      this.isLoading = true;
      this.errorMessage = '';
      
      try {
        const loginData = {
          username: this.username.trim(),
          password: this.password.trim(),
          captcha: this.captcha.trim()
        };
        
        console.log('正在发送登录请求:', {
          url: `${axiosConfig.baseURL}${API_URLS.login}`,
          username: loginData.username
        });
        
        try {
          const response = await api.post(API_URLS.login, loginData);
          
          console.log('服务器响应:', response.data);
          
          if (response.data && response.data.token) {
            // 登录成功
            localStorage.setItem('token', response.data.token);
            localStorage.setItem('username', this.username.trim());
            
            const redirect = this.$route.query.redirect || '/';
            await this.$router.push(redirect);
            return;
          }
          
          // 如果没有token但服务器返回了消息
          if (response.data && response.data.message) {
            this.errorMessage = response.data.message;
            return;
          }
        } catch (apiError) {
          console.error('API调用错误:', apiError);
          
          // 处理API错误响应
          if (apiError.response) {
            const status = apiError.response.status;
            const errorData = apiError.response.data;
            
            switch (status) {
              case 401:
                this.errorMessage = '账号或密码错误';
                break;
              case 403:
                this.errorMessage = '验证码错误';
                break;
              case 500:
                this.errorMessage = '服务器错误，请稍后重试';
                break;
              default:
                this.errorMessage = errorData?.message || '登录失败，请稍后重试';
            }
            
            // 在这里不要尝试备用登录，让错误显示给用户
            return;
          }
          
          // 如果是网络错误或服务器未响应，则尝试备用登录
          console.log('网络错误或服务器未响应，尝试备用登录');
        }
        
        // 在API调用完全失败或没有有效响应的情况下，执行备用登录
        console.log('尝试备用登录...');
        if (this.username.trim().toLowerCase() === 'test' && this.password.trim() === '123456') {
          console.log('备用登录成功');
          localStorage.setItem('token', 'mock-token-12345');
          localStorage.setItem('username', this.username.trim());
          
          const redirect = this.$route.query.redirect || '/';
          await this.$router.push(redirect);
          return;
        }
        
        this.errorMessage = '无法连接到服务器，请检查网络连接';
        
      } catch (error) {
        console.error('登录过程中发生意外错误:', error);
        this.errorMessage = '登录过程中发生错误，请稍后重试';
      } finally {
        this.isLoading = false;
      }
    }
  },
  created() {
    if (localStorage.getItem('token')) {
      const redirect = this.$route.query.redirect || '/';
      this.$router.push(redirect);
    }
  }
};
</script>

<style scoped>
.login-form {
  width: 100%;
  max-width: 400px;
  margin: 2rem auto;
  padding: 2rem;
  border-radius: 10px;
  background-color: white;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}

.login-form h2 {
  text-align: center;
  color: #1e3d59;
  margin-bottom: 2rem;
  font-size: 1.8rem;
}

.form-group {
  margin-bottom: 1.5rem;
}

.form-group label {
  display: block;
  margin-bottom: 0.5rem;
  font-weight: 500;
  color: #666;
}

.form-group input {
  width: 100%;
  padding: 0.75rem;
  border: 2px solid #e0e0e0;
  border-radius: 6px;
  font-size: 1rem;
  transition: all 0.3s ease;
}

.form-group input:focus {
  outline: none;
  border-color: #17a2b8;
  box-shadow: 0 0 0 3px rgba(23, 162, 184, 0.2);
}

.form-group input:disabled {
  background-color: #f5f5f5;
  cursor: not-allowed;
}

.password-input {
  position: relative;
  display: flex;
  align-items: center;
}

.password-input i {
  position: absolute;
  right: 12px;
  color: #666;
  cursor: pointer;
  padding: 4px;
  transition: color 0.3s ease;
}

.password-input i:hover {
  color: #17a2b8;
}

.captcha-group {
  display: flex;
  gap: 1rem;
  align-items: flex-start;
}

.captcha-input {
  flex: 1;
}

.captcha-code {
  width: 100px;
  height: 44px;
  border-radius: 6px;
  background-color: #f0f0f0;
  border: 2px solid #e0e0e0;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.5rem;
  font-weight: bold;
  color: #333;
  letter-spacing: 2px;
}

button[type="submit"] {
  width: 100%;
  padding: 0.75rem;
  background-color: #17a2b8;
  color: white;
  border: none;
  border-radius: 6px;
  font-size: 1rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
}

button[type="submit"]:hover:not(:disabled) {
  background-color: #138496;
  transform: translateY(-1px);
}

button[type="submit"]:disabled {
  background-color: #ccc;
  cursor: not-allowed;
  transform: none;
}

.error-container {
  margin-top: 1rem;
  padding: 0.75rem;
  background-color: #fff5f5;
  border: 1px solid #fed7d7;
  border-radius: 6px;
  color: #dc3545;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.9rem;
}

.error-container i {
  font-size: 1rem;
}

@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

.fa-spinner {
  animation: spin 1s linear infinite;
}
</style>