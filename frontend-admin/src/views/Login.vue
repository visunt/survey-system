<template>
  <div class="login-container">
    <el-card class="login-card">
      <h2 class="title">Survey System</h2>
      <el-form :model="form" :rules="rules" ref="formRef" @submit.prevent="handleLogin">
        <el-form-item prop="username">
          <el-input v-model="form.username" placeholder="Username" />
        </el-form-item>
        <el-form-item prop="password">
          <el-input
            v-model="form.password"
            type="password"
            placeholder="Password"
            show-password
            @keyup.enter="handleLogin"
          />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" :loading="loading" style="width: 100%" @click="handleLogin">
            Login
          </el-button>
        </el-form-item>
      </el-form>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue';
import { useRouter } from 'vue-router';
import { ElMessage, type FormInstance } from 'element-plus';
import { useUserStore } from '@/stores/user';
import { authApi } from '@/api/auth';

const router = useRouter();
const userStore = useUserStore();

const formRef = ref<FormInstance>();
const loading = ref(false);

const form = reactive({
  username: '',
  password: '',
});

const rules = {
  username: [{ required: true, message: 'Please input username', trigger: 'blur' }],
  password: [{ required: true, message: 'Please input password', trigger: 'blur' }],
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
      ElMessage.success('Login successful');
      router.push('/surveys');
    } catch (error) {
      console.error('Login error:', error);
    } finally {
      loading.value = false;
    }
  });
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
</style>
