<template>
  <el-dialog
    v-model="visible"
    title="从模板创建"
    width="800px"
    :close-on-click-modal="false"
  >
    <div class="template-selector">
      <!-- 分类标签 -->
      <div class="category-tabs">
        <el-tag
          v-for="cat in categories"
          :key="cat.value"
          :type="selectedCategory === cat.value ? '' : 'info'"
          :effect="selectedCategory === cat.value ? 'dark' : 'plain'"
          @click="selectedCategory = cat.value"
          class="category-tag"
        >
          {{ cat.label }}
        </el-tag>
      </div>

      <!-- 模板列表 -->
      <el-empty v-if="loading" description="加载中..." />
      
      <el-empty v-else-if="filteredTemplates.length === 0" description="暂无模板" />
      
      <div v-else class="template-grid">
        <el-card
          v-for="template in filteredTemplates"
          :key="template.id"
          class="template-card"
          :class="{ 'selected': selectedTemplate?.id === template.id }"
          @click="selectTemplate(template)"
          shadow="hover"
        >
          <div class="template-icon">
            <el-icon :size="32">
              <component :is="getIcon(template.icon)" />
            </el-icon>
          </div>
          <div class="template-info">
            <h4>{{ template.name }}</h4>
            <p class="template-desc">{{ template.description }}</p>
            <div class="template-meta">
              <span>{{ template.usageCount }} 次使用</span>
            </div>
          </div>
        </el-card>
      </div>
    </div>

    <template #footer>
      <el-button @click="handleCancel">取消</el-button>
      <el-button type="primary" :disabled="!selectedTemplate" @click="handleConfirm">
        使用此模板
      </el-button>
    </template>
  </el-dialog>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue';
import { ElMessage } from 'element-plus';
import {
  Document,
  User,
  ChatDotRound,
  Calendar,
  Box,
  Reading,
} from '@element-plus/icons-vue';
import { templateAPI, type Template, type TemplateCategory } from '../api/template';

const props = defineProps<{
  modelValue: boolean;
}>();

const emit = defineEmits<{
  'update:modelValue': [value: boolean];
  'select': [template: Template];
}>();

const visible = computed({
  get: () => props.modelValue,
  set: (val) => emit('update:modelValue', val),
});

const loading = ref(false);
const templates = ref<Template[]>([]);
const categories = ref<TemplateCategory[]>([]);
const selectedCategory = ref('all');
const selectedTemplate = ref<Template | null>(null);

const iconMap: Record<string, any> = {
  Document,
  User,
  ChatDotRound,
  Calendar,
  Box,
  Reading,
};

const getIcon = (iconName: string) => {
  return iconMap[iconName] || Document;
};

const filteredTemplates = computed(() => {
  if (selectedCategory.value === 'all') {
    return templates.value;
  }
  return templates.value.filter(t => t.category === selectedCategory.value);
});

const loadTemplates = async () => {
  loading.value = true;
  try {
    const [templatesRes, categoriesRes] = await Promise.all([
      templateAPI.getTemplates(),
      templateAPI.getCategories(),
    ]);
    templates.value = templatesRes.data;
    categories.value = categoriesRes.data;
  } catch (error) {
    console.error('Load templates error:', error);
    ElMessage.error('加载模板失败');
  } finally {
    loading.value = false;
  }
};

const selectTemplate = (template: Template) => {
  selectedTemplate.value = template;
};

const handleCancel = () => {
  visible.value = false;
  selectedTemplate.value = null;
};

const handleConfirm = async () => {
  if (!selectedTemplate.value) return;
  
  try {
    // 获取完整的模板数据（包含题目）
    const res = await templateAPI.getTemplateById(selectedTemplate.value.id);
    emit('select', res.data);
    visible.value = false;
    selectedTemplate.value = null;
  } catch (error) {
    console.error('Get template detail error:', error);
    ElMessage.error('获取模板详情失败');
  }
};

watch(visible, (val) => {
  if (val) {
    loadTemplates();
    selectedTemplate.value = null;
  }
});
</script>

<style scoped>
.template-selector {
  min-height: 400px;
}

.category-tabs {
  margin-bottom: 20px;
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
}

.category-tag {
  cursor: pointer;
  transition: all 0.2s;
}

.category-tag:hover {
  transform: scale(1.05);
}

.template-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(340px, 1fr));
  gap: 16px;
  max-height: 450px;
  overflow-y: auto;
}

.template-card {
  cursor: pointer;
  transition: all 0.2s;
  border: 2px solid transparent;
}

.template-card:hover {
  border-color: #409eff;
}

.template-card.selected {
  border-color: #67c23a;
  background: #f0f9ff;
}

.template-card :deep(.el-card__body) {
  display: flex;
  gap: 16px;
  padding: 16px;
}

.template-icon {
  width: 60px;
  height: 60px;
  background: #f0f9ff;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #409eff;
  flex-shrink: 0;
}

.template-info {
  flex: 1;
  min-width: 0;
}

.template-info h4 {
  margin: 0 0 8px 0;
  font-size: 16px;
  color: #303133;
}

.template-desc {
  margin: 0 0 8px 0;
  font-size: 13px;
  color: #909399;
  line-height: 1.5;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.template-meta {
  font-size: 12px;
  color: #c0c4cc;
}
</style>
