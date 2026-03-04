<template>
  <div class="survey-list">
    <div class="header-actions">
      <h2>问卷列表</h2>
      <el-select v-model="statusFilter" placeholder="筛选状态" clearable style="width: 200px">
        <el-option label="全部" value="" />
        <el-option label="已发布" value="published" />
        <el-option label="草稿" value="draft" />
      </el-select>
    </div>

    <el-empty v-if="!loading && surveys.length === 0" description="暂无问卷" />

    <div v-else class="survey-grid">
      <el-card v-for="survey in surveys" :key="survey.id" class="survey-card" @click="viewSurvey(survey.id!)">
        <div class="survey-header">
          <h3>{{ survey.title }}</h3>
          <el-tag :type="getStatusType(survey.status)">{{ getStatusText(survey.status) }}</el-tag>
        </div>
        <p class="survey-description">{{ survey.description || '暂无描述' }}</p>
        <div class="survey-info">
          <el-icon><User /></el-icon>
          <span>{{ survey.creatorId }}</span>
          <span class="separator">|</span>
          <el-icon><Clock /></el-icon>
          <span>{{ formatDate(survey.createdAt!) }}</span>
        </div>
        <div class="survey-actions">
          <el-button type="primary" size="small" @click.stop="takeSurvey(survey.id!)">填写问卷</el-button>
          <el-button v-if="canEdit(survey)" size="small" @click.stop="editSurvey(survey.id!)">编辑</el-button>
          <el-button v-if="canViewResults(survey)" size="small" @click.stop="viewResults(survey.id!)">查看结果</el-button>
        </div>
      </el-card>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { User, Clock } from '@element-plus/icons-vue';
import { surveyAPI, type Survey } from '../api/survey';
import { useAuthStore } from '../stores/auth';

const router = useRouter();
const authStore = useAuthStore();

const surveys = ref<Survey[]>([]);
const loading = ref(false);
const statusFilter = ref('');

const canEdit = (survey: Survey) => {
  return survey.creatorId === authStore.user?.id;
};

const canViewResults = (survey: Survey) => {
  return survey.creatorId === authStore.user?.id || authStore.isAdmin;
};

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

const viewSurvey = (id: number) => {
  router.push(`/surveys/${id}`);
};

const takeSurvey = (id: number) => {
  router.push(`/surveys/${id}/take`);
};

const editSurvey = (id: number) => {
  router.push(`/edit-survey/${id}`);
};

const viewResults = (id: number) => {
  router.push(`/surveys/${id}/results`);
};

const loadSurveys = async () => {
  loading.value = true;
  try {
    const params: any = {};
    if (statusFilter.value) {
      params.status = statusFilter.value;
    }
    const response = await surveyAPI.getSurveys(params);
    surveys.value = response.data;
  } catch (error) {
    console.error('Failed to load surveys:', error);
  } finally {
    loading.value = false;
  }
};

onMounted(() => {
  loadSurveys();
});
</script>

<style scoped>
.survey-list {
  padding: 20px 0;
}

.header-actions {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.survey-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 20px;
}

.survey-card {
  cursor: pointer;
  transition: transform 0.3s, box-shadow 0.3s;
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
}

.survey-header h3 {
  margin: 0;
  font-size: 18px;
  flex: 1;
  margin-right: 10px;
}

.survey-description {
  color: #666;
  line-height: 1.6;
  min-height: 40px;
  margin: 12px 0;
}

.survey-info {
  display: flex;
  align-items: center;
  gap: 8px;
  color: #999;
  font-size: 14px;
  margin: 12px 0;
}

.survey-info .separator {
  color: #ddd;
}

.survey-actions {
  display: flex;
  gap: 8px;
  margin-top: 12px;
}
</style>
