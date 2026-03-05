<template>
  <div class="home">
    <nav v-if="!isAuthenticated" class="nav-bar">
      <div class="nav-content">
        <router-link to="/" class="logo-link">
          <img src="/logo.svg" alt="VMU Logo" class="logo-image" />
          <span class="logo-text">问卷平台</span>
        </router-link>
        
        <div class="nav-links" :class="{ 'mobile-open': mobileMenuOpen }">
          <router-link to="/surveys" class="nav-link">问卷列表</router-link>
          <router-link to="/create-survey" class="nav-link">创建问卷</router-link>
          <a href="#features" class="nav-link" @click="closeMobileMenu">功能介绍</a>
          <a href="#how-it-works" class="nav-link" @click="closeMobileMenu">使用指南</a>
        </div>

        <div class="auth-buttons">
          <router-link to="/login">
            <el-button type="primary" plain>登录</el-button>
          </router-link>
          <router-link to="/register">
            <el-button type="primary">注册</el-button>
          </router-link>
        </div>

        <button class="mobile-menu-btn" @click="toggleMobileMenu">
          <el-icon size="24"><Menu v-if="!mobileMenuOpen" /><Close v-else /></el-icon>
        </button>
      </div>
    </nav>

    <header class="hero-section">
      <div class="hero-particles">
        <div class="particle" v-for="n in 20" :key="n" :style="getParticleStyle(n)"></div>
      </div>
      <div class="hero-content">
        <div class="hero-logo-wrapper fade-in">
          <img src="/logo.svg" alt="VMU Logo" class="hero-logo" />
        </div>
        <h1 class="title fade-in">问卷平台</h1>
        <p class="subtitle fade-in">智能 · 高效 · 专业</p>
        <p class="description fade-in">
          AI 驱动的在线问卷调查系统，一站式创建、发布、收集与分析
        </p>
        <div class="actions fade-in">
          <el-button type="primary" size="large" @click="goToCreate" class="cta-btn">
            <el-icon><Plus /></el-icon>
            立即创建问卷
          </el-button>
          <el-button size="large" @click="goToSurveys" class="secondary-btn">
            <el-icon><List /></el-icon>
            浏览问卷
          </el-button>
        </div>
      </div>
      <div class="hero-wave">
        <svg viewBox="0 0 1440 120" preserveAspectRatio="none">
          <path d="M0,64 C480,150 960,-20 1440,64 L1440,120 L0,120 Z" fill="#f8fafc"/>
        </svg>
      </div>
    </header>

    <section class="stats-section">
      <div class="stats-container">
        <div class="stat-item fade-in-up" v-for="(stat, index) in stats" :key="index">
          <div class="stat-number">
            <span class="counter" :data-target="stat.value">{{ stat.displayValue }}</span>
            <span class="stat-suffix">{{ stat.suffix }}</span>
          </div>
          <div class="stat-label">{{ stat.label }}</div>
        </div>
      </div>
    </section>

    <section id="features" class="features-section">
      <h2 class="section-title fade-in-up">核心功能</h2>
      <p class="section-subtitle fade-in-up">全方位满足您的问卷需求</p>
      <div class="features">
        <el-row :gutter="24" justify="center">
          <el-col :xs="24" :sm="12" :md="8" v-for="(feature, index) in features" :key="index">
            <article class="feature-card fade-in-up" :style="{ animationDelay: `${index * 0.1}s` }">
              <div class="feature-icon-wrapper">
                <el-icon size="36"><component :is="feature.icon" /></el-icon>
              </div>
              <h3>{{ feature.title }}</h3>
              <p>{{ feature.description }}</p>
            </article>
          </el-col>
        </el-row>
      </div>
    </section>

    <section id="how-it-works" class="how-it-works">
      <h2 class="section-title fade-in-up">三步开始</h2>
      <p class="section-subtitle fade-in-up">简单易用，快速上手</p>
      <div class="steps-container">
        <div class="step-line"></div>
        <el-row :gutter="40">
          <el-col :xs="24" :sm="8" v-for="(step, index) in steps" :key="index">
            <div class="step fade-in-up" :style="{ animationDelay: `${index * 0.15}s` }">
              <div class="step-number">{{ index + 1 }}</div>
              <div class="step-icon">
                <el-icon size="32"><component :is="step.icon" /></el-icon>
              </div>
              <h3>{{ step.title }}</h3>
              <p>{{ step.description }}</p>
            </div>
          </el-col>
        </el-row>
      </div>
    </section>

    <section class="question-types">
      <h2 class="section-title fade-in-up">支持多种题型</h2>
      <p class="section-subtitle fade-in-up">灵活配置，满足各类调查场景</p>
      <div class="types-grid">
        <div class="type-item fade-in-up" v-for="(type, index) in questionTypes" :key="index" :style="{ animationDelay: `${index * 0.05}s` }">
          <div class="type-icon">
            <el-icon size="28"><component :is="type.icon" /></el-icon>
          </div>
          <span>{{ type.name }}</span>
        </div>
      </div>
    </section>

    <section class="testimonials-section">
      <h2 class="section-title fade-in-up">用户评价</h2>
      <p class="section-subtitle fade-in-up">来自真实用户的反馈</p>
      <div class="testimonials">
        <el-row :gutter="24" justify="center">
          <el-col :xs="24" :md="8" v-for="(testimonial, index) in testimonials" :key="index">
            <div class="testimonial-card fade-in-up" :style="{ animationDelay: `${index * 0.1}s` }">
              <div class="testimonial-content">
                <el-icon size="24" class="quote-icon"><ChatDotRound /></el-icon>
                <p>{{ testimonial.content }}</p>
              </div>
              <div class="testimonial-author">
                <div class="author-avatar">{{ testimonial.avatar }}</div>
                <div class="author-info">
                  <div class="author-name">{{ testimonial.name }}</div>
                  <div class="author-title">{{ testimonial.title }}</div>
                </div>
              </div>
            </div>
          </el-col>
        </el-row>
      </div>
    </section>

    <section class="cta-section">
      <div class="cta-content">
        <h2 class="fade-in-up">准备好开始了吗？</h2>
        <p class="fade-in-up">免费使用，无需信用卡，立即体验</p>
        <el-button type="primary" size="large" @click="goToCreate" class="cta-btn fade-in-up">
          免费创建问卷
          <el-icon class="btn-arrow"><ArrowRight /></el-icon>
        </el-button>
      </div>
    </section>

    <footer class="footer">
      <div class="footer-content">
        <div class="footer-brand">
          <img src="/logo.svg" alt="VMU Logo" class="footer-logo" />
          <span>问卷平台</span>
        </div>
        <div class="footer-links">
          <a href="#features">功能介绍</a>
          <a href="#how-it-works">使用指南</a>
          <router-link to="/surveys">问卷列表</router-link>
        </div>
        <div class="footer-copyright">
          <p>© 2024 问卷平台 - AI Powered Survey System</p>
          <p>vmumu.com</p>
        </div>
      </div>
    </footer>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, markRaw, computed } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from '../stores/auth';
