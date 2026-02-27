<template>
  <div class="survey-fill">
    <div v-if="!survey.title" class="loading">
      {{ $t('survey.loading') }}
    </div>

    <template v-else>
      <div class="header">
        <h1>{{ survey.title }}</h1>
        <p v-if="survey.description">{{ survey.description }}</p>
      </div>

      <form @submit.prevent="submit" class="form">
        <div v-for="question in sortedQuestions" :key="question.id" class="question-item">
          <div class="question-title">
            {{ question.order + 1 }}. {{ question.title }}
            <span v-if="question.required" class="required">* {{ $t('question.required') }}</span>
          </div>
          <div v-if="question.description" class="question-desc">
            {{ question.description }}
          </div>

          <!-- Single choice -->
          <div v-if="question.type === 'single'" class="options">
            <label v-for="opt in question.options" :key="opt" class="option-label">
              <input
                type="radio"
                :name="`q${question.id}`"
                v-model="form[`q${question.id}`]"
                :value="opt"
              />
              <span>{{ opt }}</span>
            </label>
          </div>

          <!-- Multiple choice -->
          <div v-else-if="question.type === 'multiple'" class="options">
            <label v-for="opt in question.options" :key="opt" class="option-label">
              <input
                type="checkbox"
                v-model="form[`q${question.id}`]"
                :value="opt"
              />
              <span>{{ opt }}</span>
            </label>
          </div>

          <!-- Text input -->
          <textarea
            v-else-if="question.type === 'text'"
            v-model="form[`q${question.id}`]"
            class="text-input"
            :placeholder="$t('common.loading')"
          ></textarea>

          <!-- Rating -->
          <div v-else-if="question.type === 'rating'" class="rating">
            <span
              v-for="i in (question.max || 5)"
              :key="i"
              class="star"
              :class="{ active: (form[`q${question.id}`] || 0) >= i }"
              @click="setRating(question.id, i)"
            >
              ★
            </span>
          </div>
          <div v-if="errors[`q${question.id}`]" class="error">{{ errors[`q${question.id}`] }}</div>
        </div>
      </form>

      <div class="footer">
        <button class="submit-btn" :disabled="submitting" @click="submit">
          {{ submitting ? $t('submit.submitting') : $t('submit.btn') }}
        </button>
      </div>

      <div v-if="showConfirm" class="modal-overlay" @click="showConfirm = false">
        <div class="modal" @click.stop>
          <h3>{{ $t('submit.confirmTitle') }}</h3>
          <p>{{ $t('submit.confirm') }}</p>
          <div class="modal-actions">
            <button @click="showConfirm = false">{{ $t('submit.cancel') }}</button>
            <button class="primary" @click="confirmSubmit">{{ $t('submit.btn') }}</button>
          </div>
        </div>
      </div>
    </template>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { surveyApi, responseApi, type Survey, type Question } from '@/api/survey';
import { useI18n } from 'vue-i18n';

const route = useRoute();
const router = useRouter();
const { t } = useI18n();

const survey = ref<Partial<Survey>>({});
const form = reactive<Record<string, any>>({});
const errors = reactive<Record<string, string>>({});
const submitting = ref(false);
const showConfirm = ref(false);

const sortedQuestions = computed(() => {
  if (!survey.value.questions) return [];
  return [...survey.value.questions].sort((a, b) => a.order - b.order);
});

onMounted(() => {
  const id = route.params.id as string;
  if (id) {
    loadSurvey(Number(id));
  }
});

async function loadSurvey(id: number) {
  try {
    const res = await surveyApi.get(id);
    survey.value = res;

    // Initialize form
    res.questions?.forEach((q: Question) => {
      const key = `q${q.id}`;
      if (q.type === 'multiple') {
        form[key] = [];
      }
    });
  } catch (error) {
    alert(t('survey.notFound'));
  }
}

function setRating(questionId: number, value: number) {
  form[`q${questionId}`] = value;
}

function submit() {
  // Validate required fields
  let hasError = false;
  survey.value.questions?.forEach((q: Question) => {
    const key = `q${q.id}`;
    if (q.required && !form[key]) {
      errors[key] = t('question.requiredTip');
      hasError = true;
    } else {
      delete errors[key];
    }
  });

  if (hasError) return;
  showConfirm.value = true;
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
    alert(`${t('submit.success')}\n${t('submit.successDesc')}`);
    router.push(`/survey/${survey.value.id}/result`);
  } catch (error) {
    alert(t('submit.failed'));
  } finally {
    submitting.value = false;
  }
}
</script>

<style lang="scss" scoped>
.survey-fill {
  min-height: 100vh;
  background: #f5f5f5;
  padding-bottom: 80px;
}

.loading {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100vh;
  font-size: 16px;
  color: #999;
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

.options {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.option-label {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 15px;
  cursor: pointer;

  input {
    cursor: pointer;
  }
}

.text-input {
  width: 100%;
  min-height: 120px;
  padding: 12px;
  border: 1px solid #e4e7ed;
  border-radius: 8px;
  font-size: 15px;
  font-family: inherit;
  resize: vertical;

  &:focus {
    outline: none;
    border-color: #667eea;
  }
}

.rating {
  display: flex;
  gap: 8px;

  .star {
    font-size: 36px;
    color: #e4e7ed;
    cursor: pointer;
    user-select: none;

    &.active {
      color: #f7ba2a;
    }
  }
}

.error {
  color: #f56c6c;
  font-size: 13px;
  margin-top: 8px;
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
}

.submit-btn {
  width: 200px;
  height: 44px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: #fff;
  font-size: 16px;
  border: none;
  border-radius: 22px;
  cursor: pointer;

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
}

.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.modal {
  background: #fff;
  border-radius: 12px;
  padding: 24px;
  width: 90%;
  max-width: 400px;

  h3 {
    margin: 0 0 12px;
    font-size: 18px;
  }

  p {
    margin: 0 0 24px;
    color: #666;
  }
}

.modal-actions {
  display: flex;
  gap: 12px;
  justify-content: flex-end;

  button {
    padding: 8px 24px;
    border: 1px solid #e4e7ed;
    background: #fff;
    border-radius: 6px;
    cursor: pointer;

    &.primary {
      background: #667eea;
      color: #fff;
      border-color: #667eea;
    }
  }
}
</style>
