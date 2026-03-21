<template>
  <div class="template-library">
    <el-page-header @back="goBack" class="page-header">
      <template #content>
        <h2>问卷模板库</h2>
      </template>
    </el-page-header>

    <!-- 筛选器 -->
    <el-card class="filter-card">
      <el-row :gutter="20" class="filter-row">
        <el-col :xs="24" :sm="12" :md="6">
          <el-select
            v-model="selectedType"
            placeholder="模板类型"
            @change="loadTemplates"
            class="filter-select"
          >
            <el-option label="全部模板" value="all" />
            <el-option label="系统模板" value="system" />
            <el-option label="我的模板" value="my" />
          </el-select>
        </el-col>
        <el-col :xs="24" :sm="12" :md="6">
          <el-select
            v-model="selectedCategory"
            placeholder="分类筛选"
            @change="loadTemplates"
            class="filter-select"
            clearable
          >
            <el-option label="满意度调查" value="satisfaction" />
            <el-option label="活动报名" value="event" />
            <el-option label="产品反馈" value="feedback" />
            <el-option label="调研问卷" value="research" />
            <el-option label="其他" value="other" />
          </el-select>
        </el-col>
        <el-col :xs="24" :sm="24" :md="12" class="action-col">
          <el-button type="primary" :icon="Plus" @click="createFromScratch">
            从空白创建
          </el-button>
        </el-col>
      </el-row>
    </el-card>

    <!-- 模板列表 -->
    <div class="template-list">
      <el-empty v-if="!loading && templates.length === 0" description="暂无模板" />

      <el-row v-else :gutter="20">
        <el-col
          v-for="template in templates"
          :key="template.id"
          :xs="24"
          :sm="12"
          :md="8"
          :lg="6"
        >
          <el-card class="template-card" shadow="hover">
            <div class="template-header">
              <el-tag v-if="template.isSystem" type="success" size="small">系统</el-tag>
              <el-tag v-else type="info" size="small">个人</el-tag>
              <span class="template-category">{{ getCategoryText(template.category) }}</span>
            </div>

            <h3 class="template-title" :title="template.title">{{ template.title }}</h3>
            <p class="template-description" :title="template.description">
              {{ template.description || '暂无描述' }}
            </p>

            <div class="template-info">
              <div class="info-item">
                <el-icon><List /></el-icon>
                <span>{{ template.questionCount }} 道题</span>
              </div>
              <div class="info-item">
                <el-icon><DataAnalysis /></el-icon>
                <span>{{ template.usageCount }} 次使用</span>
              </div>
            </div>

            <div class="template-footer">
              <el-button type="primary" size="small" @click="useTemplate(template)">
                使用模板
              </el-button>
              <el-button size="small" @click="previewTemplate(template)">
                预览
              </el-button>
              <el-dropdown
                v-if="!template.isSystem"
                class="template-dropdown"
                trigger="click"
                @command="(cmd: string) => handleCommand(cmd, template)"
              >
                <el-button type="info" size="small" :icon="More" circle />
                <template #dropdown>
                  <el-dropdown-menu>
                    <el-dropdown-item command="edit">编辑</el-dropdown-item>
                    <el-dropdown-item command="delete" style="color: #f56c6c">删除</el-dropdown-item>
                  </el-dropdown-menu>
                </template>
              </el-dropdown>
            </div>
          </el-card>
        </el-col>
      </el-row>
    </div>

    <!-- 预览弹窗 -->
    <SurveyPreview v-model="showPreview" :survey-data="previewData" />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { ElMessage, ElMessageBox } from 'element-plus';
import { Plus, List, DataAnalysis, More } from '@element-plus/icons-vue';
import { templateAPI, type Template } from '../api/template';
import { surveyAPI } from '../api/survey';
import SurveyPreview from '../components/SurveyPreview.vue';

const router = useRouter();

const loading = ref(false);
const templates = ref<Template[]>([]);
const selectedType = ref<string>('all');
const selectedCategory = ref<string>();
const showPreview = ref(false);
const previewData = ref<Partial<Template> | null>(null);

const goBack = () => {
  router.back();
};

