<template>
  <div class="survey-detail">
    <el-page-header @back="goBack" class="page-header">
      <template #content>
        <div class="survey-title">
          <h2>{{ survey?.title }}</h2>
          <el-tag :type="getStatusType(survey?.status)">{{ getStatusText(survey?.status) }}</el-tag>
        </div>
      </template>
    </el-page-header>

    <el-empty v-if="loading" description="加载中..." />

    <el-empty v-else-if="!survey" description="问卷不存在" />

    <div v-else class="survey-content">
      <el-card class="survey-info-card">
        <div class="info-row">
          <span class="label">描述：</span>
          <span class="value">{{ survey.description || '暂无描述' }}</span>
        </div>
        <div class="info-row">
          <span class="label">创建者：</span>
          <span class="value">{{ survey.creatorId }}</span>
        </div>
        <div class="info-row">
          <span class="label">创建时间：</span>
          <span class="value">{{ formatDate(survey.createdAt!) }}</span>
        </div>
        <div class="info-row">
          <span class="label">需要登录：</span>
          <span class="value">{{ survey.requireLogin ? '是' : '否' }}</span>
        </div>
        <div class="info-row">
          <span class="label">允许匿名：</span>
          <span class="value">{{ survey.allowAnonymous ? '是' : '否' }}</span>
        </div>
      </el-card>

      <h3>题目列表</h3>
      <el-empty v-if="!survey.questions || survey.questions.length === 0" description="暂无题目" />

      <div v-else class="questions-list">
        <el-card v-for="(question, index) in sortedQuestions" :key="question.id" class="question-card">
          <div class="question-header">
            <span class="question-number">{{ index + 1 }}.</span>
            <span class="question-title">{{ question.title }}</span>
            <el-tag v-if="question.isRequired" type="danger" size="small">必填</el-tag>
          </div>
          <div class="question-type">{{ getQuestionTypeText(question.type) }}</div>
          <div v-if="question.options && question.options.length > 0" class="options-list">
            <div v-for="(option, oIndex) in sortedOptions(question)" :key="option.id" class="option-item">
              <span>{{ String.fromCharCode(65 + oIndex) }}. {{ option.text }}</span>
            </div>
          </div>
        </el-card>
      </div>

      <div class="survey-actions">
        <el-button type="primary" size="large" @click="takeSurvey">填写问卷</el-button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { surveyAPI, type Survey } from '../api/survey';
import type { Question } from '../api/survey';

const router = useRouter();
const route = useRoute();

const survey = ref<Survey | null>(null);
const loading = ref(true);

const sortedQuestions = computed(() => {
  if (!survey.value?.questions) return [];
  return [...survey.value.questions].sort((a, b) => a.orderIndex - b.orderIndex);
});

const sortedOptions = (question: Question) => {
  if (!question.options) return [];
  return [...question.options].sort((a, b) => a.orderIndex - b.orderIndex);
};

const getStatusType = (status?: string) => {
  if (!status) return 'info';
  const types: Record<string, any> = {
    published: 'success',
    draft: 'info',
    closed: 'warning',
  };
  return types[status] || 'info';
};

const getStatusText = (status?: string) => {
  if (!status) return '';
  const texts: Record<string, string> = {
    published: '已发布',
    draft: '草稿',
    closed: '已关闭',
  };
  return texts[status] || status;
};

const getQuestionTypeText = (type: string) => {
  const texts: Record<string, string> = {
    single_choice: '单选题',
    multiple_choice: '多选题',
    text: '文本题',
    textarea: '文本域',
    rating: '评分题',
    date: '日期题',
  };
  return texts[type] || type;
};

const formatDate = (date: string) => {
  return new Date(date).toLocaleString('zh-CN');
};

const goBack = () => {
  router.back();
};

const takeSurvey = () => {
  if (survey.value) {
    router.push(`/surveys/${survey.value.id}/take`);
  }
};

const loadSurvey = async () => {
  try {
    const id = Number(route.params.id);
    const response = await surveyAPI.getSurveyById(id);
    survey.value = response.data;
  } catch (error) {
    console.error('Failed to load survey:', error);
  } finally {
    loading.value = false;
  }
};

onMounted(() => {
  loadSurvey();
});
</script>

<style scoped>
.survey-detail {
  padding: 20px 0;
}

.page-header {
  margin-bottom: 20px;
}

.survey-title {
  display: flex;
  align-items: center;
  gap: 12px;
}

.survey-title h2 {
  margin: 0;
}

.survey-content {
  max-width: 800px;
}

.survey-info-card {
  margin-bottom: 20px;
}

.info-row {
  display: flex;
  padding: 8px 0;
  border-bottom: 1px solid #eee;
}

.info-row:last-child {
  border-bottom: none;
}

.info-row .label {
  font-weight: 500;
  width: 100px;
  color: #666;
}

.info-row .value {
  color: #333;
  flex: 1;
}

.questions-list {
  margin: 20px 0;
}

.question-card {
  margin-bottom: 15px;
}

.question-header {
  display: flex;
  align-items: flex-start;
  gap: 8px;
  margin-bottom: 12px;
}

.question-number {
  font-weight: 600;
  color: #667eea;
}

.question-title {
  flex: 1;
  font-weight: 500;
}

.question-type {
  color: #999;
  font-size: 14px;
  margin-bottom: 10px;
}

.options-list {
  margin-top: 10px;
  padding-left: 24px;
}

.option-item {
  padding: 5px 0;
  color: #666;
}

.survey-actions {
  margin-top: 30px;
  text-align: center;
}

.survey-actions .el-button {
  min-width: 200px;
}
</style>
