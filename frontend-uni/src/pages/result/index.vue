<template>
  <view class="result">
    <view class="result-card">
      <text class="icon">✓</text>
      <text class="title">{{ $t('submit.success') }}</text>
      <text class="desc">{{ $t('submit.successDesc') }}</text>
      <button class="btn" @tap="close">{{ $t('submit.close') }}</button>
    </view>
  </view>
</template>

<script setup lang="ts">
import { useI18n } from 'vue-i18n';

const { t } = useI18n();

function close() {
  // Try to go back or close
  const pages = getCurrentPages();
  if (pages.length > 1) {
    uni.navigateBack();
  } else {
    uni.reLaunch({
      url: '/pages/notfound/index',
    });
  }
}
</script>

<style lang="scss" scoped>
@import '@/styles/main.scss';

.result {
  min-height: 100vh;
  background: linear-gradient(135deg, #67c23a 0%, #85ce61 100%);
  display: flex;
  align-items: center;
  justify-content: center;
}

.result-card {
  background: #fff;
  border-radius: 32rpx;
  padding: 80rpx 60rpx;
  text-align: center;
  width: 90%;
  max-width: 600rpx;
}

.icon {
  display: block;
  font-size: 160rpx;
  color: #67c23a;
  margin-bottom: 40rpx;
  line-height: 1;
}

.title {
  display: block;
  font-size: 40rpx;
  font-weight: bold;
  margin-bottom: 24rpx;
  color: #333;
}

.desc {
  display: block;
  font-size: 30rpx;
  color: #666;
  margin-bottom: 60rpx;
}

.btn {
  width: 300rpx;
  height: 88rpx;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: #fff;
  font-size: 32rpx;
  border-radius: 44rpx;
  border: none;
}
</style>
