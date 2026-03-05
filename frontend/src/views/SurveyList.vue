<template>
  <div class="survey-list">
    <div class="header-actions">
      <h2>我的问卷</h2>
    </div>

    <el-tabs v-model="activeTab" class="survey-tabs">
      <el-tab-pane label="我创建的" name="created">
        <div class="tab-header">
          <el-select v-model="statusFilter" placeholder="筛选状态" clearable class="status-filter">
            <el-option label="全部" value="" />
            <el-option label="已发布" value="published" />
            <el-option label="草稿" value="draft" />
            <el-option label="已关闭" value="closed" />
          </el-select>
          <el-button type="primary" @click="router.push('/create-survey')">
            <el-icon><Plus /></el-icon>
            创建问卷
          </el-button>
        </div>

        <el-empty v-if="!loading && createdSurveys.length === 0" description="暂无创建的问卷">
          <el-button type="primary" @click="router.push('/create-survey')">立即创建</el-button>
        </el-empty>

        <div v-else class="survey-grid">
          <el-card v-for="survey in filteredCreatedSurveys" :key="survey.id" class="survey-card" @click="viewSurvey(survey.id!)">
            <div class="survey-header">
              <h3 class="survey-title">{{ survey.title }}</h3>
              <el-tag :type="getStatusType(survey.status)" size="small">{{ getStatusText(survey.status) }}</el-tag>
            </div>
            <p class="survey-description">{{ survey.description || '暂无描述' }}</p>
            <div class="survey-info">
              <div class="info-item">
                <el-icon><Clock /></el-icon>
                <span>{{ formatDate(survey.createdAt!) }}</span>
              </div>
            </div>
            <div class="survey-actions">
              <el-button v-if="survey.status === 'published'" type="primary" size="small" @click.stop="copyLink(survey.id!)">分享链接</el-button>
              <el-button v-if="survey.status === 'draft'" type="success" size="small" @click.stop="publishSurvey(survey.id!)">发布</el-button>
              <el-button size="small" @click.stop="editSurvey(survey.id!)">编辑</el-button>
              <el-button v-if="survey.status === 'published'" size="small" @click.stop="viewResults(survey.id!)">查看结果</el-button>
              <el-button type="danger" size="small" plain @click.stop="deleteSurvey(survey.id!)">删除</el-button>
            </div>
          </el-card>
        </div>
      </el-tab-pane>

      <el-tab-pane label="我填写的" name="responded">
        <el-empty v-if="!loading && respondedSurveys.length === 0" description="暂无填写记录" />

        <div v-else class="survey-grid">
          <el-card v-for="response in respondedSurveys" :key="response.id" class="survey-card" @click="viewSurveyResponse(response)">
            <div class="survey-header">
              <h3 class="survey-title">{{ response.survey?.title || '问卷已删除' }}</h3>
              <el-tag type="success" size="small">已提交</el-tag>
            </div>
            <p class="survey-description">{{ response.survey?.description || '暂无描述' }}</p>
            <div class="survey-info">
              <div class="info-item">
                <el-icon><Clock /></el-icon>
                <span>提交于 {{ formatDate(response.submittedAt) }}</span>
              </div>
            </div>
            <div class="survey-actions">
              <el-button type="primary" size="small" @click.stop="viewSurveyResponse(response)">查看答卷</el-button>
              <el-button v-if="response.survey?.status === 'published'" size="small" @click.stop="takeSurvey(response.surveyId)">再次填写</el-button>
            </div>
          </el-card>
        </div>
      </el-tab-pane>
    </el-tabs>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue';
import { useRouter } from 'vue-router';
import { ElMessage, ElMessageBox } from 'element-plus';
import { Plus, Clock } from '@element-plus/icons-vue';
import { surveyAPI, type Survey, type SurveyResponse } from '../api/survey';
import { useAuthStore } from '../stores/auth';

const router = useRouter();
const authStore = useAuthStore();

const activeTab = ref('created');
const createdSurveys = ref<Survey[]>([]);
const respondedSurveys = ref<SurveyResponse[]>([]);
const loading = ref(false);
const statusFilter = ref('');

const filteredCreatedSurveys = computed(() => {
  if (!statusFilter.value) return createdSurveys.value;
  return createdSurveys.value.filter(s => s.status === statusFilter.value);
});

const getStatusType = (status: string) => {
  const types: Record<string, any> = {
    published: 'success',
    draft: 'info',
    closed: 'warning',
  };
  return types[status] || 'info';
};

const getStatusText = (status: string) => {
  const texts: Record<string, string> = {
    published: '已发布',
    draft: '草稿',
    closed: '已关闭',
  };
  return texts[status] || status;
};

const formatDate = (date: string) => {
  return new Date(date).toLocaleDateString('zh-CN');
};

const viewSurvey = (id: string) => {
  router.push(`/surveys/${id}`);
};

