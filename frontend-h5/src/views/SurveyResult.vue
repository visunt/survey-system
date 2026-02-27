<template>
  <div class="survey-result">
    <div class="result-card">
      <div class="icon">✓</div>
      <h2>{{ $t('submit.success') }}</h2>
      <p>{{ $t('submit.successDesc') }}</p>
      <button class="close-btn" @click="close">{{ $t('submit.close') }}</button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router';
import { useI18n } from 'vue-i18n';

const router = useRouter();
const { t } = useI18n();

function close() {
  // Close window or redirect
  if (window.history.length > 1) {
    router.back();
  } else {
    window.close();
  }
}
</script>

<style lang="scss" scoped>
.survey-result {
  min-height: 100vh;
  background: linear-gradient(135deg, #67c23a 0%, #85ce61 100%);
  display: flex;
  align-items: center;
  justify-content: center;
}

.result-card {
  background: #fff;
  border-radius: 16px;
  padding: 40px;
  text-align: center;
  width: 90%;
  max-width: 400px;

  .icon {
    font-size: 80px;
    color: #67c23a;
    margin-bottom: 20px;
    line-height: 1;
  }

  h2 {
    font-size: 24px;
    margin-bottom: 12px;
    color: #333;
  }

  p {
    font-size: 16px;
    color: #666;
    margin-bottom: 30px;
  }

  .close-btn {
    padding: 12px 40px;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    color: #fff;
    font-size: 16px;
    border: none;
    border-radius: 24px;
    cursor: pointer;
  }
}
</style>
