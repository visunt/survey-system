<template>
  <div class="stats">
    <el-card>
      <template #header>
        <div class="header">
          <h3>Statistics</h3>
          <el-button @click="$router.back()">Back</el-button>
        </div>
      </template>

      <el-row :gutter="20">
        <el-col :span="8">
          <el-statistic title="Total Responses" :value="stats.totalResponses" />
        </el-col>
      </el-row>

      <el-divider />

      <div v-for="(q, idx) in stats.questionStats" :key="idx" class="question-stats">
        <h4>{{ q.question }}</h4>
        <div v-if="q.type === 'single' || q.type === 'multiple'" ref="chartRef" :id="`chart-${idx}`" style="height: 300px"></div>
        <div v-else-if="q.type === 'text'">
          <el-table :data="q.answers" style="max-height: 300px">
            <el-table-column prop="value" label="Answer" />
          </el-table>
        </div>
      </div>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, nextTick } from 'vue';
import { useRoute } from 'vue-router';
import * as echarts from 'echarts';

const route = useRoute();
const surveyId = ref(route.params.surveyId as string);

const stats = ref({
  totalResponses: 0,
  questionStats: [],
});
const chartRef = ref<HTMLElement[]>([]);

async function loadStats() {
  try {
    const res = await responseApi.getStats(Number(surveyId.value));
    stats.value = res;

    await nextTick();
    initCharts();
  } catch (error) {
    console.error('Load stats error:', error);
  }
}

function initCharts() {
  stats.value.questionStats.forEach((q: any, idx: number) => {
    if (q.type === 'single' || q.type === 'multiple') {
      const chartDom = document.getElementById(`chart-${idx}`);
      if (chartDom) {
        const myChart = echarts.init(chartDom);
        myChart.setOption({
          title: { text: q.question },
          tooltip: { trigger: 'item' },
          series: [
            {
              type: 'pie',
              data: q.optionCounts.map((o: any) => ({ name: o.option, value: o.count })),
            },
          ],
        });
      }
    }
  });
}

onMounted(() => {
  loadStats();
});
</script>

<style lang="scss" scoped>
.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.question-stats {
  margin-bottom: 40px;
}
</style>
