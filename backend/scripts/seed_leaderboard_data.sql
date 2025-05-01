-- 在leaderboard表中插入200条随机排名数据
-- 首先确保users表有足够多的用户
-- 创建临时表来存储用户数据
CREATE TEMPORARY TABLE temp_users (
  username VARCHAR(50),
  email VARCHAR(100),
  password VARCHAR(100)
);

-- 插入200个虚拟用户数据
INSERT INTO temp_users (username, email, password)
SELECT 
  'eco_user_' || i,
  'eco_user_' || i || '@example.com',
  '$2a$10$6LMc.qGxLYYLGzwti3aV4.QBtV1AULkzgHgkSeDYR1dEOQfM4Vxxa' -- 加密后的'123456'
FROM generate_series(1, 200) i
WHERE NOT EXISTS (
  SELECT 1 FROM users WHERE username = 'eco_user_' || i
);

-- 将临时表中的用户插入users表
INSERT INTO users (username, email, password)
SELECT username, email, password
FROM temp_users
ON CONFLICT (username) DO NOTHING;

-- 为每个用户生成随机的碳减排数据
INSERT INTO leaderboard (user_id, carbon_reduction, rank, date)
SELECT 
  u.id,
  (random() * 1000 + 50)::DECIMAL(10,2), -- 生成50-1050之间的随机减排量
  1, -- 初始排名设为1，后面会更新
  CURRENT_DATE - (random() * 30)::INTEGER -- 最近30天内的随机日期
FROM users u
LEFT JOIN leaderboard l ON u.id = l.user_id
WHERE l.user_id IS NULL AND u.username LIKE 'eco_user_%';

-- 更新排名
WITH ranked_users AS (
  SELECT 
    id, 
    user_id, 
    carbon_reduction,
    RANK() OVER (ORDER BY carbon_reduction DESC) as new_rank
  FROM leaderboard
)
UPDATE leaderboard l
SET rank = ru.new_rank
FROM ranked_users ru
WHERE l.id = ru.id;

-- 删除临时表
DROP TABLE temp_users; 