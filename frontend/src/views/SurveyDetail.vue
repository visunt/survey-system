<template>
  <div class="survey-detail">
    <el-page-header @back="goBack" class="page-header">
      <template #content>
        <div class="survey-title">
          <h2>{{ survey?.title }}</h2>
          <el-tag :type="getStatusType(survey?.status)">{{ getStatusText(survey?.status) }}</el-tag>
        </div>
      </template>
    </el-page-header>

    <el-empty v-if="loading" description="加载中..." />

    <el-empty v-else-if="!survey" description="问卷不存在" />

    <div v-else class="survey-content">
      <el-card class="survey-info-card">
        <div class="info-row">
          <span class="label">描述：</span>
          <span class="value">{{ survey.description || '暂无描述' }}</span>
        </div>
        <div class="info-row">
          <span class="label">创建者：</span>
          <span class="value">{{ survey.creatorId }}</span>
        </div>
        <div class="info-row">
          <span class="label">创建时间：</span>
          <span class="value">{{ formatDate(survey.createdAt!) }}</span>
        </div>
        <div class="info-row">
          <span class="label">需要登录：</span>
          <span class="value">{{ survey.requireLogin ? '是' : '否' }}</span>
        </div>
        <div class="info-row">
          <span class="label">允许匿名：</span>
          <span class="value">{{ survey.allowAnonymous ? '是' : '否' }}</span>
        </div>
      </el-card>

      <h3>题目列表</h3>
      <el-empty v-if="!survey.questions || survey.questions.length === 0" description="暂无题目" />

      <div v-else class="questions-list">
        <el-card v-for="(question, index) in sortedQuestions" :key="question.id" class="question-card">
          <div class="question-header">
            <span class="question-number">{{ index + 1 }}.</span>
            <span class="question-title">{{ question.title }}</span>
            <el-tag v-if="question.isRequired" type="danger" size="small">必填</el-tag>
          </div>
          <div class="question-type">{{ getQuestionTypeText(question.type) }}</div>
          <div v-if="question.options && question.options.length > 0" class="options-list">
            <div v-for="(option, oIndex) in sortedOptions(question)" :key="option.id" class="option-item">
              <span>{{ String.fromCharCode(65 + oIndex) }}. {{ option.text }}</span>
            </div>
          </div>
        </el-card>
      </div>

      <div class="survey-actions">
        <el-button type="primary" size="large" @click="takeSurvey">填写问卷</el-button>
        <el-button v-if="survey.status === 'published'" type="success" size="large" @click="openShareDialog">
          分享问卷
        </el-button>
      </div>
    </div>

    <!-- 分享弹窗 -->
    <el-dialog v-model="shareDialogVisible" title="分享问卷" width="480px" :close-on-click-modal="false">
      <div class="share-content">
        <div class="share-section">
          <h4>分享链接</h4>
          <div class="share-link-box">
            <el-input v-model="shareLink" readonly>
              <template #append>
                <el-button :icon="DocumentCopy" @click="copyLink">复制</el-button>
              </template>
            </el-input>
          </div>
        </div>

        <div class="share-section">
          <h4>扫码填写</h4>
          <div class="qrcode-container">
            <canvas ref="qrcodeCanvas" class="qrcode-canvas"></canvas>
          </div>
          <div class="qrcode-actions">
            <el-button type="primary" @click="downloadQRCode">下载二维码</el-button>
          </div>
        </div>
      </div>

      <template #footer>
        <el-button @click="shareDialogVisible = false">关闭</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed, nextTick, watch } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { ElMessage } from 'element-plus';
import { DocumentCopy } from '@element-plus/icons-vue';
import QRCode from 'qrcode';
import { surveyAPI, type Survey } from '../api/survey';
import type { Question } from '../api/survey';

const router = useRouter();
const route = useRoute();

const survey = ref<Survey | null>(null);
const loading = ref(true);

// 分享相关
const shareDialogVisible = ref(false);
const shareLink = ref('');
const qrcodeCanvas = ref<HTMLCanvasElement | null>(null);

const sortedQuestions = computed(() => {
  if (!survey.value?.questions) return [];
  return [...survey.value.questions].sort((a, b) => a.orderIndex - b.orderIndex);
});

const sortedOptions = (question: Question) => {
  if (!question.options) return [];
  return [...question.options].sort((a, b) => a.orderIndex - b.orderIndex);
};

const getStatusType = (status?: string) => {
  if (!status) return 'info';
  const types: Record<string, any> = {
    published: 'success',
    draft: 'info',
    closed: 'warning',
  };
  return types[status] || 'info';
};

