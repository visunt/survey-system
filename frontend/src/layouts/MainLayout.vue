<template>
  <div class="layout">
    <el-container>
      <el-header class="header">
        <div class="header-content">
          <router-link to="/" class="logo-link">
            <img src="/logo.svg" alt="VMU Logo" class="logo" />
            <span class="logo-text">问卷平台</span>
          </router-link>
          
          <nav class="nav-menu">
            <router-link to="/" class="nav-link">首页</router-link>
            <router-link to="/surveys" class="nav-link">问卷列表</router-link>
            <router-link to="/create-survey" class="nav-link">创建问卷</router-link>
          </nav>

          <div class="user-menu" v-if="authStore.isAuthenticated">
            <el-dropdown>
              <span class="user-info">
                <el-avatar :size="32" class="avatar">
                  {{ authStore.user?.username?.charAt(0).toUpperCase() }}
                </el-avatar>
                <span class="username">{{ authStore.user?.username }}</span>
              </span>
              <template #dropdown>
                <el-dropdown-menu>
                  <el-dropdown-item @click="router.push('/profile')">个人中心</el-dropdown-item>
                  <el-dropdown-item @click="router.push('/my-surveys')">我的问卷</el-dropdown-item>
                  <el-dropdown-item divided @click="handleLogout">退出登录</el-dropdown-item>
                </el-dropdown-menu>
              </template>
            </el-dropdown>
          </div>
          <div class="auth-buttons" v-else>
            <router-link to="/login">
              <el-button type="primary" plain>登录</el-button>
            </router-link>
            <router-link to="/register">
              <el-button type="primary">注册</el-button>
            </router-link>
          </div>
        </div>
      </el-header>

      <el-main class="main">
        <slot></slot>
      </el-main>

      <el-footer class="footer">
        <div class="footer-content">
          <p>© 2024 问卷平台 - AI Powered Survey System</p>
          <p>vmumu.com</p>
        </div>
      </el-footer>
    </el-container>
  </div>
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router';
import { useAuthStore } from '../stores/auth';

const router = useRouter();
const authStore = useAuthStore();

const handleLogout = () => {
  authStore.clearAuth();
  router.push('/login');
};
</script>

<style scoped>
.layout {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}

.el-container {
  flex: 1;
  display: flex;
  flex-direction: column;
}

.header {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  padding: 0 20px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  height: 60px;
  display: flex;
  align-items: center;
}

.header-content {
  width: 100%;
  max-width: 1200px;
  margin: 0 auto;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.logo-link {
  display: flex;
  align-items: center;
  gap: 12px;
  text-decoration: none;
  color: white;
}

.logo {
  height: 40px;
  width: auto;
}

.logo-text {
  font-size: 20px;
  font-weight: 600;
}

.nav-menu {
  display: flex;
  gap: 30px;
}

.nav-link {
  color: white;
  text-decoration: none;
  font-weight: 500;
  transition: opacity 0.3s;
}

.nav-link:hover,
.nav-link.router-link-active {
  opacity: 0.8;
  text-decoration: underline;
}

.user-menu {
  display: flex;
  align-items: center;
}

.user-info {
  display: flex;
  align-items: center;
  gap: 10px;
  cursor: pointer;
}

.avatar {
  background: rgba(255, 255, 255, 0.2);
  color: white;
}

.username {
  color: white;
  font-weight: 500;
}

.auth-buttons {
  display: flex;
  gap: 10px;
}

.auth-buttons a {
  text-decoration: none;
}

.main {
  flex: 1;
  padding: 20px;
  background: #f5f7fa;
}

.footer {
  background: #2c3e50;
  color: white;
  text-align: center;
  padding: 20px;
  height: auto;
}

.footer-content p {
  margin: 5px 0;
  font-size: 14px;
}

@media (max-width: 768px) {
  .nav-menu {
    display: none;
  }

  .logo-text {
    display: none;
  }

  .username {
    display: none;
  }
}
</style>
