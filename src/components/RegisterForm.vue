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
              v-model="captchaInput" 
              required 
              :disabled="isLoading"
              @input="clearError"
              maxlength="4"
              pattern="[0-9]{4}"
              placeholder="请输入验证码"
            />
          </div>
          <div 
            class="captcha-code" 
            @click="generateCaptcha" 
            title="当前验证码为随机生成"
          >
            <span
              v-for="(digit, index) in captchaDisplay"
              :key="index"
              :style="getRandomStyle()"
            >{{ digit }}</span>
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
      captchaInput: '',
      captchaDisplay: '',  // 显示的验证码
      systemCaptcha: '',   // 系统生成的验证码，用于比对
      errorMessage: '',
      isLoading: false,
      showPassword: false,
      showConfirmPassword: false,
      refreshCount: 0
    };
  },
  computed: {
    isFormValid() {
      return this.username.trim() && 
             this.email.trim() && 
             this.password && 
             this.password === this.confirmPassword &&
             this.captchaInput && 
             this.captchaInput.length === 4;
    }
  },
  created() {
    // 初始化生成随机验证码
    this.generateCaptcha();
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
    // 生成新的随机验证码
    generateCaptcha() {
      // 生成四位随机数字 (1000-9999)
      const randomNum = Math.floor(1000 + Math.random() * 9000);
      const captchaString = randomNum.toString();
      
      // 设置显示验证码和系统验证码
      this.captchaDisplay = captchaString;
      this.systemCaptcha = captchaString;
      this.captchaInput = ''; // 清空用户输入
      
      // 如果已经有输入框状态，添加刷新动画
      const captchaElement = document.querySelector('.captcha-code');
      if (captchaElement && this.refreshCount > 0) {
        captchaElement.classList.add('refreshing');
        setTimeout(() => {
          captchaElement.classList.remove('refreshing');
        }, 500);
      }
      
      this.refreshCount++;
      console.log(`生成新验证码: ${this.systemCaptcha}`);
    },
    // 为每个数字生成随机样式，增加视觉干扰
    getRandomStyle() {
      const rotation = Math.floor(Math.random() * 10) - 5;
      const fontSize = 14 + Math.floor(Math.random() * 4);
      const letterSpacing = Math.floor(Math.random() * 3) - 1;
      
      return {
        transform: `rotate(${rotation}deg)`,
        fontSize: `${fontSize}px`,
        letterSpacing: `${letterSpacing}px`,
        display: 'inline-block',
        fontWeight: 'bold',
        margin: '0 2px'
      };
    },
    async handleSubmit() {
      if (!this.isFormValid) {
        if (this.password !== this.confirmPassword) {
          this.errorMessage = '两次输入的密码不一致';
          return;
        }
        return;
      }
      
      // 检查验证码 - 与生成的验证码比对
      if (this.captchaInput !== this.systemCaptcha) {
        console.log(`验证码比对失败: 用户输入="${this.captchaInput}", 系统验证码="${this.systemCaptcha}"`);
        this.errorMessage = '验证码错误，请重新输入';
        this.captchaInput = '';
        this.generateCaptcha(); // 生成新验证码
        return;
      }
      
      console.log("验证码校验通过，准备提交注册请求");
      
      this.isLoading = true;
      this.errorMessage = '';
      
      try {
        const registerData = {
          username: this.username.trim(),
          email: this.email.trim(),
          password: this.password,
          captcha: "0000" // 固定发送"0000"给后端，保持兼容
        };
        
        console.log('正在发送注册请求:', {
          用户名: registerData.username,
          邮箱: registerData.email,
          验证码: "固定发送0000"
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
          this.generateCaptcha();
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
          this.generateCaptcha();
        } else {
          this.errorMessage = '无法连接到服务器，请检查网络连接';
          this.generateCaptcha();
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
  width: 100%;
  max-width: 380px;
  margin: 1rem auto;
  padding: 1.5rem;
  border-radius: 12px;
  background-color: rgba(255, 255, 255, 0.9);
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.2);
  backdrop-filter: blur(8px);
  -webkit-backdrop-filter: blur(8px);
  border: 1px solid rgba(255, 255, 255, 0.1);
  transition: all 0.3s ease;
}

.register-form:hover {
  transform: translateY(-3px);
  box-shadow: 0 12px 40px rgba(0, 0, 0, 0.25);
}

.register-form h2 {
  text-align: center;
  color: #2c3e50;
  margin-bottom: 1rem;
  font-size: 1.5rem;
  font-weight: 600;
  letter-spacing: 1px;
  position: relative;
  padding-bottom: 8px;
}

.register-form h2::after {
  content: '';
  position: absolute;
  bottom: 0;
  left: 50%;
  transform: translateX(-50%);
  width: 60px;
  height: 3px;
  background: linear-gradient(90deg, #4CA1AF, #2C3E50);
  border-radius: 3px;
}

.form-group {
  margin-bottom: 0.8rem;
}

.form-group label {
  display: block;
  margin-bottom: 0.3rem;
  font-weight: 500;
  color: #455a64;
  font-size: 0.9rem;
}

.form-group input {
  width: 100%;
  padding: 0.6rem;
  border: 2px solid #e0e0e0;
  border-radius: 8px;
  font-size: 0.9rem;
  transition: all 0.3s ease;
  background-color: rgba(255, 255, 255, 0.8);
}

.form-group input:focus {
  outline: none;
  border-color: #4CA1AF;
  box-shadow: 0 0 0 3px rgba(76, 161, 175, 0.2);
  background-color: #fff;
}

.form-group input:disabled {
  background-color: #f5f5f5;
  cursor: not-allowed;
}

.password-input {
  position: relative;
}

.password-input i {
  position: absolute;
  right: 12px;
  top: 50%;
  transform: translateY(-50%);
  cursor: pointer;
  color: #78909c;
  transition: all 0.2s ease;
}

.password-input i:hover {
  color: #455a64;
}

.captcha-group {
  display: flex;
  align-items: center;
  gap: 8px;
}

.captcha-input {
  flex: 1;
}

.captcha-code {
  padding: 0.5rem;
  background-color: #f5f5f5;
  border-radius: 8px;
  font-weight: bold;
  letter-spacing: 1px;
  min-width: 70px;
  text-align: center;
  border: 2px solid #e0e0e0;
  color: #2c3e50;
  user-select: none;
  cursor: pointer;
  transition: all 0.3s ease;
  position: relative;
  display: flex;
  justify-content: center;
  align-items: center;
  background-image: linear-gradient(45deg, #f5f5f5 25%, #e8e8e8 25%, #e8e8e8 50%, #f5f5f5 50%, #f5f5f5 75%, #e8e8e8 75%, #e8e8e8);
  background-size: 8px 8px;
}

.captcha-code:hover {
  background-color: #e0e0e0;
  transform: scale(1.02);
}

.captcha-code::before {
  content: '';
  position: absolute;
  width: 100%;
  height: 2px;
  background: rgba(0, 0, 0, 0.1);
  top: 50%;
  left: 0;
  transform: translateY(-50%);
}

.captcha-code::after {
  content: '点击刷新';
  position: absolute;
  bottom: -20px;
  left: 50%;
  transform: translateX(-50%);
  font-size: 0.65rem;
  color: #78909c;
  white-space: nowrap;
  opacity: 0;
  transition: opacity 0.2s ease;
}

.captcha-code:hover::after {
  opacity: 1;
}

.refreshing {
  animation: refresh-animation 0.5s;
}

@keyframes refresh-animation {
  0% { transform: rotate(0); opacity: 1; }
  50% { transform: rotate(10deg); opacity: 0.5; }
  100% { transform: rotate(0); opacity: 1; }
}

button {
  width: 100%;
  padding: 0.7rem;
  background: linear-gradient(90deg, #4CA1AF, #2C3E50);
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 0.95rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  margin-top: 0.8rem;
  letter-spacing: 0.5px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}

button:hover:not(:disabled) {
  background: linear-gradient(90deg, #3c8997, #1a2c3f);
  transform: translateY(-2px);
  box-shadow: 0 6px 8px rgba(0, 0, 0, 0.15);
}

button:disabled {
  background: #cccccc;
  cursor: not-allowed;
  opacity: 0.7;
}

.error-container {
  margin-top: 0.8rem;
  padding: 0.5rem;
  background-color: rgba(255, 76, 76, 0.1);
  border-left: 3px solid #ff4c4c;
  color: #d32f2f;
  border-radius: 4px;
  font-size: 0.8rem;
  display: flex;
  align-items: center;
}

.error-container i {
  margin-right: 8px;
  font-size: 1rem;
}

.login-link {
  text-align: center;
  margin-top: 0.8rem;
  color: #455a64;
  font-size: 0.85rem;
}

.login-link a {
  color: #4CA1AF;
  text-decoration: none;
  font-weight: 600;
  transition: all 0.3s ease;
}

.login-link a:hover {
  color: #2C3E50;
  text-decoration: underline;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.fa-spinner {
  animation: spin 1s linear infinite;
  margin-right: 8px;
}

/* 去除number类型输入框的上下箭头 */
input[type="number"]::-webkit-inner-spin-button,
input[type="number"]::-webkit-outer-spin-button {
  -webkit-appearance: none;
  margin: 0;
}

input[type="number"] {
  -moz-appearance: textfield;
}
</style> 