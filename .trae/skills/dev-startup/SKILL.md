---
name: "dev-startup"
description: "快速启动问卷调查平台的开发环境。自动启动后端和前端开发服务器。触发关键词：启动开发环境、dev、启动项目、运行项目。"
---

# 开发环境快速启动

一键启动问卷调查平台的前后端开发服务器。

## 工作流程

```
1. 检查后端依赖
   ├── 未安装 → 运行 npm install
   └── 已安装 → 跳过

2. 检查前端依赖
   ├── 未安装 → 运行 npm install
   └── 已安装 → 跳过

3. 启动后端开发服务器（端口 3001）
   └── 使用 nodemon 监听文件变化

4. 启动前端开发服务器（端口 5173）
   └── 使用 Vite 热重载
```

## 使用方式

### 方式一：同时启动前后端

```bash
# 在项目根目录执行
cd survey-platform/backend && npm run dev &
cd survey-platform/frontend && npm run dev
```

### 方式二：分别启动

**启动后端：**
```bash
cd survey-platform/backend
npm run dev
```

**启动前端：**
```bash
cd survey-platform/frontend
npm run dev
```

## 访问地址

- 前端：http://localhost:5173
- 后端 API：http://localhost:3001/api

## 前置要求

- Node.js >= 18
- MariaDB >= 10.5
- 已配置 `.env` 文件

## 触发关键词

- 启动开发环境
- dev
- 启动项目
- 运行项目
- 启动 survey-platform

## 注意事项

1. 确保数据库服务已启动
2. 确保 `.env` 文件配置正确
3. 首次运行会自动安装依赖
4. 后端使用 nodemon，代码修改自动重启
5. 前端使用 Vite，代码修改热重载

## 错误处理

| 错误场景 | 处理方式 |
|----------|----------|
| 端口被占用 | 检查并关闭占用端口的进程 |
| 数据库连接失败 | 检查 MariaDB 服务和配置 |
| 依赖安装失败 | 删除 node_modules 重新安装 |
