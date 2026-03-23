<template>
  <el-dialog
    v-model="dialogVisible"
    title="分享问卷"
    width="500px"
    :close-on-click-modal="false"
    @close="handleClose"
  >
    <div class="share-dialog">
      <!-- 问卷信息卡片 -->
      <div class="survey-card">
        <div class="survey-card-header">
          <el-icon class="survey-icon"><Document /></el-icon>
          <span class="survey-title">{{ survey.title }}</span>
        </div>
        <div class="survey-desc" v-if="survey.description">
          {{ survey.description }}
        </div>
      </div>

      <!-- 分享渠道 -->
      <div class="share-section">
        <h4>分享到</h4>
        <div class="share-platforms">
          <div class="share-item" @click="shareToWeibo">
            <div class="share-icon weibo">
              <svg viewBox="0 0 1024 1024" width="32" height="32">
                <path d="M411.2 637.3c-92.7 12.5-164.8-32.8-161.1-100.8 3.7-68.1 81.6-132.7 174.3-144.3 92.7-11.5 164.8 32.8 161.1 100.9-3.6 68-81.5 131.7-174.3 144.2z" fill="#E6162D"/>
                <path d="M422 758.8c-113 0-204.7-46.6-204.7-104s91.7-104 204.7-104c113 0 204.7 46.6 204.7 104S535 758.8 422 758.8z" fill="#E6162D"/>
                <path d="M422 720.8c-86.6 0-156.9-29.9-156.9-66.8s70.3-66.8 156.9-66.8 156.9 29.9 156.9 66.8-70.3 66.8-156.9 66.8z" fill="#E6162D"/>
              </svg>
            </div>
            <span class="share-name">微博</span>
          </div>

          <div class="share-item" @click="shareToQQ">
            <div class="share-icon qq">
              <svg viewBox="0 0 1024 1024" width="32" height="32">
                <path d="M512 0C229.2 0 0 229.2 0 512s229.2 512 512 512 512-229.2 512-512S794.8 0 512 0z" fill="#12B7F5"/>
                <path d="M332.8 307.2c0-44.2 35.8-80 80-80s80 35.8 80 80-35.8 80-80 80-80-35.8-80-80z" fill="#FFF"/>
                <path d="M531.2 307.2c0-44.2 35.8-80 80-80s80 35.8 80 80-35.8 80-80 80-80-35.8-80-80z" fill="#FFF"/>
              </svg>
            </div>
            <span class="share-name">QQ</span>
          </div>

          <div class="share-item" @click="showWeChatQR">
            <div class="share-icon wechat">
              <svg viewBox="0 0 1024 1024" width="32" height="32">
                <path d="M390.4 227.2c-176 0-318.4 118.4-318.4 265.6 0 89.6 51.2 169.6 131.2 220.8-6.4 22.4-19.2 64-22.4 73.6-3.2 9.6 3.2 16 12.8 12.8 16-6.4 73.6-32 102.4-44.8 28.8 6.4 57.6 9.6 89.6 9.6 6.4 0 12.8 0 19.2-3.2-3.2-16-6.4-32-6.4-48 0-144 131.2-262.4 294.4-262.4 9.6 0 19.2 0 28.8 3.2-22.4-121.6-156.8-227.2-331.2-227.2z" fill="#07C160"/>
                <path d="M764.8 451.2c-134.4 0-243.2 96-243.2 214.4s108.8 214.4 243.2 214.4c22.4 0 44.8-3.2 64-9.6 25.6 12.8 76.8 35.2 89.6 41.6 9.6 3.2 16-3.2 12.8-12.8-3.2-9.6-16-48-22.4-67.2 64-44.8 105.6-112 105.6-188.8 0-118.4-108.8-214.4-249.6-214.4z" fill="#07C160"/>
              </svg>
            </div>
            <span class="share-name">微信</span>
          </div>
        </div>
      </div>

      <!-- 链接复制 -->
      <div class="share-section">
        <h4>分享链接</h4>
        <div class="link-box">
          <el-input
            v-model="shareUrl"
            readonly
            class="share-input"
          >
            <template #append>
              <el-button :icon="DocumentCopy" @click="copyLink">复制</el-button>
            </template>
          </el-input>
        </div>
      </div>

      <!-- 微信二维码 -->
      <el-dialog
        v-model="showQRDialog"
        title="扫码分享到微信"
        width="360px"
        append-to-body
      >
        <div class="qrcode-wrapper">
          <div class="qrcode-box">
            <canvas ref="qrcodeCanvas" class="qrcode-canvas"></canvas>
          </div>
          <p class="qrcode-tip">使用微信扫描二维码即可分享</p>
          <el-button type="primary" @click="downloadQRCode" style="width: 100%">
            下载二维码
          </el-button>
        </div>
      </el-dialog>
    </div>

    <template #footer>
      <el-button @click="handleClose">关闭</el-button>
    </template>
  </el-dialog>
</template>

<script setup lang="ts">
import { ref, computed, watch, nextTick } from 'vue';
import { ElMessage } from 'element-plus';
import { Document, DocumentCopy } from '@element-plus/icons-vue';
import QRCode from 'qrcode';

interface Survey {
  id?: string;
  title: string;
  description?: string;
  status?: string;
}

