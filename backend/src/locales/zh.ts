export const zh = {
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

  // 认证
  auth: {
    loginSuccess: '登录成功',
    loginFailed: '用户名或密码错误',
    logoutSuccess: '退出成功',
    registerSuccess: '注册成功',
    registerFailed: '注册失败',
    tokenExpired: '登录已过期，请重新登录',
    unauthorized: '未授权',
    forbidden: '无权限访问',
  },

  // 用户
  user: {
    username: '用户名',
    password: '密码',
    role: '角色',
    admin: '管理员',
    user: '普通用户',
    notFound: '用户不存在',
    alreadyExists: '用户已存在',
    usernameRequired: '请输入用户名',
    passwordRequired: '请输入密码',
    passwordMinLength: '密码至少6位',
  },

  // 问卷
  survey: {
    title: '问卷标题',
    description: '问卷描述',
    status: '状态',
    statusDraft: '草稿',
    statusPublished: '已发布',
    statusClosed: '已关闭',
    createdAt: '创建时间',
    updatedAt: '更新时间',
    createdBy: '创建者',
    questionsCount: '题目数量',
    responsesCount: '回答数量',
    notFound: '问卷不存在',
    createSuccess: '问卷创建成功',
    updateSuccess: '问卷更新成功',
    deleteSuccess: '问卷删除成功',
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
    order: '排序',
    minRating: '最低分',
    maxRating: '最高分',
    description: '题目描述',
    addSuccess: '题目添加成功',
    updateSuccess: '题目更新成功',
    deleteSuccess: '题目删除成功',
    titleRequired: '请输入题目内容',
    addOption: '添加选项',
    minOptions: '请至少添加两个选项',
  },

  // 回答
  response: {
    submittedAt: '提交时间',
    answers: '答案',
    submitSuccess: '提交成功',
    submitFailed: '提交失败',
    allRequired: '请填写所有必填项',
    notFound: '回答不存在',
    exportSuccess: '导出成功',
    exportFailed: '导出失败',
  },

  // 统计
  stats: {
    totalResponses: '总回答数',
    questionStats: '题目统计',
    optionCount: '选项数量',
  },

  // 验证
  validation: {
    required: '此字段为必填项',
    invalidFormat: '格式不正确',
    minLength: '长度不能小于 {min} 个字符',
    maxLength: '长度不能大于 {max} 个字符',
    between: '值必须在 {min} 和 {max} 之间',
  },

  // HTTP 状态
  http: {
    badRequest: '请求参数错误',
    unauthorized: '未授权，请登录',
    forbidden: '无权限访问',
    notFound: '资源不存在',
    internalError: '服务器内部错误',
    serviceUnavailable: '服务暂不可用',
  },
};
