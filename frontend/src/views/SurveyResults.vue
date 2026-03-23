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
            <!-- 图表切换按钮 -->
            <div class="chart-controls">
              <el-button-group>
                <el-button :type="chartTypes[stat.id] === 'pie' || !chartTypes[stat.id] ? 'primary' : ''" size="small" @click="toggleChartType(stat.id, stat)">
                  <el-icon><PieChart /></el-icon> 饼图
                </el-button>
                <el-button :type="chartTypes[stat.id] === 'bar' ? 'primary' : ''" size="small" @click="toggleChartType(stat.id, stat)">
                  <el-icon><Histogram /></el-icon> 柱状图
                </el-button>
              </el-button-group>
              <el-button size="small" @click="downloadChart(stat.id, stat.title)">
                <el-icon><Download /></el-icon> 下载图表
              </el-button>
            </div>
            <!-- ECharts 图表容器 -->
            <div :id="`chart-${stat.id}`" class="chart-container" style="width: 100%; height: 300px;"></div>
            <!-- 原有进度条保留作为数据详情 -->
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

      <!-- 交叉分析区块 -->
      <el-card class="cross-analysis-card">
        <template #header>
          <h3>交叉分析</h3>
        </template>
        
        <div class="cross-analysis-controls">
          <el-row :gutter="20">
            <el-col :span="12">
              <el-form-item label="行题目（X轴）">
                <el-select v-model="crossQuestionX" placeholder="选择题目" style="width: 100%">
                  <el-option
                    v-for="stat in singleChoiceQuestions"
                    :key="stat.id"
                    :label="stat.title"
                    :value="stat.id"
                  />
                </el-select>
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item label="列题目（Y轴）">
                <el-select v-model="crossQuestionY" placeholder="选择题目" style="width: 100%">
                  <el-option
                    v-for="stat in singleChoiceQuestions"
                    :key="stat.id"
                    :label="stat.title"
                    :value="stat.id"
                  />
                </el-select>
              </el-form-item>
            </el-col>
          </el-row>
          <el-button type="primary" @click="loadCrossAnalysis" :loading="crossLoading">
            开始分析
          </el-button>
        </div>

        <div v-if="crossData" class="cross-analysis-result">
          <!-- 交叉表格 -->
          <el-table :data="crossTableData" border style="width: 100%; margin-top: 20px">
            <el-table-column prop="rowLabel" label="" width="150" fixed />
            <el-table-column
              v-for="col in crossData.yOptions"
              :key="col"
              :prop="col"
              :label="col"
            >
              <template #default="{ row }">
                <div v-if="row[col]">
                  {{ row[col].count }} ({{ row[col].percentage }}%)
                </div>
              </template>
            </el-table-column>
          </el-table>

          <!-- 分组柱状图 -->
          <div id="cross-chart" style="width: 100%; height: 400px; margin-top: 20px"></div>
        </div>
      </el-card>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, nextTick, watch, computed } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { ElMessage } from 'element-plus';
import { Download, Calendar, PieChart, DataLine, BarChart } from '@element-plus/icons-vue';
import * as echarts from 'echarts';
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
const chartInstances = ref<Record<number, echarts.ECharts>>({});
const chartTypes = ref<Record<number, 'pie' | 'bar'>>({});

// 交叉分析状态
const crossQuestionX = ref<number | null>(null);
const crossQuestionY = ref<number | null>(null);
const crossData = ref<any>(null);
const crossLoading = ref(false);
const crossChartInstance = ref<echarts.ECharts | null>(null);

// 获取单选题列表（用于交叉分析）
const singleChoiceQuestions = computed(() => {
  return statistics.value.statistics.filter((s: any) => 
    ['single_choice', 'dropdown_single', 'rating', 'nps'].includes(s.type)
  );
});

