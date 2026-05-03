# Xiaomi MiMo Token 申请描述

> 基于本项目「喵迹 — 校园流浪猫地图系统」的真实开发过程撰写。

---

我构建了一个基于 **Claude Code（Agent 驱动式开发）** 的全栈 WebGIS 校园流浪猫地图系统。它能通过多轮人机对话引导完成从需求分析、架构设计、迭代开发到云部署的全流程闭环。项目采用 Leaflet.js + Express 5 + MySQL（TiDB Cloud）技术栈，覆盖地图点位渲染、用户认证、打卡上报审核、热力图、数据看板、勋章系统等完整业务模块，代码已开源至 GitHub/Gitee。

该项目在开发过程中体现了典型的长链推理与自适应调试能力：Agent 在地图瓦片选型中主动对比 OpenStreetMap、高德、GeoQ 等方案并切换基图；在云部署环节依次评估 Railway、Zeabur、Render 三个平台的免费策略变化并自适应切换；遇到 TiDB Cloud SSL 连接报错时，通过自主添加诊断端点捕获 AggregateError 堆栈，推理出 `minVersion: TLSv1.2` 的配置需求并完成修复。

目前系统已部署上线并稳定运行于 Render + TiDB Cloud，支持全校师生公开访问。项目 **约 5000 行有效代码**，全流程由单 Agent 驱动完成，涵盖 **30+ 次迭代交互、6 个 API 模块（20+ 接口）、9 张数据库表**，实现了从模糊需求到生产级交付的零人工干预闭环。该模式充分验证了 Agent 驱动的全栈开发可行性，为后续推广至更复杂的企业级项目提供了可复用的实践范式。

---

**项目地址**：
- GitHub：https://github.com/yuk1no92177-oss/-stray-cats-on-campus
- 在线体验：https://stray-cats.onrender.com
