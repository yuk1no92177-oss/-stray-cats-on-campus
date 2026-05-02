const express = require('express');
const router = express.Router();
const pool = require('../config/db');

// GET /api/stats - 获取数据看板
router.get('/', async (req, res) => {
  try {
    // 猫咪总数
    const [totalCats] = await pool.query('SELECT COUNT(*) as count FROM cats WHERE is_active = 1');

    // 性别分布
    const [genderDist] = await pool.query('SELECT gender, COUNT(*) as count FROM cats WHERE is_active = 1 GROUP BY gender');

    // 健康状况分布
    const [healthDist] = await pool.query('SELECT health_status, COUNT(*) as count FROM cats WHERE is_active = 1 GROUP BY health_status');

    // 总打卡数
    const [totalReports] = await pool.query("SELECT COUNT(*) as count FROM reports WHERE status = '已通过'");

    // 总投喂数
    const [totalFeeds] = await pool.query('SELECT COUNT(*) as count FROM feeds');

    // 总用户数
    const [totalUsers] = await pool.query('SELECT COUNT(*) as count FROM users');

    // 近7天打卡趋势
    const [weeklyReports] = await pool.query(
      "SELECT DATE(create_time) as date, COUNT(*) as count FROM reports WHERE create_time >= DATE_SUB(CURDATE(), INTERVAL 7 DAY) AND status = '已通过' GROUP BY DATE(create_time) ORDER BY date"
    );

    // 高频率投喂点位TOP5
    const [topFeedLocs] = await pool.query(
      `SELECT c.cat_name, c.location, COUNT(f.id) as feed_count
       FROM feeds f
       JOIN cats c ON f.cat_id = c.id
       GROUP BY f.cat_id
       ORDER BY feed_count DESC
       LIMIT 5`
    );

    // 明星猫咪榜（按打卡数）
    const [topCats] = await pool.query(
      `SELECT c.id, c.cat_name, c.photo_url, COUNT(r.id) as report_count
       FROM reports r
       JOIN cats c ON r.cat_id = c.id
       WHERE r.status = '已通过'
       GROUP BY r.cat_id
       ORDER BY report_count DESC
       LIMIT 5`
    );

    // 积极用户榜
    const [topUsers] = await pool.query(
      `SELECT u.id, u.nickname, u.avatar_url,
              (SELECT COUNT(*) FROM reports WHERE user_id = u.id AND status = '已通过') as report_count,
              (SELECT COUNT(*) FROM feeds WHERE user_id = u.id) as feed_count
       FROM users u
       ORDER BY report_count + feed_count DESC
       LIMIT 5`
    );

    res.json({
      code: 200,
      msg: '获取成功',
      data: {
        totalCats: totalCats[0].count,
        totalReports: totalReports[0].count,
        totalFeeds: totalFeeds[0].count,
        totalUsers: totalUsers[0].count,
        genderDistribution: genderDist,
        healthDistribution: healthDist,
        weeklyReports: weeklyReports,
        topFeedLocations: topFeedLocs,
        topCats: topCats,
        topUsers: topUsers
      }
    });
  } catch (err) {
    res.status(500).json({ code: 500, msg: '服务器错误', error: err.message });
  }
});

module.exports = router;
