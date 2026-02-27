<template>
  <el-container class="layout">
    <el-aside width="200px">
      <div class="logo">{{ $t('auth.title') }}</div>
      <el-menu
        :default-active="activeMenu"
        router
        background-color="#304156"
        text-color="#bfcbd9"
        active-text-color="#409eff"
      >
        <el-menu-item index="/surveys">
          <el-icon><Document /></el-icon>
          <span>{{ $t('nav.surveys') }}</span>
        </el-menu-item>
        <el-menu-item @click="logout">
          <el-icon><SwitchButton /></el-icon>
          <span>{{ $t('nav.logout') }}</span>
        </el-menu-item>
      </el-menu>
    </el-aside>
    <el-container>
      <el-header class="header">
        <div class="header-content">
          <span>{{ $t('auth.loginSuccess') }}, {{ userStore.user?.username }}</span>
          <el-dropdown @command="changeLocale" trigger="click">
            <span class="lang-btn">
              <el-icon><Globe /></el-icon>
              {{ localeLabel }}
              <el-icon class="el-icon--right"><arrow-down /></el-icon>
            </span>
            <template #dropdown>
              <el-dropdown-item
                v-for="loc in availableLocales"
                :key="loc.value"
                :command="loc.value"
                :class="{ active: userStore.currentLocale === loc.value }"
              >
                {{ loc.label }}
              </el-dropdown-item>
            </template>
          </el-dropdown>
        </div>
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
import { useI18n } from 'vue-i18n';
import { availableLocales, localeLabels } from '@/locales';

const router = useRouter();
const route = useRoute();
const userStore = useUserStore();
const { t, locale } = useI18n();

const activeMenu = computed(() => route.path);
const localeLabel = computed(() => localeLabels[locale.value]);

function logout() {
  userStore.logout();
  router.push('/login');
}

function changeLocale(newLocale: string) {
  userStore.setLocale(newLocale as 'zh' | 'en');
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

.header-content {
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
}

.lang-btn {
  display: flex;
  align-items: center;
  gap: 4px;
  cursor: pointer;
  padding: 8px 12px;
  border-radius: 4px;
  transition: background-color 0.2s;

  &:hover {
    background-color: #f5f7fa;
  }
}

.el-dropdown-item.active {
  color: #409eff;
}

.main {
  background-color: #f0f2f5;
}
</style>
