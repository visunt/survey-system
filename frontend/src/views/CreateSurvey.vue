<template>
  <div class="create-survey">
    <el-page-header @back="goBack" class="page-header">
      <template #content>
        <h2>{{ isEdit ? '编辑问卷' : '创建问卷' }}</h2>
      </template>
    </el-page-header>

    <el-form :model="survey" label-width="100px" class="survey-form" label-position="top">
      <el-card class="info-card">
        <template #header>
          <h3>问卷信息</h3>
        </template>
        <el-row :gutter="20">
          <el-col :xs="24" :sm="24" :md="24" :lg="24">
            <el-form-item label="问卷标题" required>
              <el-input v-model="survey.title" placeholder="请输入问卷标题" />
            </el-form-item>
          </el-col>
          <el-col :xs="24" :sm="24" :md="24" :lg="24">
            <el-form-item label="问卷描述">
              <el-input
                v-model="survey.description"
                type="textarea"
                :rows="3"
                placeholder="请输入问卷描述"
              />
            </el-form-item>
          </el-col>
          <el-col :xs="24" :sm="12" :md="12" :lg="12">
            <el-form-item label="匿名设置">
              <el-checkbox v-model="survey.allowAnonymous">允许匿名填写</el-checkbox>
            </el-form-item>
          </el-col>
          <el-col :xs="24" :sm="12" :md="12" :lg="12">
            <el-form-item label="登录设置">
              <el-checkbox v-model="survey.requireLogin">需要登录后填写</el-checkbox>
            </el-form-item>
          </el-col>
        </el-row>
      </el-card>

      <el-card class="questions-card">
        <template #header>
          <div class="card-header">
            <h3>题目列表</h3>
            <el-button type="primary" :icon="Plus" @click="addQuestion">
              新增题目
            </el-button>
          </div>
        </template>

        <div v-if="survey.questions!.length === 0" class="empty-questions">
          <el-empty description="暂无题目，点击上方按钮添加题目" />
        </div>

        <div v-else class="questions-list">
          <div
            v-for="(question, index) in survey.questions"
            :key="question.id"
            class="question-item"
            :class="{ 'is-expanded': expandedQuestions.has(question.id) }"
          >
            <div class="question-header" @click="toggleQuestion(question.id)">
              <div class="question-info">
                <span class="question-number">{{ index + 1 }}.</span>
                <el-input
                  v-model="question.title"
                  placeholder="请输入题目内容"
                  class="title-input-inline"
                  @click.stop
                />
                <el-checkbox v-model="question.isRequired" size="small" @click.stop>必填</el-checkbox>
                <el-tag size="small" type="info">{{ getQuestionTypeText(question.type) }}</el-tag>
              </div>
            </div>

            <el-collapse-transition>
              <div v-show="expandedQuestions.has(question.id)" class="question-body">
                <div class="question-main-row">
                  <div class="type-select-group">
                    <el-radio-group v-model="question.type" @change="onQuestionTypeChange(question)" size="small">
                      <el-radio-button value="single_choice">单选题</el-radio-button>
                      <el-radio-button value="multiple_choice">多选题</el-radio-button>
                      <el-radio-button value="dropdown_single">下拉单选</el-radio-button>
                      <el-radio-button value="dropdown_multiple">下拉多选</el-radio-button>
                      <el-radio-button value="text">文本题</el-radio-button>
                      <el-radio-button value="textarea">文本域</el-radio-button>
                      <el-radio-button value="rating">评分题</el-radio-button>
                      <el-radio-button value="date">日期题</el-radio-button>
                      <el-radio-button value="switch">开关题</el-radio-button>
                    </el-radio-group>
                  </div>
                </div>

                </div>
              </div>
            </el-collapse-transition>

            <!-- 悬浮操作按钮 -->
            <div class="question-float-actions">
              <el-button-group>
                <el-tooltip content="上移" placement="top">
                  <el-button type="primary" :icon="Top" circle size="small" @click.stop="moveQuestion(index, -1)" :disabled="index === 0" />
                </el-tooltip>
                <el-tooltip content="下移" placement="top">
                  <el-button type="primary" :icon="Bottom" circle size="small" @click.stop="moveQuestion(index, 1)" :disabled="index === survey.questions!.length - 1" />
                </el-tooltip>
                <el-tooltip content="新增题目" placement="top">
                  <el-button type="primary" :icon="Plus" circle size="small" @click.stop="insertQuestionAfter(index)" />
                </el-tooltip>
                <el-tooltip content="删除题目" placement="top">
                  <el-button type="danger" :icon="Delete" circle size="small" @click.stop="removeQuestion(index)" />
                </el-tooltip>
              </el-button-group>
            </div>
          </div>
        </div>
      </el-card>

      <div class="actions">
        <el-button @click="goBack">取消</el-button>
        <el-button type="primary" @click="saveDraft" :loading="saving">保存草稿</el-button>
        <el-button type="success" @click="publishSurvey" :loading="publishing">发布问卷</el-button>
      </div>
    </el-form>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { ElMessage } from 'element-plus';
