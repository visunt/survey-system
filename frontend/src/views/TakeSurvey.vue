<template>
  <div class="take-survey">
    <el-page-header @back="goBack" class="page-header">
      <template #content>
        <h2>{{ survey?.title }}</h2>
      </template>
    </el-page-header>

    <!-- 进度条 -->
    <el-card v-if="survey && !loading && survey.status === 'published'" class="progress-card">
      <div class="progress-content">
        <div class="progress-text">
          <span class="progress-label">填写进度</span>
          <span class="progress-detail">已完成 {{ completedCount }}/{{ totalCount }} 题</span>
        </div>
        <el-progress
          :percentage="progressPercentage"
          :stroke-width="12"
          :show-text="false"
          :color="progressColor"
        />
      </div>
    </el-card>

    <el-empty v-if="loading" description="加载中..." />

    <el-empty v-else-if="!survey" description="问卷不存在" />

    <el-empty v-else-if="survey.status !== 'published'" description="该问卷尚未发布或已关闭" />

    <el-empty v-else-if="isExpired" description="该问卷已截止">
      <template #description>
        <div class="expired-message">
          <el-icon size="48" color="#f56c6c"><CircleClose /></el-icon>
          <p>该问卷已截止</p>
          <p class="expired-time" v-if="survey.deadline">
            截止时间：{{ formatDeadline(survey.deadline) }}
          </p>
        </div>
      </template>
    </el-empty>

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
          @blur="validateQuestion(question)"
        />
        <div v-if="question.type === 'text' && validationErrors[question.id!]" class="validation-error">
          <el-icon><WarningFilled /></el-icon>
          <span>{{ validationErrors[question.id!] }}</span>
        </div>

        <el-input
          v-else-if="question.type === 'textarea'"
          v-model="answers[question.id!]"
          type="textarea"
          :rows="4"
          placeholder="请输入您的回答"
          @change="handleAnswerChange(question)"
          @blur="validateQuestion(question)"
        />
        <div v-if="question.type === 'textarea' && validationErrors[question.id!]" class="validation-error">
          <el-icon><WarningFilled /></el-icon>
          <span>{{ validationErrors[question.id!] }}</span>
        </div>

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
          @change="handleAnswerChange(question); validateQuestion(question)"
        />
        <div v-if="question.type === 'date' && validationErrors[question.id!]" class="validation-error">
          <el-icon><WarningFilled /></el-icon>
          <span>{{ validationErrors[question.id!] }}</span>
        </div>
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
import { ElMessage } from 'element-plus';
import { CircleClose, WarningFilled } from '@element-plus/icons-vue';
import type { FormInstance } from 'element-plus';
import { surveyAPI, type Survey, type Question, type DisplayCondition } from '../api/survey';
import { responseAPI, type Answer } from '../api/response';
import { useAuthStore } from '../stores/auth';
import { validateAllRules } from '../utils/validation';

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
const validationErrors = ref<Record<number, string>>({});

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

// 评估单个显示条件
const evaluateCondition = (condition: DisplayCondition): boolean => {
  const questionId = condition.questionId;
  const answer = answers.value[questionId];
  const multiAnswer = multiAnswers.value[questionId];
  
  const operator = condition.operator;
  const expectedValue = condition.value;
  
  // 获取答案值
  let answerValue: string | undefined;
  if (multiAnswer !== undefined && multiAnswer.length > 0) {
    answerValue = multiAnswer.join(',');
  } else if (answer !== undefined && answer !== null && answer !== '') {
    answerValue = String(answer);
  }
  
  switch (operator) {
    case 'equals':
      if (answerValue === undefined) return false;
      return answerValue === String(expectedValue);
    
    case 'not_equals':
      if (answerValue === undefined) return true;
      return answerValue !== String(expectedValue);
    
    case 'contains':
      if (answerValue === undefined) return false;
      if (Array.isArray(multiAnswer)) {
        return multiAnswer.includes(String(expectedValue));
      }
      return answerValue.includes(String(expectedValue));
    
    case 'not_contains':
      if (answerValue === undefined) return true;
      if (Array.isArray(multiAnswer)) {
        return !multiAnswer.includes(String(expectedValue));
      }
      return !answerValue.includes(String(expectedValue));
    
    case 'greater_than':
      if (answerValue === undefined) return false;
      return Number(answerValue) > Number(expectedValue);
    
    case 'less_than':
      if (answerValue === undefined) return false;
      return Number(answerValue) < Number(expectedValue);
    
    case 'is_empty':
      return answerValue === undefined || answerValue === '';
    
    case 'is_not_empty':
      return answerValue !== undefined && answerValue !== '';
    
    default:
      return true;
  }
};

