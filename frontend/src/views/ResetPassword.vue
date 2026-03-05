<template>
  <div class="reset-password-container">
    <el-card class="reset-password-card">
      <template #header>
        <h2>重置密码</h2>
      </template>

      <div v-if="verifying" class="loading-container">
        <el-icon class="is-loading" :size="32"><Loading /></el-icon>
        <p>正在验证链接...</p>
      </div>

      <div v-else-if="!validToken" class="error-container">
        <el-result icon="error" title="链接无效" :sub-title="errorMessage">
          <template #extra>
            <router-link to="/forgot-password">
              <el-button type="primary">重新申请</el-button>
            </router-link>
          </template>
        </el-result>
      </div>

      <el-form v-else :model="form" :rules="rules" ref="formRef" label-width="80px" @submit.prevent>
        <el-form-item label="邮箱">
          <el-input :value="email" disabled />
        </el-form-item>

        <el-form-item label="新密码" prop="password">
          <el-input v-model="form.password" type="password" placeholder="请输入新密码" show-password />
        </el-form-item>

        <el-form-item label="确认密码" prop="confirmPassword">
          <el-input v-model="form.confirmPassword" type="password" placeholder="请再次输入新密码" show-password />
        </el-form-item>

        <el-form-item>
          <el-button type="primary" @click="handleSubmit" :loading="loading" style="width: 100%">
            重置密码
          </el-button>
        </el-form-item>

        <el-form-item>
          <div class="form-footer">
            <router-link to="/login" class="back-link">返回登录</router-link>
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
import { Loading } from '@element-plus/icons-vue';
import type { FormInstance, FormRules } from 'element-plus';
import { passwordAPI } from '../api/password';
import { hashPassword } from '../utils/password';

const router = useRouter();
const route = useRoute();

const formRef = ref<FormInstance>();
const loading = ref(false);
const verifying = ref(true);
const validToken = ref(false);
const errorMessage = ref('');
const email = ref('');

const form = reactive({
  password: '',
  confirmPassword: '',
});

const validateConfirmPassword = (rule: any, value: any, callback: any) => {
  if (value !== form.password) {
    callback(new Error('两次输入的密码不一致'));
  } else {
    callback();
  }
};

const rules: FormRules = {
  password: [
    { required: true, message: '请输入新密码', trigger: 'blur' },
    { min: 6, message: '密码长度不能少于6位', trigger: 'blur' },
  ],
  confirmPassword: [
    { required: true, message: '请再次输入新密码', trigger: 'blur' },
    { validator: validateConfirmPassword, trigger: 'blur' },
  ],
};

onMounted(async () => {
  const token = route.query.token as string;
  if (!token) {
    verifying.value = false;
    errorMessage.value = '缺少重置令牌';
    return;
  }

  try {
    const response = await passwordAPI.verifyToken(token);
    validToken.value = response.data.valid;
    email.value = response.data.email;
  } catch (error: any) {
    errorMessage.value = error.response?.data?.error || '链接验证失败';
  } finally {
    verifying.value = false;
  }
});

const handleSubmit = async () => {
  if (!formRef.value) return;

  loading.value = true;

  try {
    await formRef.value.validate();
  } catch (error) {
    loading.value = false;
    return;
  }

  try {
    const token = route.query.token as string;
    await passwordAPI.resetPassword(token, hashPassword(form.password));
    ElMessage.success('密码重置成功，请使用新密码登录');
    router.push('/login');
  } catch (error: any) {
    const errorMessage = error.response?.data?.error || '重置失败，请稍后重试';
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
</script>

<style scoped>
.reset-password-container {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 60vh;
}

.reset-password-card {
  width: 100%;
  max-width: 400px;
}

.reset-password-card h2 {
  margin: 0;
  text-align: center;
}

.loading-container {
  text-align: center;
  padding: 40px 0;
}

.loading-container p {
  margin-top: 16px;
  color: #666;
}

.error-container {
  padding: 20px 0;
}

.form-footer {
  display: flex;
  justify-content: center;
  width: 100%;
}

.back-link {
  color: #667eea;
  text-decoration: none;
  cursor: pointer;
}

.back-link:hover {
  text-decoration: underline;
}
</style>
