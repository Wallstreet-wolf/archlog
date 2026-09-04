-- 为 arrows 表增加环值原始字符串字段，用于区分 X 环与普通 10 环
-- X 环在 score 中按 10 分计算，ring 中保存原始值 'X'
ALTER TABLE arrows ADD COLUMN ring text;
