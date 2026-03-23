<template>
  <div class="create-survey">
    <el-page-header @back="goBack" class="page-header">
      <template #content>
        <h2>{{ isEdit ? '编辑问卷' : '创建问卷' }}</h2>
      </template>
      <template #extra>
        <el-button v-if="!isEdit" @click="showTemplateSelector = true">
          <el-icon class="el-icon--left"><DocumentCopy /></el-icon>
          从模板创建
        </el-button>
      </template>
    </el-page-header>

    <!-- 自动保存状态提示 -->
    <div v-if="isEdit && autoSaveStatus !== 'idle'" class="auto-save-status" :class="autoSaveStatus">
      <el-icon v-if="autoSaveStatus === 'saving'" class="is-loading"><Loading /></el-icon>
      <el-icon v-else-if="autoSaveStatus === 'saved'"><CircleCheck /></el-icon>
      <el-icon v-else-if="autoSaveStatus === 'error'"><CircleClose /></el-icon>
      <span>{{ autoSaveStatusText }}</span>
    </div>

    <!-- 模板选择器 -->
    <TemplateSelector
      v-model="showTemplateSelector"
      @select="handleTemplateSelect"
    />

    <el-form :model="survey" label-width="100px" class="survey-form" label-position="top">
      <el-card class="info-card">
        <template #header>
          <h3>问卷信息</h3>
        </template>
        <el-row :gutter="20">
          <el-col :xs="24" :sm="24" :md="24" :lg="24">
            <el-form-item label="问卷标题" required>
              <el-input v-model="survey.title" placeholder="请输入问卷标题" />
            </el-form-item>
          </el-col>
          <el-col :xs="24" :sm="24" :md="24" :lg="24">
            <el-form-item label="问卷描述">
              <el-input
                v-model="survey.description"
                type="textarea"
                :rows="3"
                placeholder="请输入问卷描述"
              />
            </el-form-item>
          </el-col>
          <el-col :xs="24" :sm="12" :md="12" :lg="12">
            <el-form-item label="匿名设置">
              <el-checkbox v-model="survey.allowAnonymous">允许匿名填写</el-checkbox>
            </el-form-item>
          </el-col>
          <el-col :xs="24" :sm="12" :md="12" :lg="12">
            <el-form-item label="登录设置">
              <el-checkbox v-model="survey.requireLogin">需要登录后填写</el-checkbox>
            </el-form-item>
          </el-col>
          <el-col :xs="24" :sm="24" :md="24" :lg="24">
            <el-form-item label="截止时间">
              <el-date-picker
                v-model="survey.deadline"
                type="datetime"
                placeholder="选择截止时间（可选，不设置为永不过期）"
                format="YYYY-MM-DD HH:mm"
                value-format="YYYY-MM-DD HH:mm:ss"
                :disabled-date="disabledDate"
                style="width: 100%"
              />
              <div class="deadline-tip">
                <el-icon><InfoFilled /></el-icon>
                <span>设置截止时间后，问卷将在该时间后自动关闭</span>
              </div>
            </el-form-item>
          </el-col>
        </el-row>
      </el-card>

      <el-card class="questions-card">
        <template #header>
          <div class="card-header">
            <h3>题目列表</h3>
            <el-button type="primary" :icon="Plus" @click="addQuestion">
              新增题目
            </el-button>
          </div>
        </template>

        <div v-if="survey.questions!.length === 0" class="empty-questions">
          <el-empty description="暂无题目，点击上方按钮添加题目" />
        </div>

        <div v-else class="questions-list">
          <draggable
            v-model="survey.questions"
            item-key="id"
            handle=".drag-handle"
            ghost-class="dragging"
            @end="onDragEnd"
          >
            <template #item="{ element: question, index }">
              <div
                class="question-item"
                :class="{ 'is-expanded': expandedQuestions.has(question.id) }"
              >
                <div class="drag-handle">
                  <el-icon><Rank /></el-icon>
                </div>
                <div class="question-header" @click="toggleQuestion(question.id)">
                  <div class="question-info">
                    <span class="question-number">{{ index + 1 }}.</span>
                    <div class="title-with-reference">
                      <el-input
                        v-model="question.title"
                        placeholder="请输入题目内容"
                        class="title-input-inline"
                        @click.stop
                      />
                      <el-button
                        type="primary"
                        link
                        size="small"
                        @click.stop="openReferenceDialog(index, 'title')"
                        :disabled="index === 0"
                      >
                        插入引用
                      </el-button>
                    </div>
                    <el-checkbox v-model="question.isRequired" size="small" @click.stop>必填</el-checkbox>
                    <el-tag size="small" type="info">{{ getQuestionTypeText(question.type) }}</el-tag>
                  </div>
                </div>

                <el-collapse-transition>
                  <div v-show="expandedQuestions.has(question.id)" class="question-body">
                    <!-- 题目描述（带引用功能） -->
                    <div class="question-description-row">
                      <div class="description-with-reference">
                        <el-input
                          v-model="question.description"
                          type="textarea"
                          :rows="2"
                          placeholder="题目描述（可选，支持插入引用）"
                          class="description-input"
                        />
                        <el-button
                          type="primary"
                          link
                          size="small"
                          @click="openReferenceDialog(index, 'description')"
                          :disabled="index === 0"
                        >
                          插入引用
                        </el-button>
                      </div>
                      <div class="reference-tags" v-if="extractReferences(question.title + ' ' + (question.description || '')).length > 0">
                        <el-tag
                          v-for="ref in extractReferences(question.title + ' ' + (question.description || ''))"
                          :key="ref"
                          type="warning"
                          size="small"
                          class="reference-tag"
                        >
                          {{ getReferenceLabel(ref) }}
                        </el-tag>
                      </div>
                    </div>
                    
                    <div class="question-main-row">
                      <div class="type-select-group">
                        <el-radio-group v-model="question.type" @change="onQuestionTypeChange(question)" size="small">
                          <el-radio-button value="single_choice">单选题</el-radio-button>
                          <el-radio-button value="multiple_choice">多选题</el-radio-button>
                          <el-radio-button value="dropdown_single">下拉单选</el-radio-button>
                          <el-radio-button value="dropdown_multiple">下拉多选</el-radio-button>
                          <el-radio-button value="text">文本题</el-radio-button>
                          <el-radio-button value="textarea">文本域</el-radio-button>
                          <el-radio-button value="rating">评分题</el-radio-button>
                          <el-radio-button value="date">日期题</el-radio-button>
                          <el-radio-button value="switch">开关题</el-radio-button>
                        </el-radio-group>
                      </div>
                    </div>

                    <!-- 选项配置 -->
                    <div v-if="['single_choice', 'multiple_choice', 'dropdown_single', 'dropdown_multiple'].includes(question.type)" class="options-config">
                      <el-divider content-position="left">选项设置</el-divider>

                      <div class="options-header">
                        <el-radio-group v-model="question.inputMode" size="small">
                          <el-radio-button label="batch">批量添加</el-radio-button>
                          <el-radio-button label="single">逐个添加</el-radio-button>
                        </el-radio-group>
                      </div>

                      <!-- 批量添加模式 -->
                      <div v-if="question.inputMode === 'batch'" class="batch-mode">
                        <el-input
                          v-model="question.batchText"
                          type="textarea"
                          :rows="6"
                          placeholder="请输入选项，每行一个选项&#10;例如：&#10;选项一&#10;选项二&#10;选项三"
                          @blur="parseBatchOptions(index)"
                        />
                        <div class="batch-tips">
                          <el-icon><InfoFilled /></el-icon>
                          <span>每行输入一个选项，空行将被自动忽略</span>
                        </div>
                      </div>

                      <!-- 逐个添加模式 -->
                      <div v-else class="single-mode">
                        <div v-for="(option, oIndex) in question.options" :key="oIndex" class="option-item">
                          <span class="option-label">{{ String.fromCharCode(65 + oIndex) }}.</span>
                          <el-input v-model="option.text" placeholder="请输入选项内容" class="option-input" />
                          <el-button
                            type="danger"
                            :icon="Delete"
                            circle
                            size="small"
                            @click="removeOption(index, oIndex)"
                          />
                        </div>
                        <el-button type="primary" :icon="Plus" size="small" @click="addOption(index)">
                          添加选项
                        </el-button>
                      </div>
                    </div>

                    <!-- 验证规则配置 -->
                    <div v-if="getAvailableValidationTypes(question.type).length > 0" class="validation-config">
                      <el-divider content-position="left">验证规则</el-divider>

                      <el-collapse accordion>
                        <el-collapse-item title="配置验证规则（可选）" name="validation">
                          <!-- 已添加的验证规则列表 -->
                          <div v-if="question.validationRules && question.validationRules.length > 0" class="rules-list">
                            <div v-for="(rule, rIndex) in question.validationRules" :key="rIndex" class="rule-item">
                              <div class="rule-header">
                                <el-tag size="small" type="info">{{ getValidationTypeLabel(rule.type) }}</el-tag>
                                <el-button type="danger" :icon="Delete" circle size="small" @click="removeValidationRule(index, rIndex)" />
                              </div>
                              
                              <!-- 数字范围配置 -->
                              <div v-if="rule.type === 'number_range'" class="rule-config">
                                <el-row :gutter="10">
                                  <el-col :span="12">
                                    <el-input v-model.number="rule.config!.min" placeholder="最小值" size="small">
                                      <template #prepend>最小</template>
                                    </el-input>
                                  </el-col>
                                  <el-col :span="12">
                                    <el-input v-model.number="rule.config!.max" placeholder="最大值" size="small">
                                      <template #prepend>最大</template>
                                    </el-input>
                                  </el-col>
                                </el-row>
                              </div>
                              
                              <!-- 字数限制配置 -->
                              <div v-else-if="rule.type === 'text_length'" class="rule-config">
                                <el-row :gutter="10">
                                  <el-col :span="12">
                                    <el-input v-model.number="rule.config!.min" placeholder="最小字数" size="small">
                                      <template #prepend>最小</template>
                                    </el-input>
                                  </el-col>
                                  <el-col :span="12">
                                    <el-input v-model.number="rule.config!.max" placeholder="最大字数" size="small">
                                      <template #prepend>最大</template>
                                    </el-input>
                                  </el-col>
                                </el-row>
                              </div>
                              
                              <!-- 自定义正则配置 -->
                              <div v-else-if="rule.type === 'regex'" class="rule-config">
                                <el-input v-model="rule.config!.pattern" placeholder="正则表达式，如：^[A-Za-z0-9]+$" size="small" style="margin-bottom: 8px">
                                  <template #prepend>正则</template>
                                </el-input>
                                <el-input v-model="rule.config!.message" placeholder="验证失败时的提示信息" size="small">
                                  <template #prepend>提示</template>
                                </el-input>
                              </div>
                              
                              <!-- 日期范围配置 -->
                              <div v-else-if="rule.type === 'date_range'" class="rule-config">
                                <el-row :gutter="10">
                                  <el-col :span="12">
                                    <el-date-picker
                                      v-model="rule.config!.startDate"
                                      type="date"
                                      placeholder="开始日期"
                                      value-format="YYYY-MM-DD"
                                      size="small"
                                      style="width: 100%"
                                    />
                                  </el-col>
                                  <el-col :span="12">
                                    <el-date-picker
                                      v-model="rule.config!.endDate"
                                      type="date"
                                      placeholder="结束日期"
                                      value-format="YYYY-MM-DD"
                                      size="small"
                                      style="width: 100%"
                                    />
                                  </el-col>
                                </el-row>
                              </div>
                            </div>
                          </div>

                          <!-- 添加新规则 -->
                          <el-dropdown @command="(type: string) => addValidationRule(index, type)" style="margin-top: 12px">
                            <el-button type="primary" size="small">
                              <el-icon class="el-icon--left"><Plus /></el-icon>
                              添加验证规则
                            </el-button>
                            <template #dropdown>
                              <el-dropdown-menu>
                                <el-dropdown-item
                                  v-for="type in getAvailableValidationTypes(question.type)"
                                  :key="type.value"
                                  :command="type.value"
                                >
                                  {{ type.label }}
                                </el-dropdown-item>
                              </el-dropdown-menu>
                            </template>
                          </el-dropdown>
                        </el-collapse-item>
                      </el-collapse>
                    </div>

                    <!-- 显示逻辑配置 -->
                    <div class="display-logic-config">
                      <el-divider content-position="left">显示逻辑</el-divider>

                      <el-collapse accordion>
                        <el-collapse-item name="display-logic">
                          <template #title>
                            <div class="display-logic-title">
                              <el-switch
                                v-model="(question.displayLogic as any).enabled"
                                size="small"
                                @click.stop
                                @change="onDisplayLogicEnabledChange(question)"
                              />
                              <span style="margin-left: 8px;">配置显示逻辑（可选）</span>
                            </div>
                          </template>

                          <div v-if="(question.displayLogic as any)?.enabled" class="display-logic-content">
                            <!-- 多条件逻辑选择 -->
                            <div v-if="(question.displayLogic as any).conditions.length > 1" class="logic-selector">
                              <el-radio-group v-model="(question.displayLogic as any).logic" size="small">
                                <el-radio-button value="and">同时满足（AND）</el-radio-button>
                                <el-radio-button value="or">满足任一（OR）</el-radio-button>
                              </el-radio-group>
                            </div>

                            <!-- 条件列表 -->
                            <div class="conditions-list">
                              <div v-for="(condition, cIndex) in (question.displayLogic as any).conditions" :key="cIndex" class="condition-item">
                                <div class="condition-row">
                                  <!-- 依赖题目选择 -->
                                  <el-select
                                    v-model="condition.questionId"
                                    placeholder="选择依赖题目"
                                    size="small"
                                    style="width: 200px;"
                                    @change="onConditionQuestionChange(condition)"
                                  >
                                    <el-option
                                      v-for="prevQ in getPreviousQuestions(index)"
                                      :key="prevQ.id"
                                      :label="`第${prevQ.orderIndex + 1}题: ${prevQ.title || '(未填写题目)'}`"
                                      :value="prevQ.id"
                                    />
                                  </el-select>

                                  <!-- 操作符选择 -->
                                  <el-select
                                    v-model="condition.operator"
                                    placeholder="选择操作符"
                                    size="small"
                                    style="width: 140px;"
                                  >
                                    <el-option
                                      v-for="op in getAvailableOperators(condition.questionId)"
                                      :key="op.value"
                                      :label="op.label"
                                      :value="op.value"
                                    />
                                  </el-select>

                                  <!-- 期望值输入 -->
                                  <template v-if="!['is_empty', 'is_not_empty'].includes(condition.operator)">
                                    <el-input
                                      v-if="getExpectedValueType(condition.questionId) === 'text'"
                                      v-model="condition.value"
                                      placeholder="期望值"
                                      size="small"
                                      style="width: 150px;"
                                    />
                                    <el-input-number
                                      v-else-if="getExpectedValueType(condition.questionId) === 'number'"
                                      v-model="condition.value"
                                      placeholder="期望值"
                                      size="small"
                                      style="width: 150px;"
                                    />
                                    <el-select
                                      v-else-if="getExpectedValueType(condition.questionId) === 'options'"
                                      v-model="condition.value"
                                      placeholder="选择选项"
                                      size="small"
                                      style="width: 150px;"
                                      :multiple="getDependentQuestionType(condition.questionId) === 'multiple_choice' || getDependentQuestionType(condition.questionId) === 'dropdown_multiple'"
                                    >
                                      <el-option
                                        v-for="opt in getDependentQuestionOptions(condition.questionId)"
                                        :key="opt.text"
                                        :label="opt.text"
                                        :value="opt.text"
                                      />
                                    </el-select>
                                    <el-switch
                                      v-else-if="getExpectedValueType(condition.questionId) === 'boolean'"
                                      v-model="condition.value"
                                      size="small"
                                    />
                                  </template>

                                  <!-- 删除条件按钮 -->
                                  <el-button
                                    type="danger"
                                    :icon="Delete"
                                    circle
                                    size="small"
                                    @click="removeDisplayCondition(index, cIndex)"
                                  />
                                </div>
                              </div>
                            </div>

                            <!-- 添加条件按钮 -->
                            <el-button
                              type="primary"
                              :icon="Plus"
                              size="small"
                              @click="addDisplayCondition(index)"
                              style="margin-top: 12px;"
                            >
                              添加条件
                            </el-button>

                            <div class="display-logic-tips">
                              <el-icon><InfoFilled /></el-icon>
                              <span>设置后，只有当条件满足时此题才会显示</span>
                            </div>
                          </div>
                        </el-collapse-item>
                      </el-collapse>
                    </div>
                  </div>
                </el-collapse-transition>

                <!-- 悬浮操作按钮 -->
                <div class="question-float-actions">
                  <el-button-group>
                    <el-tooltip content="上移" placement="top">
                      <el-button type="primary" :icon="Top" circle size="small" @click.stop="moveQuestion(index, -1)" :disabled="index === 0" />
                    </el-tooltip>
                    <el-tooltip content="下移" placement="top">
                      <el-button type="primary" :icon="Bottom" circle size="small" @click.stop="moveQuestion(index, 1)" :disabled="index === survey.questions!.length - 1" />
                    </el-tooltip>
                    <el-tooltip content="新增题目" placement="top">
                      <el-button type="primary" :icon="Plus" circle size="small" @click.stop="insertQuestionAfter(index)" />
                    </el-tooltip>
                    <el-tooltip content="删除题目" placement="top">
                      <el-button type="danger" :icon="Delete" circle size="small" @click.stop="removeQuestion(index)" />
                    </el-tooltip>
                  </el-button-group>
                </div>
              </div>
            </template>
          </draggable>
        </div>
      </el-card>

      <div class="actions">
        <el-button @click="goBack">取消</el-button>
        <el-button @click="openPreview">预览</el-button>
        <el-button @click="saveAsTemplate" :loading="savingAsTemplate" :icon="Star">保存为模板</el-button>
        <el-button type="success" v-if="survey.status === 'published'" @click="openShareDialog" :icon="Share">分享问卷</el-button>
        <el-button type="primary" @click="saveDraft" :loading="saving">保存草稿</el-button>
        <el-button type="success" @click="publishSurvey" :loading="publishing">发布问卷</el-button>
      </div>
    </el-form>

    <!-- 预览弹窗 -->
    <SurveyPreview v-model="showPreview" :survey-data="previewData" />

    <!-- 保存为模板弹窗 -->
    <el-dialog
      v-model="showSaveTemplateDialog"
      title="保存为模板"
      width="500px"
    >
      <el-form :model="templateForm" label-width="80px">
        <el-form-item label="模板标题">
          <el-input v-model="templateForm.title" placeholder="请输入模板标题" />
        </el-form-item>
        <el-form-item label="模板描述">
          <el-input
            v-model="templateForm.description"
            type="textarea"
            :rows="3"
            placeholder="请输入模板描述"
          />
        </el-form-item>
        <el-form-item label="分类">
          <el-select v-model="templateForm.category" placeholder="请选择分类" style="width: 100%">
            <el-option label="满意度调查" value="satisfaction" />
            <el-option label="活动报名" value="event" />
            <el-option label="产品反馈" value="feedback" />
            <el-option label="调研问卷" value="research" />
            <el-option label="其他" value="other" />
          </el-select>
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="showSaveTemplateDialog = false">取消</el-button>
        <el-button type="primary" @click="confirmSaveTemplate" :loading="savingAsTemplate">保存</el-button>
      </template>
    </el-dialog>

    <!-- 分享弹窗 -->
    <ShareDialog v-model="shareDialogVisible" :survey="survey as Survey" />
    
    <!-- 插入引用弹窗 -->
    <el-dialog
      v-model="showReferenceDialog"
      title="插入题目引用"
      width="500px"
    >
      <div class="reference-dialog-content">
        <el-select
          v-model="selectedReferenceQuestion"
          placeholder="选择要引用的前序题目"
          style="width: 100%"
        >
          <el-option
            v-for="prevQ in getPreviousQuestions(currentReferenceQuestionIndex)"
            :key="prevQ.id"
            :label="`第${getQuestionIndex(prevQ.id) + 1}题: ${prevQ.title || '(未填写题目)'}`"
            :value="prevQ.id"
          />
        </el-select>
        <div class="reference-tips">
          <el-icon><InfoFilled /></el-icon>
          <span>引用将在填写时显示为该题目的实际答案，未填写时显示为 ___</span>
        </div>
      </div>
      <template #footer>
        <el-button @click="showReferenceDialog = false">取消</el-button>
        <el-button type="primary" @click="insertReference" :disabled="!selectedReferenceQuestion">插入</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, onUnmounted, computed } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { ElMessage, ElMessageBox } from 'element-plus';
