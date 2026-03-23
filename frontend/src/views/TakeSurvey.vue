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

    <el-empty v-else-if="limitCheck && !limitCheck.canSubmit" :description="limitCheck.reason">
      <template #description>
        <div class="expired-message">
          <el-icon size="48" color="#f56c6c"><WarningFilled /></el-icon>
          <p>{{ limitCheck.reason }}</p>
          <p class="expired-time" v-if="limitCheck.limit">
            回收上限：{{ limitCheck.limit }} 份（当前已回收 {{ limitCheck.currentCount }} 份）
          </p>
          <p class="expired-time" v-else-if="limitCheck.maxResponsesPerUser > 0">
            您已填写 {{ limitCheck.userResponseCount }} 次，上限 {{ limitCheck.maxResponsesPerUser }} 次
          </p>
        </div>
      </template>
    </el-empty>

    <el-form v-else ref="formRef" :model="answers" label-position="top" class="survey-form">
      <el-card v-for="(question, index) in visibleQuestions" :key="question.id" class="question-card">
        <template #header>
          <div class="question-header">
            <span class="question-number">{{ index + 1 }}.</span>
            <span class="question-title" v-html="resolveQuestionReferences(question.title)"></span>
            <el-tag v-if="question.isRequired" type="danger" size="small">必填</el-tag>
          </div>
          <div v-if="question.description" class="question-description">
            <span v-html="resolveQuestionReferences(question.description)"></span>
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

        <!-- NPS评分 -->
        <div v-else-if="question.type === 'nps'" class="nps-container">
          <div class="nps-scale">
            <el-radio-group v-model="answers[question.id!]" @change="handleAnswerChange(question)">
              <el-radio-button v-for="n in 11" :key="n-1" :value="n-1" :class="getNpsClass(n-1)">
                {{ n-1 }}
              </el-radio-button>
            </el-radio-group>
          </div>
          <div class="nps-labels">
            <span class="nps-label detractor">0-6 贬损者</span>
            <span class="nps-label passive">7-8 被动者</span>
            <span class="nps-label promoter">9-10 推荐者</span>
          </div>
        </div>

        <!-- 排序题 -->
        <div v-else-if="question.type === 'ranking'" class="ranking-container">
          <draggable
            v-model="rankingAnswers[question.id!]"
            item-key="id"
            class="ranking-list"
            @change="handleAnswerChange(question)"
          >
            <template #item="{ element, index }">
              <div class="ranking-item">
                <span class="ranking-number">{{ index + 1 }}</span>
                <span class="ranking-text">{{ element.text }}</span>
                <el-icon class="ranking-drag"><Rank /></el-icon>
              </div>
            </template>
          </draggable>
        </div>

        <!-- 矩阵题 -->
        <div v-else-if="question.type === 'matrix'" class="matrix-container">
          <table class="matrix-table">
            <thead>
              <tr>
                <th></th>
                <th v-for="col in getMatrixColumns(question)" :key="col">{{ col }}</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="row in getMatrixRows(question)" :key="row.id">
                <td class="matrix-row-label">{{ row.text }}</td>
                <td v-for="col in getMatrixColumns(question)" :key="col" class="matrix-cell">
                  <el-radio
                    :value="col"
                    :model-value="matrixAnswers[question.id!]?.[row.id]"
                    @change="(val: string) => setMatrixAnswer(question.id!, row.id, val)"
                  />
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- 签名题 -->
        <div v-else-if="question.type === 'signature'" class="signature-container">
          <canvas
            :ref="(el: any) => setCanvasRef(question.id!, el)"
            class="signature-canvas"
            @mousedown="startDrawing(question.id!, $event)"
            @mousemove="draw(question.id!, $event)"
            @mouseup="stopDrawing(question.id!)"
            @mouseleave="stopDrawing(question.id!)"
            @touchstart="startDrawingTouch(question.id!, $event)"
            @touchmove="drawTouch(question.id!, $event)"
            @touchend="stopDrawing(question.id!)"
          ></canvas>
          <div class="signature-actions">
            <el-button size="small" @click="clearSignature(question.id!)">清除签名</el-button>
          </div>
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
import { responseAPI, type Answer, type ResponseLimitCheck } from '../api/response';
import { useAuthStore } from '../stores/auth';
import { validateAllRules } from '../utils/validation';

