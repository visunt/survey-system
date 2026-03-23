/**
 * 验证规则类型定义
 */
export interface ValidationRule {
  type: 'phone' | 'email' | 'idcard' | 'number_range' | 'text_length' | 'regex' | 'date_range';
  config?: {
    min?: number;
    max?: number;
    pattern?: string;
    message?: string;
    startDate?: string;
    endDate?: string;
  };
}

/**
 * 验证手机号（中国大陆）
 */
export const validatePhone = (value: string): boolean => {
  const phoneRegex = /^1[3-9]\d{9}$/;
  return phoneRegex.test(value);
};

/**
 * 验证邮箱
 */
export const validateEmail = (value: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(value);
};

/**
 * 验证身份证号（中国大陆）
 */
export const validateIdCard = (value: string): boolean => {
  // 15位或18位身份证号
  const idCardRegex = /(^\d{15}$)|(^\d{18}$)|(^\d{17}(\d|X|x)$)/;
  if (!idCardRegex.test(value)) {
    return false;
  }
  
  // 如果是18位，校验校验码
  if (value.length === 18) {
    const weights = [7, 9, 10, 5, 8, 4, 2, 1, 6, 3, 7, 9, 10, 5, 8, 4, 2];
    const checkCodes = ['1', '0', 'X', '9', '8', '7', '6', '5', '4', '3', '2'];
    let sum = 0;
    for (let i = 0; i < 17; i++) {
      sum += parseInt(value[i]) * weights[i];
    }
    const checkCode = checkCodes[sum % 11];
    return value[17].toUpperCase() === checkCode;
  }
  
  return true;
};

/**
 * 验证数字范围
 */
export const validateNumberRange = (value: string, min?: number, max?: number): boolean => {
  const num = parseFloat(value);
  if (isNaN(num)) {
    return false;
  }
  
  if (min !== undefined && num < min) {
    return false;
  }
  
  if (max !== undefined && num > max) {
    return false;
  }
  
  return true;
};

/**
 * 验证文本长度
 */
export const validateTextLength = (value: string, min?: number, max?: number): boolean => {
  const length = value.length;
  
  if (min !== undefined && length < min) {
    return false;
  }
  
  if (max !== undefined && length > max) {
    return false;
  }
  
  return true;
};

/**
 * 验证正则表达式
 */
export const validateRegex = (value: string, pattern: string): boolean => {
  try {
    // 防注入：限制正则表达式的复杂度
    if (pattern.length > 500) {
      console.warn('Regex pattern too long, potential attack');
      return false;
    }
    
    const regex = new RegExp(pattern);
    return regex.test(value);
  } catch (error) {
    console.error('Invalid regex pattern:', error);
    return false;
  }
};

/**
 * 验证日期范围
 */
export const validateDateRange = (value: string, startDate?: string, endDate?: string): boolean => {
  const date = new Date(value);
  
  if (isNaN(date.getTime())) {
    return false;
  }
  
  if (startDate) {
    const start = new Date(startDate);
    if (date < start) {
      return false;
    }
  }
  
  if (endDate) {
    const end = new Date(endDate);
    if (date > end) {
      return false;
    }
  }
  
  return true;
};

/**
 * 根据验证规则验证值
 * @returns { valid: boolean, message?: string }
 */
export const validateByRule = (
  value: string,
  rule: ValidationRule,
  questionType: string
): { valid: boolean; message?: string } => {
  // 空值不验证（必填由 isRequired 字段控制）
  if (!value || value.trim() === '') {
    return { valid: true };
  }
  
  const { type, config = {} } = rule;
  
  switch (type) {
    case 'phone':
      if (!validatePhone(value)) {
        return { valid: false, message: '请输入正确的手机号码' };
      }
      break;
      
    case 'email':
      if (!validateEmail(value)) {
        return { valid: false, message: '请输入正确的邮箱地址' };
      }
      break;
      
    case 'idcard':
      if (!validateIdCard(value)) {
        return { valid: false, message: '请输入正确的身份证号码' };
      }
      break;
      
    case 'number_range':
      if (!validateNumberRange(value, config.min, config.max)) {
        const rangeText = config.min !== undefined && config.max !== undefined
          ? `在 ${config.min} 到 ${config.max} 之间`
          : config.min !== undefined
            ? `不小于 ${config.min}`
            : config.max !== undefined
              ? `不大于 ${config.max}`
              : '';
        return { valid: false, message: `请输入${rangeText}的数字` };
      }
      break;
      
    case 'text_length':
      if (!validateTextLength(value, config.min, config.max)) {
        const lengthText = config.min !== undefined && config.max !== undefined
          ? `${config.min} 到 ${config.max} 个字符`
          : config.min !== undefined
            ? `至少 ${config.min} 个字符`
            : config.max !== undefined
              ? `最多 ${config.max} 个字符`
              : '';
        return { valid: false, message: `请输入${lengthText}` };
      }
      break;
      
    case 'regex':
      if (!config.pattern) {
        console.warn('Regex validation rule missing pattern');
        return { valid: true };
      }
      if (!validateRegex(value, config.pattern)) {
        return { valid: false, message: config.message || '格式不正确' };
      }
      break;
      
    case 'date_range':
      if (questionType !== 'date') {
        console.warn('Date range validation only applicable to date questions');
        return { valid: true };
      }
      if (!validateDateRange(value, config.startDate, config.endDate)) {
        const rangeText = config.startDate && config.endDate
          ? `${config.startDate} 到 ${config.endDate} 之间`
          : config.startDate
            ? `${config.startDate} 之后`
            : config.endDate
              ? `${config.endDate} 之前`
              : '';
        return { valid: false, message: `请选择${rangeText}的日期` };
      }
      break;
      
    default:
      console.warn(`Unknown validation type: ${type}`);
  }
  
  return { valid: true };
};

/**
 * 验证所有规则
 */
export const validateAllRules = (
  value: string,
  rules: ValidationRule[],
  questionType: string
): { valid: boolean; messages: string[] } => {
  const messages: string[] = [];
  
  for (const rule of rules) {
    const result = validateByRule(value, rule, questionType);
    if (!result.valid && result.message) {
      messages.push(result.message);
    }
  }
  
  return {
    valid: messages.length === 0,
    messages,
  };
};

/**
 * 获取适用于特定题型的验证规则类型
 */
export const getAvailableValidationTypes = (questionType: string): Array<{ value: string; label: string }> => {
  const textTypes = ['text', 'textarea'];
  const dateTypes = ['date'];
  
  if (textTypes.includes(questionType)) {
    return [
      { value: 'phone', label: '手机号验证' },
      { value: 'email', label: '邮箱验证' },
      { value: 'idcard', label: '身份证验证' },
      { value: 'number_range', label: '数字范围' },
      { value: 'text_length', label: '字数限制' },
      { value: 'regex', label: '自定义正则' },
    ];
  }
  
  if (dateTypes.includes(questionType)) {
    return [
      { value: 'date_range', label: '日期范围' },
    ];
  }
  
  return [];
};
