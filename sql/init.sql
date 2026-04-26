-- 校园流浪猫系统数据库建表脚本
-- 包含主键、外键、索引设计

-- 猫咪信息表
CREATE TABLE cats (
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
    create_time DATETIME DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_location (location),
    INDEX idx_coordinate (longitude, latitude)
) COMMENT='校园流浪猫信息表';

-- 用户表
CREATE TABLE users (
    id INT PRIMARY KEY AUTO_INCREMENT,
    username VARCHAR(50) NOT NULL UNIQUE,
    phone VARCHAR(20),
    role ENUM('user','admin') DEFAULT 'user',
    create_time DATETIME DEFAULT CURRENT_TIMESTAMP
) COMMENT='用户表';

-- 上报记录表
CREATE TABLE reports (
    id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT NOT NULL,
    cat_id INT,
    description TEXT NOT NULL,
    location VARCHAR(100),
    status ENUM('待审核','已通过','已驳回') DEFAULT '待审核',
    create_time DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id),
    FOREIGN KEY (cat_id) REFERENCES cats(id) ON DELETE SET NULL,
    INDEX idx_status (status)
) COMMENT='流浪猫上报记录表';

-- 投喂记录表
CREATE TABLE feeds (
    id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT NOT NULL,
    cat_id INT NOT NULL,
    feed_time DATETIME DEFAULT CURRENT_TIMESTAMP,
    food VARCHAR(50),
    FOREIGN KEY (user_id) REFERENCES users(id),
    FOREIGN KEY (cat_id) REFERENCES cats(id),
    INDEX idx_cat_id (cat_id)
) COMMENT='猫咪投喂记录表';