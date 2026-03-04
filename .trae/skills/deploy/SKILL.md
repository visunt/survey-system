---
name: "deploy"
description: "项目部署工具。构建前后端、配置生产环境、部署到服务器。触发关键词：部署、deploy、发布、上线、生产环境。"
---

# 项目部署工具

将问卷调查平台部署到生产环境。

## 工作流程

```
1. 构建后端
   ├── 编译 TypeScript
   └── 生成 dist 目录

2. 构建前端
   ├── Vite 打包
   └── 生成 dist 目录

3. 配置生产环境
   ├── 设置环境变量
   └── 配置 Nginx

4. 部署到服务器
   ├── 上传文件
   └── 重启服务
```

## 使用方式

### 方式一：手动部署

**1. 构建后端：**
```bash
cd survey-platform/backend
npm run build
```

**2. 构建前端：**
```bash
cd survey-platform/frontend
npm run build
```

**3. 配置生产环境变量：**

后端 `.env`：
```env
PORT=3001
NODE_ENV=production

DB_HOST=your_db_host
DB_PORT=3306
DB_NAME=survey_platform
DB_USER=your_db_user
DB_PASSWORD=your_db_password

JWT_SECRET=your_production_jwt_secret
JWT_EXPIRES_IN=7d

CORS_ORIGIN=https://your-domain.com
```

**4. 启动生产服务：**
```bash
cd survey-platform/backend
npm start
```

**5. 配置 Nginx：**
```nginx
server {
    listen 80;
    server_name your-domain.com;

    # 前端静态文件
    location / {
        root /path/to/survey-platform/frontend/dist;
        try_files $uri $uri/ /index.html;
    }

    # 后端 API
    location /api {
        proxy_pass http://localhost:3001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

### 方式二：使用 PM2 部署

**1. 安装 PM2：**
```bash
npm install -g pm2
```

**2. 创建 PM2 配置文件：**
```javascript
// ecosystem.config.js
module.exports = {
  apps: [{
    name: 'survey-platform-backend',
    cwd: './backend',
    script: 'dist/index.js',
    instances: 'max',
    exec_mode: 'cluster',
    env_production: {
      NODE_ENV: 'production',
      PORT: 3001
    }
  }]
};
```

**3. 启动服务：**
```bash
pm2 start ecosystem.config.js --env production
pm2 save
pm2 startup
```

### 方式三：Docker 部署

**1. 创建 Dockerfile（后端）：**
```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY dist ./dist
EXPOSE 3001
CMD ["node", "dist/index.js"]
```

**2. 创建 Dockerfile（前端）：**
```dockerfile
FROM nginx:alpine
COPY dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

**3. 使用 Docker Compose：**
```yaml
version: '3.8'
services:
  backend:
    build: ./backend
    ports:
      - "3001:3001"
    environment:
      - NODE_ENV=production
    depends_on:
      - db

  frontend:
    build: ./frontend
    ports:
      - "80:80"
    depends_on:
      - backend

  db:
    image: mariadb:10.5
    environment:
      - MYSQL_ROOT_PASSWORD=root_password
      - MYSQL_DATABASE=survey_platform
    volumes:
      - db_data:/var/lib/mysql

volumes:
  db_data:
```

**4. 启动服务：**
```bash
docker-compose up -d
```

## 触发关键词

- 部署
- deploy
- 发布
- 上线
- 生产环境

## 部署检查清单

- [ ] 数据库已创建并配置
- [ ] 环境变量已配置
- [ ] 后端已构建
- [ ] 前端已构建
- [ ] Nginx 已配置
- [ ] SSL 证书已配置（推荐）
- [ ] 防火墙已配置
- [ ] 日志目录已创建
- [ ] 备份策略已制定

## 注意事项

1. 生产环境必须修改 JWT_SECRET
2. 建议使用 HTTPS
3. 配置数据库定期备份
4. 监控服务器资源使用
5. 配置日志轮转
6. 使用环境变量管理敏感信息

## 错误处理

| 错误场景 | 处理方式 |
|----------|----------|
| 构建失败 | 检查依赖和代码错误 |
| 数据库连接失败 | 检查数据库配置和网络 |
| 端口被占用 | 修改端口或关闭占用进程 |
| 权限不足 | 检查文件和目录权限 |