import { 
  Edit, Share, DataAnalysis, CircleCheck, Finished, EditPen, 
  Star, ArrowDown, Calendar, Switch, Document, Plus, List,
  Menu, Close, ArrowRight, ChatDotRound, Setting, User, Timer
} from '@element-plus/icons-vue';

const router = useRouter();
const authStore = useAuthStore();
const mobileMenuOpen = ref(false);

const isAuthenticated = computed(() => authStore.isAuthenticated);

const stats = [
  { value: 10000, displayValue: '10,000', suffix: '+', label: '活跃用户' },
  { value: 50000, displayValue: '50,000', suffix: '+', label: '已创建问卷' },
  { value: 1000000, displayValue: '100万', suffix: '+', label: '收集答卷' },
  { value: 99.9, displayValue: '99.9', suffix: '%', label: '系统可用率' },
];

const features = [
  { icon: markRaw(Edit), title: '灵活创建', description: '支持8种题型，拖拽排序，逻辑跳转，满足复杂调查需求' },
  { icon: markRaw(Share), title: '便捷分享', description: '一键生成链接和二维码，支持微信、邮件等多渠道分发' },
  { icon: markRaw(DataAnalysis), title: '智能分析', description: '实时数据统计，可视化图表，一键导出专业报告' },
  { icon: markRaw(Timer), title: '高效收集', description: '支持批量导入联系人，定时发送提醒，提升回收率' },
  { icon: markRaw(Setting), title: '个性化定制', description: '自定义主题样式，品牌Logo，打造专属问卷' },
  { icon: markRaw(User), title: '团队协作', description: '多人协同编辑，权限管理，提升团队效率' },
];