const takeSurvey = (id: string) => {
  router.push(`/surveys/${id}/take`);
};

const editSurvey = (id: string) => {
  router.push(`/edit-survey/${id}`);
};

const viewResults = (id: string) => {
  router.push(`/surveys/${id}/results`);
};

const viewSurveyResponse = (response: SurveyResponse) => {
  router.push(`/surveys/${response.surveyId}/responses/${response.id}`);
};

const copyLink = async (id: string) => {
  const link = `${window.location.origin}/surveys/${id}/take`;
  try {
    await navigator.clipboard.writeText(link);
    ElMessage.success('链接已复制到剪贴板');
  } catch {
    ElMessage.error('复制失败，请手动复制');
  }
};

const publishSurvey = async (id: string) => {
  try {
    await surveyAPI.publishSurvey(id);
    ElMessage.success('发布成功');
    loadCreatedSurveys();
  } catch (error: any) {
    ElMessage.error(error.response?.data?.error || '发布失败');
  }
};

const deleteSurvey = async (id: string) => {
  try {
    await ElMessageBox.confirm('确定要删除这个问卷吗？删除后无法恢复。', '确认删除', {
      confirmButtonText: '删除',
      cancelButtonText: '取消',
      type: 'warning',
    });
    await surveyAPI.deleteSurvey(id);
    ElMessage.success('删除成功');
    loadCreatedSurveys();
  } catch (error: any) {
    if (error !== 'cancel') {
      ElMessage.error(error.response?.data?.error || '删除失败');
    }
  }
};

const loadCreatedSurveys = async () => {
  try {
    loading.value = true;
    const response = await surveyAPI.getMySurveys();
    createdSurveys.value = response.data;
  } catch (error) {
    console.error('Failed to load created surveys:', error);
    ElMessage.error('加载问卷失败');
  } finally {
    loading.value = false;
  }
};

const loadRespondedSurveys = async () => {
  try {
    loading.value = true;
    const response = await surveyAPI.getMyResponses();
    respondedSurveys.value = response.data;
  } catch (error) {
    console.error('Failed to load responded surveys:', error);
    ElMessage.error('加载填写记录失败');
  } finally {
    loading.value = false;
  }
};

watch(activeTab, (newTab) => {
  if (newTab === 'created') {
    loadCreatedSurveys();
  } else {
    loadRespondedSurveys();
  }
});

onMounted(() => {
  loadCreatedSurveys();
});
</script>

<style scoped>
.survey-list {
  padding: 20px 0;
  max-width: 1400px;
  margin: 0 auto;
}

.header-actions {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  padding: 0 20px;
}

.header-actions h2 {
  margin: 0;
  font-size: 24px;
}

.survey-tabs {
  padding: 0 20px;
}

.tab-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  gap: 12px;
}

.status-filter {
  width: 200px;
}

.survey-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
  gap: 20px;
}

.survey-card {
  cursor: pointer;
  transition: transform 0.3s, box-shadow 0.3s;
  display: flex;
  flex-direction: column;
}

.survey-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.12);
}

.survey-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 12px;
  gap: 10px;
}

.survey-title {
  margin: 0;
  font-size: 18px;
  flex: 1;
  word-break: break-word;
}

.survey-description {
  color: #666;
  line-height: 1.6;
  min-height: 40px;
  margin: 12px 0;
  flex: 1;
  overflow: hidden;
  text-overflow: ellipsis;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
}

.survey-info {
  display: flex;
  align-items: center;
  gap: 16px;
  color: #999;
  font-size: 14px;
  margin: 12px 0;
  flex-wrap: wrap;
}

.info-item {
  display: flex;
  align-items: center;
  gap: 4px;
}

.survey-actions {
  display: flex;
  gap: 8px;
  margin-top: auto;
  padding-top: 12px;
  border-top: 1px solid #f0f0f0;
  flex-wrap: wrap;
}

.survey-actions .el-button {
  flex: 1;
  min-width: 70px;
}

@media (max-width: 768px) {
  .survey-list {
    padding: 10px 0;
  }

  .header-actions {
    padding: 0 10px;
  }

  .header-actions h2 {
    font-size: 20px;
  }

  .survey-tabs {
    padding: 0 10px;
  }

  .tab-header {
    flex-direction: column;
    align-items: stretch;
  }

  .status-filter {
    width: 100%;
  }

  .survey-grid {
    grid-template-columns: 1fr;
    gap: 16px;
  }

  .survey-title {
    font-size: 16px;
  }

  .survey-actions {
    flex-direction: column;
  }

  .survey-actions .el-button {
    width: 100%;
  }
}

@media (min-width: 769px) and (max-width: 1024px) {
  .survey-grid {
    grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  }
}

@media (min-width: 1400px) {
  .survey-grid {
    grid-template-columns: repeat(4, 1fr);
  }
}
</style>
