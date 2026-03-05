<template>
  <div class="survey-results">
    <el-page-header @back="goBack" class="page-header">
      <template #content>
        <h2>{{ survey?.title }} - 数据统计</h2>
      </template>
    </el-page-header>

    <el-empty v-if="loading" description="加载中..." />

    <el-empty v-else-if="!survey" description="问卷不存在" />

    <el-empty v-else-if="statistics.totalResponses === 0" description="暂无填写数据" />

    <div v-else class="results-content">
      <el-card class="summary-card">
        <h3>问卷概览</h3>
        <el-row :gutter="20">
          <el-col :span="8">
            <div class="stat-item">
              <div class="stat-value">{{ statistics.totalResponses }}</div>
              <div class="stat-label">总回复数</div>
            </div>
          </el-col>
          <el-col :span="8">
            <div class="stat-item">
              <div class="stat-value">{{ statistics.statistics.length }}</div>
              <div class="stat-label">题目数</div>
            </div>
          </el-col>
          <el-col :span="8">
            <div class="stat-item">
              <div class="stat-value">{{ formatDate(survey.createdAt!) }}</div>
              <div class="stat-label">创建时间</div>
            </div>
          </el-col>
        </el-row>
      </el-card>

      <div class="questions-statistics">
        <el-card v-for="stat in statistics.statistics" :key="stat.id" class="question-stat-card">
          <h4 class="question-title">{{ stat.title }}</h4>
          <div class="question-meta">
            <el-tag type="info">{{ getQuestionTypeText(stat.type) }}</el-tag>
            <el-tag :type="stat.required ? 'danger' : 'info'">
              {{ stat.required ? '必填' : '选填' }}
            </el-tag>
            <span class="response-count">{{ stat.totalResponses }} 回复</span>
          </div>

          <!-- 单选题和多选题 -->
          <div v-if="stat.options" class="options-chart">
            <div v-for="option in stat.options" :key="option.text" class="option-bar">
              <div class="option-text">{{ option.text }}</div>
              <div class="option-stats">
                <el-progress
                  :percentage="option.percentage"
                  :color="getBarColor(option.percentage)"
                />
                <span class="option-count">{{ option.count }} ({{ option.percentage.toFixed(1) }}%)</span>
              </div>
            </div>
          </div>

          <!-- 评分题 -->
          <div v-else-if="stat.average !== undefined" class="rating-stats">
            <div class="average-rating">
              <div class="rating-value">{{ stat.average.toFixed(1) }}</div>
              <div class="rating-label">平均评分</div>
            </div>
            <div class="rating-distribution">
              <div v-for="(count, rating) in stat.distribution" :key="rating" class="rating-bar">
                <span class="rating-label">{{ rating }} 星</span>
                <el-progress
                  :percentage="((count / stat.totalResponses) * 100)"
                  :color="getBarColor((count / stat.totalResponses) * 100)"
                />
                <span class="rating-count">{{ count }}</span>
              </div>
            </div>
          </div>

          <!-- 文本类题目 -->
          <div v-else class="text-answers">
            <div v-if="stat.answers && stat.answers.length > 0" class="answers-list">
              <div v-for="(answer, index) in stat.answers" :key="index" class="answer-item">
                <span class="answer-index">{{ index + 1 }}.</span>
                <span class="answer-text">{{ answer }}</span>
              </div>
            </div>
            <el-empty v-else description="暂无回答" :image-size="100" />
          </div>
        </el-card>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { ElMessage } from 'element-plus';
import { responseAPI } from '../api/response';
import { surveyAPI, type Survey } from '../api/survey';

const router = useRouter();
const route = useRoute();

const survey = ref<Survey | null>(null);
const statistics = ref<any>({
  surveyId: null,
  totalResponses: 0,
  statistics: [],
});
const loading = ref(true);

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

const getBarColor = (percentage: number) => {
  if (percentage >= 50) return '#67c23a';
  if (percentage >= 30) return '#e6a23c';
  return '#f56c6c';
};

const formatDate = (date: string) => {
  return new Date(date).toLocaleDateString('zh-CN');
};

const goBack = () => {
  router.back();
};

const loadResults = async () => {
  try {
    const id = route.params.id as string;

    // 并行加载问卷和统计数据
    const [surveyResponse, statsResponse] = await Promise.all([
      surveyAPI.getSurveyById(id),
      responseAPI.getSurveyStatistics(id),
    ]);

    survey.value = surveyResponse.data;
    statistics.value = statsResponse.data;
  } catch (error) {
    console.error('Failed to load results:', error);
    ElMessage.error('加载统计数据失败');
  } finally {
    loading.value = false;
  }
};

onMounted(() => {
  loadResults();
});
</script>

<style scoped>
.survey-results {
  padding: 20px 0;
  max-width: 900px;
  margin: 0 auto;
}

.page-header {
  margin-bottom: 20px;
}

.page-header h2 {
  margin: 0;
}

.summary-card {
  margin-bottom: 30px;
}

.summary-card h3 {
  margin-top: 0;
  margin-bottom: 20px;
}

.stat-item {
  text-align: center;
  padding: 20px;
}

.stat-value {
  font-size: 32px;
  font-weight: bold;
  color: #667eea;
  margin-bottom: 8px;
}

.stat-label {
  color: #666;
  font-size: 14px;
}

.questions-statistics {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.question-stat-card {
  margin-bottom: 20px;
}

.question-title {
  margin: 0 0 12px 0;
  font-size: 16px;
  font-weight: 500;
}

.question-meta {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 16px;
}

.response-count {
  color: #999;
  font-size: 14px;
  margin-left: auto;
}

/* 选项图表样式 */
.options-chart {
  margin-top: 16px;
}

.option-bar {
  margin-bottom: 12px;
}

.option-text {
  display: block;
  margin-bottom: 6px;
  color: #333;
}

.option-stats {
  display: flex;
  align-items: center;
  gap: 12px;
}

.option-stats .el-progress {
  flex: 1;
}

.option-count {
  min-width: 80px;
  text-align: right;
  color: #666;
  font-size: 14px;
}

/* 评分题样式 */
.rating-stats {
  margin-top: 16px;
}

.average-rating {
  text-align: center;
  margin-bottom: 24px;
  padding: 20px;
  background: #f0f9ff;
  border-radius: 8px;
}

.rating-value {
  font-size: 48px;
  font-weight: bold;
  color: #667eea;
  line-height: 1;
}

.rating-label {
  color: #666;
  margin-top: 8px;
}

.rating-distribution {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.rating-bar {
  display: flex;
  align-items: center;
  gap: 12px;
}

.rating-label {
  min-width: 60px;
  color: #666;
}

.rating-bar .el-progress {
  flex: 1;
}

.rating-count {
  min-width: 40px;
  text-align: right;
  color: #666;
}

/* 文本答案样式 */
.text-answers {
  margin-top: 16px;
}

.answers-list {
  max-height: 400px;
  overflow-y: auto;
}

.answer-item {
  display: flex;
  gap: 8px;
  padding: 12px;
  border-bottom: 1px solid #eee;
}

.answer-item:last-child {
  border-bottom: none;
}

.answer-index {
  color: #999;
  min-width: 30px;
}

.answer-text {
  flex: 1;
  color: #333;
  line-height: 1.6;
}
</style>