import { Delete, Plus, InfoFilled, Top, Bottom, Rank, Star, DocumentCopy, Share, Loading, CircleCheck, CircleClose } from '@element-plus/icons-vue';
import draggable from 'vuedraggable';
import { surveyAPI, type Survey, type Question, type QuestionOption, type ValidationRule, type DisplayLogic, type DisplayCondition } from '../api/survey';
import { templateAPI } from '../api/template';
import type { Template } from '../api/template';
import SurveyPreview from '../components/SurveyPreview.vue';
import TemplateSelector from '../components/TemplateSelector.vue';
import ShareDialog from '../components/ShareDialog.vue';
import { getAvailableValidationTypes } from '../utils/validation';

const router = useRouter();
const route = useRoute();

const isEdit = ref(false);
const saving = ref(false);
const publishing = ref(false);
const savingAsTemplate = ref(false);
const expandedQuestions = ref<Set<number>>(new Set());

// 自动保存相关
const autoSaveStatus = ref<'idle' | 'saving' | 'saved' | 'error'>('idle');
const lastSaveTime = ref<Date | null>(null);
let autoSaveTimer: ReturnType<typeof setInterval> | null = null;
let lastSavedData: string = '';

// 预览相关
const showPreview = ref(false);
const previewData = ref<Partial<Survey> | null>(null);

