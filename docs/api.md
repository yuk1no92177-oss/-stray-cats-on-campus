# 喵迹 - API 接口文档

**基础地址**：`https://stray-cats.onrender.com/api`

> 本地开发为 `http://localhost:3000/api`

---

## 目录

- [通用说明](#通用说明)
- [用户认证](#用户认证)
- [猫咪管理](#猫咪管理)
- [打卡上报](#打卡上报)
- [投喂记录](#投喂记录)
- [评论系统](#评论系统)
- [数据统计](#数据统计)
- [系统诊断](#系统诊断)

---

## 通用说明

### 认证方式

需要登录的接口在请求头中携带 token：

```
Authorization: Bearer eyJhbGciOiJIUzI1NiIs...
```

Token 有效期 7 天，过期需重新登录。

### 统一响应格式

```json
{
  "code": 200,
  "msg": "操作成功",
  "data": {}
}
```

| code | 含义 |
|------|------|
| 200 | 成功 |
| 400 | 参数错误 |
| 401 | 未登录或 token 过期 |
| 403 | 无管理员权限 |
| 404 | 资源不存在 |
| 500 | 服务器错误 |

---

## 用户认证

### 注册

```
POST /users/register
Content-Type: application/json
```

**请求参数：**

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| username | string | 是 | 用户名（唯一） |
| password | string | 是 | 密码 |
| nickname | string | 否 | 昵称 |
| phone | string | 否 | 手机号 |

**响应：**
```json
{ "code": 200, "msg": "注册成功", "data": { "id": 1 } }
```

### 登录

```
POST /users/login
Content-Type: application/json
```

**请求参数：**

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| username | string | 是 | 用户名 |
| password | string | 是 | 密码 |

**响应：**
```json
{
  "code": 200,
  "msg": "登录成功",
  "data": {
    "token": "eyJ...",
    "user": {
      "id": 1,
      "username": "xhx",
      "nickname": "管理员",
      "avatar_url": null,
      "role": "admin"
    }
  }
}
```

### 获取个人信息

```
GET /users/profile
Authorization: Bearer <token>
```

**响应包含**：用户信息 + 打卡数统计 + 投喂数统计 + 解锁猫咪数 + 已获得勋章列表。

### 更新个人信息

```
PUT /users/profile
Authorization: Bearer <token>
Content-Type: application/json
```

**请求参数：**

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| nickname | string | 否 | 昵称 |
| phone | string | 否 | 手机号 |
| avatar_url | string | 否 | 头像URL |

### 用户列表（管理员）

```
GET /users
Authorization: Bearer <token>
```

> 需要 admin 角色。

---

## 猫咪管理

### 获取所有猫咪

```
GET /cats
```

> 无需登录。仅返回 `is_active = 1` 的猫咪。

**响应：**
```json
{
  "code": 200,
  "data": [
    {
      "id": 1,
      "cat_name": "胖虎",
      "color": "橘色",
      "gender": "公",
      "age": "3岁",
      "character_desc": "沉稳亲人",
      "health_status": "健康",
      "is_neutered": 1,
      "location": "逸夫图书馆正门台阶",
      "longitude": "118.78080000",
      "latitude": "31.91560000",
      "photo_url": "",
      "area": "",
      "is_active": 1,
      "create_time": "2026-05-02T10:22:37.000Z"
    }
  ]
}
```

### 获取猫咪详情

```
GET /cats/:id
```

额外返回：
- `reports` — 最近 10 条已通过的打卡记录
- `feedCount` — 投喂总数
- `reportCount` — 打卡总数

### 新增猫咪（管理员）

```
POST /cats
Authorization: Bearer <token>
Content-Type: application/json
```

**请求参数：**

| 参数 | 类型 | 必填 | 默认 |
|------|------|------|------|
| cat_name | string | 是 | - |
| color | string | 否 | - |
| gender | string | 否 | 未知 |
| age | string | 否 | - |
| health_status | string | 否 | 健康 |
| is_neutered | int | 否 | 0 |
| location | string | 否 | - |
| longitude | decimal | 否 | - |
| latitude | decimal | 否 | - |
| photo_url | string | 否 | - |
| character_desc | text | 否 | - |
| area | string | 否 | 西校区 |

### 更新猫咪（管理员）

```
PUT /cats/:id
Authorization: Bearer <token>
Content-Type: application/json
```

支持更新上述所有字段，只需传需要修改的字段。

### 删除猫咪（管理员）

```
DELETE /cats/:id
Authorization: Bearer <token>
```

> 软删除（`is_active = 0`）。

---

## 打卡上报

### 提交打卡

```
POST /reports
Authorization: Bearer <token>
Content-Type: multipart/form-data
```

**请求参数：**

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| cat_id | int | 是 | 猫咪ID |
| report_type | string | 否 | 偶遇/投喂 |
| health_status | string | 否 | 健康状态 |
| description | string | 否 | 备注 |
| location | string | 否 | 位置描述 |
| longitude | decimal | 否 | GPS经度 |
| latitude | decimal | 否 | GPS纬度 |
| photo | file | 否 | 照片（最大5MB） |

### 获取打卡记录

```
GET /reports?cat_id=&user_id=&status=
```

不传 status 时返回已通过和待审核的记录。

### 获取地图打卡点位

```
GET /reports/map
```

> 返回已通过且有坐标的打卡点位，供地图标注和热力图使用。

### 获取我的打卡记录

```
GET /reports/mine
Authorization: Bearer <token>
```

### 审核打卡（管理员）

```
PUT /reports/:id/status
Authorization: Bearer <token>
Content-Type: application/json
```

**请求参数：**

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| status | string | 是 | 已通过 / 已驳回 |

> 审核通过时自动检查并解锁用户勋章。

---

## 投喂记录

### 记录投喂

```
POST /feeds
Authorization: Bearer <token>
Content-Type: application/json
```

**请求参数：**

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| cat_id | int | 是 | 猫咪ID |
| food | string | 否 | 投喂食物 |

### 获取投喂记录

```
GET /feeds?cat_id=&user_id=
```

---

## 评论系统

### 发表评论

```
POST /comments
Authorization: Bearer <token>
Content-Type: application/json
```

**请求参数：**

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| cat_id | int | 是 | 猫咪ID |
| content | string | 是 | 评论内容 |

### 获取评论列表

```
GET /comments?cat_id=
```

---

## 数据统计

### 获取看板数据

```
GET /stats
```

返回：
- `totalCats` / `totalReports` / `totalFeeds` / `totalUsers` — 概览
- `genderDistribution` — 性别分布
- `healthDistribution` — 健康状况分布
- `weeklyReports` — 近 7 天打卡趋势
- `topCats` — 明星猫咪榜（按打卡数 TOP5）
- `topUsers` — 积极用户榜
- `topFeedLocations` — 热门投喂点 TOP5

---

## 系统诊断

### 健康检查

```
GET /health
```

**响应：**
```json
{ "code": 200, "db": "stray_cats", "pool": "ok" }
```
