<template>
  <div class="thank-you-page">
    <el-card class="thank-you-card">
      <div class="thank-you-content">
        <!-- 感谢图标/动画 -->
        <div class="success-icon-wrapper">
          <el-icon class="success-icon" :size="80">
            <CircleCheckFilled />
          </el-icon>
        </div>

        <!-- 感谢文案 -->
        <h1 class="thank-you-title">感谢您的参与！</h1>
        
        <!-- 问卷标题 -->
        <p v-if="surveyTitle" class="survey-title-display">{{ surveyTitle }}</p>
        
        <p class="thank-you-message">您的回答已成功提交</p>

        <!-- 按钮组 -->
        <div class="action-buttons">
          <el-button type="primary" size="large" @click="goToSurveyList">
            <el-icon><List /></el-icon>
            <span>返回问卷列表</span>
          </el-button>
          
          <el-button size="large" @click="takeAnotherSurvey">
            <el-icon><Edit /></el-icon>
            <span>继续填写其他问卷</span>
          </el-button>
        </div>

        <!-- 装饰元素 -->
        <div class="decorations">
          <span class="decoration">🎉</span>
          <span class="decoration">✨</span>
          <span class="decoration">🎊</span>
        </div>
      </div>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { CircleCheckFilled, List, Edit } from '@element-plus/icons-vue';
import { surveyAPI } from '../api/survey';

const router = useRouter();
const route = useRoute();
const surveyTitle = ref<string>('');

const loadSurveyTitle = async () => {
  try {
    const id = route.params.id as string;
    const response = await surveyAPI.getSurveyById(id);
    surveyTitle.value = response.data.title;
  } catch (error) {
    console.error('Failed to load survey title:', error);
  }
};

const goToSurveyList = () => {
  router.push('/surveys');
};

const takeAnotherSurvey = () => {
  router.push('/surveys');
};

onMounted(() => {
  loadSurveyTitle();
});
</script>

<style scoped>
.thank-you-page {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: calc(100vh - 120px);
  padding: 20px;
}

.thank-you-card {
  max-width: 600px;
  width: 100%;
  border-radius: 16px;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.08);
}

.thank-you-content {
  text-align: center;
  padding: 40px 20px;
}

.success-icon-wrapper {
  margin-bottom: 30px;
  animation: scale-in 0.5s ease-out;
}

.success-icon {
  color: #67c23a;
  filter: drop-shadow(0 4px 12px rgba(103, 194, 58, 0.3));
}

@keyframes scale-in {
  0% {
    transform: scale(0);
    opacity: 0;
  }
  50% {
    transform: scale(1.1);
  }
  100% {
    transform: scale(1);
    opacity: 1;
  }
}

.thank-you-title {
  font-size: 32px;
  font-weight: 700;
  color: #303133;
  margin: 0 0 20px 0;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.survey-title-display {
  font-size: 18px;
  color: #606266;
  margin: 0 0 10px 0;
  font-weight: 500;
}

.thank-you-message {
  font-size: 16px;
  color: #909399;
  margin: 0 0 40px 0;
}

.action-buttons {
  display: flex;
  flex-direction: column;
  gap: 16px;
  align-items: center;
}

.action-buttons .el-button {
  min-width: 280px;
  height: 48px;
  font-size: 16px;
  border-radius: 8px;
}

.action-buttons .el-button .el-icon {
  margin-right: 8px;
}

.decorations {
  margin-top: 40px;
  font-size: 32px;
  animation: bounce 1s ease-in-out infinite;
}

.decoration {
  display: inline-block;
  margin: 0 8px;
}

.decoration:nth-child(2) {
  animation-delay: 0.2s;
}

.decoration:nth-child(3) {
  animation-delay: 0.4s;
}

@keyframes bounce {
  0%, 100% {
    transform: translateY(0);
  }
  50% {
    transform: translateY(-10px);
  }
}

@media (max-width: 768px) {
  .thank-you-page {
    padding: 10px;
  }

  .thank-you-content {
    padding: 30px 15px;
  }

  .thank-you-title {
    font-size: 28px;
  }

  .action-buttons .el-button {
    min-width: 100%;
  }

  .decorations {
    font-size: 24px;
  }
}
</style>
