<template>
  <div class="login-container">
    <el-card class="login-card">
      <h2 class="title">{{ $t('auth.title') }}</h2>
      <el-form :model="form" :rules="rules" ref="formRef" @submit.prevent="handleLogin">
        <el-form-item prop="username">
          <el-input v-model="form.username" :placeholder="$t('auth.username')" />
        </el-form-item>
        <el-form-item prop="password">
          <el-input
            v-model="form.password"
            type="password"
            :placeholder="$t('auth.password')"
            show-password
            @keyup.enter="handleLogin"
          />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" :loading="loading" style="width: 100%" @click="handleLogin">
            {{ $t('auth.loginBtn') }}
          </el-button>
        </el-form-item>
      </el-form>
      <div class="lang-switch">
        <span
          v-for="loc in availableLocales"
          :key="loc.value"
          :class="{ active: currentLocale === loc.value }"
          @click="changeLocale(loc.value)"
        >
          {{ loc.label }}
        </span>
      </div>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed } from 'vue';
import { useRouter } from 'vue-router';
import { ElMessage, type FormInstance } from 'element-plus';
import { useUserStore } from '@/stores/user';
import { authApi } from '@/api/auth';
import { useI18n } from 'vue-i18n';
import { availableLocales } from '@/locales';

const router = useRouter();
const userStore = useUserStore();
const { t, locale } = useI18n();

const formRef = ref<FormInstance>();
const loading = ref(false);

const currentLocale = computed(() => locale.value);

const form = reactive({
  username: '',
  password: '',
});

const rules = {
  username: [{ required: true, message: () => t('auth.usernameRequired'), trigger: 'blur' }],
  password: [{ required: true, message: () => t('auth.passwordRequired'), trigger: 'blur' }],
};

async function handleLogin() {
  if (!formRef.value) return;

  await formRef.value.validate(async (valid) => {
    if (!valid) return;

    loading.value = true;
    try {
      const res = await authApi.login(form);
      userStore.setToken(res.token);
      userStore.setUser(res.user);
      ElMessage.success(t('auth.loginSuccess'));
      router.push('/surveys');
    } catch (error) {
      console.error('Login error:', error);
      ElMessage.error(t('auth.loginFailed'));
    } finally {
      loading.value = false;
    }
  });
}

function changeLocale(newLocale: string) {
  userStore.setLocale(newLocale as 'zh' | 'en');
}
</script>

<style lang="scss" scoped>
.login-container {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100vh;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}

.login-card {
  width: 400px;
}

.title {
  text-align: center;
  margin-bottom: 30px;
  color: #333;
}

.lang-switch {
  margin-top: 20px;
  display: flex;
  justify-content: center;
  gap: 12px;

  span {
    cursor: pointer;
    padding: 4px 12px;
    border-radius: 4px;
    transition: all 0.2s;
    color: #999;

    &:hover {
      background-color: #f5f7fa;
      color: #666;
    }

    &.active {
      color: #667eea;
      background-color: #f0f4ff;
    }
  }
}
</style>
