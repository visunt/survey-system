<template>
  <div class="survey-edit">
    <el-card>
      <template #header>
        <div class="header">
          <h3>{{ isEdit ? 'Edit Survey' : 'Create Survey' }}</h3>
          <el-button @click="$router.back()">Back</el-button>
        </div>
      </template>

      <el-form :model="form" label-width="100px">
        <el-form-item label="Title">
          <el-input v-model="form.title" placeholder="Enter survey title" />
        </el-form-item>
        <el-form-item label="Description">
          <el-input
            v-model="form.description"
            type="textarea"
            placeholder="Enter survey description"
          />
        </el-form-item>
        <el-form-item label="Status">
          <el-select v-model="form.status">
            <el-option label="Draft" value="draft" />
            <el-option label="Published" value="published" />
            <el-option label="Closed" value="closed" />
          </el-select>
        </el-form-item>
      </el-form>

      <el-divider>Questions</el-divider>

      <el-button type="primary" @click="showAddQuestionDialog">Add Question</el-button>

      <el-table :data="questions" style="margin-top: 20px">
        <el-table-column prop="order" label="Order" width="80" />
        <el-table-column prop="title" label="Question" />
        <el-table-column prop="type" label="Type" width="120" />
        <el-table-column label="Actions" width="150">
          <template #default="{ $index }">
            <el-button link type="primary" @click="editQuestion($index)">Edit</el-button>
            <el-button link type="danger" @click="removeQuestion($index)">Remove</el-button>
          </template>
        </el-table-column>
      </el-table>

      <div class="actions">
        <el-button type="primary" @click="saveSurvey">Save</el-button>
      </div>
    </el-card>

    <el-dialog v-model="dialogVisible" :title="dialogTitle" width="500px">
      <el-form :model="questionForm" label-width="100px">
        <el-form-item label="Type">
          <el-select v-model="questionForm.type">
            <el-option label="Single Choice" value="single" />
            <el-option label="Multiple Choice" value="multiple" />
            <el-option label="Text" value="text" />
            <el-option label="Rating" value="rating" />
          </el-select>
        </el-form-item>
        <el-form-item label="Question">
          <el-input v-model="questionForm.title" />
        </el-form-item>
        <el-form-item v-if="questionForm.type === 'single' || questionForm.type === 'multiple'" label="Options">
          <div v-for="(opt, idx) in questionForm.options" :key="idx" style="margin-bottom: 8px">
            <el-input v-model="questionForm.options[idx]" style="width: 300px" />
            <el-button @click="removeOption(idx)" style="margin-left: 8px">-</el-button>
          </div>
          <el-button @click="addOption">+ Add Option</el-button>
        </el-form-item>
        <el-form-item label="Required">
          <el-switch v-model="questionForm.required" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="dialogVisible = false">Cancel</el-button>
        <el-button type="primary" @click="saveQuestion">Save</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { ElMessage } from 'element-plus';
import { surveyApi, type Survey, type Question } from '@/api/survey';

const router = useRouter();
const route = useRoute();

const isEdit = computed(() => !!route.params.id);
const surveyId = computed(() => route.params.id as string);

const form = reactive<Partial<Survey>>({
  title: '',
  description: '',
  status: 'draft',
});

const questions = ref<Question[]>([]);
const dialogVisible = ref(false);
const dialogTitle = ref('Add Question');
const editingQuestionIndex = ref(-1);

const questionForm = reactive<Question>({
  type: 'single',
  title: '',
  required: true,
  options: [''],
  order: 0,
});

function showAddQuestionDialog() {
  dialogTitle.value = 'Add Question';
  editingQuestionIndex.value = -1;
  resetQuestionForm();
  dialogVisible.value = true;
}

function editQuestion(index: number) {
  dialogTitle.value = 'Edit Question';
  editingQuestionIndex.value = index;
  const q = questions.value[index];
  Object.assign(questionForm, {
    ...q,
    options: q.options ? [...q.options] : [''],
  });
  dialogVisible.value = true;
}

function saveQuestion() {
  const q = { ...questionForm };
  q.options = questionForm.options.filter((o) => o.trim());

  if (editingQuestionIndex.value === -1) {
    q.order = questions.value.length;
    questions.value.push(q);
  } else {
    q.order = questions.value[editingQuestionIndex.value].order;
    questions.value[editingQuestionIndex.value] = q;
  }

  dialogVisible.value = false;
}

function removeQuestion(index: number) {
  questions.value.splice(index, 1);
  questions.value.forEach((q, i) => (q.order = i));
}

function addOption() {
  questionForm.options?.push('');
}

function removeOption(index: number) {
  questionForm.options?.splice(index, 1);
}

function resetQuestionForm() {
  Object.assign(questionForm, {
    type: 'single',
    title: '',
    required: true,
    options: [''],
  });
}

async function saveSurvey() {
  try {
    if (isEdit.value) {
      await surveyApi.update(Number(surveyId.value), form);
      ElMessage.success('Survey updated');
    } else {
      const res = await surveyApi.create(form);
      ElMessage.success('Survey created');
      router.push(`/surveys/${res.id}`);
    }
  } catch (error) {
    console.error('Save survey error:', error);
  }
}

async function loadSurvey() {
  if (!isEdit.value) return;
  try {
    const res = await surveyApi.get(Number(surveyId.value));
    Object.assign(form, res);
    questions.value = res.questions || [];
  } catch (error) {
    console.error('Load survey error:', error);
  }
}

onMounted(() => {
  loadSurvey();
});
</script>

<style lang="scss" scoped>
.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.actions {
  margin-top: 20px;
  text-align: center;
}
</style>