const router = useRouter();
const route = useRoute();
const authStore = useAuthStore();

const survey = ref<Survey | null>(null);
const loading = ref(true);
const submitting = ref(false);
const formRef = ref<FormInstance>();
const limitCheck = ref<ResponseLimitCheck | null>(null);

const answers = ref<Record<number, string | boolean>>({});
const multiAnswers = ref<Record<number, string[]>>({});
const rankingAnswers = ref<Record<number, { id: number; text: string }[]>>({});
const matrixAnswers = ref<Record<number, Record<number, string>>>({});
const signatureData = ref<Record<number, string>>({});
const canvasRefs = ref<Record<number, HTMLCanvasElement | null>>({});
const isDrawing = ref<Record<number, boolean>>({});
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

// 解析题目引用
const resolveQuestionReferences = (text: string): string => {
  if (!text) return '';
  
  return text.replace(/\{\{question_(\d+)\}\}/g, (match, questionId) => {
    const id = parseInt(questionId);
    const answer = answers.value[id];
    const multiAnswer = multiAnswers.value[id];
    
    // 找到引用的题目
    const referencedQuestion = sortedQuestions.value.find(q => q.id === id);
    
    if (!referencedQuestion) {
      return '<span class="reference-placeholder">___</span>';
    }
    
    let displayValue: string;
    let hasValue = false;
    
    // 处理不同题型的答案显示
    if (referencedQuestion.type === 'switch') {
      // 开关题显示"是"/"否"
      if (answer !== undefined) {
        displayValue = answer ? '是' : '否';
        hasValue = true;
      }
    } else if (referencedQuestion.type === 'multiple_choice' || referencedQuestion.type === 'dropdown_multiple') {
      // 多选题显示逗号分隔的选项文本
      if (multiAnswer && multiAnswer.length > 0) {
        displayValue = multiAnswer.join(', ');
        hasValue = true;
      }
    } else if (answer !== undefined && answer !== null && answer !== '') {
      // 其他题型直接显示答案值
      displayValue = String(answer);
      hasValue = true;
    }
    
    if (hasValue) {
      return `<span class="reference-value">${displayValue!}</span>`;
    } else {
      return '<span class="reference-placeholder">___</span>';
    }
  });
};

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

// NPS 相关
const getNpsClass = (value: number): string => {
  if (value <= 6) return 'nps-detractor';
  if (value <= 8) return 'nps-passive';
  return 'nps-promoter';
};

// 矩阵题相关
const getMatrixRows = (question: Question) => {
  return question.options?.filter(o => o.orderIndex >= 100) || [];
};

const getMatrixColumns = (question: Question): string[] => {
  const colOption = question.options?.find(o => o.orderIndex < 100);
  if (colOption?.text) {
    return colOption.text.split('|');
  }
  return ['非常不满意', '不满意', '一般', '满意', '非常满意'];
};

const setMatrixAnswer = (questionId: number, rowId: number, value: string) => {
  if (!matrixAnswers.value[questionId]) {
    matrixAnswers.value[questionId] = {};
  }
  matrixAnswers.value[questionId][rowId] = value;
};

// 排序题相关
import draggable from 'vuedraggable';
import { Rank } from '@element-plus/icons-vue';

// 签名相关
const setCanvasRef = (questionId: number, el: any) => {
  if (el) {
    canvasRefs.value[questionId] = el;
    initCanvas(questionId);
  }
};

