# 问卷调查平台 (Survey Platform)

一个功能完整的问卷调查系统，类似于问卷星，使用 Vue3 + Node.js + MariaDB 开发。

## 项目概述

这是一个全栈问卷系统，支持用户创建、发布、填写和统计问卷。系统包含完整的前端界面和后端 API，采用现代化的技术栈构建。

## 技术栈

### 前端
- Vue 3.5+ (Composition API + TypeScript)
- Vite 7 (构建工具)
- Element Plus 2.13+ (UI 组件库)
- Pinia 3 (状态管理)
- Vue Router 4 (路由)
- Axios (HTTP 客户端)

### 后端
- Node.js 18+
- Express 5.2+ (Web 框架)
- TypeScript 5.9+
- Sequelize 6.37+ (ORM)
- MariaDB 10.5+ (数据库)
- JWT (身份认证)
- bcryptjs (密码加密)

## 功能特性

### 用户系统
- 用户注册/登录
- JWT Token 认证
- 用户资料管理
- 权限控制（普通用户/管理员）

### 问卷管理
- 创建问卷
- 编辑问卷
- 删除问卷
- 发布问卷
- 问卷状态管理（草稿/已发布/已关闭）

### 题目类型
- 单选题
- 多选题
- 下拉单选
- 下拉多选
- 文本题（单行）
- 文本域（多行）
- 评分题（1-5星）
- 日期题
- 开关题

### 高级功能
- **设备限制**：每台设备只能填写一次（基于浏览器指纹）
- **条件跳转**：支持题目条件跳转逻辑
- **响应式设计**：完美适配 H5 和 PC 端

### 问卷设置
- 匿名填写支持
- 需要登录填写选项
- 设备限制选项
- 必填/选填设置
- 题目排序

### 数据收集
- 响应式问卷填写界面
- 表单验证
- 提交答案

### 数据统计
- 回复总数统计
- 题目回复统计
- 选项分布统计（带百分比）
- 评分平均分
- 文本答案列表

## 项目结构

```
survey-platform/
├── frontend/                 # 前端项目 (Vue3)
│   ├── src/
│   │   ├── api/            # API 接口封装
│   │   ├── router/         # 路由配置
│   │   ├── stores/         # Pinia 状态管理
│   │   ├── views/          # 页面组件
│   │   ├── App.vue         # 根组件
│   │   └── main.ts         # 入口文件
│   ├── .env.example        # 环境变量示例
│   └── package.json
├── backend/                  # 后端项目 (Node.js)
│   ├── src/
│   │   ├── config/         # 配置文件
│   │   ├── controllers/    # 控制器
│   │   ├── middleware/     # 中间件
│   │   ├── models/         # 数据模型
│   │   ├── routes/         # 路由
│   │   ├── types/          # TypeScript 类型
│   │   ├── utils/          # 工具函数
│   │   └── index.ts        # 应用入口
│   ├── .env.example        # 环境变量示例
│   └── package.json
├── .trae/
│   └── skills/              # 项目级 Skills
│       ├── dev-startup/     # 开发环境启动
│       ├── db-migrate/      # 数据库迁移
│       └── deploy/          # 部署工具
├── docs/                    # 文档
└── README.md               # 本文件
```

## 快速开始

### 前置要求
- Node.js >= 18
- MariaDB >= 10.5

### 1. 克隆项目

```bash
git clone <repository-url>
cd survey-platform
```

### 2. 安装依赖

```bash
# 安装后端依赖
cd backend
npm install

# 安装前端依赖
cd ../frontend
npm install
```

### 3. 配置数据库

创建 MariaDB 数据库：

```sql
CREATE DATABASE survey_platform CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

配置后端环境变量：

```bash
cd backend
cp .env.example .env
```

编辑 `.env` 文件：

```env
PORT=3001
NODE_ENV=development

# Database Configuration (MariaDB)
DB_HOST=localhost
DB_PORT=3306
DB_NAME=survey_platform
DB_USER=root
DB_PASSWORD=your_password

# JWT Configuration
JWT_SECRET=your_jwt_secret_key_here_change_in_production
JWT_EXPIRES_IN=7d

