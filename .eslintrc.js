module.exports = {
  root: true,
  env: {
    node: true
  },
  extends: [
    'plugin:vue/vue3-essential',
    'eslint:recommended'
  ],
  parserOptions: {
    parser: '@babel/eslint-parser'
  },
  rules: {
    'no-console': process.env.NODE_ENV === 'production' ? 'warn' : 'off',
    'no-debugger': process.env.NODE_ENV === 'production' ? 'warn' : 'off',
    // 关闭一些可能导致开发阶段困扰的规则
    'vue/no-unused-components': 'warn',
    'vue/multi-word-component-names': 'off',
    'no-unused-vars': 'warn'
  }
} 