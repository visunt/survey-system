<template>
  <div class="register-container">
    <el-card class="register-card">
      <template #header>
        <h2>注册</h2>
      </template>

      <el-form :model="form" :rules="rules" ref="formRef" label-width="80px">
        <el-form-item label="用户名" prop="username">
          <el-input v-model="form.username" placeholder="请输入用户名" />
        </el-form-item>

        <el-form-item label="邮箱" prop="email">
          <el-input v-model="form.email" type="email" placeholder="请输入邮箱" />
        </el-form-item>

        <el-form-item label="密码" prop="password">
          <el-input v-model="form.password" type="password" placeholder="请输入密码" show-password />
        </el-form-item>

        <el-form-item label="确认密码" prop="confirmPassword">
          <el-input v-model="form.confirmPassword" type="password" placeholder="请再次输入密码" show-password />
        </el-form-item>

        <el-form-item label="验证码" prop="captchaCode">
          <div class="captcha-row">
            <el-input v-model="form.captchaCode" placeholder="请输入验证码" class="captcha-input" />
            <div class="captcha-svg" v-html="captchaSvg" @click="refreshCaptcha" title="点击刷新"></div>
          </div>
        </el-form-item>

        <el-form-item>
          <el-button type="primary" @click="handleRegister" :loading="loading" style="width: 100%">
            注册
          </el-button>
        </el-form-item>

        <el-form-item>
          <div class="form-footer">
            <span>已有账号？</span>
            <router-link to="/login" class="login-link">立即登录</router-link>
          </div>
        </el-form-item>
      </el-form>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { ElMessage } from 'element-plus';
import type { FormInstance, FormRules } from 'element-plus';
import { authAPI } from '../api/auth';
import { useAuthStore } from '../stores/auth';
import { hashPassword } from '../utils/password';

const router = useRouter();
const authStore = useAuthStore();

const formRef = ref<FormInstance>();
const loading = ref(false);
const captchaSvg = ref('');
const captchaId = ref('');

const form = reactive({
  username: '',
  email: '',
  password: '',
  confirmPassword: '',
  captchaCode: '',
});

const validateConfirmPassword = (rule: any, value: any, callback: any) => {
  if (value !== form.password) {
    callback(new Error('两次输入的密码不一致'));
  } else {
    callback();
  }
};

const rules: FormRules = {
  username: [
    { required: true, message: '请输入用户名', trigger: 'blur' },
    { min: 3, max: 20, message: '用户名长度在 3 到 20 个字符', trigger: 'blur' },
  ],
  email: [
    { required: true, message: '请输入邮箱', trigger: 'blur' },
    { type: 'email', message: '请输入有效的邮箱地址', trigger: 'blur' },
  ],
  password: [
    { required: true, message: '请输入密码', trigger: 'blur' },
    { min: 6, message: '密码长度不能少于6位', trigger: 'blur' },
  ],
  confirmPassword: [
    { required: true, message: '请再次输入密码', trigger: 'blur' },
    { validator: validateConfirmPassword, trigger: 'blur' },
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

const handleRegister = async () => {
  if (!formRef.value) return;

  try {
    await formRef.value.validate();
    loading.value = true;

    const response = await authAPI.register({
      username: form.username,
      email: form.email,
      password: hashPassword(form.password),
      captchaId: captchaId.value,
      captchaCode: form.captchaCode,
    });

    authStore.setAuth(response.data.user, response.data.token);
    ElMessage.success('注册成功');
    router.push('/');
  } catch (error: any) {
    const responseData = error.response?.data || {};
    ElMessage.error(responseData.error || '注册失败');
    
    if (responseData.requireCaptcha) {
      await fetchCaptcha();
      form.captchaCode = '';
    }
  } finally {
    loading.value = false;
  }
};

onMounted(() => {
  fetchCaptcha();
});
</script>

<style scoped>
.register-container {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 60vh;
}

.register-card {
  width: 100%;
  max-width: 400px;
}

.register-card h2 {
  margin: 0;
  text-align: center;
}

.form-footer {
  display: flex;
  justify-content: center;
  gap: 5px;
  width: 100%;
}

.login-link {
  color: #667eea;
  text-decoration: none;
  cursor: pointer;
}

.login-link:hover {
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
