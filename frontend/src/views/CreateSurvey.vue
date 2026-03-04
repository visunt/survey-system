<template>
  <div class="create-survey">
    <el-page-header @back="goBack" class="page-header">
      <template #content>
        <h2>{{ isEdit ? '编辑问卷' : '创建问卷' }}</h2>
      </template>
    </el-page-header>

    <el-form :model="survey" label-width="100px" class="survey-form">
      <el-card class="info-card">
        <h3>问卷信息</h3>
        <el-form-item label="问卷标题" required>
          <el-input v-model="survey.title" placeholder="请输入问卷标题" />
        </el-form-item>
        <el-form-item label="问卷描述">
          <el-input
            v-model="survey.description"
            type="textarea"
            :rows="3"
            placeholder="请输入问卷描述"
          />
        </el-form-item>
        <el-form-item label="匿名设置">
          <el-checkbox v-model="survey.allowAnonymous">允许匿名填写</el-checkbox>
        </el-form-item>
        <el-form-item label="登录设置">
          <el-checkbox v-model="survey.requireLogin">需要登录后填写</el-checkbox>
        </el-form-item>
      </el-card>

      <el-card class="questions-card">
        <template #header>
          <div class="card-header">
            <h3>题目列表</h3>
            <el-dropdown trigger="click">
              <el-button type="primary">
                添加题目 <el-icon><ArrowDown /></el-icon>
              </el-button>
              <template #dropdown>
                <el-dropdown-menu>
                  <el-dropdown-item @click="addQuestion('single_choice')">单选题</el-dropdown-item>
                  <el-dropdown-item @click="addQuestion('multiple_choice')">多选题</el-dropdown-item>
                  <el-dropdown-item @click="addQuestion('text')">文本题</el-dropdown-item>
                  <el-dropdown-item @click="addQuestion('textarea')">文本域</el-dropdown-item>
                  <el-dropdown-item @click="addQuestion('rating')">评分题</el-dropdown-item>
                  <el-dropdown-item @click="addQuestion('date')">日期题</el-dropdown-item>
                </el-dropdown-menu>
              </template>
            </el-dropdown>
          </div>
        </template>

        <div v-if="survey.questions!.length === 0" class="empty-questions">
          <el-empty description="暂无题目，请添加题目" />
        </div>

        <div v-else class="questions-list">
          <div
            v-for="(question, index) in survey.questions"
            :key="question.id"
            class="question-item"
          >
            <div class="question-header">
              <span class="question-number">{{ index + 1 }}.</span>
              <el-input
                v-model="question.title"
                placeholder="请输入题目"
                class="question-title-input"
              />
              <el-checkbox v-model="question.isRequired">必填</el-checkbox>
              <el-button type="danger" :icon="Delete" circle size="small" @click="removeQuestion(index)" />
            </div>

            <div class="question-type-label">
              {{ getQuestionTypeText(question.type) }}
            </div>

            <!-- 选项配置 -->
            <div v-if="['single_choice', 'multiple_choice'].includes(question.type)" class="options-config">
              <div v-for="(option, oIndex) in question.options" :key="oIndex" class="option-item">
                <span class="option-label">{{ String.fromCharCode(65 + oIndex) }}.</span>
                <el-input v-model="option.text" placeholder="请输入选项内容" class="option-input" />
                <el-button
                  type="danger"
                  :icon="Delete"
                  circle
                  size="small"
                  @click="removeOption(index, oIndex)"
                />
              </div>
              <el-button type="primary" :icon="Plus" size="small" @click="addOption(index)">
                添加选项
              </el-button>
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
import { ArrowDown, Delete, Plus } from '@element-plus/icons-vue';
import { surveyAPI, type Survey, type Question, type QuestionOption } from '../api/survey';

const router = useRouter();
const route = useRoute();

const isEdit = ref(false);
const saving = ref(false);
const publishing = ref(false);

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
    text: '文本题',
    textarea: '文本域',
    rating: '评分题',
    date: '日期题',
  };
  return texts[type] || type;
};

const addQuestion = (type: string) => {
  const newQuestion: Question = {
    id: questionIdCounter--,
    title: '',
    type: type as any,
    isRequired: true,
    orderIndex: survey.questions!.length,
    options: ['single_choice', 'multiple_choice'].includes(type) ? [] : undefined,
  };
  survey.questions!.push(newQuestion);
};

const removeQuestion = (index: number) => {
  survey.questions!.splice(index, 1);
  // 更新orderIndex
  survey.questions!.forEach((q, i) => {
    q.orderIndex = i;
  });
};

const addOption = (questionIndex: number) => {
  const question = survey.questions![questionIndex];
  if (!question.options) {
    question.options = [];
  }
  question.options.push({
    id: optionIdCounter--,
    text: '',
    orderIndex: question.options.length,
  });
};

const removeOption = (questionIndex: number, optionIndex: number) => {
  const question = survey.questions![questionIndex];
  question.options!.splice(optionIndex, 1);
  // 更新orderIndex
  question.options!.forEach((o, i) => {
    o.orderIndex = i;
  });
};

const saveDraft = async () => {
  if (!survey.title?.trim()) {
    ElMessage.warning('请输入问卷标题');
    return;
  }

  try {
    saving.value = true;
    if (isEdit.value) {
      const id = Number(route.params.id);
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

  // 验证题目
  for (const question of survey.questions) {
    if (!question.title?.trim()) {
      ElMessage.warning('请填写所有题目的标题');
      return;
    }
    if (['single_choice', 'multiple_choice'].includes(question.type)) {
      if (!question.options || question.options.length === 0) {
        ElMessage.warning('选择题至少需要两个选项');
        return;
      }
      if (question.options.some((o) => !o.text?.trim())) {
        ElMessage.warning('请填写所有选项的内容');
        return;
      }
    }
  }

  try {
    publishing.value = true;
    let surveyId: number;

    if (isEdit.value) {
      const id = Number(route.params.id);
      const response = await surveyAPI.updateSurvey(id, { ...survey, status: 'published' } as Survey);
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
      const id = Number(route.params.id);
      const response = await surveyAPI.getSurveyById(id);
      const data = response.data;

      survey.title = data.title;
      survey.description = data.description;
      survey.allowAnonymous = data.allowAnonymous;
      survey.requireLogin = data.requireLogin;
      survey.questions = data.questions || [];
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
}

.page-header {
  margin-bottom: 20px;
}

.page-header h2 {
  margin: 0;
}

.survey-form {
  max-width: 900px;
  margin: 0 auto;
}

.info-card {
  margin-bottom: 20px;
}

.info-card h3 {
  margin-top: 0;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
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
  gap: 20px;
  margin-top: 20px;
}

.question-item {
  border: 1px solid #e4e7ed;
  border-radius: 8px;
  padding: 16px;
  background: #fafafa;
}

.question-header {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 12px;
}

.question-number {
  font-weight: 600;
  color: #667eea;
  min-width: 24px;
}

.question-title-input {
  flex: 1;
}

.question-type-label {
  color: #999;
  font-size: 14px;
  margin-bottom: 12px;
}

.options-config {
  margin-top: 12px;
  padding-left: 24px;
}

.option-item {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 8px;
}

.option-label {
  color: #666;
  min-width: 24px;
}

.option-input {
  flex: 1;
}

.actions {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  margin-top: 40px;
}
</style>