// 保存为模板相关
const showSaveTemplateDialog = ref(false);

// 分享相关
const shareDialogVisible = ref(false);

// 引用相关
const showReferenceDialog = ref(false);
const currentReferenceQuestionIndex = ref(0);
const currentReferenceField = ref<'title' | 'description'>('title');
const selectedReferenceQuestion = ref<number | undefined>(undefined);

const templateForm = reactive({
  title: '',
  description: '',
  category: 'other' as 'satisfaction' | 'event' | 'feedback' | 'research' | 'other',
});

// 模板选择器
const showTemplateSelector = ref(false);

const handleTemplateSelect = (template: Template) => {
  if (survey.questions && survey.questions.length > 0) {
    ElMessageBox.confirm(
      '使用模板将覆盖当前已添加的题目，是否继续？',
      '提示',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning',
      }
    ).then(() => {
      applyTemplate(template);
    }).catch(() => {
      // 用户取消
    });
  } else {
    applyTemplate(template);
  }
};

const applyTemplate = (template: Template) => {
  // 设置问卷基本信息
  survey.title = template.name;
  survey.description = template.description || '';

  // 转换模板题目为问卷题目
  if (template.questions && template.questions.length > 0) {
    survey.questions = template.questions.map((q: any, index: number) => ({
      id: questionIdCounter--,
      title: q.title,
      type: q.type,
      isRequired: q.isRequired,
      orderIndex: index,
      options: q.options || [],
      inputMode: 'batch',
      batchText: q.options?.map((o: any) => o.text).join('\n') || '',
    }));
    
    // 展开所有题目
    survey.questions.forEach((q: any) => {
      expandedQuestions.value.add(q.id);
    });
  }

  ElMessage.success(`已应用模板：${template.name}`);
};

