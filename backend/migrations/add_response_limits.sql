-- 添加回收限制相关字段到 surveys 表
-- 执行方式：mysql -u root -p survey_platform < migrations/add_response_limits.sql

ALTER TABLE surveys 
  ADD COLUMN response_limit INT NULL COMMENT '回收数量上限，NULL表示无限制' AFTER deadline,
  ADD COLUMN max_responses_per_user INT NOT NULL DEFAULT 1 COMMENT '每人限填次数，0表示不限制' AFTER response_limit;

-- 添加索引以加速查询
ALTER TABLE surveys ADD INDEX idx_response_limit (response_limit);
