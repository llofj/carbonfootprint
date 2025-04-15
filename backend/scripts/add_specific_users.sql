-- 为特定用户添加排名数据
-- 先删除已有的记录（如果存在）
DELETE FROM leaderboard WHERE user_id = 1;
DELETE FROM leaderboard WHERE user_id = 2;

-- 为ID为1的用户（llofj）添加排名数据
INSERT INTO leaderboard (user_id, carbon_reduction, date)
VALUES (1, 850.5, CURRENT_DATE);

-- 为ID为2的用户（test）添加排名数据
INSERT INTO leaderboard (user_id, carbon_reduction, date)
VALUES (2, 920.8, CURRENT_DATE);

-- 更新所有用户的排名
WITH ranked_users AS (
  SELECT id, user_id, carbon_reduction,
         RANK() OVER (ORDER BY carbon_reduction DESC) as new_rank
  FROM leaderboard
)
UPDATE leaderboard l
SET rank = ru.new_rank
FROM ranked_users ru
WHERE l.id = ru.id; 