const survey = reactive<Partial<Survey>>({
  title: '',
  description: '',
  allowAnonymous: false,
  requireLogin: true,
  deadline: undefined,
  questions: [],
});

let questionIdCounter = 0;
let optionIdCounter = 0;

const disabledDate = (time: Date) => {
  // 禁止选择过去的日期
  return time.getTime() < Date.now() - 8.64e7;
};

const goBack = () => {
  router.back();
};

// ============ 自动保存功能 ============
const formatTime = (date: Date): string => {
  const hours = date.getHours().toString().padStart(2, '0');
  const minutes = date.getMinutes().toString().padStart(2, '0');
  const seconds = date.getSeconds().toString().padStart(2, '0');
  return `${hours}:${minutes}:${seconds}`;
};

const getSurveySnapshot = (): string => {
  return JSON.stringify({
    title: survey.title,
    description: survey.description,
    allowAnonymous: survey.allowAnonymous,
    requireLogin: survey.requireLogin,
    deadline: survey.deadline,
    questions: survey.questions?.map(q => ({
      title: (q as any).title,
      type: (q as any).type,
      isRequired: (q as any).isRequired,
      orderIndex: (q as any).orderIndex,
      options: (q as any).options,
      batchText: (q as any).batchText,
    })),
  });
};

const hasContentChanged = (): boolean => {
  const currentData = getSurveySnapshot();
  return currentData !== lastSavedData;
};

const performAutoSave = async () => {
  // 只在编辑模式下自动保存
  if (!isEdit.value) return;
  
  // 检查是否有变更
  if (!hasContentChanged()) return;
  
  // 检查标题是否为空
  if (!survey.title?.trim()) return;

  try {
    autoSaveStatus.value = 'saving';
    
    const id = route.params.id as string;
    await surveyAPI.updateSurvey(id, { ...survey, status: survey.status || 'draft' } as Survey);
    
    // 更新状态
    autoSaveStatus.value = 'saved';
    lastSaveTime.value = new Date();
    lastSavedData = getSurveySnapshot();
    
  } catch (error: any) {
    console.error('Auto save failed:', error);
    autoSaveStatus.value = 'error';
  }
};

const startAutoSave = () => {
  if (autoSaveTimer) {
    clearInterval(autoSaveTimer);
  }
  
  // 初始化上次保存的数据
  lastSavedData = getSurveySnapshot();
  
  // 启动30秒定时器
  autoSaveTimer = setInterval(() => {
    performAutoSave();
  }, 30000);
};

const stopAutoSave = () => {
  if (autoSaveTimer) {
    clearInterval(autoSaveTimer);
    autoSaveTimer = null;
  }
};

const autoSaveStatusText = computed(() => {
  switch (autoSaveStatus.value) {
    case 'saving':
      return '正在保存...';
    case 'saved':
      return lastSaveTime.value ? `已自动保存 于 ${formatTime(lastSaveTime.value)}` : '已自动保存';
    case 'error':
      return '自动保存失败';
    default:
      return '';
  }
});
// ============ 自动保存功能结束 ============

