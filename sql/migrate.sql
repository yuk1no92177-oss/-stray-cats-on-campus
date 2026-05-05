-- Migration: Add is_banned column and new low-difficulty badges
-- Run this against the stray_cats database

-- 1. Add is_banned column to users table
ALTER TABLE users ADD COLUMN is_banned TINYINT DEFAULT 0 COMMENT '是否被封禁' AFTER role;

-- 2. Insert low-difficulty badges (skip duplicates)
INSERT IGNORE INTO badges (badge_name, badge_desc, icon, condition_type, condition_value) VALUES
('初次邂逅', '投喂第一只猫咪', 'bowl', 'feed_count', 1),
('探索新手', '打卡过1只猫咪', 'paw', 'cat_unlocked', 1),
('爱心传递', '累计投喂5次', 'bowl', 'feed_count', 5),
('热心铲屎官', '累计打卡10次', 'clipboard', 'report_count', 10),
('投喂达人', '累计投喂20次', 'bowl', 'feed_count', 20),
('寻猫先锋', '打卡过5只不同猫咪', 'paw', 'cat_unlocked', 5);
