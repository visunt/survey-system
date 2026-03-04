# 问卷调查平台

一个功能完整的问卷调查系统，类似于问卷星，使用 Vue3 + Node.js + MySQL 开发。

## 技术栈

### 前端
- Vue 3 + TypeScript
- Vite
- Element Plus
- Pinia (状态管理)
- Vue Router (路由)
- Axios (HTTP客户端)

### 后端
- Node.js + Express
- TypeScript
- Sequelize (ORM)
- MySQL (数据库)
- JWT (认证)
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

### 题题类型
- 单选题
- 多选题
- 文本题
- 文本域
- 评分题
- 日期题

### 问卷设置
- 匿名填写
- 需要登录填写
- 必填/选填设置

### 数据收集
- 问卷填写界面
- 选项验证
- 提交答案

### 数据统计
- 回复总数统计
- 题目回复统计
- 选项分布统计
- 评分平均分
- 文本答案列表

## 项目结构

```
survey-platform/
├── frontend/                 # 前端项目
│   ├── src/
│   │   ├── api/            # API 接口
│   │   ├── components/      # 公共组件
│   │   ├── router/         # 路由配置
│   │   ├── stores/         # 状态管理
│   │   ├── utils/          # 工具函数
│   │   └── views/         # 页面组件
│   ├── package.json
│   └── vite.config.ts
└── backend/                  # 后端项目
    ├── src/
    │   ├── config/         # 配置文件
    │   ├── controllers/    # 控制器
    │   ├── middleware/     # 中间件
    │   ├── models/         # 数据模型
    │   ├── routes/         # 路由
    │   ├── types/          # TypeScript 类型
    │   ├── utils/          # 工具函数
    │   └── index.ts        # 入口文件
    ├── package.json
    └── tsconfig.json
```

## 数据库设计

### 表结构

1. **users** - 用户表
   - id, username, email, password, role

2. **surveys** - 问卷表
   - id, title, description, status, creatorId, startDate, endDate, allowAnonymous, requireLogin

3. **questions** - 题目表
   - id, surveyId, title, type, isRequired, orderIndex

4. **question_options** - 选项表
   - id, questionId, text, orderIndex

5. **responses** - 回复表
   - id, surveyId, userId, ipAddress, submittedAt

6. **answers** - 答案表
   - id, responseId, questionId, answer

## 快速开始

### 前置要求
- Node.js >= 18
- MySQL >= 5.7

### 1. 安装依赖

```bash
# 安装后端依赖
cd backend
npm install

# 安装前端依赖
cd ../frontend
npm install
```

### 2. 配置数据库

创建 MySQL 数据库：

```sql
CREATE DATABASE survey_platform CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

配置后端环境变量：

```bash
cd backend
cp .env.example .env
# 编辑 .env 文件，配置数据库连接信息
```

### 3. 启动后端

```bash
cd backend
npm run dev
```

后端将运行在 http://localhost:3001

### 4. 启动前端

```bash
cd frontend
cp .env.example .env
npm run dev
```

前端将运行在 http://localhost:5173

## API 接口

### 认证接口
- POST /api/auth/register - 用户注册
- POST /api/auth/login - 用户登录
- GET /api/auth/profile - 获取用户信息

### 问卷接口
- GET /api/surveys - 获取问卷列表
- GET /api/surveys/:id - 获取问卷详情
- POST /api/surveys - 创建问卷
- PUT /api/surveys/:id - 更新问卷
- DELETE /api/surveys/:id - 删除问卷
- PATCH /api/surveys/:id/publish - 发布问卷

### 回复接口
- POST /api/surveys/:surveyId/responses - 提交问卷
- GET /api/surveys/:surveyId/responses - 获取问卷回复
- GET /api/surveys/:surveyId/statistics - 获取问卷统计

## 开发计划

- [x] 项目初始化
- [x] 数据库设计
- [x] 用户认证系统
- [x] 问卷管理功能
- [x] 问卷填写功能
- [x] 数据统计功能
- [ ] 导出问卷数据（Excel/PDF）
- [ ] 问卷模板
- [ ] 问卷分享功能
- [ ] 实时通知
- [ ] 移动端适配
- [ ] 单元测试

## 许可证

MIT