// 交叉表格数据
const crossTableData = computed(() => {
  if (!crossData.value) return [];
  
  const rows: any[] = [];
  crossData.value.xOptions.forEach((xOpt: string) => {
    const row: any = { rowLabel: xOpt };
    crossData.value.yOptions.forEach((yOpt: string) => {
      if (crossData.value.tableData[xOpt] && crossData.value.tableData[xOpt][yOpt]) {
        row[yOpt] = crossData.value.tableData[xOpt][yOpt];
      }
    });
    rows.push(row);
  });
  return rows;
});

// 加载交叉分析数据
const loadCrossAnalysis = async () => {
  if (!crossQuestionX.value || !crossQuestionY.value) {
    ElMessage.warning('请选择两个题目');
    return;
  }

  if (crossQuestionX.value === crossQuestionY.value) {
    ElMessage.warning('请选择不同的题目');
    return;
  }

  crossLoading.value = true;
  try {
    const surveyId = route.params.id as string;
    const res = await responseAPI.getCrossAnalysis(surveyId, {
      questionX: crossQuestionX.value,
      questionY: crossQuestionY.value,
    });
    crossData.value = res.data;

    // 初始化交叉分析图表
    nextTick(() => {
      initCrossChart();
    });
  } catch (error: any) {
    ElMessage.error(error.response?.data?.error || '加载交叉分析失败');
  } finally {
    crossLoading.value = false;
  }
};

// 初始化交叉分析图表
const initCrossChart = () => {
  if (!crossData.value) return;

  const container = document.getElementById('cross-chart');
  if (!container) return;

  if (crossChartInstance.value) {
    crossChartInstance.value.dispose();
  }

  crossChartInstance.value = echarts.init(container);

  const series = crossData.value.yOptions.map((yOpt: string, idx: number) => ({
    name: yOpt,
    type: 'bar',
    data: crossData.value.xOptions.map((xOpt: string) => 
      crossData.value.tableData[xOpt]?.[yOpt]?.count || 0
    ),
  }));

  crossChartInstance.value.setOption({
    tooltip: {
      trigger: 'axis',
      axisPointer: { type: 'shadow' }
    },
    legend: {
      data: crossData.value.yOptions
    },
    grid: {
      left: '3%',
      right: '4%',
      bottom: '3%',
      containLabel: true
    },
    xAxis: {
      type: 'category',
      data: crossData.value.xOptions
    },
    yAxis: {
      type: 'value'
    },
    series
  });

  window.addEventListener('resize', () => crossChartInstance.value?.resize());
};

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
    nps: 'NPS评分',
    ranking: '排序题',
    matrix: '矩阵题',
    signature: '签名题',
  };
  return texts[type] || type;
};

// 初始化图表
const initChart = (statId: number, stat: any, type: 'pie' | 'bar' = 'pie') => {
  nextTick(() => {
    const container = document.getElementById(`chart-${statId}`);
    if (!container || !stat.options) return;

    if (chartInstances.value[statId]) {
      chartInstances.value[statId].dispose();
    }

    const chart = echarts.init(container);
    chartInstances.value[statId] = chart;

    const chartData = stat.options.map((opt: any) => ({
      name: opt.text,
      value: opt.count
    }));

    if (type === 'pie') {
      chart.setOption({
        tooltip: { trigger: 'item', formatter: '{b}: {c} ({d}%)' },
        legend: { orient: 'vertical', right: 10, top: 'center' },
        series: [{
          type: 'pie',
          radius: ['40%', '70%'],
          itemStyle: { borderRadius: 10, borderColor: '#fff', borderWidth: 2 },
          label: { show: true, formatter: '{b}: {d}%' },
          data: chartData
        }]
      });
    } else {
      chart.setOption({
        tooltip: { trigger: 'axis', axisPointer: { type: 'shadow' } },
        grid: { left: '3%', right: '4%', bottom: '3%', containLabel: true },
        xAxis: { type: 'category', data: stat.options.map((opt: any) => opt.text) },
        yAxis: { type: 'value' },
        series: [{
          type: 'bar',
          data: stat.options.map((opt: any) => opt.count),
          itemStyle: { color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
            { offset: 0, color: '#667eea' }, { offset: 1, color: '#764ba2' }
          ])},
          label: { show: true, position: 'top' }
        }]
      });
    }
    window.addEventListener('resize', () => chart.resize());
  });
};

