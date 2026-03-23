-- Migration: Add displayLogic column to questions table
-- This migration adds support for display logic conditions that control question visibility
-- Date: 2024-03-23

-- Add displayLogic column if it doesn't exist
ALTER TABLE questions 
ADD COLUMN IF NOT EXISTS displayLogic JSON NULL 
COMMENT '显示逻辑配置，用于控制题目显示条件';

-- The displayLogic JSON structure:
-- {
--   "enabled": boolean,
--   "conditions": [
--     {
--       "questionId": number,
--       "operator": "equals" | "not_equals" | "contains" | "not_contains" | "greater_than" | "less_than" | "is_empty" | "is_not_empty",
--       "value": string | number | boolean
--     }
--   ],
--   "logic": "and" | "or"
-- }
