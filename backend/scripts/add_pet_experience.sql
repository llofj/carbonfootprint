-- 为virtual_pets表添加experience字段
ALTER TABLE virtual_pets ADD COLUMN IF NOT EXISTS experience INTEGER DEFAULT 0;

-- 更新现有宠物的经验值
UPDATE virtual_pets SET experience = (level - 1) * 100 WHERE experience = 0; 