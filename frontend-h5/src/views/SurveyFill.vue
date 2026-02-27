<template>
  <div class="survey-fill">
    <div class="header">
      <h1>{{ survey.title }}</h1>
      <p v-if="survey.description">{{ survey.description }}</p>
    </div>

    <el-form
      ref="formRef"
      :model="form"
      :rules="rules"
      label-position="top"
      class="form"
    >
      <div v-for="question in sortedQuestions" :key="question.id" class="question-item">
        <div class="question-title">
          {{ question.order + 1 }}. {{ question.title }}
          <span v-if="question.required" class="required">*</span>
        </div>
        <div v-if="question.description" class="question-desc">
          {{ question.description }}
        </div>

        <!-- Single choice -->
        <el-radio-group
          v-if="question.type === 'single'"
          v-model="form[`q${question.id}`]"
          class="question-input"
        >
          <el-radio v-for="opt in question.options" :key="opt" :label="opt">
            {{ opt }}
          </el-radio>
        </el-radio-group>

        <!-- Multiple choice -->
        <el-checkbox-group
          v-else-if="question.type === 'multiple'"
          v-model="form[`q${question.id}`]"
          class="question-input"
        >
          <el-checkbox v-for="opt in question.options" :key="opt" :label="opt">
            {{ opt }}
          </el-checkbox>
        </el-checkbox-group>

        <!-- Text input -->
        <el-input
          v-else-if="question.type === 'text'"
          v-model="form[`q${question.id}`]"
          type="textarea"
          :rows="4"
          class="question-input"
        />

        <!-- Rating -->
        <el-rate
          v-else-if="question.type === 'rating'"
          v-model="form[`q${question.id}`]"
          :max="question.max || 5"
          class="question-input"
        />
      </div>
    </el-form>

    <div class="footer">
      <el-button type="primary" size="large" :loading="submitting" @click="submit">
        Submit
      </el-button>
    </div>

    <el-dialog v-model="showConfirm" title="Confirm" width="80%">
      <p>Are you sure to submit your answers?</p>
      <template #footer>
        <el-button @click="showConfirm = false">Cancel</el-button>
        <el-button type="primary" @click="confirmSubmit">Confirm</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { ElMessage } from 'element-plus';
import { surveyApi, responseApi, type Survey, type Question } from '@/api/survey';

const route = useRoute();
const router = useRouter();

const survey = ref<Partial<Survey>>({});
const formRef = ref();
const submitting = ref(false);
const showConfirm = ref(false);

const form = reactive<Record<string, any>>({});
const rules = reactive<Record<string, any>>({});

const sortedQuestions = computed(() => {
  if (!survey.value.questions) return [];
  return [...survey.value.questions].sort((a, b) => a.order - b.order);
});

async function loadSurvey() {
  const id = route.params.id as string;
  try {
    const res = await surveyApi.get(Number(id));
    survey.value = res;

    // Initialize form and rules
    res.questions.forEach((q: Question) => {
      const key = `q${q.id}`;
      if (q.required) {
        rules[key] = [
          { required: true, message: 'This field is required', trigger: 'change' },
        ];
      }
      if (q.type === 'multiple') {
        form[key] = [];
      }
    });
  } catch (error) {
    ElMessage.error('Survey not found');
  }
}

function submit() {
  formRef.value?.validate((valid: boolean) => {
    if (!valid) return;
    showConfirm.value = true;
  });
}

async function confirmSubmit() {
  showConfirm.value = false;
  submitting.value = true;

  const answers = survey.value.questions?.map((q) => ({
    questionId: q.id,
    value: form[`q${q.id}`],
  }));

  try {
    await responseApi.submit(survey.value.id!, answers);
    ElMessage.success('Thank you for your response!');
    router.push(`/survey/${survey.value.id}/result`);
  } catch (error) {
    ElMessage.error('Submission failed');
  } finally {
    submitting.value = false;
  }
}

onMounted(() => {
  loadSurvey();
});
</script>

<style lang="scss" scoped>
.survey-fill {
  min-height: 100vh;
  background: #f5f5f5;
  padding-bottom: 80px;
}

.header {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: #fff;
  padding: 30px 20px;
  text-align: center;

  h1 {
    font-size: 24px;
    margin-bottom: 10px;
  }

  p {
    font-size: 14px;
    opacity: 0.9;
  }
}

.form {
  padding: 20px;
}

.question-item {
  background: #fff;
  border-radius: 8px;
  padding: 20px;
  margin-bottom: 16px;
}

.question-title {
  font-size: 16px;
  font-weight: 500;
  margin-bottom: 8px;
  color: #333;

  .required {
    color: #f56c6c;
    margin-left: 4px;
  }
}

.question-desc {
  font-size: 14px;
  color: #666;
  margin-bottom: 12px;
}

.question-input {
  width: 100%;
}

.footer {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  background: #fff;
  padding: 12px 20px;
  box-shadow: 0 -2px 10px rgba(0, 0, 0, 0.1);
  text-align: center;

  .el-button {
    width: 200px;
  }
}
</style>