const initCanvas = (questionId: number) => {
  const canvas = canvasRefs.value[questionId];
  if (!canvas) return;
  
  const ctx = canvas.getContext('2d');
  if (!ctx) return;
  
  canvas.width = canvas.offsetWidth;
  canvas.height = 200;
  
  ctx.fillStyle = '#fff';
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  ctx.strokeStyle = '#333';
  ctx.lineWidth = 2;
  ctx.lineCap = 'round';
};

const getPos = (canvas: HTMLCanvasElement, e: MouseEvent | TouchEvent): { x: number; y: number } => {
  const rect = canvas.getBoundingClientRect();
  if ('touches' in e) {
    return {
      x: e.touches[0].clientX - rect.left,
      y: e.touches[0].clientY - rect.top
    };
  }
  return {
    x: e.clientX - rect.left,
    y: e.clientY - rect.top
  };
};

const startDrawing = (questionId: number, e: MouseEvent) => {
  isDrawing.value[questionId] = true;
  const canvas = canvasRefs.value[questionId];
  if (!canvas) return;
  
  const ctx = canvas.getContext('2d');
  if (!ctx) return;
  
  const pos = getPos(canvas, e);
  ctx.beginPath();
  ctx.moveTo(pos.x, pos.y);
};

const startDrawingTouch = (questionId: number, e: TouchEvent) => {
  e.preventDefault();
  startDrawing(questionId, e as any);
};

const draw = (questionId: number, e: MouseEvent) => {
  if (!isDrawing.value[questionId]) return;
  
  const canvas = canvasRefs.value[questionId];
  if (!canvas) return;
  
  const ctx = canvas.getContext('2d');
  if (!ctx) return;
  
  const pos = getPos(canvas, e);
  ctx.lineTo(pos.x, pos.y);
  ctx.stroke();
  
  // 保存签名数据
  signatureData.value[questionId] = canvas.toDataURL('image/png');
  answers.value[questionId] = signatureData.value[questionId];
};

const drawTouch = (questionId: number, e: TouchEvent) => {
  e.preventDefault();
  draw(questionId, e as any);
};

const stopDrawing = (questionId: number) => {
  isDrawing.value[questionId] = false;
};

