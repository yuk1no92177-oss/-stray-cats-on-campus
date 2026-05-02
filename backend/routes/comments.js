const express = require('express');
const router = express.Router();
const pool = require('../config/db');
const { authToken } = require('../middleware/auth');

// POST /api/comments - 发表评论
router.post('/', authToken, async (req, res) => {
  try {
    const { cat_id, content } = req.body;

    if (!cat_id || !content) {
      return res.status(400).json({ code: 400, msg: '参数不完整' });
    }

    const [result] = await pool.query(
      'INSERT INTO comments (cat_id, user_id, content) VALUES (?,?,?)',
      [cat_id, req.user.id, content]
    );

    res.json({ code: 200, msg: '评论成功', data: { id: result.insertId } });
  } catch (err) {
    res.status(500).json({ code: 500, msg: '评论失败', error: err.message });
  }
});

// GET /api/comments?cat_id=xx - 获取评论列表
router.get('/', async (req, res) => {
  try {
    const { cat_id } = req.query;
    if (!cat_id) {
      return res.status(400).json({ code: 400, msg: '请指定猫咪ID' });
    }

    const [rows] = await pool.query(
      `SELECT c.*, u.nickname, u.avatar_url
       FROM comments c
       LEFT JOIN users u ON c.user_id = u.id
       WHERE c.cat_id = ?
       ORDER BY c.create_time DESC
       LIMIT 50`,
      [cat_id]
    );

    res.json({ code: 200, msg: '获取成功', data: rows });
  } catch (err) {
    res.status(500).json({ code: 500, msg: '服务器错误', error: err.message });
  }
});

module.exports = router;
