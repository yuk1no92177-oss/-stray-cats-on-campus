git add docs/api.md
git commit -m "feat: add api interface document"
git push
# 校园流浪猫地图系统 — API 接口文档
本项目采用 RESTful 风格接口设计，所有接口返回统一格式。

## 基础信息
- 后端地址：http://localhost:3000
- 接口前缀：/api

---

## 一、猫咪相关接口

### 1. 获取所有猫咪信息
- **URL**：/api/cats
- **请求方式**：GET
- **接口描述**：获取校园内所有流浪猫列表
- **请求参数**：无
- **成功返回**
```json
{
  "code": 200,
  "msg": "获取成功",
  "data": [
    {
      "id": 1,
      "catName": "小橘",
      "color": "橘白",
      "gender": "公",
      "location": "食堂门口",
      "healthStatus": "健康"
    }
  ]
}
{
  "code": 200,
  "msg": "获取成功",
  "data": {
    "id": 1,
    "catName": "小橘",
    "color": "橘白",
    "gender": "公",
    "age": "1岁",
    "character": "温顺亲人",
    "location": "食堂门口",
    "longitude": 116.123456,
    "latitude": 39.123456,
    "isNeutered": 1,
    "healthStatus": "健康"
  }
}
{
  "userId": 1,
  "description": "食堂门口发现一只橘猫，很温顺",
  "location": "食堂门口"
}
{
  "userId": 1,
  "catId": 1,
  "food": "猫粮"
}
{
  "code": 200,
  "msg": "获取成功",
  "data": {
    "username": "校园猫友",
    "reportCount": 2,
    "feedCount": 5
  }
}