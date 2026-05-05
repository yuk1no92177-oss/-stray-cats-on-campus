-- 校园流浪猫系统数据库建表脚本
-- 兼容 MySQL 8.0 / MariaDB 10.4+

-- 创建数据库
CREATE DATABASE IF NOT EXISTS stray_cats DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE stray_cats;

-- 猫咪信息表
CREATE TABLE IF NOT EXISTS cats (
    id INT PRIMARY KEY AUTO_INCREMENT,
    cat_name VARCHAR(50) NOT NULL COMMENT '猫咪名字',
    color VARCHAR(30) COMMENT '毛色',
    gender ENUM('公','母','未知') DEFAULT '未知',
    age VARCHAR(20) COMMENT '年龄',
    character_desc TEXT COMMENT '性格',
    health_status VARCHAR(20) DEFAULT '健康',
    is_neutered TINYINT DEFAULT 0 COMMENT '是否绝育 0=否 1=是',
    location VARCHAR(100) COMMENT '常出没位置',
    longitude DECIMAL(12,8) COMMENT '经度',
    latitude DECIMAL(12,8) COMMENT '纬度',
    photo_url VARCHAR(255) COMMENT '猫咪照片URL',
    area VARCHAR(20) DEFAULT '西校区' COMMENT '所属区域：西校区/东校区',
    is_active TINYINT DEFAULT 1 COMMENT '是否活跃 0=离开/失踪 1=活跃',
    create_time DATETIME DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_location (location),
    INDEX idx_coordinate (longitude, latitude),
    INDEX idx_area (area)
) COMMENT='校园流浪猫信息表';

-- 用户表
CREATE TABLE IF NOT EXISTS users (
    id INT PRIMARY KEY AUTO_INCREMENT,
    username VARCHAR(50) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL COMMENT 'bcrypt加密密码',
    nickname VARCHAR(50) COMMENT '昵称',
    phone VARCHAR(20),
    avatar_url VARCHAR(255) COMMENT '头像URL',
    role ENUM('user','admin') DEFAULT 'user',
    is_banned TINYINT DEFAULT 0 COMMENT '是否被封禁',
    create_time DATETIME DEFAULT CURRENT_TIMESTAMP
) COMMENT='用户表';

-- 上报/打卡记录表
CREATE TABLE IF NOT EXISTS reports (
    id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT NOT NULL,
    cat_id INT,
    description TEXT COMMENT '用户备注',
    location VARCHAR(100) COMMENT '位置描述',
    longitude DECIMAL(12,8) COMMENT 'GPS经度',
    latitude DECIMAL(12,8) COMMENT 'GPS纬度',
    photo_url VARCHAR(255) COMMENT '上传照片URL',
    health_status VARCHAR(20) COMMENT '打卡时填写的健康状态',
    report_type ENUM('偶遇','投喂') DEFAULT '偶遇',
    status ENUM('待审核','已通过','已驳回') DEFAULT '待审核',
    create_time DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (cat_id) REFERENCES cats(id) ON DELETE SET NULL,
    INDEX idx_status (status),
    INDEX idx_cat_id (cat_id),
    INDEX idx_user_id (user_id)
) COMMENT='流浪猫打卡上报记录表';

-- 投喂记录表
CREATE TABLE IF NOT EXISTS feeds (
    id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT NOT NULL,
    cat_id INT NOT NULL,
    food VARCHAR(50) COMMENT '投喂食物',
    feed_time DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (cat_id) REFERENCES cats(id) ON DELETE CASCADE,
    INDEX idx_cat_id (cat_id)
) COMMENT='猫咪投喂记录表';