const getQuestionTypeText = (type: string) => {
  const texts: Record<string, string> = {
    single_choice: '单选题',
    multiple_choice: '多选题',
    dropdown_single: '下拉单选',
    dropdown_multiple: '下拉多选',
    text: '文本题',
    textarea: '文本域',
    rating: '评分题',
    date: '日期题',
    switch: '开关题',
  };
  return texts[type] || type;
};

// ============ 验证规则相关 ============
const getValidationTypeLabel = (type: string): string => {
  const labels: Record<string, string> = {
    phone: '手机号验证',
    email: '邮箱验证',
    idcard: '身份证验证',
    number_range: '数字范围',
    text_length: '字数限制',
    regex: '自定义正则',
    date_range: '日期范围',
  };
  return labels[type] || type;
};

const addValidationRule = (questionIndex: number, type: string) => {
  const question = survey.questions![questionIndex] as any;
  if (!question.validationRules) {
    question.validationRules = [];
  }
  
  const newRule: ValidationRule = {
    type: type as any,
    config: {},
  };
  
  question.validationRules.push(newRule);
};

const removeValidationRule = (questionIndex: number, ruleIndex: number) => {
  const question = survey.questions![questionIndex] as any;
  if (question.validationRules) {
    question.validationRules.splice(ruleIndex, 1);
  }
};
// ============ 验证规则相关结束 ============

// ============ 显示逻辑相关 ============
const getPreviousQuestions = (currentIndex: number) => {
  // 返回当前题之前的所有题目
  return (survey.questions as any[] || [])
    .filter((q, idx) => idx < currentIndex)
    .sort((a, b) => a.orderIndex - b.orderIndex);
};

const getDependentQuestion = (questionId: number | undefined) => {
  if (!questionId) return null;
  return (survey.questions as any[] || []).find(q => q.id === questionId);
};

const getDependentQuestionType = (questionId: number | undefined) => {
  const q = getDependentQuestion(questionId);
  return q?.type;
};

const getDependentQuestionOptions = (questionId: number | undefined) => {
  const q = getDependentQuestion(questionId);
  if (!q || !q.options) return [];
  
  // 如果是批量模式，先解析
  if (q.inputMode === 'batch' && q.batchText) {
    const lines = q.batchText
      .split('\n')
      .map((line: string) => line.trim())
      .filter((line: string) => line.length > 0);
    return lines.map((text: string) => ({ text, orderIndex: 0 }));
  }
  
  return q.options || [];
};

const getAvailableOperators = (questionId: number | undefined) => {
  const type = getDependentQuestionType(questionId);
  if (!type) {
    return [
      { value: 'equals', label: '等于' },
      { value: 'not_equals', label: '不等于' },
    ];
  }

  const operators: { value: string; label: string }[] = [];

  switch (type) {
    case 'single_choice':
    case 'dropdown_single':
    case 'switch':
      operators.push(
        { value: 'equals', label: '等于' },
        { value: 'not_equals', label: '不等于' }
      );
      break;
    case 'multiple_choice':
    case 'dropdown_multiple':
      operators.push(
        { value: 'contains', label: '包含' },
        { value: 'not_contains', label: '不包含' }
      );
      break;
    case 'rating':
      operators.push(
        { value: 'equals', label: '等于' },
        { value: 'not_equals', label: '不等于' },
        { value: 'greater_than', label: '大于' },
        { value: 'less_than', label: '小于' }
      );
      break;
    case 'text':
    case 'textarea':
      operators.push(
        { value: 'equals', label: '等于' },
        { value: 'not_equals', label: '不等于' },
        { value: 'contains', label: '包含' },
        { value: 'not_contains', label: '不包含' }
      );
      break;
    case 'date':
      operators.push(
        { value: 'equals', label: '等于' },
        { value: 'not_equals', label: '不等于' },
        { value: 'greater_than', label: '晚于' },
        { value: 'less_than', label: '早于' }
      );
      break;
  }

  // 所有类型都支持 is_empty 和 is_not_empty
  operators.push(
    { value: 'is_empty', label: '为空' },
    { value: 'is_not_empty', label: '不为空' }
  );

  return operators;
};

const getExpectedValueType = (questionId: number | undefined): 'text' | 'number' | 'options' | 'boolean' | 'none' => {
  const type = getDependentQuestionType(questionId);
  if (!type) return 'text';

  switch (type) {
    case 'single_choice':
    case 'dropdown_single':
    case 'multiple_choice':
    case 'dropdown_multiple':
      return 'options';
    case 'rating':
      return 'number';
    case 'switch':
      return 'boolean';
    case 'text':
    case 'textarea':
    case 'date':
    default:
      return 'text';
  }
};

const onDisplayLogicEnabledChange = (question: any) => {
  if (question.displayLogic?.enabled && (!question.displayLogic.conditions || question.displayLogic.conditions.length === 0)) {
    // 初始化一个空条件
    question.displayLogic.conditions = [{
      questionId: undefined as any,
      operator: 'equals',
      value: '',
    }];
    question.displayLogic.logic = 'and';
  }
};

const onConditionQuestionChange = (condition: any) => {
  // 重置操作符和值
  condition.operator = 'equals';
  condition.value = '';
};

const addDisplayCondition = (questionIndex: number) => {
  const question = (survey.questions as any[])[questionIndex];
  if (!question.displayLogic) {
    question.displayLogic = { enabled: true, conditions: [], logic: 'and' };
  }
  question.displayLogic.conditions.push({
    questionId: undefined as any,
    operator: 'equals',
    value: '',
  });
};

const removeDisplayCondition = (questionIndex: number, conditionIndex: number) => {
  const question = (survey.questions as any[])[questionIndex];
  if (question.displayLogic?.conditions) {
    question.displayLogic.conditions.splice(conditionIndex, 1);
    // 如果没有条件了，关闭显示逻辑
    if (question.displayLogic.conditions.length === 0) {
      question.displayLogic.enabled = false;
    }
  }
};
// ============ 显示逻辑相关结束 ============

// ============ 题目引用相关 ============
const openReferenceDialog = (questionIndex: number, field: 'title' | 'description') => {
  currentReferenceQuestionIndex.value = questionIndex;
  currentReferenceField.value = field;
  selectedReferenceQuestion.value = undefined;
  showReferenceDialog.value = true;
};

const insertReference = () => {
  if (!selectedReferenceQuestion.value) return;
  
  const question = (survey.questions as any[])[currentReferenceQuestionIndex.value];
  const reference = `{{question_${selectedReferenceQuestion.value}}}`;
  
  if (currentReferenceField.value === 'title') {
    question.title = (question.title || '') + reference;
  } else {
    question.description = (question.description || '') + reference;
  }
  
  showReferenceDialog.value = false;
  ElMessage.success('引用已插入');
};

