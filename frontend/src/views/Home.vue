<template>
  <div class="home">
    <!-- Hero Section -->
    <header class="hero-section">
      <div class="hero-content">
        <h1 class="title">问卷平台</h1>
        <p class="subtitle">专业的在线问卷调查系统</p>
        <p class="description">
          创建、发布和收集问卷数据的一站式解决方案。支持多种题型、数据分析和可视化统计功能。
        </p>
        <div class="actions">
          <el-button type="primary" size="large" @click="goToSurveys">
            浏览问卷
          </el-button>
          <el-button type="success" size="large" @click="goToCreate">
            创建问卷
          </el-button>
        </div>
      </div>
    </header>

    <!-- Features Section -->
    <section class="features-section" aria-labelledby="features-title">
      <h2 id="features-title" class="section-title">核心功能</h2>
      <el-row :gutter="20" class="features">
        <el-col :xs="24" :sm="12" :md="8">
          <article class="feature-card">
            <div class="feature-icon">
              <el-icon size="48"><Edit /></el-icon>
            </div>
            <h3>创建问卷</h3>
            <p>支持多种题型，包括单选、多选、文本、评分、下拉选择等，满足各种调查需求</p>
          </article>
        </el-col>
        <el-col :xs="24" :sm="12" :md="8">
          <article class="feature-card">
            <div class="feature-icon">
              <el-icon size="48"><Share /></el-icon>
            </div>
            <h3>发布分享</h3>
            <p>一键发布问卷，生成专属链接，支持二维码分享，轻松触达目标用户</p>
          </article>
        </el-col>
        <el-col :xs="24" :sm="12" :md="8">
          <article class="feature-card">
            <div class="feature-icon">
              <el-icon size="48"><DataAnalysis /></el-icon>
            </div>
            <h3>数据分析</h3>
            <p>实时查看问卷结果，数据可视化统计，支持导出报表，洞察数据价值</p>
          </article>
        </el-col>
      </el-row>
    </section>

    <!-- How It Works Section -->
    <section class="how-it-works" aria-labelledby="how-title">
      <h2 id="how-title" class="section-title">如何使用</h2>
      <el-row :gutter="20">
        <el-col :xs="24" :sm="8">
          <div class="step">
            <div class="step-number">1</div>
            <h3>创建问卷</h3>
            <p>登录后点击创建问卷，添加题目和选项</p>
          </div>
        </el-col>
        <el-col :xs="24" :sm="8">
          <div class="step">
            <div class="step-number">2</div>
            <h3>发布分享</h3>
            <p>发布问卷后获取链接，分享给目标用户</p>
          </div>
        </el-col>
        <el-col :xs="24" :sm="8">
          <div class="step">
            <div class="step-number">3</div>
            <h3>收集分析</h3>
            <p>实时查看统计数据，导出分析报告</p>
          </div>
        </el-col>
      </el-row>
    </section>

    <!-- Question Types Section -->
    <section class="question-types" aria-labelledby="types-title">
      <h2 id="types-title" class="section-title">支持的题型</h2>
      <el-row :gutter="20">
        <el-col :xs="12" :sm="8" :md="6">
          <div class="type-item">
            <el-icon size="32"><CircleCheck /></el-icon>
            <span>单选题</span>
          </div>
        </el-col>
        <el-col :xs="12" :sm="8" :md="6">
          <div class="type-item">
            <el-icon size="32"><Finished /></el-icon>
            <span>多选题</span>
          </div>
        </el-col>
        <el-col :xs="12" :sm="8" :md="6">
          <div class="type-item">
            <el-icon size="32"><EditPen /></el-icon>
            <span>文本题</span>
          </div>
        </el-col>
        <el-col :xs="12" :sm="8" :md="6">
          <div class="type-item">
            <el-icon size="32"><Star /></el-icon>
            <span>评分题</span>
          </div>
        </el-col>
        <el-col :xs="12" :sm="8" :md="6">
          <div class="type-item">
            <el-icon size="32"><ArrowDown /></el-icon>
            <span>下拉选择</span>
          </div>
        </el-col>
        <el-col :xs="12" :sm="8" :md="6">
          <div class="type-item">
            <el-icon size="32"><Calendar /></el-icon>
            <span>日期题</span>
          </div>
        </el-col>
        <el-col :xs="12" :sm="8" :md="6">
          <div class="type-item">
            <el-icon size="32"><Switch /></el-icon>
            <span>开关题</span>
          </div>
        </el-col>
        <el-col :xs="12" :sm="8" :md="6">
          <div class="type-item">
            <el-icon size="32"><Document /></el-icon>
            <span>文本域</span>
          </div>
        </el-col>
      </el-row>
    </section>

    <!-- CTA Section -->
    <section class="cta-section">
      <h2>立即开始创建您的问卷</h2>
      <p>免费使用，无需信用卡</p>
      <el-button type="primary" size="large" @click="goToCreate">
        免费创建问卷
      </el-button>
    </section>
  </div>
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router';
import { Edit, Share, DataAnalysis, CircleCheck, Finished, EditPen, Star, ArrowDown, Calendar, Switch, Document } from '@element-plus/icons-vue';

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
  padding: 0;
}

