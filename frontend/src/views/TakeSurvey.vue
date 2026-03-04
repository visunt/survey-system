<template>
  <div class="take-survey">
    <el-page-header @back="goBack" class="page-header">
      <template #content>
        <h2>{{ survey?.title }}</h2>
      </template>
    </el-page-header>

    <el-empty v-if="loading" description="加载中..." />

    <el-empty v-else-if="!survey" description="问卷不存在" />

    <el-empty v-else-if="survey.status !== 'published'" description="该问卷尚未发布或已关闭" />

    <el-form v-else ref="formRef" :model="answers" label-position="top" class="survey-form">
      <el-card v-for="(question, index) in visibleQuestions" :key="question.id" class="question-card">
        <template #header>
          <div class="question-header">
            <span class="question-number">{{ index + 1 }}.</span>
            <span class="question-title">{{ question.title }}</span>
            <el-tag v-if="question.isRequired" type="danger" size="small">必填</el-tag>
          </div>
        </template>

        <el-radio-group
          v-if="question.type === 'single_choice'"
          v-model="answers[question.id!]"
          class="option-group"
          @change="handleAnswerChange(question)"
        >
          <el-radio
            v-for="option in sortedOptions(question)"
            :key="option.id"
            :label="option.text"
          >
            {{ option.text }}
          </el-radio>
        </el-radio-group>

        <el-checkbox-group
          v-else-if="question.type === 'multiple_choice'"
          v-model="multiAnswers[question.id!]"
          class="option-group"
          @change="handleAnswerChange(question)"
        >
          <el-checkbox
            v-for="option in sortedOptions(question)"
            :key="option.id"
            :label="option.text"
          >
            {{ option.text }}
          </el-checkbox>
        </el-checkbox-group>

        <el-select
          v-else-if="question.type === 'dropdown_single'"
          v-model="answers[question.id!]"
          placeholder="请选择"
          style="width: 100%"
          @change="handleAnswerChange(question)"
        >
          <el-option
            v-for="option in sortedOptions(question)"
            :key="option.id"
            :label="option.text"
            :value="option.text"
          />
        </el-select>

        <el-select
          v-else-if="question.type === 'dropdown_multiple'"
          v-model="multiAnswers[question.id!]"
          multiple
          placeholder="请选择（可多选）"
          style="width: 100%"
          @change="handleAnswerChange(question)"
        >
          <el-option
            v-for="option in sortedOptions(question)"
            :key="option.id"
            :label="option.text"
            :value="option.text"
          />
        </el-select>

        <el-switch
          v-else-if="question.type === 'switch'"
          v-model="answers[question.id!]"
          active-text="是"
          inactive-text="否"
          @change="handleAnswerChange(question)"
        />

        <el-input
          v-else-if="question.type === 'text'"
          v-model="answers[question.id!]"
          placeholder="请输入您的回答"
          @change="handleAnswerChange(question)"
        />

        <el-input
          v-else-if="question.type === 'textarea'"
          v-model="answers[question.id!]"
          type="textarea"
          :rows="4"
          placeholder="请输入您的回答"
          @change="handleAnswerChange(question)"
        />

        <el-rate
          v-else-if="question.type === 'rating'"
          v-model="answers[question.id!]"
          :max="5"
          allow-half
          @change="handleAnswerChange(question)"
        />

        <el-date-picker
          v-else-if="question.type === 'date'"
          v-model="answers[question.id!]"
          type="date"
          placeholder="请选择日期"
          style="width: 100%"
          @change="handleAnswerChange(question)"
        />
      </el-card>

      <div class="submit-section">
        <el-button type="primary" size="large" @click="handleSubmit" :loading="submitting">
          提交问卷
        </el-button>
      </div>
    </el-form>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { ElMessage, FormInstance } from 'element-plus';
import { surveyAPI, type Survey, type Question } from '../api/survey';
import { responseAPI, type Answer } from '../api/response';
import { useAuthStore } from '../stores/auth';

const router = useRouter();
const route = useRoute();
const authStore = useAuthStore();

const survey = ref<Survey | null>(null);
const loading = ref(true);
const submitting = ref(false);
const formRef = ref<FormInstance>();

const answers = ref<Record<number, string | boolean>>({});
const multiAnswers = ref<Record<number, string[]>>({});
const deviceId = ref<string>('');