const steps = [
  { icon: markRaw(Edit), title: '创建问卷', description: '选择模板或从零开始，添加题目和选项' },
  { icon: markRaw(Share), title: '发布分享', description: '获取专属链接或二维码，分享给目标用户' },
  { icon: markRaw(DataAnalysis), title: '收集分析', description: '实时查看统计数据，导出分析报告' },
];

const questionTypes = [
  { icon: markRaw(CircleCheck), name: '单选题' },
  { icon: markRaw(Finished), name: '多选题' },
  { icon: markRaw(EditPen), name: '文本题' },
  { icon: markRaw(Star), name: '评分题' },
  { icon: markRaw(ArrowDown), name: '下拉选择' },
  { icon: markRaw(Calendar), name: '日期题' },
  { icon: markRaw(Switch), name: '开关题' },
  { icon: markRaw(Document), name: '文本域' },
];

const testimonials = [
  { 
    content: '界面简洁易用，功能强大，帮助我们快速完成了市场调研工作。数据分析功能特别实用！', 
    name: '张经理', 
    title: '市场部主管',
    avatar: '张'
  },
  { 
    content: '作为高校教师，我用它来收集学生反馈。题型丰富，统计直观，大大提高了工作效率。', 
    name: '李教授', 
    title: '大学教师',
    avatar: '李'
  },
  { 
    content: '团队协作功能很棒，多人可以同时编辑问卷。客户服务响应也很及时，五星好评！', 
    name: '王总监', 
    title: '产品总监',
    avatar: '王'
  },
];

const getParticleStyle = (n: number) => {
  const size = Math.random() * 6 + 2;
  return {
    width: `${size}px`,
    height: `${size}px`,
    left: `${Math.random() * 100}%`,
    top: `${Math.random() * 100}%`,
    animationDelay: `${Math.random() * 5}s`,
    animationDuration: `${Math.random() * 10 + 10}s`,
  };
};

const toggleMobileMenu = () => {
  mobileMenuOpen.value = !mobileMenuOpen.value;
};

const closeMobileMenu = () => {
  mobileMenuOpen.value = false;
};

const goToSurveys = () => {
  router.push('/surveys');
};

const goToCreate = () => {
  router.push('/create-survey');
};

onMounted(() => {
  const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
  };

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
      }
    });
  }, observerOptions);

  document.querySelectorAll('.fade-in, .fade-in-up').forEach(el => {
    observer.observe(el);
  });
});
</script>

<style scoped>
.home {
  padding: 0;
  min-height: 100vh;
  background: #f8fafc;
}

.nav-bar {
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(10px);
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.08);
  position: sticky;
  top: 0;
  z-index: 1000;
}

