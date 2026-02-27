<template>
  <el-container class="layout">
    <el-aside width="200px">
      <div class="logo">Survey Admin</div>
      <el-menu
        :default-active="activeMenu"
        router
        background-color="#304156"
        text-color="#bfcbd9"
        active-text-color="#409eff"
      >
        <el-menu-item index="/surveys">
          <el-icon><Document /></el-icon>
          <span>Surveys</span>
        </el-menu-item>
        <el-menu-item @click="logout">
          <el-icon><SwitchButton /></el-icon>
          <span>Logout</span>
        </el-menu-item>
      </el-menu>
    </el-aside>
    <el-container>
      <el-header class="header">
        <span>Welcome, {{ userStore.user?.username }}</span>
      </el-header>
      <el-main class="main">
        <router-view />
      </el-main>
    </el-container>
  </el-container>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { useUserStore } from '@/stores/user';

const router = useRouter();
const route = useRoute();
const userStore = useUserStore();

const activeMenu = computed(() => route.path);

function logout() {
  userStore.logout();
  router.push('/login');
}
</script>

<style lang="scss" scoped>
.layout {
  height: 100vh;
}

.logo {
  height: 60px;
  line-height: 60px;
  text-align: center;
  color: #fff;
  font-size: 18px;
  font-weight: bold;
  background-color: #2b2f3a;
}

.el-aside {
  background-color: #304156;
}

.header {
  background-color: #fff;
  box-shadow: 0 1px 4px rgba(0, 21, 41, 0.08);
  display: flex;
  align-items: center;
  padding: 0 20px;
}

.main {
  background-color: #f0f2f5;
}
</style>
