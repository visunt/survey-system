import { Response, Request } from 'express';
import { SurveyTemplate } from '../models';
import { AuthRequest } from '../types';

// 预置模板数据
const SYSTEM_TEMPLATES = [
  {
    name: '员工满意度调查',
    description: '了解员工对工作环境、薪酬福利、管理风格等方面的满意度',
    category: 'employee',
    icon: 'User',
    isSystem: true,
    questions: [
      { title: '您对目前的工作环境满意吗？', type: 'rating', isRequired: true, orderIndex: 0 },
      { title: '您对薪酬福利满意吗？', type: 'rating', isRequired: true, orderIndex: 1 },
      { title: '您对直属上级的管理风格满意吗？', type: 'rating', isRequired: true, orderIndex: 2 },
      { title: '您对公司的发展前景有信心吗？', type: 'single_choice', isRequired: true, orderIndex: 3, options: ['非常有信心', '比较有信心', '一般', '不太有信心', '完全没有信心'] },
      { title: '您认为公司最需要改进的方面是？', type: 'multiple_choice', isRequired: false, orderIndex: 4, options: ['薪酬福利', '工作环境', '培训发展', '管理制度', '沟通机制', '其他'] },
      { title: '您对公司的其他建议？', type: 'textarea', isRequired: false, orderIndex: 5 },
    ],
  },
  {
    name: '客户满意度调查',
    description: '收集客户对产品/服务的反馈，提升客户体验',
    category: 'customer',
    icon: 'ChatDotRound',
    isSystem: true,
    questions: [
      { title: '您对我们的产品/服务整体满意度如何？', type: 'rating', isRequired: true, orderIndex: 0 },
      { title: '您最常使用我们的哪些产品/服务？', type: 'multiple_choice', isRequired: true, orderIndex: 1, options: ['产品A', '产品B', '产品C', '服务D'] },
      { title: '您是通过什么渠道了解我们的？', type: 'single_choice', isRequired: true, orderIndex: 2, options: ['朋友推荐', '搜索引擎', '社交媒体', '广告', '其他'] },
      { title: '您是否愿意向他人推荐我们的产品/服务？', type: 'single_choice', isRequired: true, orderIndex: 3, options: ['非常愿意', '比较愿意', '一般', '不太愿意', '完全不愿意'] },
      { title: '您希望我们改进哪些方面？', type: 'textarea', isRequired: false, orderIndex: 4 },
    ],
  },
  {
    name: '活动报名表',
    description: '收集活动参与者的基本信息和参与意向',
    category: 'event',
    icon: 'Calendar',
    isSystem: true,
    questions: [
      { title: '您的姓名', type: 'text', isRequired: true, orderIndex: 0 },
      { title: '您的手机号码', type: 'text', isRequired: true, orderIndex: 1 },
      { title: '您的邮箱', type: 'text', isRequired: false, orderIndex: 2 },
      { title: '您所在的公司/组织', type: 'text', isRequired: false, orderIndex: 3 },
      { title: '您的职位', type: 'text', isRequired: false, orderIndex: 4 },
      { title: '您是通过什么渠道了解到本次活动的？', type: 'single_choice', isRequired: true, orderIndex: 5, options: ['官网', '微信公众号', '朋友推荐', '邮件邀请', '其他'] },
      { title: '您是否有特殊饮食需求？', type: 'single_choice', isRequired: false, orderIndex: 6, options: ['无', '素食', '清真', '其他'] },
      { title: '其他备注', type: 'textarea', isRequired: false, orderIndex: 7 },
    ],
  },
  {
    name: '产品反馈表',
    description: '收集用户对产品的使用反馈和改进建议',
    category: 'product',
    icon: 'Box',
    isSystem: true,
    questions: [
      { title: '您使用我们产品的频率是？', type: 'single_choice', isRequired: true, orderIndex: 0, options: ['每天', '每周几次', '每月几次', '很少使用'] },
      { title: '您对产品整体满意度如何？', type: 'rating', isRequired: true, orderIndex: 1 },
      { title: '您最喜欢产品的哪个功能？', type: 'multiple_choice', isRequired: true, orderIndex: 2, options: ['功能A', '功能B', '功能C', '界面设计', '性能稳定', '其他'] },
      { title: '您在使用过程中遇到的最大问题是什么？', type: 'textarea', isRequired: true, orderIndex: 3 },
      { title: '您希望我们增加什么新功能？', type: 'textarea', isRequired: false, orderIndex: 4 },
      { title: '您是否愿意参与产品内测？', type: 'single_choice', isRequired: false, orderIndex: 5, options: ['愿意', '不愿意'] },
    ],
  },
  {
    name: '课程评价表',
    description: '收集学员对培训课程的评价和建议',
    category: 'education',
    icon: 'Reading',
    isSystem: true,
    questions: [
      { title: '您对本次课程的整体评价？', type: 'rating', isRequired: true, orderIndex: 0 },
      { title: '您对讲师的授课水平满意吗？', type: 'rating', isRequired: true, orderIndex: 1 },
      { title: '课程内容对您的工作有帮助吗？', type: 'single_choice', isRequired: true, orderIndex: 2, options: ['非常有帮助', '比较有帮助', '一般', '帮助不大', '完全没有帮助'] },
      { title: '您认为课程的难度如何？', type: 'single_choice', isRequired: true, orderIndex: 3, options: ['太难', '偏难', '适中', '偏简单', '太简单'] },
      { title: '您最喜欢的课程环节是？', type: 'multiple_choice', isRequired: false, orderIndex: 4, options: ['理论讲解', '案例分析', '小组讨论', '实操演练', '问答环节'] },
      { title: '您对课程的改进建议？', type: 'textarea', isRequired: false, orderIndex: 5 },
      { title: '您希望后续开设哪些主题的课程？', type: 'textarea', isRequired: false, orderIndex: 6 },
    ],
  },
];

