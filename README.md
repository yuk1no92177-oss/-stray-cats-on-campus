# 校园流浪猫地图系统

## 项目简介
基于WebGIS的校园流浪猫可视化管理平台，实现猫咪信息展示、上报、投喂记录与救助联动。

## 技术栈
- 前端：HTML + CSS + JavaScript
- 后端：Node.js + Express
- 数据库：MySQL 8.0
- 地图：WebGIS 地图组件

## 启动步骤
1. 导入数据库脚本：执行 /sql/init.sql
2. 配置数据库连接信息：/backend/config/db.js
3. 启动后端：cd backend && npm install && npm run start
4. 启动前端：打开 frontend/index.html

## 接口入口
- 接口文档：[`docs/api.md`](./docs/api.md)
- 后端服务本地地址：`http://localhost:3000`
- 接口前缀：`/api`
