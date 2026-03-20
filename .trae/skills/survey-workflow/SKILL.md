---
name: survey-workflow
description: '问卷调查平台项目工作流程。触发词：需求、workflow、工作流程、开发流程'
metadata:
  openclaw:
    emoji: 📋
    project: survey-platform
---

# Survey Platform 工作流程

## 项目信息
- **路径**: `/Users/pengjie/Documents/work/wn/project/youhua/survey-platform`
- **技术栈**: Vue3 + TypeScript + Vite (前端) | Node.js + Express + TypeScript + MariaDB (后端)
- **UI框架**: Element Plus

## 角色分工

### PM (产品经理)
- 分析待实现功能列表，确定需求优先级
- 输出产品设计文档（功能描述、交互设计、技术方案）
- 验收测试

### Engineer (程序员)
- 根据 PM 设计进行开发
- 代码实现、测试
- 提交代码

## 标准工作流程

```
1. PM 分析需求 → 输出产品设计
2. PM 通知 Engineer 开始开发
3. Engineer 开发完成 → 通知 PM 验收
4. PM 验收通过 → 提交 GitHub
5. 进入下一个需求
```

## ⚠️ 重要规则

### 响应确认
- **开发/设计前必须先回复确认收到消息**
- 长时间操作时定期汇报进度
- 避免用户误以为无响应

### 沟通规范
- 每次收到需求先回复："收到，正在[PM分析/开发]中..."
- 完成后汇报："[PM/Engineer] 完成：xxx"
- 遇到问题及时反馈

## 已完成需求

| 序号 | 功能 | 状态 |
|------|------|------|
| 1 | 问卷预览功能 | ✅ 已完成 |
| 2 | 分享链接+二维码 | ✅ 已完成（未提交） |
| 3 | 题目拖拽排序 | 🔄 进行中 |

## 待实现功能

- [ ] 导出问卷数据（Excel/PDF）
- [ ] 问卷模板功能
- [ ] 问卷分享到社交媒体
- [ ] 实时通知新回复
- [x] 问卷预览功能
- [ ] **题目拖拽排序** ← 当前需求
- [ ] 微信小程序适配
- [ ] 单元测试和集成测试
- [ ] 性能优化
- [ ] Docker 部署支持

## Git 提交规范

```
feat: 新功能
fix: 修复bug
docs: 文档更新
style: 代码格式
refactor: 重构
test: 测试
chore: 构建/工具
```
