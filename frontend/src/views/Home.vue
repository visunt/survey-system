<template>
  <div class="home">
    <el-row :gutter="20">
      <el-col :span="24">
        <div class="hero-section">
          <h1 class="title">欢迎使用问卷平台</h1>
          <p class="description">创建、发布和收集问卷数据的一站式解决方案</p>
          <div class="actions">
            <el-button type="primary" size="large" @click="goToSurveys">
              浏览问卷
            </el-button>
            <el-button type="success" size="large" @click="goToCreate">
              创建问卷
            </el-button>
          </div>
        </div>
      </el-col>
    </el-row>

    <el-row :gutter="20" class="features">
      <el-col :xs="24" :sm="12" :md="8">
        <el-card class="feature-card">
          <div class="feature-icon">
            <el-icon size="48"><Edit /></el-icon>
          </div>
          <h3>创建问卷</h3>
          <p>支持多种题型，包括单选、多选、文本、评分等</p>
        </el-card>
      </el-col>
      <el-col :xs="24" :sm="12" :md="8">
        <el-card class="feature-card">
          <div class="feature-icon">
            <el-icon size="48"><Share /></el-icon>
          </div>
          <h3>发布分享</h3>
          <p>一键发布问卷，分享链接即可开始收集数据</p>
        </el-card>
      </el-col>
      <el-col :xs="24" :sm="12" :md="8">
        <el-card class="feature-card">
          <div class="feature-icon">
            <el-icon size="48"><DataAnalysis /></el-icon>
          </div>
          <h3>数据分析</h3>
          <p>实时查看问卷结果，数据可视化统计</p>
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router';
import { Edit, Share, DataAnalysis } from '@element-plus/icons-vue';

const router = useRouter();

const goToSurveys = () => {
  router.push('/surveys');
};

const goToCreate = () => {
  router.push('/create-survey');
};
</script>

<style scoped>
.home {
  padding: 40px 0;
}

.hero-section {
  text-align: center;
  padding: 60px 20px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border-radius: 12px;
  margin-bottom: 40px;
}

.title {
  font-size: 48px;
  margin-bottom: 20px;
}

.description {
  font-size: 18px;
  opacity: 0.9;
  margin-bottom: 30px;
}

.actions {
  display: flex;
  gap: 15px;
  justify-content: center;
}

.features {
  margin-top: 40px;
}

.feature-card {
  text-align: center;
  padding: 30px 20px;
  transition: transform 0.3s, box-shadow 0.3s;
}

.feature-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.12);
}

.feature-icon {
  color: #667eea;
  margin-bottom: 15px;
}

.feature-card h3 {
  margin: 15px 0 10px;
  color: #333;
}

.feature-card p {
  color: #666;
  line-height: 1.6;
}
</style>
