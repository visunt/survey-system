<template>
  <div class="responses-list">
    <el-card>
      <template #header>
        <div class="header">
          <h3>Responses</h3>
          <div>
            <el-button @click="$router.push(`/responses/${surveyId}/stats`)">
              Statistics
            </el-button>
            <el-button type="primary" @click="exportData">Export</el-button>
          </div>
        </div>
      </template>

      <el-table :data="responses" v-loading="loading">
        <el-table-column prop="id" label="ID" width="80" />
        <el-table-column prop="submittedAt" label="Submitted" width="180" />
        <el-table-column label="Actions" width="120">
          <template #default="{ row }">
            <el-button link type="primary" @click="viewDetail(row.id)">View</el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useRoute } from 'vue-router';
import { ElMessage } from 'element-plus';
import { responseApi } from '@/api/response';

const route = useRoute();
const surveyId = ref(route.params.surveyId as string);

const responses = ref([]);
const loading = ref(false);

async function loadResponses() {
  loading.value = true;
  try {
    const res = await responseApi.list(Number(surveyId.value), {});
    responses.value = res.responses || [];
  } catch (error) {
    console.error('Load responses error:', error);
  } finally {
    loading.value = false;
  }
}

function viewDetail(id: number) {
  ElMessage.info('Detail view to be implemented');
}

async function exportData() {
  try {
    await responseApi.export(Number(surveyId.value), 'csv');
    ElMessage.success('Export started');
  } catch (error) {
    console.error('Export error:', error);
  }
}

onMounted(() => {
  loadResponses();
});
</script>

<style lang="scss" scoped>
.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}
</style>