.hero-section {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  padding: 80px 20px;
  text-align: center;
}

.hero-content {
  max-width: 800px;
  margin: 0 auto;
}

.title {
  font-size: 56px;
  margin: 0 0 10px;
  font-weight: 700;
}

.subtitle {
  font-size: 24px;
  margin: 0 0 20px;
  opacity: 0.95;
}

.description {
  font-size: 18px;
  opacity: 0.9;
  margin-bottom: 40px;
  line-height: 1.6;
}

.actions {
  display: flex;
  gap: 15px;
  justify-content: center;
  flex-wrap: wrap;
}

.section-title {
  text-align: center;
  font-size: 32px;
  margin-bottom: 40px;
  color: #333;
}

.features-section {
  padding: 60px 20px;
  background: #f8f9fa;
}

.features {
  max-width: 1200px;
  margin: 0 auto;
}

.feature-card {
  background: white;
  text-align: center;
  padding: 40px 20px;
  border-radius: 12px;
  transition: transform 0.3s, box-shadow 0.3s;
  height: 100%;
}

.feature-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 12px 30px rgba(0, 0, 0, 0.15);
}

.feature-icon {
  color: #667eea;
  margin-bottom: 20px;
}

.feature-card h3 {
  margin: 0 0 15px;
  color: #333;
  font-size: 20px;
}

.feature-card p {
  color: #666;
  line-height: 1.6;
  margin: 0;
}

.how-it-works {
  padding: 60px 20px;
  max-width: 1200px;
  margin: 0 auto;
}

.step {
  text-align: center;
  padding: 30px 20px;
}

.step-number {
  width: 60px;
  height: 60px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 24px;
  font-weight: bold;
  margin: 0 auto 20px;
}

.step h3 {
  margin: 0 0 10px;
  color: #333;
}

.step p {
  color: #666;
  margin: 0;
}

.question-types {
  padding: 60px 20px;
  background: #f8f9fa;
}

.question-types .el-row {
  max-width: 1200px;
  margin: 0 auto;
}

.type-item {
  background: white;
  padding: 30px 20px;
  border-radius: 8px;
  text-align: center;
  margin-bottom: 20px;
  transition: transform 0.3s, box-shadow 0.3s;
}

.type-item:hover {
  transform: translateY(-3px);
  box-shadow: 0 8px 20px rgba(0, 0, 0, 0.1);
}

.type-item .el-icon {
  color: #667eea;
  margin-bottom: 10px;
}

.type-item span {
  display: block;
  color: #333;
  font-weight: 500;
}

.cta-section {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  padding: 80px 20px;
  text-align: center;
}

.cta-section h2 {
  font-size: 36px;
  margin: 0 0 15px;
}

.cta-section p {
  font-size: 18px;
  opacity: 0.9;
  margin: 0 0 30px;
}

@media (max-width: 768px) {
  .title {
    font-size: 36px;
  }

  .subtitle {
    font-size: 18px;
  }

  .description {
    font-size: 16px;
  }

  .section-title {
    font-size: 24px;
  }

  .cta-section h2 {
    font-size: 24px;
  }
}
</style>