import { Delete, Plus, InfoFilled, Top, Bottom } from '@element-plus/icons-vue';
import { surveyAPI, type Survey, type Question, type QuestionOption } from '../api/survey';

const router = useRouter();
const route = useRoute();

const isEdit = ref(false);
const saving = ref(false);
const publishing = ref(false);
const expandedQuestions = ref<Set<number>>(new Set());

const survey = reactive<Partial<Survey>>({
  title: '',
  description: '',
  allowAnonymous: false,
  requireLogin: true,
  questions: [],
});

let questionIdCounter = 0;
let optionIdCounter = 0;

const goBack = () => {
  router.back();
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

const toggleQuestion = (questionId: number) => {
  if (expandedQuestions.value.has(questionId)) {
    expandedQuestions.value.delete(questionId);
  } else {
    expandedQuestions.value.add(questionId);
  }
};

const addQuestion = () => {
  const newQuestion: any = {
    id: questionIdCounter--,
    title: '',
    type: 'single_choice',
    isRequired: true,
    orderIndex: survey.questions!.length,
    options: [],
    inputMode: 'batch',
    batchText: '',
  };
  survey.questions!.push(newQuestion);
  expandedQuestions.value.add(newQuestion.id);
};

const onQuestionTypeChange = (question: any) => {
  const needsOptions = ['single_choice', 'multiple_choice', 'dropdown_single', 'dropdown_multiple'].includes(question.type);
  if (needsOptions && !question.options) {
    question.options = [];
    question.batchText = '';
  } else if (!needsOptions) {
    question.options = undefined;
    question.inputMode = undefined;
    question.batchText = undefined;
  }
};

const changeQuestionType = (question: any, type: string) => {
  question.type = type;
  onQuestionTypeChange(question);
};

const changeInputMode = (question: any, mode: string) => {
  if (question.inputMode === mode) return;
  
  const oldMode = question.inputMode;
  question.inputMode = mode;
  
  if (mode === 'single' && oldMode === 'batch' && question.batchText && question.batchText.trim()) {
    parseBatchOptions(survey.questions!.indexOf(question), false);
  } else if (mode === 'batch' && oldMode === 'single') {
    if (question.options && question.options.length > 0) {
      question.batchText = question.options.map((o: any) => o.text).join('\n');
    }
  }
};

const moveQuestion = (index: number, direction: number) => {
  const newIndex = index + direction;
  if (newIndex < 0 || newIndex >= survey.questions!.length) return;
  
  const questions = survey.questions!;
  [questions[index], questions[newIndex]] = [questions[newIndex], questions[index]];
  questions.forEach((q: any, i: number) => {
    q.orderIndex = i;
  });
};

const removeQuestion = (index: number) => {
  const question = survey.questions![index];
  expandedQuestions.value.delete(question.id);
  survey.questions!.splice(index, 1);
  survey.questions!.forEach((q: any, i: number) => {
    q.orderIndex = i;
  });
};

const insertQuestionAfter = (index: number) => {
  const newQuestion: any = {
    id: questionIdCounter--,
    title: '',
    type: 'single_choice',
    isRequired: true,
    orderIndex: index + 1,
    options: [],
    inputMode: 'batch',
    batchText: '',
  };
  survey.questions!.splice(index + 1, 0, newQuestion);
  survey.questions!.forEach((q: any, i: number) => {
    q.orderIndex = i;
  });
  expandedQuestions.value.add(newQuestion.id);
};

const addOption = (questionIndex: number) => {
  const question = survey.questions![questionIndex] as any;
  if (!question.options) {
    question.options = [];
  }
  question.options.push({
    id: optionIdCounter--,
    text: '',
    orderIndex: question.options.length,
  });
  
  if (question.inputMode === 'single') {
    updateBatchTextFromOptions(question);
  }
};

const removeOption = (questionIndex: number, optionIndex: number) => {
  const question = survey.questions![questionIndex] as any;
  question.options!.splice(optionIndex, 1);
  question.options!.forEach((o: any, i: number) => {
    o.orderIndex = i;
  });
  
  if (question.inputMode === 'single') {
    updateBatchTextFromOptions(question);
  }
};

const parseBatchOptions = (questionIndex: number, append: boolean = false) => {
  const question = survey.questions![questionIndex] as any;
  if (!question.batchText) return;
  
  const lines = question.batchText
    .split('\n')
    .map((line: string) => line.trim())
    .filter((line: string) => line.length > 0);

  if (lines.length === 0) return;

  const newOptions = lines.map((text: string, index: number) => ({
    id: optionIdCounter--,
    text,
    orderIndex: index,
  }));
  
  if (append) {
    const existingOptions = question.options || [];
    question.options = [...existingOptions, ...newOptions];
  } else {
    question.options = newOptions;
  }
};

const updateBatchTextFromOptions = (question: any) => {
  if (question.options && question.options.length > 0) {
    question.batchText = question.options.map((o: any) => o.text).join('\n');
  }
};

const saveDraft = async () => {
  if (!survey.title?.trim()) {
    ElMessage.warning('请输入问卷标题');
    return;
  }

  try {
    saving.value = true;
    if (isEdit.value) {
      const id = route.params.id as string;
      await surveyAPI.updateSurvey(id, { ...survey, status: 'draft' } as Survey);
      ElMessage.success('保存成功');
    } else {
      await surveyAPI.createSurvey({ ...survey, status: 'draft' } as Survey);
      ElMessage.success('创建成功');
      router.push('/surveys');
    }
  } catch (error: any) {
    ElMessage.error(error.response?.data?.error || '保存失败');
  } finally {
    saving.value = false;
  }
};

const publishSurvey = async () => {
  if (!survey.title?.trim()) {
    ElMessage.warning('请输入问卷标题');
    return;
  }

  if (!survey.questions || survey.questions.length === 0) {
    ElMessage.warning('请至少添加一道题目');
    return;
  }

  for (const question of survey.questions as any[]) {
    if (!question.title?.trim()) {
      ElMessage.warning('请填写所有题目的标题');
      return;
    }
    if (['single_choice', 'multiple_choice', 'dropdown_single', 'dropdown_multiple'].includes(question.type)) {
      if (question.inputMode === 'batch' && question.batchText) {
        parseBatchOptions(survey.questions!.indexOf(question));
      }
      if (!question.options || question.options.length === 0) {
        ElMessage.warning('选择题至少需要一个选项');
        return;
      }
      if (question.options.some((o: any) => !o.text?.trim())) {
        ElMessage.warning('请填写所有选项的内容');
        return;
      }
    }
  }

  try {
    publishing.value = true;
    let surveyId: string;

    if (isEdit.value) {
      const id = route.params.id as string;
      await surveyAPI.updateSurvey(id, { ...survey, status: 'published' } as Survey);
      surveyId = id;
    } else {
      const response = await surveyAPI.createSurvey({ ...survey, status: 'published' } as Survey);
      surveyId = response.data.id!;
    }

    ElMessage.success('发布成功');
    router.push(`/surveys/${surveyId}`);
  } catch (error: any) {
    ElMessage.error(error.response?.data?.error || '发布失败');
  } finally {
    publishing.value = false;
  }
};

const loadSurvey = async () => {
  if (route.name === 'EditSurvey') {
    isEdit.value = true;
    try {
      const id = route.params.id as string;
      const response = await surveyAPI.getSurveyById(id);
      const data = response.data;

      survey.title = data.title;
      survey.description = data.description;
      survey.allowAnonymous = data.allowAnonymous;
      survey.requireLogin = data.requireLogin;
      survey.questions = (data.questions || []).map((q: any) => ({
        ...q,
        inputMode: 'single',
        batchText: '',
      }));
      
      // 展开所有已加载的题目
      survey.questions?.forEach((q: any) => {
        expandedQuestions.value.add(q.id);
      });
    } catch (error) {
      console.error('Failed to load survey:', error);
      ElMessage.error('加载问卷失败');
    }
  }
};

onMounted(() => {
  loadSurvey();
});
</script>

<style scoped>
.create-survey {
  padding: 20px 0;
  max-width: 1200px;
  margin: 0 auto;
}

.page-header {
  margin-bottom: 20px;
}

.page-header h2 {
  margin: 0;
}

.survey-form {
  padding: 0 20px;
}

.info-card {
  margin-bottom: 20px;
}

.info-card h3 {
  margin: 0;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 12px;
}

.card-header h3 {
  margin: 0;
}

.questions-card {
  margin-bottom: 20px;
}

.empty-questions {
  padding: 40px 0;
}

.questions-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
  margin-top: 20px;
}

