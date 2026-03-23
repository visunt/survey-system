-- 添加 deadline 字段到 surveys 表
-- 执行方式：mysql -u root -p survey_platform < migrations/add_deadline.sql

ALTER TABLE surveys ADD COLUMN deadline DATETIME NULL COMMENT '问卷截止时间';

-- 如果需要添加索引以加速查询
-- ALTER TABLE surveys ADD INDEX idx_deadline (deadline);