const generateDeviceId = (): string => {
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');
  if (ctx) {
    ctx.textBaseline = 'top';
    ctx.font = '14px Arial';
    ctx.fillText('device-fingerprint', 2, 2);
  }
  const canvasData = canvas.toDataURL();
  
  const screenInfo = `${screen.width}x${screen.height}x${screen.colorDepth}`;
  const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
  const language = navigator.language;
  const platform = navigator.platform;
  
  const fingerprint = `${canvasData}-${screenInfo}-${timezone}-${language}-${platform}`;
  
  let hash = 0;
  for (let i = 0; i < fingerprint.length; i++) {
    const char = fingerprint.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash;
  }
  
  return `device_${Math.abs(hash).toString(36)}`;
};

const sortedQuestions = computed(() => {
  if (!survey.value?.questions) return [];
  return [...survey.value.questions].sort((a, b) => a.orderIndex - b.orderIndex);
});

const visibleQuestions = computed(() => {
  return sortedQuestions.value.filter(question => {
    if (!question.skipLogic || !question.skipLogic.enabled) {
      return true;
    }
    
    const { conditions } = question.skipLogic;
    for (const condition of conditions) {
      const dependentAnswer = answers.value[condition.questionId] || multiAnswers.value[condition.questionId];
      
      if (!dependentAnswer) continue;
      
      const answerValue = Array.isArray(dependentAnswer) 
        ? dependentAnswer.join(',') 
        : String(dependentAnswer);
      
      switch (condition.operator) {
        case 'equals':
          if (answerValue === String(condition.value)) return true;
          break;
        case 'not_equals':
          if (answerValue !== String(condition.value)) return true;
          break;
        case 'contains':
          if (answerValue.includes(String(condition.value))) return true;
          break;
        default:
          return true;
      }
    }
    
    return conditions.length === 0;
  });
});

const sortedOptions = (question: Question) => {
  if (!question.options) return [];
  return [...question.options].sort((a, b) => a.orderIndex - b.orderIndex);
};

const handleAnswerChange = (question: Question) => {
  // Answer change handler for potential future use
};

const goBack = () => {
  router.back();
};

const handleSubmit = async () => {
  if (!survey.value) return;

  for (const question of survey.value.questions) {
    if (question.isRequired) {
      const answer = answers.value[question.id!] ?? multiAnswers.value[question.id!];
      if (!answer || (Array.isArray(answer) && answer.length === 0)) {
        ElMessage.warning(`请回答问题: ${question.title}`);
        return;
      }
    }
  }

  const submissionAnswers: Answer[] = [];

  for (const question of survey.value.questions) {
    let answer = '';

    if (question.type === 'multiple_choice' || question.type === 'dropdown_multiple') {
      const selected = multiAnswers.value[question.id!] || [];
      answer = JSON.stringify(selected);
    } else if (question.type === 'switch') {
      answer = answers.value[question.id!] ? 'true' : 'false';
    } else {
      answer = String(answers.value[question.id!] || '');
    }

    if (answer) {
      submissionAnswers.push({
        questionId: question.id!,
        answer,
      });
    }
  }

  try {
    submitting.value = true;
    await responseAPI.submitResponse(survey.value.id!, submissionAnswers, deviceId.value);
    ElMessage.success('提交成功！');
    router.push('/surveys');
  } catch (error: any) {
    ElMessage.error(error.response?.data?.error || '提交失败');
  } finally {
    submitting.value = false;
  }
};

const loadSurvey = async () => {
  try {
    const id = Number(route.params.id);
    const response = await surveyAPI.getSurveyById(id);
    survey.value = response.data;

    if (survey.value.requireLogin && !authStore.isAuthenticated) {
      ElMessage.warning('该问卷需要登录后填写');
      router.push('/login');
    }
  } catch (error) {
    console.error('Failed to load survey:', error);
  } finally {
    loading.value = false;
  }
};

onMounted(() => {
  deviceId.value = generateDeviceId();
  loadSurvey();
});
</script>

<style scoped>
.take-survey {
  padding: 20px 0;
}

.page-header {
  margin-bottom: 20px;
}

.page-header h2 {
  margin: 0;
}

.survey-form {
  max-width: 800px;
  margin: 0 auto;
}

.question-card {
  margin-bottom: 20px;
}

.question-header {
  display: flex;
  align-items: flex-start;
  gap: 8px;
}

.question-number {
  font-weight: 600;
  color: #667eea;
}

.question-title {
  flex: 1;
  font-weight: 500;
}

.option-group {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.option-group .el-radio,
.option-group .el-checkbox {
  margin-right: 0;
}

.submit-section {
  margin-top: 40px;
  text-align: center;
}

.submit-section .el-button {
  min-width: 200px;
}

@media (max-width: 768px) {
  .take-survey {
    padding: 10px 0;
  }
  
  .survey-form {
    padding: 0 10px;
  }
  
  .question-card {
    margin-bottom: 15px;
  }
  
  .submit-section .el-button {
    width: 100%;
  }
}
</style>