const getStatusText = (status?: string) => {
  if (!status) return '';
  const texts: Record<string, string> = {
    published: '已发布',
    draft: '草稿',
    closed: '已关闭',
  };
  return texts[status] || status;
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

const formatDate = (date: string) => {
  return new Date(date).toLocaleString('zh-CN');
};

const goBack = () => {
  router.back();
};

const takeSurvey = () => {
  if (survey.value) {
    router.push(`/surveys/${survey.value.id}/take`);
  }
};

// 分享功能
const openShareDialog = () => {
  if (!survey.value) return;

  // 生成分享链接
  const baseUrl = window.location.origin;
  shareLink.value = `${baseUrl}/surveys/${survey.value.id}/take`;

  shareDialogVisible.value = true;

  // 生成二维码
  nextTick(() => {
    generateQRCode();
  });
};

const generateQRCode = async () => {
  if (!qrcodeCanvas.value || !shareLink.value) return;

  try {
    await QRCode.toCanvas(qrcodeCanvas.value, shareLink.value, {
      width: 200,
      margin: 2,
      color: {
        dark: '#000000',
        light: '#ffffff',
      },
    });
  } catch (error) {
    console.error('Failed to generate QR code:', error);
    ElMessage.error('生成二维码失败');
  }
};

const copyLink = async () => {
  try {
    await navigator.clipboard.writeText(shareLink.value);
    ElMessage.success('链接已复制到剪贴板');
  } catch (error) {
    // 降级方案：使用传统方式复制
    try {
      const textArea = document.createElement('textarea');
      textArea.value = shareLink.value;
      textArea.style.position = 'fixed';
      textArea.style.left = '-9999px';
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
      ElMessage.success('链接已复制到剪贴板');
    } catch (fallbackError) {
      ElMessage.error('复制失败，请手动复制');
    }
  }
};

const downloadQRCode = () => {
  if (!qrcodeCanvas.value) return;

  try {
    // 创建一个带有白色背景的 canvas
    const canvas = document.createElement('canvas');
    const padding = 20;
    const size = 200 + padding * 2;
    canvas.width = size;
    canvas.height = size;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // 填充白色背景
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, size, size);

    // 绘制二维码
    ctx.drawImage(qrcodeCanvas.value, padding, padding);

    // 下载
    const link = document.createElement('a');
    link.download = `问卷-${survey.value?.title || '分享'}-二维码.png`;
    link.href = canvas.toDataURL('image/png');
    link.click();

    ElMessage.success('二维码已下载');
  } catch (error) {
    console.error('Failed to download QR code:', error);
    ElMessage.error('下载失败');
  }
};

const loadSurvey = async () => {
  try {
    const id = route.params.id as string;
    const response = await surveyAPI.getSurveyById(id);
    survey.value = response.data;
  } catch (error) {
    console.error('Failed to load survey:', error);
  } finally {
    loading.value = false;
  }
};

onMounted(() => {
  loadSurvey();
});
</script>

<style scoped>
.survey-detail {
  padding: 20px 0;
}

.page-header {
  margin-bottom: 20px;
}

.survey-title {
  display: flex;
  align-items: center;
  gap: 12px;
}

.survey-title h2 {
  margin: 0;
}

.survey-content {
  max-width: 800px;
  margin: 0 auto;
}

.survey-info-card {
  margin-bottom: 20px;
}

.info-row {
  display: flex;
  padding: 8px 0;
  border-bottom: 1px solid #eee;
}

.info-row:last-child {
  border-bottom: none;
}

.info-row .label {
  font-weight: 500;
  width: 100px;
  color: #666;
}

.info-row .value {
  color: #333;
  flex: 1;
}

.questions-list {
  margin: 20px 0;
}

.question-card {
  margin-bottom: 15px;
}

.question-header {
  display: flex;
  align-items: flex-start;
  gap: 8px;
  margin-bottom: 12px;
}

.question-number {
  font-weight: 600;
  color: #667eea;
}

.question-title {
  flex: 1;
  font-weight: 500;
}

.question-type {
  color: #999;
  font-size: 14px;
  margin-bottom: 10px;
}

.options-list {
  margin-top: 10px;
  padding-left: 24px;
}

.option-item {
  padding: 5px 0;
  color: #666;
}

.survey-actions {
  margin-top: 30px;
  text-align: center;
  display: flex;
  justify-content: center;
  gap: 16px;
}

.survey-actions .el-button {
  min-width: 150px;
}

/* 分享弹窗样式 */
.share-content {
  padding: 10px 0;
}

.share-section {
  margin-bottom: 24px;
}

.share-section:last-child {
  margin-bottom: 0;
}

.share-section h4 {
  margin: 0 0 12px 0;
  font-size: 14px;
  color: #303133;
}

.share-link-box {
  width: 100%;
}

.qrcode-container {
  display: flex;
  justify-content: center;
  padding: 16px;
  background: #f5f7fa;
  border-radius: 8px;
  margin-bottom: 12px;
}

.qrcode-canvas {
  display: block;
}

.qrcode-actions {
  text-align: center;
}

@media (max-width: 768px) {
  .survey-detail {
    padding: 10px 0;
  }

  .survey-actions {
    flex-direction: column;
    align-items: center;
  }

  .survey-actions .el-button {
    width: 100%;
    max-width: 280px;
  }
}
</style>