const extractReferences = (text: string): string[] => {
  const matches = text.match(/\{\{question_\d+\}\}/g) || [];
  return [...new Set(matches)];
};

const getQuestionIndex = (questionId: number): number => {
  return (survey.questions as any[] || []).findIndex(q => q.id === questionId);
};

const getReferenceLabel = (reference: string): string => {
  const match = reference.match(/\{\{question_(\d+)\}\}/);
  if (!match) return reference;
  
  const questionId = parseInt(match[1]);
  const questionIndex = getQuestionIndex(questionId);
  const question = (survey.questions as any[])[questionIndex];
  
  if (question) {
    return `引用: 第${questionIndex + 1}题`;
  }
  return reference;
};
// ============ 题目引用相关结束 ============

const toggleQuestion = (questionId: number) => {
  if (expandedQuestions.value.has(questionId)) {
    expandedQuestions.value.delete(questionId);
  } else {
    expandedQuestions.value.add(questionId);
  }
};

const addQuestion = () => {
  const newQuestion: any = {
    id: questionIdCounter--,
    title: '',
    description: '',
    type: 'single_choice',
    isRequired: true,
    orderIndex: survey.questions!.length,
    options: [],
    inputMode: 'batch',
    batchText: '',
    displayLogic: {
      enabled: false,
      conditions: [],
      logic: 'and',
    },
  };
  survey.questions!.push(newQuestion);
  expandedQuestions.value.add(newQuestion.id);
};

const onQuestionTypeChange = (question: any) => {
  const needsOptions = ['single_choice', 'multiple_choice', 'dropdown_single', 'dropdown_multiple'].includes(question.type);
  if (needsOptions && !question.options) {
    question.options = [];
    question.batchText = '';
  } else if (!needsOptions) {
    question.options = undefined;
    question.inputMode = undefined;
    question.batchText = undefined;
  }
};

const changeQuestionType = (question: any, type: string) => {
  question.type = type;
  onQuestionTypeChange(question);
};

const changeInputMode = (question: any, mode: string) => {
  if (question.inputMode === mode) return;
  
  const oldMode = question.inputMode;
  question.inputMode = mode;
  
  if (mode === 'single' && oldMode === 'batch' && question.batchText && question.batchText.trim()) {
    parseBatchOptions(survey.questions!.indexOf(question), false);
  } else if (mode === 'batch' && oldMode === 'single') {
    if (question.options && question.options.length > 0) {
      question.batchText = question.options.map((o: any) => o.text).join('\n');
    }
  }
};

const moveQuestion = (index: number, direction: number) => {
  const newIndex = index + direction;
  if (newIndex < 0 || newIndex >= survey.questions!.length) return;

  const questions = survey.questions!;
  [questions[index], questions[newIndex]] = [questions[newIndex], questions[index]];
  questions.forEach((q: any, i: number) => {
    q.orderIndex = i;
  });
};

const onDragEnd = async () => {
  // 更新所有题目的 orderIndex
  survey.questions!.forEach((q: any, i: number) => {
    q.orderIndex = i;
  });

  // 如果是编辑模式，自动保存到后端
  if (isEdit.value) {
    try {
      const questionOrders = survey.questions!.map((q: any) => ({
        id: q.id,
        orderIndex: q.orderIndex,
      }));
      await surveyAPI.reorderQuestions(route.params.id as string, questionOrders);
      ElMessage.success('顺序已保存');
    } catch (error: any) {
      console.error('Failed to save question order:', error);
      ElMessage.error('保存顺序失败');
    }
  }
};

const removeQuestion = (index: number) => {
  const question = survey.questions![index];
  expandedQuestions.value.delete(question.id);
  survey.questions!.splice(index, 1);
  survey.questions!.forEach((q: any, i: number) => {
    q.orderIndex = i;
  });
};

const insertQuestionAfter = (index: number) => {
  const newQuestion: any = {
    id: questionIdCounter--,
    title: '',
    description: '',
    type: 'single_choice',
    isRequired: true,
    orderIndex: index + 1,
    options: [],
    inputMode: 'batch',
    batchText: '',
    displayLogic: {
      enabled: false,
      conditions: [],
      logic: 'and',
    },
  };
  survey.questions!.splice(index + 1, 0, newQuestion);
  survey.questions!.forEach((q: any, i: number) => {
    q.orderIndex = i;
  });
  expandedQuestions.value.add(newQuestion.id);
};

const addOption = (questionIndex: number) => {
  const question = survey.questions![questionIndex] as any;
  if (!question.options) {
    question.options = [];
  }
  question.options.push({
    id: optionIdCounter--,
    text: '',
    orderIndex: question.options.length,
  });
  
  if (question.inputMode === 'single') {
    updateBatchTextFromOptions(question);
  }
};

const removeOption = (questionIndex: number, optionIndex: number) => {
  const question = survey.questions![questionIndex] as any;
  question.options!.splice(optionIndex, 1);
  question.options!.forEach((o: any, i: number) => {
    o.orderIndex = i;
  });
  
  if (question.inputMode === 'single') {
    updateBatchTextFromOptions(question);
  }
};

const parseBatchOptions = (questionIndex: number, append: boolean = false) => {
  const question = survey.questions![questionIndex] as any;
  if (!question.batchText) return;
  
  const lines = question.batchText
    .split('\n')
    .map((line: string) => line.trim())
    .filter((line: string) => line.length > 0);

  if (lines.length === 0) return;

  const newOptions = lines.map((text: string, index: number) => ({
    id: optionIdCounter--,
    text,
    orderIndex: index,
  }));
  
  if (append) {
    const existingOptions = question.options || [];
    question.options = [...existingOptions, ...newOptions];
  } else {
    question.options = newOptions;
  }
};

const updateBatchTextFromOptions = (question: any) => {
  if (question.options && question.options.length > 0) {
    question.batchText = question.options.map((o: any) => o.text).join('\n');
  }
};

const openPreview = () => {
  if (!survey.title?.trim()) {
    ElMessage.warning('请输入问卷标题后再预览');
    return;
  }

  // 深拷贝问卷数据用于预览
  const previewSurvey = JSON.parse(JSON.stringify(survey));

  // 解析所有题目的批量输入选项
  previewSurvey.questions = previewSurvey.questions.map((q: any) => {
    const needsOptions = ['single_choice', 'multiple_choice', 'dropdown_single', 'dropdown_multiple'].includes(q.type);
    
    if (needsOptions && q.inputMode === 'batch' && q.batchText) {
      // 解析批量输入
      const lines = q.batchText
        .split('\n')
        .map((line: string) => line.trim())
        .filter((line: string) => line.length > 0);
      
      q.options = lines.map((text: string, index: number) => ({
        id: -(Date.now() + index),
        text,
        orderIndex: index,
      }));
    }
    
    return q;
  });

  previewData.value = previewSurvey;
  showPreview.value = true;
};