.nav-content {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 24px;
  height: 64px;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.logo-link {
  display: flex;
  align-items: center;
  gap: 12px;
  text-decoration: none;
}

.logo-image {
  height: 36px;
  width: auto;
}

.logo-text {
  font-size: 18px;
  font-weight: 600;
  color: #1a1a2e;
  letter-spacing: -0.5px;
}

.nav-links {
  display: flex;
  gap: 32px;
}

.nav-link {
  color: #64748b;
  text-decoration: none;
  font-weight: 500;
  font-size: 15px;
  transition: all 0.3s ease;
  position: relative;
}

.nav-link::after {
  content: '';
  position: absolute;
  bottom: -4px;
  left: 0;
  width: 0;
  height: 2px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  transition: width 0.3s ease;
}

.nav-link:hover {
  color: #667eea;
}

.nav-link:hover::after {
  width: 100%;
}

.auth-buttons {
  display: flex;
  gap: 12px;
}

.auth-buttons a {
  text-decoration: none;
}

.mobile-menu-btn {
  display: none;
  background: none;
  border: none;
  cursor: pointer;
  padding: 8px;
  color: #64748b;
}

.hero-section {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 50%, #f093fb 100%);
  color: white;
  padding: 100px 24px 140px;
  text-align: center;
  position: relative;
  overflow: hidden;
}

.hero-particles {
  position: absolute;
  inset: 0;
  overflow: hidden;
}

.particle {
  position: absolute;
  background: rgba(255, 255, 255, 0.3);
  border-radius: 50%;
  animation: float linear infinite;
}

@keyframes float {
  0%, 100% {
    transform: translateY(0) translateX(0);
    opacity: 0;
  }
  10% {
    opacity: 1;
  }
  90% {
    opacity: 1;
  }
  100% {
    transform: translateY(-100vh) translateX(50px);
    opacity: 0;
  }
}

.hero-content {
  max-width: 800px;
  margin: 0 auto;
  position: relative;
  z-index: 1;
}

.hero-logo-wrapper {
  margin-bottom: 24px;
}

.hero-logo {
  width: 100px;
  height: 100px;
  filter: drop-shadow(0 8px 24px rgba(0, 0, 0, 0.2));
  animation: pulse 3s ease-in-out infinite;
}

@keyframes pulse {
  0%, 100% {
    transform: scale(1);
  }
  50% {
    transform: scale(1.05);
  }
}

.title {
  font-size: 56px;
  margin: 0 0 12px;
  font-weight: 700;
  letter-spacing: -1px;
  text-shadow: 0 2px 20px rgba(0, 0, 0, 0.1);
}

.subtitle {
  font-size: 24px;
  margin: 0 0 16px;
  opacity: 0.95;
  font-weight: 300;
  letter-spacing: 4px;
}

.description {
  font-size: 18px;
  opacity: 0.9;
  margin-bottom: 40px;
  line-height: 1.8;
  max-width: 600px;
  margin-left: auto;
  margin-right: auto;
}

.actions {
  display: flex;
  gap: 16px;
  justify-content: center;
  flex-wrap: wrap;
}

.cta-btn {
  padding: 14px 32px !important;
  font-size: 16px !important;
  font-weight: 600 !important;
  border-radius: 12px !important;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%) !important;
  border: none !important;
  box-shadow: 0 4px 20px rgba(102, 126, 234, 0.4) !important;
  transition: all 0.3s ease !important;
}

.cta-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 30px rgba(102, 126, 234, 0.5) !important;
}

.secondary-btn {
  padding: 14px 32px !important;
  font-size: 16px !important;
  font-weight: 600 !important;
  border-radius: 12px !important;
  background: rgba(255, 255, 255, 0.15) !important;
  border: 2px solid rgba(255, 255, 255, 0.3) !important;
  color: white !important;
  backdrop-filter: blur(10px);
  transition: all 0.3s ease !important;
}

.secondary-btn:hover {
  background: rgba(255, 255, 255, 0.25) !important;
  border-color: rgba(255, 255, 255, 0.5) !important;
}

.hero-wave {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  line-height: 0;
}

.hero-wave svg {
  width: 100%;
  height: 80px;
}

.stats-section {
  padding: 60px 24px;
  background: #f8fafc;
}

.stats-container {
  max-width: 1000px;
  margin: 0 auto;
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 32px;
}

.stat-item {
  text-align: center;
  padding: 24px;
  background: white;
  border-radius: 16px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.05);
  transition: transform 0.3s ease;
}

.stat-item:hover {
  transform: translateY(-4px);
}

.stat-number {
  font-size: 36px;
  font-weight: 700;
  color: #667eea;
  margin-bottom: 8px;
}

.stat-suffix {
  font-size: 24px;
}

.stat-label {
  font-size: 14px;
  color: #64748b;
  font-weight: 500;
}