-- 评论/故事墙表
CREATE TABLE IF NOT EXISTS comments (
    id INT PRIMARY KEY AUTO_INCREMENT,
    cat_id INT NOT NULL,
    user_id INT NOT NULL,
    content TEXT NOT NULL COMMENT '评论内容',
    create_time DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (cat_id) REFERENCES cats(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_cat_id (cat_id)
) COMMENT='猫咪故事墙/评论表';

-- 勋章表
CREATE TABLE IF NOT EXISTS badges (
    id INT PRIMARY KEY AUTO_INCREMENT,
    badge_name VARCHAR(50) NOT NULL,
    badge_desc VARCHAR(255) COMMENT '勋章描述',
    icon VARCHAR(50) COMMENT '图标名',
    condition_type ENUM('report_count','feed_count','cat_unlocked','days_active') COMMENT '解锁条件类型',
    condition_value INT DEFAULT 1 COMMENT '解锁条件值'
) COMMENT='勋章定义表';

-- 用户勋章关联表
CREATE TABLE IF NOT EXISTS user_badges (
    id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT NOT NULL,
    badge_id INT NOT NULL,
    unlock_time DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (badge_id) REFERENCES badges(id) ON DELETE CASCADE,
    UNIQUE KEY uk_user_badge (user_id, badge_id)
) COMMENT='用户已解锁勋章表';

-- 收藏表
CREATE TABLE IF NOT EXISTS favorites (
    id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT NOT NULL,
    cat_id INT NOT NULL,
    create_time DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (cat_id) REFERENCES cats(id) ON DELETE CASCADE,
    UNIQUE KEY uk_user_cat (user_id, cat_id)
) COMMENT='用户收藏猫咪表';

-- =====================
-- 初始数据
-- =====================

-- 插入初始猫咪数据（河海大学江宁校区 主校区坐标中心: 31.9139°N, 118.7862°E）
INSERT INTO cats (cat_name, color, gender, age, character_desc, health_status, is_neutered, location, longitude, latitude, area, photo_url) VALUES
('胖虎', '橘色', '公', '3岁', '沉稳亲人，逸夫图书馆常驻馆长', '健康', 1, '逸夫图书馆正门台阶', 118.7808, 31.9156, '', ''),
('警长', '黑白奶牛', '公', '2岁', '机警敏捷，喜欢在致高楼A座天井活动', '健康', 1, '致高楼A座天井', 118.7845, 31.9138, '', ''),
('点点', '三花', '母', '1.5岁', '胆小亲人，喜欢被摸头但怕大声', '健康', 0, '东操场看台下方', 118.7885, 31.9120, '', ''),
('小灰', '灰色', '公', '4岁', '佛系淡定，校内元老级猫咪，常在叠翠山出没', '健康', 1, '叠翠山草坪', 118.7840, 31.9145, '', ''),
('奥利奥', '黑白长毛', '公', '2岁', '优雅粘人，喜欢坐在宿舍门口等人', '健康', 1, '骏园宿舍区', 118.7790, 31.9105, '', ''),
('小橘白', '橘白', '母', '1岁', '活泼好动，清晨常在食堂附近活动', '需关注', 0, '新食堂东侧', 118.7855, 31.9118, '', '');

-- 插入初始管理员账号（密码: admin123，需在应用启动时bcrypt处理）
INSERT INTO users (username, password, nickname, role) VALUES
('admin', '$2b$10$placeholder_will_be_updated_by_app', '管理员', 'admin');

-- 插入默认勋章（含低难度勋章）
INSERT INTO badges (badge_name, badge_desc, icon, condition_type, condition_value) VALUES
('初露锋芒', '首次打卡成功', 'medal', 'report_count', 1),
('初次邂逅', '投喂第一只猫咪', 'bowl', 'feed_count', 1),
('探索新手', '打卡过1只猫咪', 'paw', 'cat_unlocked', 1),
('爱心传递', '累计投喂5次', 'bowl', 'feed_count', 5),
('热心铲屎官', '累计打卡10次', 'clipboard', 'report_count', 10),
('投喂达人', '累计投喂20次', 'bowl', 'feed_count', 20),
('寻猫先锋', '打卡过5只不同猫咪', 'paw', 'cat_unlocked', 5),
('校园卫士', '打卡过10只不同猫咪', 'paw', 'cat_unlocked', 10),
('急救天使', '上报3次需救助猫咪', 'first-aid', 'report_count', 3);