const saveDraft = async () => {
  if (!survey.title?.trim()) {
    ElMessage.warning('请输入问卷标题');
    return;
  }

  try {
    saving.value = true;
    if (isEdit.value) {
      const id = route.params.id as string;
      await surveyAPI.updateSurvey(id, { ...survey, status: 'draft' } as Survey);
      // 更新自动保存状态
      lastSavedData = getSurveySnapshot();
      autoSaveStatus.value = 'saved';
      lastSaveTime.value = new Date();
      ElMessage.success('保存成功');
    } else {
      await surveyAPI.createSurvey({ ...survey, status: 'draft' } as Survey);
      ElMessage.success('创建成功');
      router.push('/surveys');
    }
  } catch (error: any) {
    ElMessage.error(error.response?.data?.error || '保存失败');
  } finally {
    saving.value = false;
  }
};

const publishSurvey = async () => {
  if (!survey.title?.trim()) {
    ElMessage.warning('请输入问卷标题');
    return;
  }

  if (!survey.questions || survey.questions.length === 0) {
    ElMessage.warning('请至少添加一道题目');
    return;
  }

  for (const question of survey.questions as any[]) {
    if (!question.title?.trim()) {
      ElMessage.warning('请填写所有题目的标题');
      return;
    }
    if (['single_choice', 'multiple_choice', 'dropdown_single', 'dropdown_multiple'].includes(question.type)) {
      if (question.inputMode === 'batch' && question.batchText) {
        parseBatchOptions(survey.questions!.indexOf(question));
      }
      if (!question.options || question.options.length === 0) {
        ElMessage.warning('选择题至少需要一个选项');
        return;
      }
      if (question.options.some((o: any) => !o.text?.trim())) {
        ElMessage.warning('请填写所有选项的内容');
        return;
      }
    }
  }

  try {
    publishing.value = true;
    let surveyId: string;

    if (isEdit.value) {
      const id = route.params.id as string;
      await surveyAPI.updateSurvey(id, { ...survey, status: 'published' } as Survey);
      // 更新自动保存状态
      lastSavedData = getSurveySnapshot();
      surveyId = id;
    } else {
      const response = await surveyAPI.createSurvey({ ...survey, status: 'published' } as Survey);
      surveyId = response.data.id!;
    }

    ElMessage.success('发布成功');
    router.push(`/surveys/${surveyId}`);
  } catch (error: any) {
    ElMessage.error(error.response?.data?.error || '发布失败');
  } finally {
    publishing.value = false;
  }
};

const saveAsTemplate = () => {
  if (!survey.title?.trim()) {
    ElMessage.warning('请输入问卷标题');
    return;
  }

  if (!survey.questions || survey.questions.length === 0) {
    ElMessage.warning('请至少添加一道题目');
    return;
  }

  // 填充默认值
  templateForm.title = survey.title;
  templateForm.description = survey.description || '';
  templateForm.category = 'other';

  showSaveTemplateDialog.value = true;
};

const openShareDialog = () => {
  if (!survey.id) return;
  shareDialogVisible.value = true;
};

const confirmSaveTemplate = async () => {
  if (!templateForm.title?.trim()) {
    ElMessage.warning('请输入模板标题');
    return;
  }

  // 准备模板数据
  const templateQuestions = (survey.questions as any[]).map((q: any) => {
    // 处理批量模式下的选项
    let options = q.options;
    if (q.inputMode === 'batch' && q.batchText) {
      const lines = q.batchText
        .split('\n')
        .map((line: string) => line.trim())
        .filter((line: string) => line.length > 0);
      options = lines.map((text: string, index: number) => ({
        text,
        orderIndex: index,
      }));
    }

    return {
      title: q.title,
      type: q.type,
      isRequired: q.isRequired,
      orderIndex: q.orderIndex,
      options,
    };
  });

  try {
    savingAsTemplate.value = true;
    await templateAPI.createTemplate({
      title: templateForm.title,
      description: templateForm.description,
      category: templateForm.category,
      questions: templateQuestions,
    });
    ElMessage.success('保存为模板成功');
    showSaveTemplateDialog.value = false;
  } catch (error: any) {
    console.error('Failed to save as template:', error);
    ElMessage.error(error.response?.data?.error || '保存模板失败');
  } finally {
    savingAsTemplate.value = false;
  }
};

const loadSurvey = async () => {
  if (route.name === 'EditSurvey') {
    isEdit.value = true;
    try {
      const id = route.params.id as string;
      const response = await surveyAPI.getSurveyById(id);
      const data = response.data;

      survey.title = data.title;
      survey.description = data.description;
      survey.allowAnonymous = data.allowAnonymous;
      survey.requireLogin = data.requireLogin;
      survey.status = data.status;
      survey.deadline = data.deadline;
      survey.questions = (data.questions || []).map((q: any) => ({
        ...q,
        inputMode: 'single',
        batchText: '',
        displayLogic: q.displayLogic || {
          enabled: false,
          conditions: [],
          logic: 'and',
        },
      }));
      
      // 展开所有已加载的题目
      survey.questions?.forEach((q: any) => {
        expandedQuestions.value.add(q.id);
      });
      
      // 启动自动保存
      startAutoSave();
    } catch (error) {
      console.error('Failed to load survey:', error);
      ElMessage.error('加载问卷失败');
    }
  }
};

onMounted(() => {
  loadSurvey();
});

onUnmounted(() => {
  stopAutoSave();
});
</script>

<style scoped>
.create-survey {
  padding: 20px 0;
  max-width: 1200px;
  margin: 0 auto;
}

.page-header {
  margin-bottom: 20px;
}

.page-header h2 {
  margin: 0;
}

.auto-save-status {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 8px 16px;
  margin-bottom: 16px;
  border-radius: 6px;
  font-size: 13px;
  transition: all 0.3s;
}

.auto-save-status.saving {
  background: #ecf5ff;
  color: #409eff;
}

.auto-save-status.saved {
  background: #f0f9ff;
  color: #67c23a;
}

.auto-save-status.error {
  background: #fef0f0;
  color: #f56c6c;
}

.auto-save-status .el-icon {
  font-size: 14px;
}

.auto-save-status .is-loading {
  animation: rotating 2s linear infinite;
}

@keyframes rotating {
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
}

.survey-form {
  padding: 0 20px;
}

.info-card {
  margin-bottom: 20px;
}

.info-card h3 {
  margin: 0;
}

.deadline-tip {
  display: flex;
  align-items: center;
  gap: 6px;
  margin-top: 8px;
  color: #909399;
  font-size: 12px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 12px;
}

.card-header h3 {
  margin: 0;
}

.questions-card {
  margin-bottom: 20px;
}

.empty-questions {
  padding: 40px 0;
}

