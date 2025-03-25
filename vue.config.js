const { defineConfig } = require('@vue/cli-service')

module.exports = defineConfig({
  transpileDependencies: true,
  // 关闭 eslint 错误在浏览器中的遮罩层
  lintOnSave: false
}) 