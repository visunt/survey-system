<template>
  <view class="survey-fill">
    <view v-if="!survey.title" class="loading">
      {{ $t('survey.loading') }}
    </view>

    <template v-else>
      <view class="header">
        <text class="title">{{ survey.title }}</text>
        <text v-if="survey.description" class="desc">{{ survey.description }}</text>
      </view>

      <view class="questions">
        <view v-for="(question, idx) in sortedQuestions" :key="question.id" class="question-item">
          <view class="question-title">
            <text>{{ idx + 1 }}. {{ question.title }}</text>
            <text v-if="question.required" class="required">* {{ $t('question.required') }}</text>
          </view>
          <view v-if="question.description" class="question-desc">
            <text>{{ question.description }}</text>
          </view>

          <!-- Single choice -->
          <radio-group v-if="question.type === 'single'" @change="(e) => onRadioChange(question.id, e)">
            <view v-for="opt in question.options" :key="opt" class="option-item">
              <radio :value="opt" :checked="form[`q${question.id}`] === opt" />
              <text>{{ opt }}</text>
            </view>
          </radio-group>

          <!-- Multiple choice -->
          <checkbox-group v-else-if="question.type === 'multiple'" @change="(e) => onCheckboxChange(question.id, e)">
            <view v-for="opt in question.options" :key="opt" class="option-item">
              <checkbox :value="opt" :checked="isOptionSelected(question.id, opt)" />
              <text>{{ opt }}</text>
            </view>
          </checkbox-group>

          <!-- Text input -->
          <textarea
            v-else-if="question.type === 'text'"
            v-model="form[`q${question.id}`]"
            class="text-input"
            :placeholder="$t('common.loading')"
          />

          <!-- Rating -->
          <view v-else-if="question.type === 'rating'" class="rating">
            <view
              v-for="i in (question.max || 5)"
              :key="i"
              class="star"
              :class="{ active: (form[`q${question.id}`] || 0) >= i }"
              @tap="setRating(question.id, i)"
            >
              <text>★</text>
            </view>
          </view>
        </view>
      </view>

      <view class="footer">
        <button class="submit-btn" :disabled="submitting" @tap="submit">
          {{ submitting ? $t('submit.submitting') : $t('submit.btn') }}
        </button>
      </view>

      <uni-popup ref="confirmPopup" type="dialog">
        <uni-popup-dialog
          :title="$t('submit.confirmTitle')"
          :content="$t('submit.confirm')"
          @confirm="confirmSubmit"
          @close="confirmPopup?.close()"
        />
      </uni-popup>
    </template>
  </view>
</template>

<script setup lang="ts">
import { ref, reactive, computed } from 'vue';
import { onLoad } from '@dcloudio/uni-app';
import { surveyApi, responseApi, type Survey, type Question } from '@/api/survey';
import { useI18n } from 'vue-i18n';

const { t } = useI18n();

const confirmPopup = ref();

const survey = ref<Partial<Survey>>({});
const form = reactive<Record<string, any>>({});
const submitting = ref(false);

const sortedQuestions = computed(() => {
  if (!survey.value.questions) return [];
  return [...survey.value.questions].sort((a, b) => a.order - b.order);
});

onLoad((options: any) => {
  if (options.id) {
    loadSurvey(Number(options.id));
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
    uni.showToast({
      title: t('survey.notFound'),
      icon: 'none',
    });
  }
}

function onRadioChange(questionId: number, e: any) {
  form[`q${questionId}`] = e.detail.value;
}

function onCheckboxChange(questionId: number, e: any) {
  form[`q${questionId}`] = e.detail.value;
}

function isOptionSelected(questionId: number, option: string) {
  return form[`q${questionId}`]?.includes(option);
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
      uni.showToast({
        title: t('question.requiredTip'),
        icon: 'none',
      });
      hasError = true;
    }
  });

  if (hasError) return;
  confirmPopup.value?.open();
}

async function confirmSubmit() {
  submitting.value = true;

  const answers = survey.value.questions?.map((q) => ({
    questionId: q.id,
    value: form[`q${q.id}`],
  }));

  try {
    await responseApi.submit(survey.value.id!, answers);
    uni.showToast({
      title: `${t('submit.success')}\n${t('submit.successDesc')}`,
      icon: 'success',
      duration: 3000,
    });
    setTimeout(() => {
      uni.redirectTo({
        url: '/pages/result/index',
      });
    }, 1500);
  } catch (error) {
    uni.showToast({
      title: t('submit.failed'),
      icon: 'none',
    });
  } finally {
    submitting.value = false;
  }
}
</script>

<style lang="scss" scoped>
@import '@/styles/main.scss';

.survey-fill {
  min-height: 100vh;
  background: #f5f5f5;
  padding-bottom: 160rpx;
}

.loading {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100vh;
  font-size: 32rpx;
  color: #999;
}

.header {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: #fff;
  padding: 120rpx 40rpx;
  text-align: center;

  .title {
    display: block;
    font-size: 48rpx;
    font-weight: bold;
    margin-bottom: 20rpx;
  }

  .desc {
    display: block;
    font-size: 28rpx;
    opacity: 0.9;
  }
}

.questions {
  padding: 40rpx;
}

.question-item {
  background: #fff;
  border-radius: 16rpx;
  padding: 40rpx;
  margin-bottom: 32rpx;
}

.question-title {
  font-size: 32rpx;
  font-weight: 500;
  margin-bottom: 16rpx;
  color: #333;

  .required {
    color: #f56c6c;
    margin-left: 8rpx;
  }
}

.question-desc {
  font-size: 28rpx;
  color: #666;
  margin-bottom: 24rpx;
}

.option-item {
  display: flex;
  align-items: center;
  gap: 16rpx;
  font-size: 30rpx;
  padding: 16rpx 0;

  radio, checkbox {
    margin-right: 16rpx;
  }
}

.text-input {
  width: 100%;
  min-height: 240rpx;
  padding: 24rpx;
  border: 1rpx solid #e4e7ed;
  border-radius: 16rpx;
  font-size: 30rpx;
  box-sizing: border-box;
}

.rating {
  display: flex;
  gap: 16rpx;

  .star {
    font-size: 72rpx;
    color: #e4e7ed;

    &.active {
      color: #f7ba2a;
    }
  }
}

.footer {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  background: #fff;
  padding: 24rpx 40rpx;
  box-shadow: 0 -4rpx 20rpx rgba(0, 0, 0, 0.1);
}

.submit-btn {
  width: 100%;
  height: 88rpx;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: #fff;
  font-size: 32rpx;
  border: none;
  border-radius: 44rpx;

  &[disabled] {
    opacity: 0.6;
  }
}
</style>