const clearSignature = (questionId: number) => {
  initCanvas(questionId);
  delete signatureData.value[questionId];
  delete answers.value[questionId];
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
    } else if (question.type === 'ranking') {
      // 排序题：保存排序后的选项 ID 列表
      const ranking = rankingAnswers.value[question.id!] || [];
      answer = JSON.stringify(ranking.map(r => r.id));
    } else if (question.type === 'matrix') {
      // 矩阵题：保存每行的选择
      answer = JSON.stringify(matrixAnswers.value[question.id!] || {});
    } else if (question.type === 'nps') {
      // NPS：直接保存分数
      answer = String(answers.value[question.id!] || '');
    } else if (question.type === 'signature') {
      // 签名：保存 Base64 图片数据
      answer = signatureData.value[question.id!] || '';
    } else {
      answer = String(answers.value[question.id!] || '');
    }

    if (answer && answer !== '[]' && answer !== '' && answer !== '{}') {
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

    // 初始化排序题答案
    survey.value.questions?.forEach(q => {
      if (q.type === 'ranking' && q.options) {
        rankingAnswers.value[q.id!] = q.options
          .sort((a, b) => a.orderIndex - b.orderIndex)
          .map(o => ({ id: o.id!, text: o.text }));
      }
    });

    if (survey.value.requireLogin && !authStore.isAuthenticated) {
      ElMessage.warning('该问卷需要登录后填写');
      router.push({
        path: '/login',
        query: { redirect: route.fullPath },
      });
      return;
    }

    // 检查填写限制
    if (survey.value.status === 'published') {
      try {
        const limitResponse = await responseAPI.checkResponseLimit(id);
        limitCheck.value = limitResponse.data;
      } catch (error) {
        console.error('Failed to check response limit:', error);
      }
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

.question-description {
  margin-top: 8px;
  font-size: 14px;
  color: #606266;
  line-height: 1.6;
}

.question-title :deep(.reference-value),
.question-description :deep(.reference-value) {
  display: inline-block;
  padding: 2px 8px;
  background: #f0f9ff;
  border-radius: 4px;
  color: #409eff;
  font-weight: 500;
  margin: 0 2px;
}

.question-title :deep(.reference-placeholder),
.question-description :deep(.reference-placeholder) {
  display: inline-block;
  padding: 2px 8px;
  background: #f5f7fa;
  border-radius: 4px;
  color: #909399;
  font-style: italic;
  margin: 0 2px;
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

/* NPS 样式 */
.nps-container {
  width: 100%;
}

.nps-scale {
  display: flex;
  justify-content: center;
  margin-bottom: 12px;
}

.nps-scale :deep(.el-radio-group) {
  display: flex;
  gap: 4px;
}

.nps-scale :deep(.el-radio-button__inner) {
  padding: 8px 12px;
}

.nps-scale :deep(.nps-detractor .el-radio-button__inner) {
  background: #fef0f0;
  border-color: #fbc4c4;
  color: #f56c6c;
}

.nps-scale :deep(.nps-detractor.is-active .el-radio-button__inner) {
  background: #f56c6c;
  border-color: #f56c6c;
  color: #fff;
}

.nps-scale :deep(.nps-passive .el-radio-button__inner) {
  background: #fdf6ec;
  border-color: #f5dab1;
  color: #e6a23c;
}

.nps-scale :deep(.nps-passive.is-active .el-radio-button__inner) {
  background: #e6a23c;
  border-color: #e6a23c;
  color: #fff;
}

.nps-scale :deep(.nps-promoter .el-radio-button__inner) {
  background: #f0f9eb;
  border-color: #c2e7b0;
  color: #67c23a;
}

.nps-scale :deep(.nps-promoter.is-active .el-radio-button__inner) {
  background: #67c23a;
  border-color: #67c23a;
  color: #fff;
}

.nps-labels {
  display: flex;
  justify-content: space-between;
  font-size: 12px;
  color: #909399;
}

.nps-label {
  padding: 2px 8px;
  border-radius: 4px;
}

.nps-label.detractor {
  background: #fef0f0;
  color: #f56c6c;
}

.nps-label.passive {
  background: #fdf6ec;
  color: #e6a23c;
}

.nps-label.promoter {
  background: #f0f9eb;
  color: #67c23a;
}

/* 排序题样式 */
.ranking-container {
  width: 100%;
}

.ranking-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.ranking-item {
  display: flex;
  align-items: center;
  padding: 12px 16px;
  background: #f5f7fa;
  border-radius: 8px;
  cursor: move;
  transition: all 0.2s;
}

.ranking-item:hover {
  background: #e6e8eb;
}

.ranking-number {
  width: 24px;
  height: 24px;
  background: #409eff;
  color: #fff;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 12px;
  font-weight: 600;
  margin-right: 12px;
}

.ranking-text {
  flex: 1;
}

.ranking-drag {
  color: #909399;
}

/* 矩阵题样式 */
.matrix-container {
  width: 100%;
  overflow-x: auto;
}

.matrix-table {
  width: 100%;
  border-collapse: collapse;
}

.matrix-table th,
.matrix-table td {
  padding: 12px;
  text-align: center;
  border: 1px solid #ebeef5;
}

.matrix-table th {
  background: #f5f7fa;
  font-weight: 600;
}

.matrix-row-label {
  text-align: left;
  font-weight: 500;
}

.matrix-cell :deep(.el-radio) {
  margin-right: 0;
}

/* 签名题样式 */
.signature-container {
  width: 100%;
}

.signature-canvas {
  width: 100%;
  height: 200px;
  border: 1px solid #dcdfe6;
  border-radius: 4px;
  background: #fff;
  cursor: crosshair;
  touch-action: none;
}

.signature-actions {
  margin-top: 8px;
  text-align: right;
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
