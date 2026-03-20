---
name: engineer-dev
description: 'Engineer 开发规范。触发词：开发、代码实现、coding、实现'
metadata:
  openclaw:
    emoji: 🛠️
    role: Engineer
---

# Engineer 开发规范

## 开发前准备

### 1. 环境检查
```bash
# 检查前端依赖
cd frontend && npm install

# 检查后端依赖
cd backend && npm install

# 启动开发服务器
cd backend && npm run dev  # 端口 3001
cd frontend && npm run dev # 端口 5173
```

### 2. 代码规范
- TypeScript 严格模式
- Vue3 Composition API
- 使用 `<script setup>` 语法
- 组件命名：PascalCase
- 文件命名：kebab-case

## 开发流程

### 1. 收到需求
```
✅ 先回复确认："收到，正在开发 [功能名称]..."
```

### 2. 开发中
- 定期汇报进度（复杂功能）
- 遇到问题及时反馈

### 3. 开发完成
```
✅ 汇报："Engineer 完成：[功能名称] 已实现"
```

## 技术栈速查

### 前端 (Vue3)
```typescript
// 路由
import { useRouter, useRoute } from 'vue-router'

// 状态管理
import { useXxxStore } from '@/stores/xxx'

// API 调用
import { xxxAPI } from '@/api/xxx'

// Element Plus
import { ElMessage, ElMessageBox } from 'element-plus'
import { IconName } from '@element-plus/icons-vue'
```

### 后端 (Express)
```typescript
// 路由
router.get('/xxx', controller.xxx)

// 控制器
export const xxx = async (req: Request, res: Response) => {
  // ...
}

// 模型
import { User, Survey, Question, Response, Answer } from '../models'
```

## 常用命令

```bash
# 前端
npm run dev      # 开发
npm run build    # 构建

# 后端
npm run dev      # 开发（热重载）
npm run build    # 编译 TypeScript
npm start        # 生产模式

# Git
git add .
git commit -m "feat: xxx"
git push
```

## Survey Platform 开发约定

### 前端目录结构
```
frontend/src/
├── api/        # API 封装
├── components/ # 公共组件
├── views/      # 页面组件
├── stores/     # Pinia 状态
├── router/     # 路由配置
└── utils/      # 工具函数
```

### 后端目录结构
```
backend/src/
├── config/       # 配置
├── controllers/  # 控制器
├── middleware/   # 中间件
├── models/       # 数据模型
├── routes/       # 路由
├── types/        # 类型定义
└── utils/        # 工具函数
```

### 数据库模型
- **User**: 用户
- **Survey**: 问卷
- **Question**: 题目
- **QuestionOption**: 选项
- **Response**: 回复
- **Answer**: 答案

## 已实现功能参考

| 功能 | 文件 | 关键技术 |
|------|------|----------|
| 问卷预览 | `SurveyPreview.vue` | 组件封装 |
| 分享链接+二维码 | `SurveyDetail.vue` | qrcode 库 |
