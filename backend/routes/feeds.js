const express = require('express');
const router = express.Router();
const pool = require('../config/db');
const { authToken } = require('../middleware/auth');

// POST /api/feeds - 记录投喂
router.post('/', authToken, async (req, res) => {
  try {
    const { cat_id, food } = req.body;

    if (!cat_id) {
      return res.status(400).json({ code: 400, msg: '请选择猫咪' });
    }

    const [result] = await pool.query(
      'INSERT INTO feeds (user_id, cat_id, food) VALUES (?,?,?)',
      [req.user.id, cat_id, food || null]
    );

    // 检查并解锁勋章
    const [feedCount] = await pool.query('SELECT COUNT(*) as c FROM feeds WHERE user_id = ?', [req.user.id]);
    await checkAndAwardBadge(req.user.id, 'feed_count', feedCount[0].c);

    const [catCount] = await pool.query('SELECT COUNT(DISTINCT cat_id) as c FROM feeds WHERE user_id = ?', [req.user.id]);
    await checkAndAwardBadge(req.user.id, 'cat_unlocked', catCount[0].c);

    res.json({ code: 200, msg: '投喂记录成功！', data: { id: result.insertId } });
  } catch (err) {
    res.status(500).json({ code: 500, msg: '记录失败', error: err.message });
  }
});

// GET /api/feeds - 获取投喂记录
router.get('/', async (req, res) => {
  try {
    const { cat_id, user_id } = req.query;
    let sql = `SELECT f.*, u.nickname, c.cat_name
               FROM feeds f
               LEFT JOIN users u ON f.user_id = u.id
               LEFT JOIN cats c ON f.cat_id = c.id
               WHERE 1=1`;
    const params = [];

    if (cat_id) { sql += ' AND f.cat_id = ?'; params.push(cat_id); }
    if (user_id) { sql += ' AND f.user_id = ?'; params.push(user_id); }

    sql += ' ORDER BY f.feed_time DESC LIMIT 50';

    const [rows] = await pool.query(sql, params);
    res.json({ code: 200, msg: '获取成功', data: rows });
  } catch (err) {
    res.status(500).json({ code: 500, msg: '服务器错误', error: err.message });
  }
});

async function checkAndAwardBadge(userId, conditionType, value) {
  try {
    const [badges] = await pool.query(
      'SELECT id, condition_value FROM badges WHERE condition_type = ? AND condition_value <= ?',
      [conditionType, value]
    );
    for (const badge of badges) {
      await pool.query(
        'INSERT IGNORE INTO user_badges (user_id, badge_id) VALUES (?, ?)',
        [userId, badge.id]
      );
    }
  } catch (err) {
    console.error('勋章检查失败:', err.message);
  }
}

module.exports = router;