const getCategoryText = (category: string) => {
  const texts: Record<string, string> = {
    satisfaction: '满意度调查',
    event: '活动报名',
    feedback: '产品反馈',
    research: '调研问卷',
    other: '其他',
  };
  return texts[category] || category;
};

const loadTemplates = async () => {
  try {
    loading.value = true;
    const params: any = { type: selectedType.value };
    if (selectedCategory.value) {
      params.category = selectedCategory.value;
    }
    const response = await templateAPI.getTemplates(params);
    templates.value = response.data;
  } catch (error: any) {
    console.error('Failed to load templates:', error);
    ElMessage.error('加载模板失败');
  } finally {
    loading.value = false;
  }
};

const createFromScratch = () => {
  router.push('/create-survey');
};

const useTemplate = async (template: Template) => {
  try {
    loading.value = true;
    const response = await templateAPI.createSurveyFromTemplate(template.id!);
    const surveyId = response.data.id;
    ElMessage.success('问卷创建成功');
    router.push(`/edit-survey/${surveyId}`);
  } catch (error: any) {
    console.error('Failed to create survey from template:', error);
    ElMessage.error(error.response?.data?.error || '创建问卷失败');
  } finally {
    loading.value = false;
  }
};

const previewTemplate = (template: Template) => {
  // 深拷贝模板数据用于预览
  const previewSurvey = JSON.parse(JSON.stringify(template));
  previewData.value = {
    title: previewSurvey.title,
    description: previewSurvey.description,
    questions: previewSurvey.questions,
  };
  showPreview.value = true;
};

const handleCommand = async (command: string, template: Template) => {
  if (command === 'edit') {
    // 编辑模板（暂未实现）
    ElMessage.info('编辑功能开发中');
  } else if (command === 'delete') {
    try {
      await ElMessageBox.confirm(
        '确定要删除这个模板吗？',
        '确认删除',
        {
          confirmButtonText: '删除',
          cancelButtonText: '取消',
          type: 'warning',
        }
      );
      await templateAPI.deleteTemplate(template.id!);
      ElMessage.success('删除成功');
      loadTemplates();
    } catch (error: any) {
      if (error !== 'cancel') {
        console.error('Failed to delete template:', error);
        ElMessage.error('删除失败');
      }
    }
  }
};

onMounted(() => {
  loadTemplates();
});
</script>

<style scoped>
.template-library {
  padding: 20px 0;
  max-width: 1400px;
  margin: 0 auto;
}

.page-header {
  margin-bottom: 20px;
}

.page-header h2 {
  margin: 0;
}

.filter-card {
  margin-bottom: 20px;
}

.filter-row {
  align-items: center;
}

.filter-select {
  width: 100%;
}

.action-col {
  text-align: right;
  display: flex;
  justify-content: flex-end;
}

@media (max-width: 768px) {
  .action-col {
    text-align: left;
    justify-content: flex-start;
  }
  .action-col .el-button {
    width: 100%;
  }
}

.template-list {
  min-height: 300px;
}

.template-card {
  height: 100%;
  display: flex;
  flex-direction: column;
  margin-bottom: 20px;
  transition: transform 0.3s ease, box-shadow 0.3s ease;
}

.template-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.12) !important;
}

.template-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
}

.template-category {
  font-size: 12px;
  color: #909399;
}

.template-title {
  font-size: 16px;
  font-weight: 600;
  color: #303133;
  margin: 0 0 8px 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.template-description {
  font-size: 13px;
  color: #606266;
  margin: 0 0 16px 0;
  overflow: hidden;
  text-overflow: ellipsis;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  line-height: 1.5;
  min-height: 39px;
}

.template-info {
  display: flex;
  gap: 16px;
  margin-bottom: 16px;
  padding-bottom: 16px;
  border-bottom: 1px solid #f0f0f0;
}

.info-item {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 13px;
  color: #909399;
}

.template-footer {
  display: flex;
  gap: 8px;
  margin-top: auto;
}

.template-footer .el-button {
  flex: 1;
}

.template-dropdown {
  flex-shrink: 0;
}

.template-dropdown .el-button {
  width: 32px;
  height: 32px;
  padding: 0;
}
</style>
