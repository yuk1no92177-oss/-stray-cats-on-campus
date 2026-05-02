# 喵迹 - 校园流浪猫地图系统

基于 WebGIS 的河海大学江宁校区流浪猫可视化管理平台。

## 技术栈

- **前端**：HTML + CSS + JavaScript + Leaflet.js
- **后端**：Node.js + Express 5
- **数据库**：MySQL 8.0 / MariaDB 10.4+（XAMPP）
- **地图**：Leaflet + OpenStreetMap

## 快速启动

### 1. 数据库配置

确保 MySQL 服务已启动，然后初始化数据库：

```bash
mysql -u root --default-character-set=utf8mb4 < sql/init.sql
```

### 2. 启动后端

```bash
cd backend
npm install
npm start
```

服务运行在 `http://localhost:3000`

### 3. 访问系统

- 地图首页：`http://localhost:3000/`
- 管理员账号：`admin / admin123`

## 功能模块

| 模块 | 说明 |
|------|------|
| 🗺️ 校园地图 | Leaflet 地图展示河海大学江宁校区，猫咪点位标记 |
| 📖 猫咪图鉴 | 校园流浪猫档案库，支持按区域筛选 |
| 📸 打卡上报 | 记录猫咪出现位置、健康状态，上传照片 |
| 🍽️ 投喂记录 | 记录猫咪投喂情况 |
| 💬 故事墙 | 猫咪详情页留言板 |
| 📊 数据看板 | 统计数据、排行榜、热力图 |
| 🏅 成就勋章 | 根据打卡/投喂行为自动解锁 |
| 🛡️ 管理后台 | 打卡审核、猫咪/用户管理 |

## 项目结构

```
D:\webgis\
├── backend/               # 后端
│   ├── app.js             # Express 入口
│   ├── config/db.js       # 数据库连接池
│   ├── routes/            # API 路由
│   │   ├── cats.js        # 猫咪接口
│   │   ├── users.js       # 用户接口
│   │   ├── reports.js     # 打卡接口
│   │   ├── feeds.js       # 投喂接口
│   │   ├── comments.js    # 评论接口
│   │   └── stats.js       # 统计接口
│   ├── middleware/auth.js # JWT 认证
│   └── uploads/           # 上传图片
├── frontend/              # 前端页面
│   ├── index.html         # 地图首页
│   ├── login.html         # 登录/注册
│   ├── detail.html        # 猫咪详情
│   ├── report.html        # 打卡上报
│   ├── wiki.html          # 猫咪图鉴
│   ├── profile.html       # 个人中心
│   ├── dashboard.html     # 数据看板
│   ├── admin.html         # 管理后台
│   ├── css/style.css      # 样式
│   └── js/
│       ├── api.js         # API 封装
│       ├── auth.js        # 认证模块
│       └── map.js         # 地图逻辑
├── sql/init.sql           # 建表脚本
└── README.md
```
