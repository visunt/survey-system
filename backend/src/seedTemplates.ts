import { SurveyTemplate, User } from './models';
import sequelize from './config/database';

// 预设系统模板数据
const systemTemplates = [
  {
    id: 'sys-satisf-001',
    title: '满意度调查模板',
    description: '通用的满意度调查问卷模板，包含服务、产品质量、整体评价等维度',
    category: 'satisfaction' as const,
    isSystem: true,
    usageCount: 0,
    questions: [
      {
        title: '您对本次服务的整体满意度如何？',
        type: 'rating' as const,
        isRequired: true,
        orderIndex: 0,
      },
      {
        title: '您对我们的产品质量是否满意？',
        type: 'rating' as const,
        isRequired: true,
        orderIndex: 1,
      },
      {
        title: '您最喜欢我们的哪个方面？',
        type: 'single_choice' as const,
        isRequired: true,
        orderIndex: 2,
        options: [
          { text: '产品质量', orderIndex: 0 },
          { text: '服务态度', orderIndex: 1 },
          { text: '响应速度', orderIndex: 2 },
          { text: '性价比', orderIndex: 3 },
          { text: '其他', orderIndex: 4 },
        ],
      },
      {
        title: '您觉得我们需要改进的地方是？',
        type: 'textarea' as const,
        isRequired: false,
        orderIndex: 3,
      },
      {
        title: '您是否愿意向朋友推荐我们？',
        type: 'switch' as const,
        isRequired: true,
        orderIndex: 4,
      },
    ],
  },
  {
    id: 'sys-event-001',
    title: '活动报名表模板',
    description: '通用的活动报名表单模板，包含基本信息、联系方式、饮食偏好等',
    category: 'event' as const,
    isSystem: true,
    usageCount: 0,
    questions: [
      {
        title: '姓名',
        type: 'text' as const,
        isRequired: true,
        orderIndex: 0,
      },
      {
        title: '手机号码',
        type: 'text' as const,
        isRequired: true,
        orderIndex: 1,
      },
      {
        title: '电子邮箱',
        type: 'text' as const,
        isRequired: true,
        orderIndex: 2,
      },
      {
        title: '公司/学校',
        type: 'text' as const,
        isRequired: false,
        orderIndex: 3,
      },
      {
        title: '职位',
        type: 'text' as const,
        isRequired: false,
        orderIndex: 4,
      },
      {
        title: '您如何得知本次活动？',
        type: 'single_choice' as const,
        isRequired: true,
        orderIndex: 5,
        options: [
          { text: '同事/朋友推荐', orderIndex: 0 },
          { text: '社交媒体', orderIndex: 1 },
          { text: '官网/公众号', orderIndex: 2 },
          { text: '邮件邀请', orderIndex: 3 },
          { text: '其他渠道', orderIndex: 4 },
        ],
      },
      {
        title: '您是否有饮食偏好或过敏源？',
        type: 'textarea' as const,
        isRequired: false,
        orderIndex: 6,
      },
      {
        title: '是否需要停车券？',
        type: 'switch' as const,
        isRequired: true,
        orderIndex: 7,
      },
    ],
  },
  {
    id: 'sys-feedb-001',
    title: '产品反馈表模板',
    description: '产品反馈收集模板，帮助收集用户对产品的意见和建议',
    category: 'feedback' as const,
    isSystem: true,
    usageCount: 0,
    questions: [
      {
        title: '您使用我们产品的频率是？',
        type: 'dropdown_single' as const,
        isRequired: true,
        orderIndex: 0,
        options: [
          { text: '每天', orderIndex: 0 },
          { text: '每周几次', orderIndex: 1 },
          { text: '每月几次', orderIndex: 2 },
          { text: '偶尔使用', orderIndex: 3 },
          { text: '已经很少使用了', orderIndex: 4 },
        ],
      },
      {
        title: '您最喜欢产品的哪个功能？',
        type: 'multiple_choice' as const,
        isRequired: true,
        orderIndex: 1,
        options: [
          { text: '界面设计', orderIndex: 0 },
          { text: '功能完整性', orderIndex: 1 },
          { text: '操作便捷性', orderIndex: 2 },
          { text: '性能表现', orderIndex: 3 },
          { text: '客户服务', orderIndex: 4 },
        ],
      },
      {
        title: '您希望产品改进的地方是？',
        type: 'multiple_choice' as const,
        isRequired: false,
        orderIndex: 2,
        options: [
          { text: '增加新功能', orderIndex: 0 },
          { text: '优化现有功能', orderIndex: 1 },
          { text: '提升性能', orderIndex: 2 },
          { text: '改进界面设计', orderIndex: 3 },
          { text: '完善文档帮助', orderIndex: 4 },
        ],
      },
      {
        title: '您会给这个产品打几分？（1-10分）',
        type: 'rating' as const,
        isRequired: true,
        orderIndex: 3,
      },
      {
        title: '请描述您遇到的问题或建议',
        type: 'textarea' as const,
        isRequired: false,
        orderIndex: 4,
      },
    ],
  },
  {
    id: 'sys-resch-001',
    title: '用户调研问卷模板',
    description: '通用的用户调研问卷，包含用户画像、使用习惯、需求调研等',
    category: 'research' as const,
    isSystem: true,
    usageCount: 0,
    questions: [
      {
        title: '您的年龄段是？',
        type: 'single_choice' as const,
        isRequired: true,
        orderIndex: 0,
        options: [
          { text: '18岁以下', orderIndex: 0 },
          { text: '18-25岁', orderIndex: 1 },
          { text: '26-35岁', orderIndex: 2 },
          { text: '36-45岁', orderIndex: 3 },
          { text: '46-55岁', orderIndex: 4 },
          { text: '55岁以上', orderIndex: 5 },
        ],
      },
      {
        title: '您的职业是？',
        type: 'dropdown_single' as const,
        isRequired: true,
        orderIndex: 1,
        options: [
          { text: '学生', orderIndex: 0 },
          { text: '企业职员', orderIndex: 1 },
          { text: '自由职业者', orderIndex: 2 },
          { text: '公务员/事业单位', orderIndex: 3 },
          { text: '个体经营者', orderIndex: 4 },
          { text: '其他', orderIndex: 5 },
        ],
      },
      {
        title: '您使用类似产品的目的是？',
        type: 'multiple_choice' as const,
        isRequired: true,
        orderIndex: 2,
        options: [
          { text: '工作需要', orderIndex: 0 },
          { text: '学习提升', orderIndex: 1 },
          { text: '娱乐休闲', orderIndex: 2 },
          { text: '社交互动', orderIndex: 3 },
          { text: '其他', orderIndex: 4 },
        ],
      },
      {
        title: '您在什么时间使用此类产品最多？',
        type: 'single_choice' as const,
        isRequired: false,
        orderIndex: 3,
        options: [
          { text: '工作日白天', orderIndex: 0 },
          { text: '工作日晚上', orderIndex: 1 },
          { text: '周末白天', orderIndex: 2 },
          { text: '周末晚上', orderIndex: 3 },
          { text: '随时随地', orderIndex: 4 },
        ],
      },
      {
        title: '您对产品最看重的特性是？',
        type: 'textarea' as const,
        isRequired: false,
        orderIndex: 4,
      },
    ],
  },
];

// 初始化系统模板
export async function seedSystemTemplates() {
  try {
    // 查找或创建系统用户（用于系统模板的 creatorId）
    let systemUser = await User.findOne({
      where: { username: 'system' },
    });

    if (!systemUser) {
      systemUser = await User.create({
        username: 'system',
        email: 'system@survey.local',
        password: 'system_password_hash', // 这个密码不会被使用
        role: 'admin',
      });
      console.log('System user created');
    }

    // 检查模板是否已存在
    const existingTemplateIds = (await SurveyTemplate.findAll({
      where: { isSystem: true },
      attributes: ['id'],
    })).map(t => t.id);

    // 插入不存在的系统模板
    for (const template of systemTemplates) {
      if (!existingTemplateIds.includes(template.id)) {
        await SurveyTemplate.create({
          ...template,
          creatorId: systemUser!.id,
        });
        console.log(`System template created: ${template.title}`);
      }
    }

    console.log('System templates seeding completed');
  } catch (error) {
    console.error('Error seeding system templates:', error);
  }
}
