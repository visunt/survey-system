<template>
  <div id="app">
    <el-container>
      <el-header v-if="isAuthenticated" class="header">
        <div class="header-content">
          <div class="logo-container">
            <img src="/logo.svg" alt="VMU Logo" class="logo-image" />
            <h1 class="logo-text">问卷平台</h1>
          </div>
          <nav class="nav">
            <router-link to="/">首页</router-link>
            <router-link to="/surveys">问卷列表</router-link>
            <router-link to="/create-survey">创建问卷</router-link>
          </nav>
          <div class="user-menu">
            <span>{{ authStore.user?.username }}</span>
            <el-button type="primary" @click="handleLogout">退出登录</el-button>
          </div>
        </div>
      </el-header>
      <el-main class="main-content">
        <router-view />
      </el-main>
    </el-container>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from './stores/auth';

const router = useRouter();
const authStore = useAuthStore();

const isAuthenticated = computed(() => authStore.isAuthenticated);

const handleLogout = () => {
  authStore.clearAuth();
  router.push('/login');
};
</script>

<style scoped>
#app {
  min-height: 100vh;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
}

.header {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  padding: 0 20px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.header-content {
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: 100%;
  max-width: 1200px;
  margin: 0 auto;
}

.logo-container {
  display: flex;
  align-items: center;
  gap: 10px;
}

.logo-image {
  height: 40px;
  width: auto;
}

.logo-text {
  font-size: 24px;
  margin: 0;
}

.nav {
  display: flex;
  gap: 20px;
}

.nav a {
  color: white;
  text-decoration: none;
  font-weight: 500;
  transition: opacity 0.3s;
}

.nav a:hover,
.nav a.router-link-active {
  opacity: 0.8;
  text-decoration: underline;
}

.user-menu {
  display: flex;
  align-items: center;
  gap: 10px;
}

.main-content {
  padding: 20px;
  background: #f5f7fa;
  min-height: calc(100vh - 60px);
}
</style>