// 初始化系统模板
export const initSystemTemplates = async () => {
  try {
    const count = await SurveyTemplate.count({ where: { isSystem: true } });
    if (count === 0) {
      for (const template of SYSTEM_TEMPLATES) {
        await SurveyTemplate.create({
          ...template,
          questions: template.questions.map(q => ({
            ...q,
            options: q.options?.map((text, idx) => ({ text, orderIndex: idx })),
          })),
          usageCount: 0,
        });
      }
      console.log('System templates initialized');
    }
  } catch (error) {
    console.error('Failed to initialize system templates:', error);
  }
};

// 获取模板列表
export const getTemplates = async (req: Request, res: Response) => {
  try {
    const { category } = req.query;
    const whereClause: any = {};
    
    if (category && category !== 'all') {
      whereClause.category = category;
    }

    const templates = await SurveyTemplate.findAll({
      where: whereClause,
      order: [['usageCount', 'DESC'], ['createdAt', 'DESC']],
      attributes: { exclude: ['questions'] },
    });

    res.json(templates);
  } catch (error) {
    console.error('Get templates error:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

// 获取模板详情
export const getTemplateById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const templateId = Array.isArray(id) ? parseInt(id[0]) : parseInt(id);
    const template = await SurveyTemplate.findByPk(templateId);

    if (!template) {
      return res.status(404).json({ error: 'Template not found' });
    }

    // 增加使用次数
    await template.increment('usageCount');

    res.json(template);
  } catch (error) {
    console.error('Get template error:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

// 获取模板分类
export const getTemplateCategories = async (req: Request, res: Response) => {
  try {
    const categories = [
      { value: 'all', label: '全部' },
      { value: 'employee', label: '员工管理' },
      { value: 'customer', label: '客户调研' },
      { value: 'event', label: '活动报名' },
      { value: 'product', label: '产品反馈' },
      { value: 'education', label: '教育培训' },
    ];
    res.json(categories);
  } catch (error) {
    console.error('Get categories error:', error);
    res.status(500).json({ error: 'Server error' });
  }
};
