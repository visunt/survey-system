<template>
  <div class="survey-result">
    <div class="result-card">
      <div class="icon">
        <el-icon size="80" color="#67c23a"><SuccessFilled /></el-icon>
      </div>
      <h2>Thank You!</h2>
      <p>Your response has been submitted successfully.</p>
      <el-button type="primary" @click="close">Close</el-button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router';

const router = useRouter();

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
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
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
    margin-bottom: 20px;
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
}
</style>
