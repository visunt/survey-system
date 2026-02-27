export default {
  // 通用
  common: {
    success: '成功',
    error: '错误',
    warning: '警告',
    info: '信息',
    confirm: '确认',
    cancel: '取消',
    save: '保存',
    delete: '删除',
    edit: '编辑',
    create: '创建',
    update: '更新',
    search: '搜索',
    loading: '加载中...',
    noData: '暂无数据',
    operations: {
      success: '操作成功',
      failed: '操作失败',
      created: '创建成功',
      updated: '更新成功',
      deleted: '删除成功',
    },
  },

  // 导航
  nav: {
    dashboard: '仪表盘',
    surveys: '问卷管理',
    responses: '答卷管理',
    settings: '设置',
    logout: '退出登录',
  },

  // 认证
  auth: {
    title: '问卷系统',
    login: '登录',
    loginSuccess: '登录成功',
    loginFailed: '用户名或密码错误',
    logout: '退出',
    logoutSuccess: '退出成功',
    username: '用户名',
    password: '密码',
    rememberMe: '记住我',
    loginBtn: '登录',
    usernameRequired: '请输入用户名',
    passwordRequired: '请输入密码',
  },

  // 问卷
  survey: {
    title: '问卷',
    list: '问卷列表',
    create: '创建问卷',
    edit: '编辑问卷',
    delete: '删除问卷',
    title: '问卷标题',
    description: '问卷描述',
    status: '状态',
    statusDraft: '草稿',
    statusPublished: '已发布',
    statusClosed: '已关闭',
    createdAt: '创建时间',
    updatedAt: '更新时间',
    actions: '操作',
    view: '查看',
    addQuestion: '添加题目',
    question: '题目',
    questions: '题目',
    createSuccess: '问卷创建成功',
    updateSuccess: '问卷更新成功',
    deleteSuccess: '问卷删除成功',
    deleteConfirm: '确定要删除这个问卷吗？',
    titleRequired: '请输入问卷标题',
  },

  // 题目
  question: {
    title: '题目',
    type: '题目类型',
    typeSingle: '单选题',
    typeMultiple: '多选题',
    typeText: '填空题',
    typeRating: '评分题',
    options: '选项',
    required: '必填',
    add: '添加题目',
    edit: '编辑题目',
    delete: '删除题目',
    content: '题目内容',
    description: '题目描述',
    addOption: '添加选项',
    addSuccess: '题目添加成功',
    updateSuccess: '题目更新成功',
    deleteSuccess: '题目删除成功',
    contentRequired: '请输入题目内容',
    minOptions: '请至少添加两个选项',
    deleteConfirm: '确定要删除这个题目吗？',
  },

  // 答卷
  response: {
    title: '答卷',
    list: '答卷列表',
    view: '查看答卷',
    export: '导出',
    exportExcel: '导出 Excel',
    exportCsv: '导出 CSV',
    stats: '统计分析',
    submittedAt: '提交时间',
    actions: '操作',
    total: '答卷数',
    notFound: '答卷不存在',
    exportSuccess: '导出成功',
    exportFailed: '导出失败',
  },

  // 统计
  stats: {
    title: '统计分析',
    totalResponses: '总回答数',
    questionStats: '题目统计',
    answerCount: '回答数',
    percent: '占比',
  },

  // 验证
  validation: {
    required: '此字段为必填项',
    usernameRequired: '请输入用户名',
    passwordRequired: '请输入密码',
  },

  // Element Plus 翻译
  el: {
    selectPlaceholder: '请选择',
    inputPlaceholder: '请输入',
  },
};