.question-item {
  border: 1px solid #e4e7ed;
  border-radius: 8px;
  background: #fff;
  overflow: hidden;
  transition: box-shadow 0.3s;
  position: relative;
}

.question-item:hover {
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
}

.question-item.is-expanded {
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.12);
}

.question-float-actions {
  position: absolute;
  right: 0;
  bottom: 0;
  display: flex;
  gap: 6px;
  opacity: 0;
  transition: opacity 0.2s ease;
  z-index: 10;
}

.question-float-actions .el-button-group {
  background: rgba(255, 255, 255, 0.95);
  border-radius: 12px;
  padding: 4px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.question-item:hover .question-float-actions {
  opacity: 1;
}

.question-float-actions .el-button {
  box-shadow: none;
  transition: all 0.2s ease;
}

.question-float-actions .el-button:hover {
  transform: scale(1.1);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
}

.question-float-actions .el-button--primary {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}

.question-float-actions .el-button--danger {
  background: linear-gradient(135deg, #f5576c 0%, #f093fb 100%);
}

.question-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px;
  cursor: pointer;
  background: #fafafa;
  transition: background 0.3s;
}

.question-header:hover {
  background: #f0f2f5;
}

.question-info {
  display: flex;
  align-items: center;
  gap: 12px;
  flex: 1;
  min-width: 0;
  flex-wrap: wrap;
}

.question-number {
  font-weight: 600;
  color: #667eea;
  min-width: 24px;
  flex-shrink: 0;
  height: 32px;
  display: flex;
  align-items: center;
}

.question-title-preview {
  flex: 1;
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  color: #303133;
  height: 32px;
  display: flex;
  align-items: center;
}

.title-input-inline {
  flex: 1;
  height: 32px;
  display: flex;
  align-items: center;
}

.title-input-inline :deep(.el-input__wrapper) {
  height: 100%;
  display: flex;
  align-items: center;
}

.title-input-inline :deep(.el-input__inner) {
  height: 100%;
  display: flex;
  align-items: center;
}

.title-input-inline :deep(.el-input__inner input) {
  height: 100%;
  padding: 0 12px;
  line-height: normal;
}

.title-input-inline :deep(.el-tag) {
  margin-left: 8px;
  flex-shrink: 0;
  height: 24px;
  display: inline-flex;
  align-items: center;
}

.title-input-inline :deep(.el-checkbox) {
  margin-left: 8px;
  flex-shrink: 0;
}

.question-actions {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-shrink: 0;
}

.question-body {
  padding: 20px;
  border-top: 1px solid #e4e7ed;
  background: #fff;
}

.question-main-row {
  display: flex;
  gap: 16px;
  align-items: flex-start;
  flex-wrap: wrap;
}

.question-main-row .el-form-item {
  margin-bottom: 16px;
}

.title-input-item {
  flex: 1;
  min-width: 200px;
}

.type-input-item {
  flex-shrink: 0;
}

.required-input-item {
  flex-shrink: 0;
  margin-top: 24px;
}

.type-select-group {
  flex: 1;
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.type-select-group .el-radio-button {
  flex-shrink: 0;
}

.options-config {
  margin-top: 16px;
  padding: 16px;
  background: #fafafa;
  border-radius: 8px;
}

.options-header {
  margin-bottom: 12px;
}

.single-mode {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.option-item {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
}

.option-label {
  color: #666;
  min-width: 24px;
  flex-shrink: 0;
}

.option-input {
  flex: 1;
  min-width: 200px;
}

.batch-mode {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.batch-tips {
  display: flex;
  align-items: center;
  gap: 6px;
  color: #909399;
  font-size: 12px;
}

.actions {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  margin-top: 40px;
  padding: 0 20px 20px;
  flex-wrap: wrap;
}

@media (max-width: 768px) {
  .create-survey {
    padding: 10px 0;
  }

  .survey-form {
    padding: 0 10px;
  }

  .question-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 12px;
  }

  .question-info {
    width: 100%;
    flex-wrap: wrap;
  }

  .question-title-preview {
    width: 100%;
    order: 3;
  }

  .question-actions {
    width: 100%;
    justify-content: flex-end;
  }

  .option-item {
    flex-direction: column;
    align-items: flex-start;
  }

  .option-input {
    width: 100%;
  }

  .actions {
    flex-direction: column;
    padding: 0 10px 10px;
  }

  .actions .el-button {
    width: 100%;
  }
}

@media (min-width: 769px) and (max-width: 1024px) {
  .survey-form {
    padding: 0 40px;
  }
}
</style>