// 评估显示逻辑
const evaluateDisplayLogic = (question: Question): boolean => {
  if (!question.displayLogic || !question.displayLogic.enabled) {
    return true; // 没有显示逻辑，默认显示
  }
  
  const { conditions, logic } = question.displayLogic;
  
  if (!conditions || conditions.length === 0) {
    return true; // 没有条件，默认显示
  }
  
  if (logic === 'and') {
    // AND: 所有条件都必须满足
    return conditions.every(condition => evaluateCondition(condition));
  } else {
    // OR: 任一条件满足即可
    return conditions.some(condition => evaluateCondition(condition));
  }
};

// 获取所有可见题目ID集合
const visibleQuestionIds = computed(() => {
  const ids = new Set<number>();
  sortedQuestions.value.forEach(question => {
    if (evaluateDisplayLogic(question)) {
      ids.add(question.id!);
    }
  });
  return ids;
});

const visibleQuestions = computed(() => {
  return sortedQuestions.value.filter(question => {
    // 使用显示逻辑判断是否可见
    return evaluateDisplayLogic(question);
  });
});

// 进度计算
const totalCount = computed(() => visibleQuestions.value.length);

const completedCount = computed(() => {
  return visibleQuestions.value.filter(question => {
    const answer = answers.value[question.id!];
    const multiAnswer = multiAnswers.value[question.id!];
    
    // 如果是必填题，必须有答案才算完成
    if (question.isRequired) {
      if (question.type === 'multiple_choice' || question.type === 'dropdown_multiple') {
        return multiAnswer && multiAnswer.length > 0;
      }
      return answer !== undefined && answer !== '' && answer !== null;
    }
    
    // 如果是选填题，无论是否作答都算完成
    return true;
  }).length;
});

const progressPercentage = computed(() => {
  if (totalCount.value === 0) return 0;
  return Math.round((completedCount.value / totalCount.value) * 100);
});

const progressColor = computed(() => {
  if (progressPercentage.value < 30) return '#f56c6c';
  if (progressPercentage.value < 70) return '#e6a23c';
  return '#67c23a';
});

// 检查问卷是否已过期
const isExpired = computed(() => {
  if (!survey.value?.deadline) return false;
  return new Date(survey.value.deadline) < new Date();
});

// 格式化截止时间
const formatDeadline = (deadline: string) => {
  const date = new Date(deadline);
  return date.toLocaleString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  });
};

const sortedOptions = (question: Question) => {
  if (!question.options) return [];
  return [...question.options].sort((a, b) => a.orderIndex - b.orderIndex);
};

// 清除隐藏题目的答案
const clearHiddenQuestionAnswers = () => {
  if (!survey.value?.questions) return;
  
  survey.value.questions.forEach(question => {
    if (!visibleQuestionIds.value.has(question.id!)) {
      // 题目被隐藏，清除其答案
      if (answers.value[question.id!] !== undefined) {
        delete answers.value[question.id!];
      }
      if (multiAnswers.value[question.id!] !== undefined) {
        delete multiAnswers.value[question.id!];
      }
      // 清除验证错误
      if (validationErrors.value[question.id!] !== undefined) {
        delete validationErrors.value[question.id!];
      }
    }
  });
};

const handleAnswerChange = (question: Question) => {
  // 答案变化时，检查并清除隐藏题目的答案
  clearHiddenQuestionAnswers();
};

