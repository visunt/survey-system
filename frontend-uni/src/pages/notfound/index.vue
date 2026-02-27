<template>
  <view class="not-found">
    <text class="code">404</text>
    <text class="text">问卷不存在</text>
  </view>
</template>

<script setup lang="ts">
// Not found page
</script>

<style lang="scss" scoped>
.not-found {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  background: #f5f5f5;
}

.code {
  font-size: 200rpx;
  color: #999;
  font-weight: bold;
}

.text {
  font-size: 36rpx;
  color: #666;
  margin-top: 20rpx;
}
</style>
