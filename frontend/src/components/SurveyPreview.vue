<template>
  <el-dialog
    v-model="visible"
    title="问卷预览"
    width="800px"
    :close-on-click-modal="false"
    destroy-on-close
    class="preview-dialog"
  >
    <div class="preview-banner">
      <el-alert
        title="预览模式"
        type="info"
        description="这是问卷预览效果，无法提交。请检查问卷内容和排版。"
        :closable="false"
        show-icon
      />
    </div>

    <div class="preview-content" v-if="surveyData">
      <div class="survey-header">
        <h2>{{ surveyData.title || '未命名问卷' }}</h2>
        <p v-if="surveyData.description" class="survey-desc">{{ surveyData.description }}</p>
      </div>

      <el-form label-position="top" class="survey-form">
        <el-card v-for="(question, index) in sortedQuestions" :key="question.id" class="question-card">
          <template #header>
            <div class="question-header">
              <span class="question-number">{{ index + 1 }}.</span>
              <span class="question-title">{{ question.title || '未填写题目' }}</span>
              <el-tag v-if="question.isRequired" type="danger" size="small">必填</el-tag>
              <el-tag size="small" type="info">{{ getQuestionTypeText(question.type) }}</el-tag>
            </div>
          </template>

          <!-- 单选题 -->
          <el-radio-group
            v-if="question.type === 'single_choice'"
            v-model="answers[question.id]"
            class="option-group"
          >
            <el-radio
              v-for="option in sortedOptions(question)"
              :key="option.id"
              :label="option.text"
            >
              {{ option.text || '选项内容' }}
            </el-radio>
          </el-radio-group>

          <!-- 多选题 -->
          <el-checkbox-group
            v-else-if="question.type === 'multiple_choice'"
            v-model="multiAnswers[question.id]"
            class="option-group"
          >
            <el-checkbox
              v-for="option in sortedOptions(question)"
              :key="option.id"
              :label="option.text"
            >
              {{ option.text || '选项内容' }}
            </el-checkbox>
          </el-checkbox-group>

          <!-- 下拉单选 -->
          <el-select
            v-else-if="question.type === 'dropdown_single'"
            v-model="answers[question.id]"
            placeholder="请选择"
            style="width: 100%"
          >
            <el-option
              v-for="option in sortedOptions(question)"
              :key="option.id"
              :label="option.text || '选项内容'"
              :value="option.text"
            />
          </el-select>

          <!-- 下拉多选 -->
          <el-select
            v-else-if="question.type === 'dropdown_multiple'"
            v-model="multiAnswers[question.id]"
            multiple
            placeholder="请选择（可多选）"
            style="width: 100%"
          >
            <el-option
              v-for="option in sortedOptions(question)"
              :key="option.id"
              :label="option.text || '选项内容'"
              :value="option.text"
            />
          </el-select>

          <!-- 开关题 -->
          <el-switch
            v-else-if="question.type === 'switch'"
            v-model="answers[question.id]"
            active-text="是"
            inactive-text="否"
          />

          <!-- 文本题 -->
          <el-input
            v-else-if="question.type === 'text'"
            v-model="answers[question.id]"
            placeholder="请输入您的回答"
          />

          <!-- 文本域 -->
          <el-input
            v-else-if="question.type === 'textarea'"
            v-model="answers[question.id]"
            type="textarea"
            :rows="4"
            placeholder="请输入您的回答"
          />

          <!-- 评分题 -->
          <el-rate
            v-else-if="question.type === 'rating'"
            v-model="answers[question.id]"
            :max="5"
            allow-half
          />

          <!-- 日期题 -->
          <el-date-picker
            v-else-if="question.type === 'date'"
            v-model="answers[question.id]"
            type="date"
            placeholder="请选择日期"
            style="width: 100%"
          />

          <!-- 未知题型 -->
          <div v-else class="unknown-type">
            <el-text type="warning">未知题型: {{ question.type }}</el-text>
          </div>
        </el-card>
      </el-form>
    </div>

    <template #footer>
      <el-button type="primary" @click="closePreview">关闭预览</el-button>
    </template>
  </el-dialog>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue';
import type { Survey, Question, QuestionOption } from '../api/survey';

interface Props {
  modelValue: boolean;
  surveyData: Partial<Survey> | null;
}

const props = defineProps<Props>();
const emit = defineEmits<{
  (e: 'update:modelValue', value: boolean): void;
}>();

const visible = computed({
  get: () => props.modelValue,
  set: (val) => emit('update:modelValue', val),
});

const answers = ref<Record<number, string | boolean>>({});
const multiAnswers = ref<Record<number, string[]>>({});

const sortedQuestions = computed(() => {
  if (!props.surveyData?.questions) return [];
  return [...props.surveyData.questions].sort((a, b) => a.orderIndex - b.orderIndex);
});

const sortedOptions = (question: Question): QuestionOption[] => {
  if (!question.options) return [];
  return [...question.options].sort((a, b) => a.orderIndex - b.orderIndex);
};

const getQuestionTypeText = (type: string) => {
  const texts: Record<string, string> = {
    single_choice: '单选题',
    multiple_choice: '多选题',
    dropdown_single: '下拉单选',
    dropdown_multiple: '下拉多选',
    text: '文本题',
    textarea: '文本域',
    rating: '评分题',
    date: '日期题',
    switch: '开关题',
  };
  return texts[type] || type;
};

const closePreview = () => {
  visible.value = false;
};

// 重置答案
watch(visible, (val) => {
  if (val) {
    answers.value = {};
    multiAnswers.value = {};
  }
});
</script>

<style scoped>
.preview-dialog :deep(.el-dialog__body) {
  max-height: 70vh;
  overflow-y: auto;
  padding: 0;
}

.preview-banner {
  padding: 16px 20px;
  border-bottom: 1px solid #e4e7ed;
  background: #f5f7fa;
}

.preview-content {
  padding: 20px;
}

.survey-header {
  margin-bottom: 24px;
  text-align: center;
}

.survey-header h2 {
  margin: 0 0 8px 0;
  color: #303133;
}

.survey-desc {
  margin: 0;
  color: #606266;
  font-size: 14px;
}

.survey-form {
  max-width: 100%;
}

.question-card {
  margin-bottom: 20px;
}

.question-header {
  display: flex;
  align-items: flex-start;
  gap: 8px;
  flex-wrap: wrap;
}

.question-number {
  font-weight: 600;
  color: #667eea;
}

.question-title {
  flex: 1;
  font-weight: 500;
  min-width: 100px;
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

.unknown-type {
  padding: 10px;
  background: #fdf6ec;
  border-radius: 4px;
}

@media (max-width: 768px) {
  .preview-dialog :deep(.el-dialog) {
    width: 95% !important;
    margin: 5vh auto !important;
  }
  
  .preview-content {
    padding: 10px;
  }
  
  .question-card {
    margin-bottom: 15px;
  }
}
</style>
