-- 创建数据库
--CREATE DATABASE carbon_footprint;

-- 切换到数据库
--\c carbon_footprint;

-- 创建用户表
CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  username VARCHAR(50) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  email VARCHAR(100) UNIQUE NOT NULL
);

-- 创建碳排放记录表
CREATE TABLE carbon_emissions (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id),
  category VARCHAR(50),
  sub_category VARCHAR(50),
  amount DECIMAL,
  date DATE
);

-- 创建虚拟宠物表
CREATE TABLE virtual_pets (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id),
  name VARCHAR(50),
  level INTEGER,
  health VARCHAR(50),
  coins INTEGER
);

-- 创建成就表
CREATE TABLE achievements (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id),
  achievement_id VARCHAR(100) NOT NULL,
  achievement_name VARCHAR(100),
  date DATE
);

-- 创建排名表
CREATE TABLE leaderboard (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id),
  carbon_reduction DECIMAL,
  rank INTEGER,
  date DATE
);

-- 添加索引以提高查询性能
CREATE TABLE step_records (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id),
  steps INTEGER NOT NULL,
  carbon_reduction DECIMAL,
  coins_earned INTEGER,
  date DATE DEFAULT CURRENT_DATE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 为提高查询性能添加索引
CREATE INDEX idx_achievements_user_id ON achievements(user_id);
CREATE INDEX idx_achievements_id ON achievements(achievement_id);
CREATE INDEX idx_leaderboard_user_id ON leaderboard(user_id);
CREATE INDEX idx_leaderboard_rank ON leaderboard(rank);
CREATE INDEX idx_step_records_user_id ON step_records(user_id);
CREATE INDEX idx_carbon_emissions_user_id ON carbon_emissions(user_id);