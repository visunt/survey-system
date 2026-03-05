<template>
  <div class="survey-list">
    <div class="header-actions">
      <h2>问卷列表</h2>
      <el-select v-model="statusFilter" placeholder="筛选状态" clearable class="status-filter">
        <el-option label="全部" value="" />
        <el-option label="已发布" value="published" />
        <el-option label="草稿" value="draft" />
        <el-option label="已关闭" value="closed" />
      </el-select>
    </div>

    <el-empty v-if="!loading && surveys.length === 0" description="暂无问卷" />

    <div v-else class="survey-grid">
      <el-card v-for="survey in surveys" :key="survey.id" class="survey-card" @click="viewSurvey(survey.id!)">
        <div class="survey-header">
          <h3 class="survey-title">{{ survey.title }}</h3>
          <el-tag :type="getStatusType(survey.status)" size="small">{{ getStatusText(survey.status) }}</el-tag>
        </div>
        <p class="survey-description">{{ survey.description || '暂无描述' }}</p>
        <div class="survey-info">
          <div class="info-item">
            <el-icon><User /></el-icon>
            <span>{{ survey.creatorId }}</span>
          </div>
          <div class="info-item">
            <el-icon><Clock /></el-icon>
            <span>{{ formatDate(survey.createdAt!) }}</span>
          </div>
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
import { ref, computed, onMounted, watch } from 'vue';
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

watch(statusFilter, () => {
  loadSurveys();
});

onMounted(() => {
  loadSurveys();
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
  flex-wrap: wrap;
  gap: 12px;
}

.header-actions h2 {
  margin: 0;
  font-size: 24px;
}

.status-filter {
  width: 200px;
}

.survey-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
  gap: 20px;
  padding: 0 20px;
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
  min-width: 80px;
}

@media (max-width: 768px) {
  .survey-list {
    padding: 10px 0;
  }

  .header-actions {
    padding: 0 10px;
    flex-direction: column;
    align-items: stretch;
  }

  .header-actions h2 {
    font-size: 20px;
  }

  .status-filter {
    width: 100%;
  }

  .survey-grid {
    grid-template-columns: 1fr;
    padding: 0 10px;
    gap: 16px;
  }

  .survey-card {
    margin: 0;
  }

  .survey-title {
    font-size: 16px;
  }

  .survey-info {
    flex-direction: column;
    align-items: flex-start;
    gap: 8px;
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
    padding: 0 20px;
  }
}

@media (min-width: 1400px) {
  .survey-grid {
    grid-template-columns: repeat(4, 1fr);
  }
}
</style>
