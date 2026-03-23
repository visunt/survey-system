-- 添加 validation_rules 字段到 questions 表
-- 用于存储题目的验证规则配置

ALTER TABLE questions 
ADD COLUMN validation_rules JSON NULL 
COMMENT '验证规则配置，支持phone/email/idcard/number_range/text_length/regex/date_range等规则';

-- 说明：
-- validation_rules 字段存储 ValidationRule[] 数组的 JSON 格式
-- 示例数据：
-- [
--   {"type": "phone"},
--   {"type": "email"},
--   {"type": "text_length", "config": {"min": 10, "max": 100}},
--   {"type": "number_range", "config": {"min": 0, "max": 100}},
--   {"type": "regex", "config": {"pattern": "^[A-Za-z0-9]+$", "message": "只能输入字母和数字"}},
--   {"type": "date_range", "config": {"startDate": "2024-01-01", "endDate": "2024-12-31"}}
-- ]