# CORS Configuration
CORS_ORIGIN=http://localhost:5173
```

配置前端环境变量：

```bash
cd frontend
cp .env.example .env
```

编辑 `.env` 文件：

```env
VITE_API_URL=http://localhost:3001/api
```

### 4. 启动后端

```bash
cd backend
npm run dev
```

后端将运行在 http://localhost:3001

### 5. 启动前端

```bash
cd frontend
npm run dev
```

前端将运行在 http://localhost:5173

### 6. 访问应用

打开浏览器访问 http://localhost:5173

## API 接口文档

### 认证接口
- `POST /api/auth/register` - 用户注册
- `POST /api/auth/login` - 用户登录
- `GET /api/auth/profile` - 获取用户信息（需要认证）

### 问卷接口
- `GET /api/surveys` - 获取问卷列表
- `GET /api/surveys/:id` - 获取问卷详情
- `POST /api/surveys` - 创建问卷（需要认证）
- `PUT /api/surveys/:id` - 更新问卷（需要认证）
- `DELETE /api/surveys/:id` - 删除问卷（需要认证）
- `PATCH /api/surveys/:id/publish` - 发布问卷（需要认证）

### 回复接口
- `POST /api/surveys/:surveyId/responses` - 提交问卷
- `GET /api/surveys/:surveyId/responses` - 获取问卷回复（需要认证）
- `GET /api/surveys/:surveyId/statistics` - 获取问卷统计（需要认证）

## 数据库设计

### 表结构

**users** - 用户表
- `id` (主键)
- `username` (用户名，唯一)
- `email` (邮箱，唯一)
- `password` (加密密码)
- `role` (角色: admin/user)
- `created_at`, `updated_at`

**surveys** - 问卷表
- `id` (主键)
- `title` (标题)
- `description` (描述)
- `status` (状态: draft/published/closed)
- `creator_id` (创建者，外键到 users)
- `start_date`, `end_date` (起止时间)
- `allow_anonymous` (允许匿名)
- `require_login` (需要登录)
- `limit_by_device` (设备限制)
- `created_at`, `updated_at`

**questions** - 题目表
- `id` (主键)
- `survey_id` (问卷ID，外键到 surveys)
- `title` (题目标题)
- `type` (题目类型)
- `is_required` (是否必填)
- `order_index` (排序索引)
- `skip_logic` (跳转逻辑，JSON)
- `created_at`, `updated_at`

**question_options** - 选项表
- `id` (主键)
- `question_id` (题目ID，外键到 questions)
- `text` (选项文本)
- `order_index` (排序索引)
- `created_at`, `updated_at`

**responses** - 回复表
- `id` (主键)
- `survey_id` (问卷ID，外键到 surveys)
- `user_id` (用户ID，外键到 users，可为空)
- `device_id` (设备ID)
- `ip_address` (IP地址)
- `submitted_at` (提交时间)
- `created_at`, `updated_at`

**answers** - 答案表
- `id` (主键)
- `response_id` (回复ID，外键到 responses)
- `question_id` (题目ID，外键到 questions)
- `answer` (答案内容，JSON格式)
- `created_at`, `updated_at`

## 开发说明

### 后端开发

```bash
cd backend
npm run dev        # 启动开发服务器（自动重启）
npm run build      # 编译 TypeScript
npm start          # 启动生产服务器
```

### 前端开发

```bash
cd frontend
npm run dev        # 启动开发服务器
npm run build      # 构建生产版本
npm run preview    # 预览生产构建
```

## 项目级 Skills

本项目包含以下 Skills，可通过关键词触发：

### 1. dev-startup - 开发环境启动
- 触发关键词：启动开发环境、dev、启动项目、运行项目
- 功能：一键启动前后端开发服务器

### 2. db-migrate - 数据库迁移
- 触发关键词：数据库迁移、初始化数据库、创建表、db init、migrate
- 功能：创建数据库、同步表结构、初始化数据

### 3. deploy - 项目部署
- 触发关键词：部署、deploy、发布、上线、生产环境
- 功能：构建前后端、配置生产环境、部署到服务器

## 待实现功能

- [ ] 导出问卷数据（Excel/PDF）
- [ ] 问卷模板功能
- [ ] 问卷分享到社交媒体
- [ ] 实时通知新回复
- [ ] 问卷预览功能
- [ ] 题目拖拽排序
- [ ] 微信小程序适配
- [ ] 单元测试和集成测试
- [ ] 性能优化
- [ ] Docker 部署支持

## 许可证

MIT

## 联系方式

如有问题或建议，欢迎提交 Issue。
