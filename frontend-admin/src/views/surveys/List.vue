<template>
  <div class="survey-list">
    <el-card>
      <template #header>
        <div class="header">
          <h3>Surveys</h3>
          <el-button type="primary" @click="$router.push('/surveys/create')">
            Create Survey
          </el-button>
        </div>
      </template>

      <el-table :data="surveys" v-loading="loading">
        <el-table-column prop="id" label="ID" width="80" />
        <el-table-column prop="title" label="Title" />
        <el-table-column prop="status" label="Status" width="120">
          <template #default="{ row }">
            <el-tag :type="getStatusType(row.status)">
              {{ row.status }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="createdAt" label="Created" width="180" />
        <el-table-column label="Actions" width="200">
          <template #default="{ row }">
            <el-button link type="primary" @click="editSurvey(row.id)">Edit</el-button>
            <el-button link type="danger" @click="deleteSurvey(row.id)">Delete</el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { ElMessage, ElMessageBox } from 'element-plus';
import { surveyApi, type Survey } from '@/api/survey';

const router = useRouter();
const surveys = ref<Survey[]>([]);
const loading = ref(false);

function getStatusType(status: string) {
  const map: Record<string, any> = {
    draft: 'info',
    published: 'success',
    closed: 'warning',
  };
  return map[status] || 'info';
}

async function loadSurveys() {
  loading.value = true;
  try {
    const res = await surveyApi.list({});
    surveys.value = res.surveys || [];
  } catch (error) {
    console.error('Load surveys error:', error);
  } finally {
    loading.value = false;
  }
}

function editSurvey(id: number) {
  router.push(`/surveys/${id}`);
}

async function deleteSurvey(id: number) {
  await ElMessageBox.confirm('Are you sure to delete this survey?', 'Confirm', {
    type: 'warning',
  });
  try {
    await surveyApi.delete(id);
    ElMessage.success('Survey deleted');
    loadSurveys();
  } catch (error) {
    console.error('Delete survey error:', error);
  }
}

onMounted(() => {
  loadSurveys();
});
</script>

<style lang="scss" scoped>
.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}
</style>
