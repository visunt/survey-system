<template>
  <div class="forgot-password-container">
    <el-card class="forgot-password-card">
      <template #header>
        <h2>找回密码</h2>
      </template>

      <el-form :model="form" :rules="rules" ref="formRef" label-width="80px" @submit.prevent>
        <el-form-item label="邮箱" prop="email">
          <el-input v-model="form.email" type="email" placeholder="请输入注册邮箱" />
        </el-form-item>

        <el-form-item>
          <el-button type="primary" @click="handleSubmit" :loading="loading" style="width: 100%">
            发送重置邮件
          </el-button>
        </el-form-item>

        <el-form-item>
          <div class="form-footer">
            <router-link to="/login" class="back-link">返回登录</router-link>
          </div>
        </el-form-item>
      </el-form>

      <el-alert
        v-if="success"
        title="邮件发送成功"
        type="success"
        description="请查收邮箱，点击邮件中的链接重置密码"
        :closable="false"
        show-icon
        style="margin-top: 20px"
      />
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue';
import { ElMessage } from 'element-plus';
import type { FormInstance, FormRules } from 'element-plus';
import { passwordAPI } from '../api/password';

const formRef = ref<FormInstance>();
const loading = ref(false);
const success = ref(false);

const form = reactive({
  email: '',
});

const rules: FormRules = {
  email: [
    { required: true, message: '请输入邮箱', trigger: 'blur' },
    { type: 'email', message: '请输入有效的邮箱地址', trigger: 'blur' },
  ],
};

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
    await passwordAPI.forgotPassword(form.email);
    success.value = true;
    ElMessage.success('重置邮件已发送');
  } catch (error: any) {
    const errorMessage = error.response?.data?.error || '发送失败，请稍后重试';
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
.forgot-password-container {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 60vh;
}

.forgot-password-card {
  width: 100%;
  max-width: 400px;
}

.forgot-password-card h2 {
  margin: 0;
  text-align: center;
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