.section-title {
  text-align: center;
  font-size: 36px;
  margin-bottom: 12px;
  color: #1a1a2e;
  font-weight: 700;
  letter-spacing: -0.5px;
}

.section-subtitle {
  text-align: center;
  font-size: 18px;
  color: #64748b;
  margin-bottom: 48px;
}

.features-section {
  padding: 80px 24px;
  background: white;
}

.features {
  max-width: 1200px;
  margin: 0 auto;
}

.features .el-row {
  justify-content: center;
}

.feature-card {
  background: #f8fafc;
  text-align: center;
  padding: 40px 28px;
  border-radius: 20px;
  transition: all 0.4s ease;
  height: 100%;
  border: 1px solid transparent;
}

.feature-card:hover {
  transform: translateY(-8px);
  box-shadow: 0 20px 40px rgba(102, 126, 234, 0.15);
  border-color: rgba(102, 126, 234, 0.2);
  background: white;
}

.feature-icon-wrapper {
  width: 72px;
  height: 72px;
  margin: 0 auto 24px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  transition: transform 0.3s ease;
}

.feature-card:hover .feature-icon-wrapper {
  transform: scale(1.1) rotate(5deg);
}

.feature-card h3 {
  margin: 0 0 12px;
  color: #1a1a2e;
  font-size: 20px;
  font-weight: 600;
}

.feature-card p {
  color: #64748b;
  line-height: 1.7;
  margin: 0;
  font-size: 15px;
}

.how-it-works {
  padding: 80px 24px;
  background: #f8fafc;
}

.steps-container {
  max-width: 1000px;
  margin: 0 auto;
  position: relative;
}

.step-line {
  position: absolute;
  top: 50px;
  left: 16.67%;
  right: 16.67%;
  height: 3px;
  background: linear-gradient(90deg, #667eea, #764ba2, #f093fb);
  border-radius: 2px;
}

.step {
  text-align: center;
  padding: 32px 20px;
  position: relative;
}

.step-number {
  width: 56px;
  height: 56px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 22px;
  font-weight: 700;
  margin: 0 auto 20px;
  position: relative;
  z-index: 1;
  box-shadow: 0 8px 24px rgba(102, 126, 234, 0.3);
}

.step-icon {
  color: #667eea;
  margin-bottom: 16px;
}

.step h3 {
  margin: 0 0 8px;
  color: #1a1a2e;
  font-size: 18px;
  font-weight: 600;
}

.step p {
  color: #64748b;
  margin: 0;
  font-size: 14px;
  line-height: 1.6;
}

.question-types {
  padding: 80px 24px;
  background: white;
}

.types-grid {
  max-width: 900px;
  margin: 0 auto;
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 20px;
}

.type-item {
  background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%);
  padding: 28px 20px;
  border-radius: 16px;
  text-align: center;
  transition: all 0.3s ease;
  border: 1px solid transparent;
}

.type-item:hover {
  transform: translateY(-4px);
  box-shadow: 0 12px 24px rgba(102, 126, 234, 0.12);
  border-color: rgba(102, 126, 234, 0.2);
  background: white;
}

.type-icon {
  color: #667eea;
  margin-bottom: 12px;
}

.type-item span {
  display: block;
  color: #1a1a2e;
  font-weight: 500;
  font-size: 15px;
}

.testimonials-section {
  padding: 80px 24px;
  background: linear-gradient(180deg, #f8fafc 0%, #f1f5f9 100%);
}

.testimonials {
  max-width: 1200px;
  margin: 0 auto;
}

.testimonials .el-row {
  justify-content: center;
}

.testimonial-card {
  background: white;
  padding: 32px;
  border-radius: 20px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.05);
  height: 100%;
  display: flex;
  flex-direction: column;
  transition: all 0.3s ease;
}

.testimonial-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 12px 32px rgba(102, 126, 234, 0.12);
}

.testimonial-content {
  flex: 1;
  margin-bottom: 24px;
}

.quote-icon {
  color: #667eea;
  opacity: 0.3;
  margin-bottom: 12px;
}

