<template>
  <div class="login-container">
    <el-card class="login-card">
      <template #header>
        <h2>登录</h2>
      </template>

      <el-form :model="form" :rules="rules" ref="formRef" label-width="80px" @submit.prevent>
        <el-form-item label="邮箱" prop="email">
          <el-input v-model="form.email" type="email" placeholder="请输入邮箱" @blur="checkCaptchaRequired" />
        </el-form-item>

        <el-form-item label="密码" prop="password">
          <el-input v-model="form.password" type="password" placeholder="请输入密码" show-password @keyup.enter="handleLogin" />
        </el-form-item>

        <el-form-item v-if="showCaptcha" label="验证码" prop="captchaCode">
          <div class="captcha-row">
            <el-input v-model="form.captchaCode" placeholder="请输入验证码" class="captcha-input" />
            <div class="captcha-svg" v-html="captchaSvg" @click="refreshCaptcha" title="点击刷新"></div>
          </div>
        </el-form-item>

        <el-form-item>
          <el-button type="primary" @click="handleLogin" :loading="loading" style="width: 100%">
            登录
          </el-button>
        </el-form-item>

        <el-form-item>
          <div class="form-footer">
            <span>还没有账号？</span>
            <router-link to="/register" class="register-link">立即注册</router-link>
          </div>
        </el-form-item>
      </el-form>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { ElMessage } from 'element-plus';
import type { FormInstance, FormRules } from 'element-plus';
import { authAPI } from '../api/auth';
import { useAuthStore } from '../stores/auth';
import { hashPassword } from '../utils/password';

const router = useRouter();
const route = useRoute();
const authStore = useAuthStore();

const formRef = ref<FormInstance>();
const loading = ref(false);
const showCaptcha = ref(false);
const captchaSvg = ref('');
const captchaId = ref('');

const form = reactive({
  email: '',
  password: '',
  captchaCode: '',
});

const rules: FormRules = {
  email: [
    { required: true, message: '请输入邮箱', trigger: 'blur' },
    { type: 'email', message: '请输入有效的邮箱地址', trigger: 'blur' },
  ],
  password: [
    { required: true, message: '请输入密码', trigger: 'blur' },
    { min: 6, message: '密码长度不能少于6位', trigger: 'blur' },
  ],
  captchaCode: [
    { required: true, message: '请输入验证码', trigger: 'blur' },
  ],
};

const fetchCaptcha = async () => {
  try {
    const response = await authAPI.getCaptcha();
    captchaId.value = response.data.captchaId;
    captchaSvg.value = response.data.svg;
  } catch (error) {
    console.error('Failed to fetch captcha:', error);
  }
};

const refreshCaptcha = () => {
  fetchCaptcha();
};

const checkCaptchaRequired = async () => {
  if (!form.email) return;
  
  try {
    const response = await authAPI.checkCaptchaRequired(form.email);
    if (response.data.requireCaptcha) {
      showCaptcha.value = true;
      if (!captchaId.value) {
        await fetchCaptcha();
      }
    }
  } catch (error) {
    console.error('Failed to check captcha requirement:', error);
  }
};

const handleLogin = async () => {
  if (!formRef.value) return;

  loading.value = true;

  try {
    await formRef.value.validate();
  } catch (error) {
    loading.value = false;
    return;
  }

  try {
    const loginData: any = {
      email: form.email,
      password: hashPassword(form.password),
    };

    if (showCaptcha.value) {
      loginData.captchaId = captchaId.value;
      loginData.captchaCode = form.captchaCode;
    }

    const response = await authAPI.login(loginData);

    authStore.setAuth(response.data.user, response.data.token);
    ElMessage.success('登录成功');
    
    const redirect = route.query.redirect as string;
    router.push(redirect || '/');
  } catch (error: any) {
    const responseData = error.response?.data || {};
    const errorMessage = responseData.error || '登录失败，请检查邮箱和密码';
    
    if (responseData.requireCaptcha) {
      showCaptcha.value = true;
      await fetchCaptcha();
      form.captchaCode = '';
    }
    
    ElMessage({
      message: errorMessage,
      type: 'error',
      duration: 3000,
      showClose: true,
    });
  } finally {
    loading.value = false;
  }
};

onMounted(() => {
  if (route.query.email) {
    form.email = route.query.email as string;
    checkCaptchaRequired();
  }
});
</script>

<style scoped>
.login-container {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 60vh;
}

.login-card {
  width: 100%;
  max-width: 400px;
}

.login-card h2 {
  margin: 0;
  text-align: center;
}

.form-footer {
  display: flex;
  justify-content: center;
  gap: 5px;
  width: 100%;
}

.register-link {
  color: #667eea;
  text-decoration: none;
  cursor: pointer;
}

.register-link:hover {
  text-decoration: underline;
}

.captcha-row {
  display: flex;
  gap: 12px;
  align-items: center;
}

.captcha-input {
  flex: 1;
}

.captcha-svg {
  cursor: pointer;
  border: 1px solid #dcdfe6;
  border-radius: 4px;
  overflow: hidden;
  flex-shrink: 0;
}

.captcha-svg :deep(svg) {
  display: block;
}
</style>
