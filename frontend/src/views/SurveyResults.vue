<template>
  <div class="survey-results">
    <el-page-header @back="goBack" class="page-header">
      <template #content>
        <h2>{{ survey?.title }} - 数据统计</h2>
      </template>
      <template #extra>
        <el-dropdown v-if="statistics.totalResponses > 0" @command="handleExport">
          <el-button type="primary">
            <el-icon class="el-icon--left"><Download /></el-icon>
            导出数据
          </el-button>
          <template #dropdown>
            <el-dropdown-menu>
              <el-dropdown-item command="excel">导出为 Excel</el-dropdown-item>
              <el-dropdown-item command="pdf">导出为 PDF</el-dropdown-item>
            </el-dropdown-menu>
          </template>
        </el-dropdown>
      </template>
    </el-page-header>

    <!-- 日期筛选卡片 -->
    <el-card v-if="survey && statistics.totalResponses > 0" class="filter-card">
      <div class="filter-content">
        <div class="filter-label">
          <el-icon><Calendar /></el-icon>
          <span>统计时间筛选</span>
        </div>
        <el-date-picker
          v-model="dateRange"
          type="daterange"
          range-separator="至"
          start-placeholder="开始日期"
          end-placeholder="结束日期"
          format="YYYY-MM-DD"
          value-format="YYYY-MM-DD"
          :shortcuts="dateShortcuts"
          @change="handleDateChange"
          style="width: 380px"
        />
        <el-button v-if="dateRange && dateRange.length > 0" @click="clearDateFilter">
          清除筛选
        </el-button>
      </div>
    </el-card>

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
              <div class="stat-label">
                {{ statistics.dateRange?.startDate ? '筛选后回复数' : '总回复数' }}
              </div>
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
import { Download, Calendar } from '@element-plus/icons-vue';
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
const dateRange = ref<[string, string] | null>(null);

// 日期快捷选项
const dateShortcuts = [
  {
    text: '最近7天',
    value: () => {
      const end = new Date();
      const start = new Date();
      start.setTime(start.getTime() - 3600 * 1000 * 24 * 7);
      return [start, end];
    },
  },
  {
    text: '最近30天',
    value: () => {
      const end = new Date();
      const start = new Date();
      start.setTime(start.getTime() - 3600 * 1000 * 24 * 30);
      return [start, end];
    },
  },
  {
    text: '最近90天',
    value: () => {
      const end = new Date();
      const start = new Date();
      start.setTime(start.getTime() - 3600 * 1000 * 24 * 90);
      return [start, end];
    },
  },
];

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

const handleExport = (command: string) => {
  if (command === 'excel') {
    exportToExcel();
  } else if (command === 'pdf') {
    exportToPDF();
  }
};

const exportToExcel = async () => {
  if (!survey.value || statistics.value.totalResponses === 0) {
    ElMessage.warning('暂无数据可导出');
    return;
  }

  try {
    ElMessage.info('正在生成 Excel，请稍候...');
    const id = route.params.id as string;
    
    // 添加日期筛选参数
    const params = dateRange.value && dateRange.value.length === 2
      ? { startDate: dateRange.value[0], endDate: dateRange.value[1] }
      : undefined;
    
    const response = await responseAPI.exportToExcel(id, params);

    // 从响应头获取文件名
    const contentDisposition = response.headers['content-disposition'];
    let fileName = `${survey.value.title}_统计.xlsx`;
    if (contentDisposition) {
      const match = contentDisposition.match(/filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/);
      if (match && match[1]) {
        fileName = match[1].replace(/['"]/g, '');
      }
    }

    // 创建 Blob 并下载
    const blob = new Blob([response.data], {
      type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', fileName);
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.URL.revokeObjectURL(url);

    ElMessage.success('导出 Excel 成功');
  } catch (error) {
    console.error('Export Excel error:', error);
    ElMessage.error('导出 Excel 失败');
  }
};

const exportToPDF = async () => {
  if (!survey.value || statistics.value.totalResponses === 0) {
    ElMessage.warning('暂无数据可导出');
    return;
  }

  try {
    ElMessage.info('正在生成 PDF，请稍候...');
    const id = route.params.id as string;
    
    // 添加日期筛选参数
    const params = dateRange.value && dateRange.value.length === 2
      ? { startDate: dateRange.value[0], endDate: dateRange.value[1] }
      : undefined;
    
    const response = await responseAPI.exportToPdf(id, params);

    // 从响应头获取文件名
    const contentDisposition = response.headers['content-disposition'];
    let fileName = `${survey.value.title}_统计.pdf`;
    if (contentDisposition) {
      const match = contentDisposition.match(/filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/);
      if (match && match[1]) {
        fileName = match[1].replace(/['"]/g, '');
      }
    }

    // 创建 Blob 并下载
    const blob = new Blob([response.data], {
      type: 'application/pdf',
    });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', fileName);
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.URL.revokeObjectURL(url);

    ElMessage.success('导出 PDF 成功');
  } catch (error) {
    console.error('Export PDF error:', error);
    ElMessage.error('导出 PDF 失败');
  }
};

const loadResults = async (startDate?: string, endDate?: string) => {
  try {
    const id = route.params.id as string;

    // 并行加载问卷和统计数据
    const [surveyResponse, statsResponse] = await Promise.all([
      surveyAPI.getSurveyById(id),
      responseAPI.getSurveyStatistics(id, startDate && endDate ? { startDate, endDate } : undefined),
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

// 日期筛选变化
const handleDateChange = async (value: [string, string] | null) => {
  if (value && value.length === 2) {
    loading.value = true;
    await loadResults(value[0], value[1]);
  } else {
    loading.value = true;
    await loadResults();
  }
};

// 清除日期筛选
const clearDateFilter = async () => {
  dateRange.value = null;
  loading.value = true;
  await loadResults();
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

.filter-card {
  margin-bottom: 20px;
}

.filter-content {
  display: flex;
  align-items: center;
  gap: 16px;
  flex-wrap: wrap;
}

.filter-label {
  display: flex;
  align-items: center;
  gap: 6px;
  font-weight: 500;
  color: #303133;
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