.questions-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
  margin-top: 20px;
}

.question-item {
  border: 1px solid #e4e7ed;
  border-radius: 8px;
  background: #fff;
  overflow: hidden;
  transition: box-shadow 0.3s;
  position: relative;
  display: flex;
}

.question-item:hover {
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
}

.question-item.is-expanded {
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.12);
}

.question-item.dragging {
  opacity: 0.5;
  transform: scale(1.02);
  box-shadow: 0 8px 24px rgba(102, 126, 234, 0.3);
}

.drag-handle {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  padding: 0;
  cursor: grab;
  color: #909399;
  flex-shrink: 0;
  transition: color 0.2s ease, background 0.2s ease;
  border-right: 1px solid #f0f0f0;
}

.drag-handle:hover {
  color: #667eea;
  background: #f5f7fa;
}

.drag-handle:active {
  cursor: grabbing;
  color: #667eea;
}

.drag-handle .el-icon {
  font-size: 18px;
}

.question-float-actions {
  position: absolute;
  right: 0;
  bottom: 0;
  display: flex;
  gap: 6px;
  opacity: 0;
  transition: opacity 0.2s ease;
  z-index: 10;
}

.question-float-actions .el-button-group {
  background: rgba(255, 255, 255, 0.95);
  border-radius: 12px;
  padding: 4px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.question-item:hover .question-float-actions {
  opacity: 1;
}

.question-float-actions .el-button {
  box-shadow: none;
  transition: all 0.2s ease;
}

.question-float-actions .el-button:hover {
  transform: scale(1.1);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
}

.question-float-actions .el-button--primary {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}

.question-float-actions .el-button--danger {
  background: linear-gradient(135deg, #f5576c 0%, #f093fb 100%);
}

.question-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px;
  cursor: pointer;
  background: #fafafa;
  transition: background 0.3s;
}

.question-header:hover {
  background: #f0f2f5;
}

.question-info {
  display: flex;
  align-items: center;
  gap: 12px;
  flex: 1;
  min-width: 0;
  flex-wrap: wrap;
}

.question-number {
  font-weight: 600;
  color: #667eea;
  min-width: 24px;
  flex-shrink: 0;
  height: 32px;
  display: flex;
  align-items: center;
}

.question-title-preview {
  flex: 1;
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  color: #303133;
  height: 32px;
  display: flex;
  align-items: center;
}

.title-input-inline {
  flex: 1;
  height: 32px;
  display: flex;
  align-items: center;
}

.title-input-inline :deep(.el-input__wrapper) {
  height: 100%;
  display: flex;
  align-items: center;
}

.title-input-inline :deep(.el-input__inner) {
  height: 100%;
  display: flex;
  align-items: center;
}

.title-input-inline :deep(.el-input__inner input) {
  height: 100%;
  padding: 0 12px;
  line-height: normal;
}

.title-input-inline :deep(.el-tag) {
  margin-left: 8px;
  flex-shrink: 0;
  height: 24px;
  display: inline-flex;
  align-items: center;
}

.title-with-reference {
  flex: 1;
  display: flex;
  align-items: center;
  gap: 8px;
  height: 32px;
}

.description-with-reference {
  display: flex;
  align-items: flex-start;
  gap: 8px;
  margin-bottom: 8px;
}

.description-input {
  flex: 1;
}

.reference-tags {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
  margin-top: 8px;
}

.reference-tag {
  font-size: 12px;
}

.question-description-row {
  margin-bottom: 16px;
}

.title-input-inline :deep(.el-checkbox) {
  margin-left: 8px;
  flex-shrink: 0;
}

.question-actions {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-shrink: 0;
}

.question-body {
  padding: 20px;
  border-top: 1px solid #e4e7ed;
  background: #fff;
}

.question-main-row {
  display: flex;
  gap: 16px;
  align-items: flex-start;
  flex-wrap: wrap;
}

.question-main-row .el-form-item {
  margin-bottom: 16px;
}

.title-input-item {
  flex: 1;
  min-width: 200px;
}

.type-input-item {
  flex-shrink: 0;
}

.required-input-item {
  flex-shrink: 0;
  margin-top: 24px;
}

.type-select-group {
  flex: 1;
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.type-select-group .el-radio-button {
  flex-shrink: 0;
}

.options-config {
  margin-top: 16px;
  padding: 16px;
  background: #fafafa;
  border-radius: 8px;
}

.options-header {
  margin-bottom: 12px;
}

.single-mode {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.option-item {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
}

.option-label {
  color: #666;
  min-width: 24px;
  flex-shrink: 0;
}

.option-input {
  flex: 1;
  min-width: 200px;
}

.batch-mode {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.batch-tips {
  display: flex;
  align-items: center;
  gap: 6px;
  color: #909399;
  font-size: 12px;
}

.validation-config {
  margin-top: 16px;
  padding: 16px;
  background: #f0f9ff;
  border-radius: 8px;
}

.display-logic-config {
  margin-top: 16px;
  padding: 16px;
  background: #fff7e6;
  border-radius: 8px;
}

.display-logic-title {
  display: flex;
  align-items: center;
}

.display-logic-content {
  margin-top: 12px;
}

.logic-selector {
  margin-bottom: 12px;
}

.conditions-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.condition-item {
  padding: 12px;
  background: #fff;
  border-radius: 6px;
  border: 1px solid #e4e7ed;
}

.condition-row {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
}

.display-logic-tips {
  display: flex;
  align-items: center;
  gap: 6px;
  margin-top: 12px;
  color: #909399;
  font-size: 12px;
}

.rules-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.rule-item {
  padding: 12px;
  background: #fff;
  border-radius: 6px;
  border: 1px solid #e4e7ed;
}

.rule-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
}

.rule-config {
  margin-top: 8px;
}

.reference-dialog-content {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.reference-tips {
  display: flex;
  align-items: center;
  gap: 6px;
  color: #909399;
  font-size: 12px;
}

.actions {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  margin-top: 40px;
  padding: 0 20px 20px;
  flex-wrap: wrap;
}

@media (max-width: 768px) {
  .create-survey {
    padding: 10px 0;
  }

  .survey-form {
    padding: 0 10px;
  }

  .question-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 12px;
  }

  .question-info {
    width: 100%;
    flex-wrap: wrap;
  }

  .question-title-preview {
    width: 100%;
    order: 3;
  }

  .question-actions {
    width: 100%;
    justify-content: flex-end;
  }

  .option-item {
    flex-direction: column;
    align-items: flex-start;
  }

  .option-input {
    width: 100%;
  }

  .actions {
    flex-direction: column;
    padding: 0 10px 10px;
  }

  .actions .el-button {
    width: 100%;
  }
}

@media (min-width: 769px) and (max-width: 1024px) {
  .survey-form {
    padding: 0 40px;
  }
}
</style>