interface Props {
  modelValue: boolean;
  survey: Survey;
}

interface Emits {
  (e: 'update:modelValue', value: boolean): void;
}

const props = defineProps<Props>();
const emit = defineEmits<Emits>();

const dialogVisible = computed({
  get: () => props.modelValue,
  set: (val) => emit('update:modelValue', val)
});

const showQRDialog = ref(false);
const qrcodeCanvas = ref<HTMLCanvasElement | null>(null);

const shareUrl = computed(() => {
  if (!props.survey.id) return '';
  const baseUrl = window.location.origin;
  return `${baseUrl}/surveys/${props.survey.id}/take`;
});

const handleClose = () => {
  dialogVisible.value = false;
};

const shareToWeibo = () => {
  const title = encodeURIComponent(`${props.survey.title} - 快来填写问卷吧！`);
  const url = encodeURIComponent(shareUrl.value);
  const weiboUrl = `https://service.weibo.com/share/share.php?title=${title}&url=${url}`;
  window.open(weiboUrl, '_blank', 'width=600,height=500');
};

const shareToQQ = () => {
  const title = encodeURIComponent(props.survey.title);
  const desc = encodeURIComponent(props.survey.description || '快来填写这份问卷吧！');
  const url = encodeURIComponent(shareUrl.value);
  const qqUrl = `https://connect.qq.com/widget/shareqq/index.html?url=${url}&title=${title}&desc=${desc}`;
  window.open(qqUrl, '_blank', 'width=600,height=500');
};

const showWeChatQR = () => {
  showQRDialog.value = true;
  nextTick(() => {
    generateQRCode();
  });
};

const generateQRCode = async () => {
  if (!qrcodeCanvas.value || !shareUrl.value) return;

  try {
    await QRCode.toCanvas(qrcodeCanvas.value, shareUrl.value, {
      width: 220,
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
    await navigator.clipboard.writeText(shareUrl.value);
    ElMessage.success('链接已复制到剪贴板');
  } catch (error) {
    // 降级方案：使用传统方式复制
    try {
      const textArea = document.createElement('textarea');
      textArea.value = shareUrl.value;
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
    const canvas = document.createElement('canvas');
    const padding = 30;
    const size = 220 + padding * 2;
    canvas.width = size;
    canvas.height = size;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, size, size);

    ctx.drawImage(qrcodeCanvas.value, padding, padding);

    const link = document.createElement('a');
    link.download = `问卷-${props.survey.title}-二维码.png`;
    link.href = canvas.toDataURL('image/png');
    link.click();

    ElMessage.success('二维码已下载');
  } catch (error) {
    console.error('Failed to download QR code:', error);
    ElMessage.error('下载失败');
  }
};
</script>

<style scoped>
.share-dialog {
  padding: 10px 0;
}

.survey-card {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 12px;
  padding: 20px;
  margin-bottom: 24px;
  color: #fff;
}

.survey-card-header {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 8px;
}

.survey-icon {
  font-size: 24px;
  opacity: 0.9;
}

.survey-title {
  font-size: 18px;
  font-weight: 600;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.survey-desc {
  font-size: 14px;
  opacity: 0.9;
  overflow: hidden;
  text-overflow: ellipsis;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
}

.share-section {
  margin-bottom: 24px;
}

.share-section:last-child {
  margin-bottom: 0;
}

.share-section h4 {
  margin: 0 0 16px 0;
  font-size: 14px;
  color: #303133;
  font-weight: 500;
}

.share-platforms {
  display: flex;
  gap: 24px;
  justify-content: center;
}

.share-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  cursor: pointer;
  transition: transform 0.2s ease, opacity 0.2s ease;
}

.share-item:hover {
  transform: translateY(-4px);
  opacity: 0.8;
}

.share-item:active {
  transform: translateY(-2px);
}

.share-icon {
  width: 48px;
  height: 48px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: box-shadow 0.2s ease;
}

.share-icon.weibo {
  background: #E6162D;
  box-shadow: 0 4px 12px rgba(230, 22, 45, 0.3);
}

.share-icon.qq {
  background: #12B7F5;
  box-shadow: 0 4px 12px rgba(18, 183, 245, 0.3);
}

.share-icon.wechat {
  background: #07C160;
  box-shadow: 0 4px 12px rgba(7, 193, 96, 0.3);
}

.share-name {
  font-size: 14px;
  color: #606266;
}

.link-box {
  width: 100%;
}

.share-input :deep(.el-input-group__append) {
  padding: 0;
}

.share-input .el-button {
  border: none;
  border-radius: 0 4px 4px 0;
}

.qrcode-wrapper {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 10px 0;
}

.qrcode-box {
  display: flex;
  justify-content: center;
  padding: 20px;
  background: #f5f7fa;
  border-radius: 12px;
  margin-bottom: 16px;
}

.qrcode-canvas {
  display: block;
}

.qrcode-tip {
  margin: 0 0 16px 0;
  font-size: 14px;
  color: #909399;
  text-align: center;
}

@media (max-width: 480px) {
  .share-platforms {
    gap: 16px;
  }

  .share-icon {
    width: 42px;
    height: 42px;
  }

  .share-icon svg {
    width: 28px;
    height: 28px;
  }
}
</style>
