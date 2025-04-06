# EcoPaw - 碳足迹追踪应用

## 项目简介
EcoPaw是一个基于Vue.js开发的碳足迹追踪应用，旨在帮助用户了解和减少他们的碳足迹。该应用提供了直观的界面和详细的数据分析，使用户能够更好地理解他们的日常活动对环境的影响。

## 技术栈
- 前端框架：Vue.js 3
- 状态管理：Vuex 4
- 路由管理：Vue Router 4
- HTTP客户端：Axios
- UI组件：Font Awesome
- 构建工具：Vue CLI

## 环境要求
- Node.js >= 14.0.0
- npm >= 6.14.0
- Vue CLI >= 5.0.0
- 现代浏览器（Chrome、Firefox、Safari、Edge等）

## 环境配置
1. 安装Node.js
   - 访问 [Node.js官网](https://nodejs.org/)
   - 下载并安装LTS（长期支持）版本

2. 安装Vue CLI
```bash
npm install -g @vue/cli
```

3. 配置开发环境
   - 确保已安装Git
   - 配置npm镜像（可选，推荐使用淘宝镜像）
```bash
npm config set registry https://registry.npmmirror.com
```

4. IDE推荐
   - Visual Studio Code
   - 推荐安装的VSCode插件：
     - Volar (Vue 3)
     - ESLint
     - Prettier
     - Auto Import
     - Vue VSCode Snippets

## 项目结构
```
ecopaw/
├── src/                    # 源代码目录
│   ├── assets/            # 静态资源
│   ├── components/        # 可复用组件
│   ├── config/           # 配置文件
│   ├── router/           # 路由配置
│   ├── store/            # Vuex状态管理
│   ├── views/            # 页面视图
│   ├── App.vue           # 根组件
│   └── main.js           # 入口文件
├── public/                # 公共资源目录
├── backend/              # 后端服务
├── dist/                 # 构建输出目录
└── package.json          # 项目配置文件
```

## 功能特性
- 用户认证和授权
- 碳足迹数据追踪
- 数据可视化展示
- 个性化建议
- 社区互动功能

## 安装说明
1. 克隆项目
```bash
git clone [项目地址]
```

2. 安装依赖
```bash
npm install
```

3. 启动开发服务器
```bash
npm run serve
```

4. 构建生产版本
```bash
npm run build
```

## 开发指南
- 遵循Vue.js官方风格指南
- 使用ESLint进行代码规范检查
- 组件化开发，保持代码的可复用性
- 使用Vuex进行状态管理
- 遵循RESTful API设计规范

## 贡献指南
1. Fork 项目
2. 创建特性分支 (`git checkout -b feature/AmazingFeature`)
3. 提交更改 (`git commit -m 'Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 开启Pull Request

## 版本历史
- 1.0.0 - 初始版本发布

## 许可证
本项目采用 ISC 许可证 
