---
name: "db-migrate"
description: "数据库迁移和初始化工具。创建数据库、同步表结构、初始化数据。触发关键词：数据库迁移、初始化数据库、创建表、db init、migrate。"
---

# 数据库迁移工具

管理问卷调查平台的数据库结构初始化和迁移。

## 工作流程

```
1. 检查数据库连接
   └── 读取 .env 配置

2. 创建数据库（如果不存在）
   └── CREATE DATABASE survey_platform

3. 同步表结构
   ├── users 表
   ├── surveys 表
   ├── questions 表
   ├── question_options 表
   ├── responses 表
   └── answers 表

4. 创建索引
   └── survey_device_unique 唯一索引
```

## 使用方式

### 初始化数据库

```bash
# 1. 创建 MariaDB 数据库
mysql -u root -p -e "CREATE DATABASE survey_platform CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;"

# 2. 配置环境变量
cd survey-platform/backend
cp .env.example .env
# 编辑 .env 文件，填入数据库密码

# 3. 启动后端（自动同步表结构）
npm run dev
```

### 数据库表结构

**users 表：**
```sql
CREATE TABLE users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  username VARCHAR(50) UNIQUE NOT NULL,
  email VARCHAR(100) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  role ENUM('admin', 'user') DEFAULT 'user',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);
```

**surveys 表：**
```sql
CREATE TABLE surveys (
  id INT AUTO_INCREMENT PRIMARY KEY,
  title VARCHAR(200) NOT NULL,
  description TEXT,
  status ENUM('draft', 'published', 'closed') DEFAULT 'draft',
  creator_id INT NOT NULL,
  start_date DATETIME,
  end_date DATETIME,
  allow_anonymous BOOLEAN DEFAULT FALSE,
  require_login BOOLEAN DEFAULT TRUE,
  limit_by_device BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (creator_id) REFERENCES users(id)
);
```

**questions 表：**
```sql
CREATE TABLE questions (
  id INT AUTO_INCREMENT PRIMARY KEY,
  survey_id INT NOT NULL,
  title VARCHAR(500) NOT NULL,
  type ENUM('single_choice', 'multiple_choice', 'text', 'textarea', 'rating', 'date', 'dropdown_single', 'dropdown_multiple', 'switch') NOT NULL,
  is_required BOOLEAN DEFAULT TRUE,
  order_index INT NOT NULL,
  skip_logic JSON,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (survey_id) REFERENCES surveys(id) ON DELETE CASCADE
);
```

**question_options 表：**
```sql
CREATE TABLE question_options (
  id INT AUTO_INCREMENT PRIMARY KEY,
  question_id INT NOT NULL,
  text VARCHAR(255) NOT NULL,
  order_index INT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (question_id) REFERENCES questions(id) ON DELETE CASCADE
);
```

**responses 表：**
```sql
CREATE TABLE responses (
  id INT AUTO_INCREMENT PRIMARY KEY,
  survey_id INT NOT NULL,
  user_id INT,
  device_id VARCHAR(100),
  ip_address VARCHAR(45),
  submitted_at DATETIME NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (survey_id) REFERENCES surveys(id),
  FOREIGN KEY (user_id) REFERENCES users(id),
  UNIQUE INDEX survey_device_unique (survey_id, device_id)
);
```

**answers 表：**
```sql
CREATE TABLE answers (
  id INT AUTO_INCREMENT PRIMARY KEY,
  response_id INT NOT NULL,
  question_id INT NOT NULL,
  answer TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (response_id) REFERENCES responses(id) ON DELETE CASCADE,
  FOREIGN KEY (question_id) REFERENCES questions(id)
);
```

## 触发关键词

- 数据库迁移
- 初始化数据库
- 创建表
- db init
- migrate
- 数据库初始化

## 注意事项

1. 确保 MariaDB 服务已启动
2. 确保有创建数据库的权限
3. 首次运行会自动创建所有表
4. 使用 Sequelize 的 `sync` 方法自动同步表结构
5. 生产环境建议使用数据库迁移工具（如 Umzug）

## 错误处理

| 错误场景 | 处理方式 |
|----------|----------|
| 连接失败 | 检查数据库服务和配置 |
| 权限不足 | 使用 root 用户或授予相应权限 |
| 表已存在 | Sequelize 会跳过创建 |
| 字符集问题 | 确保使用 utf8mb4 |