.testimonial-content p {
  color: #475569;
  line-height: 1.8;
  font-size: 15px;
  margin: 0;
}

.testimonial-author {
  display: flex;
  align-items: center;
  gap: 12px;
  padding-top: 20px;
  border-top: 1px solid #f1f5f9;
}

.author-avatar {
  width: 44px;
  height: 44px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-weight: 600;
  font-size: 18px;
}

.author-info {
  flex: 1;
}

.author-name {
  font-weight: 600;
  color: #1a1a2e;
  font-size: 15px;
}

.author-title {
  font-size: 13px;
  color: #64748b;
}

.cta-section {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 50%, #f093fb 100%);
  color: white;
  padding: 100px 24px;
  text-align: center;
  position: relative;
  overflow: hidden;
}

.cta-section::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.05'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E");
}

.cta-content {
  position: relative;
  z-index: 1;
}

.cta-section h2 {
  font-size: 40px;
  margin: 0 0 12px;
  font-weight: 700;
}

.cta-section p {
  font-size: 18px;
  opacity: 0.9;
  margin: 0 0 32px;
}

.btn-arrow {
  margin-left: 8px;
  transition: transform 0.3s ease;
}

.cta-btn:hover .btn-arrow {
  transform: translateX(4px);
}

.footer {
  background: #1a1a2e;
  color: white;
  padding: 48px 24px;
}

.footer-content {
  max-width: 1200px;
  margin: 0 auto;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 24px;
}

.footer-brand {
  display: flex;
  align-items: center;
  gap: 12px;
}

.footer-logo {
  height: 32px;
  width: auto;
}

.footer-brand span {
  font-size: 18px;
  font-weight: 600;
}

.footer-links {
  display: flex;
  gap: 32px;
}

.footer-links a {
  color: #94a3b8;
  text-decoration: none;
  font-size: 14px;
  transition: color 0.3s ease;
}

.footer-links a:hover {
  color: white;
}

.footer-copyright {
  text-align: center;
  padding-top: 24px;
  border-top: 1px solid #2d2d44;
  width: 100%;
}

.footer-copyright p {
  margin: 4px 0;
  font-size: 13px;
  color: #64748b;
}

.fade-in {
  opacity: 0;
  transform: translateY(20px);
  transition: opacity 0.6s ease, transform 0.6s ease;
}

.fade-in-up {
  opacity: 0;
  transform: translateY(30px);
  transition: opacity 0.6s ease, transform 0.6s ease;
}

.fade-in.visible,
.fade-in-up.visible {
  opacity: 1;
  transform: translateY(0);
}

@media (max-width: 1024px) {
  .stats-container {
    grid-template-columns: repeat(2, 1fr);
  }
  
  .types-grid {
    grid-template-columns: repeat(4, 1fr);
  }
}

@media (max-width: 768px) {
  .nav-links {
    display: none;
    position: absolute;
    top: 64px;
    left: 0;
    right: 0;
    background: white;
    flex-direction: column;
    padding: 20px;
    gap: 16px;
    box-shadow: 0 8px 24px rgba(0, 0, 0, 0.1);
  }

  .nav-links.mobile-open {
    display: flex;
  }

  .auth-buttons {
    display: none;
  }

  .mobile-menu-btn {
    display: block;
  }

  .logo-text {
    display: none;
  }

  .title {
    font-size: 36px;
  }

  .subtitle {
    font-size: 16px;
    letter-spacing: 2px;
  }

  .description {
    font-size: 16px;
  }

  .section-title {
    font-size: 28px;
  }

  .section-subtitle {
    font-size: 16px;
    margin-bottom: 32px;
  }

  .stats-container {
    grid-template-columns: repeat(2, 1fr);
    gap: 16px;
  }

  .stat-number {
    font-size: 28px;
  }

  .types-grid {
    grid-template-columns: repeat(2, 1fr);
    gap: 12px;
  }

  .step-line {
    display: none;
  }

  .cta-section h2 {
    font-size: 28px;
  }

  .footer-links {
    flex-wrap: wrap;
    justify-content: center;
    gap: 16px;
  }
}
</style>