// 切换图表类型
const toggleChartType = (statId: number, stat: any) => {
  const currentType = chartTypes.value[statId] || 'pie';
  const newType = currentType === 'pie' ? 'bar' : 'pie';
  chartTypes.value[statId] = newType;
  initChart(statId, stat, newType);
};

// 下载图表
const downloadChart = (statId: number, title: string) => {
  const chart = chartInstances.value[statId];
  if (!chart) return;
  const url = chart.getDataURL({ type: 'png', pixelRatio: 2, backgroundColor: '#fff' });
  const link = document.createElement('a');
  link.href = url;
  link.download = `${title}.png`;
  link.click();
};

// 初始化评分题图表
const initRatingChart = (statId: number, stat: any) => {
  nextTick(() => {
    const container = document.getElementById(`chart-${statId}`);
    if (!container || !stat.distribution) return;
    if (chartInstances.value[statId]) chartInstances.value[statId].dispose();

    const chart = echarts.init(container);
    chartInstances.value[statId] = chart;

    const ratings = Object.keys(stat.distribution).sort();
    const counts = ratings.map(r => stat.distribution[r]);

    chart.setOption({
      tooltip: { trigger: 'axis', axisPointer: { type: 'shadow' } },
      grid: { left: '3%', right: '4%', bottom: '3%', containLabel: true },
      xAxis: { type: 'category', data: ratings.map(r => `${r}星`) },
      yAxis: { type: 'value' },
      series: [{
        type: 'bar',
        data: counts,
        itemStyle: { color: '#667eea' },
        label: { show: true, position: 'top' }
      }]
    });
    window.addEventListener('resize', () => chart.resize());
  });
};

// 初始化 NPS 图表
const initNpsChart = (statId: number, stat: any) => {
  nextTick(() => {
    const container = document.getElementById(`chart-${statId}`);
    if (!container) return;
    if (chartInstances.value[statId]) chartInstances.value[statId].dispose();

    const chart = echarts.init(container);
    chartInstances.value[statId] = chart;

    const distribution: Record<number, number> = {};
    for (let i = 0; i <= 10; i++) distribution[i] = 0;
    if (stat.answers) {
      stat.answers.forEach((ans: string) => {
        const score = parseInt(ans);
        if (!isNaN(score) && score >= 0 && score <= 10) distribution[score]++;
      });
    }

    const scores = Object.keys(distribution).map(Number);
    const counts = scores.map(s => distribution[s]);

    chart.setOption({
      tooltip: { trigger: 'axis', axisPointer: { type: 'shadow' } },
      grid: { left: '3%', right: '4%', bottom: '3%', containLabel: true },
      xAxis: { type: 'category', data: scores },
      yAxis: { type: 'value' },
      series: [{
        type: 'bar',
        data: counts.map((count, idx) => ({
          value: count,
          itemStyle: { color: idx <= 6 ? '#f56c6c' : idx <= 8 ? '#e6a23c' : '#67c23a' }
        })),
        label: { show: true, position: 'top' }
      }]
    });
    window.addEventListener('resize', () => chart.resize());
  });
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

    // 初始化图表
    nextTick(() => {
      statistics.value.statistics.forEach((stat: any) => {
        if (stat.options) {
          initChart(stat.id, stat, 'pie');
        } else if (stat.distribution && stat.type === 'rating') {
          initRatingChart(stat.id, stat);
        } else if (stat.type === 'nps') {
          initNpsChart(stat.id, stat);
        }
      });
    });
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
