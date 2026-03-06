<template>
  <div id="app">
    <el-container>
      <el-header v-if="isAuthenticated" class="header">
        <div class="header-content">
          <router-link to="/" class="logo-container">
            <img src="/logo.svg" alt="VMU Logo" class="logo-image" />
            <h1 class="logo-text">问卷平台</h1>
          </router-link>
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
  router.push('/');
};
</script>

<style>
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

html, body {
  margin: 0;
  padding: 0;
  width: 100%;
  min-height: 100vh;
}

#app {
  min-height: 100vh;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
}
</style>

<style scoped>

.header {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  padding: 0 20px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  height: 60px !important;
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
  text-decoration: none;
  color: inherit;
}

.logo-image {
  height: 36px;
  width: auto;
}

.logo-text {
  font-size: 20px;
  margin: 0;
  white-space: nowrap;
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
  white-space: nowrap;
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

.user-menu span {
  white-space: nowrap;
  max-width: 100px;
  overflow: hidden;
  text-overflow: ellipsis;
}

.main-content {
  padding: 20px;
  background: #f5f7fa;
  min-height: calc(100vh - 60px);
}

@media (max-width: 768px) {
  .header-content {
    gap: 8px;
  }

  .logo-text {
    display: none;
  }

  .nav {
    gap: 12px;
    font-size: 14px;
  }

  .nav a {
    font-size: 14px;
  }

  .user-menu span {
    display: none;
  }

  .user-menu .el-button {
    padding: 8px 12px;
    font-size: 14px;
  }
}

@media (max-width: 480px) {
  .nav {
    gap: 8px;
  }

  .nav a {
    font-size: 12px;
  }

  .user-menu .el-button {
    padding: 6px 10px;
    font-size: 12px;
  }
}
</style>