// 验证单个题目
const validateQuestion = (question: Question) => {
  // 如果题目被隐藏，跳过验证
  if (!visibleQuestionIds.value.has(question.id!)) {
    return true;
  }

  if (!question.validationRules || question.validationRules.length === 0) {
    // 没有验证规则，清除错误
    delete validationErrors.value[question.id!];
    return true;
  }

  const value = String(answers.value[question.id!] || '');
  
  // 如果是日期类型，格式化为 YYYY-MM-DD
  const answerValue = question.type === 'date' && answers.value[question.id!]
    ? new Date(answers.value[question.id!] as any).toISOString().split('T')[0]
    : value;

  const result = validateAllRules(answerValue, question.validationRules, question.type);
  
  if (!result.valid && result.messages.length > 0) {
    validationErrors.value[question.id!] = result.messages[0];
    return false;
  } else {
    delete validationErrors.value[question.id!];
    return true;
  }
};

// 验证所有题目
const validateAllQuestions = (): boolean => {
  let allValid = true;
  
  // 只验证可见的题目
  for (const question of visibleQuestions.value) {
    if (question.validationRules && question.validationRules.length > 0) {
      const valid = validateQuestion(question);
      if (!valid) {
        allValid = false;
      }
    }
  }
  
  return allValid;
};

const goBack = () => {
  router.back();
};

const handleSubmit = async () => {
  if (!survey.value) return;

  // 再次检查截止时间
  if (isExpired.value) {
    ElMessage.error('该问卷已截止，无法提交');
    return;
  }

  // 验证可见题目中的必填题
  for (const question of visibleQuestions.value) {
    if (question.isRequired) {
      const answer = answers.value[question.id!] ?? multiAnswers.value[question.id!];
      if (!answer || (Array.isArray(answer) && answer.length === 0)) {
        ElMessage.warning(`请回答问题: ${question.title}`);
        return;
      }
    }
  }

  // 验证所有可见题目的验证规则
  if (!validateAllQuestions()) {
    ElMessage.warning('请检查输入格式是否正确');
    return;
  }

  const submissionAnswers: Answer[] = [];

  // 只提交可见题目的答案
  for (const question of visibleQuestions.value) {
    let answer = '';

    if (question.type === 'multiple_choice' || question.type === 'dropdown_multiple') {
      const selected = multiAnswers.value[question.id!] || [];
      answer = JSON.stringify(selected);
    } else if (question.type === 'switch') {
      answer = answers.value[question.id!] ? 'true' : 'false';
    } else {
      answer = String(answers.value[question.id!] || '');
    }

    if (answer && answer !== '[]' && answer !== '') {
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
    router.push(`/surveys/${survey.value.id}/thank-you`);
  } catch (error: any) {
    ElMessage.error(error.response?.data?.error || '提交失败');
  } finally {
    submitting.value = false;
  }
};

const loadSurvey = async () => {
  try {
    const id = route.params.id as string;
    const response = await surveyAPI.getSurveyById(id);
    survey.value = response.data;

    if (survey.value.requireLogin && !authStore.isAuthenticated) {
      ElMessage.warning('该问卷需要登录后填写');
      router.push({
        path: '/login',
        query: { redirect: route.fullPath },
      });
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

.progress-card {
  margin-bottom: 20px;
  max-width: 800px;
  margin-left: auto;
  margin-right: auto;
}

.progress-content {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.progress-text {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.progress-label {
  font-weight: 600;
  font-size: 16px;
  color: #303133;
}

.progress-detail {
  font-size: 14px;
  color: #606266;
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

.expired-message {
  text-align: center;
  padding: 20px;
}

.expired-message p {
  margin: 12px 0 0 0;
  color: #909399;
}

.expired-message .expired-time {
  font-size: 12px;
  color: #c0c4cc;
}

.validation-error {
  display: flex;
  align-items: center;
  gap: 6px;
  margin-top: 8px;
  padding: 8px 12px;
  background: #fef0f0;
  border-radius: 4px;
  color: #f56c6c;
  font-size: 13px;
}

.validation-error .el-icon {
  font-size: 14px;
  flex-shrink: 0;
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
