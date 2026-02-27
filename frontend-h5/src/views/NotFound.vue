<template>
  <div class="not-found">
    <h1>404</h1>
    <p>Survey not found</p>
  </div>
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

  h1 {
    font-size: 80px;
    color: #999;
  }

  p {
    font-size: 18px;
    color: #666;
  }
}
</style>
