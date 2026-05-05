const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const pool = require('../config/db');
const { authToken, authAdmin, JWT_SECRET } = require('../middleware/auth');

// POST /api/users/register - 注册
router.post('/register', async (req, res) => {
  try {
    const { username, password, nickname, phone } = req.body;

    if (!username || !password) {
      return res.status(400).json({ code: 400, msg: '用户名和密码不能为空' });
    }

    // 检查用户名是否已存在
    const [existing] = await pool.query('SELECT id FROM users WHERE username = ?', [username]);
    if (existing.length > 0) {
      return res.status(400).json({ code: 400, msg: '用户名已存在' });
    }

    const hashedPwd = await bcrypt.hash(password, 10);
    const [result] = await pool.query(
      'INSERT INTO users (username, password, nickname, phone) VALUES (?,?,?,?)',
      [username, hashedPwd, nickname || username, phone || null]
    );

    res.json({ code: 200, msg: '注册成功', data: { id: result.insertId } });
  } catch (err) {
    res.status(500).json({ code: 500, msg: '注册失败', error: err.message });
  }
});

// POST /api/users/login - 登录
router.post('/login', async (req, res) => {
  try {
    const { username, password } = req.body;

    const [users] = await pool.query('SELECT * FROM users WHERE username = ?', [username]);
    if (users.length === 0) {
      return res.status(401).json({ code: 401, msg: '用户名或密码错误' });
    }

    const user = users[0];

    // 检查是否被封禁
    if (user.is_banned) {
      return res.status(403).json({ code: 403, msg: '账号已被封禁，请联系管理员' });
    }

    const valid = await bcrypt.compare(password, user.password);
    if (!valid) {
      return res.status(401).json({ code: 401, msg: '用户名或密码错误' });
    }

    const token = jwt.sign(
      { id: user.id, username: user.username, role: user.role },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.json({
      code: 200,
      msg: '登录成功',
      data: {
        token,
        user: {
          id: user.id,
          username: user.username,
          nickname: user.nickname,
          avatar_url: user.avatar_url,
          role: user.role
        }
      }
    });
  } catch (err) {
    res.status(500).json({ code: 500, msg: '登录失败', error: err.message });
  }
});

// GET /api/users/profile - 获取个人信息
router.get('/profile', authToken, async (req, res) => {
  try {
    const [users] = await pool.query(
      'SELECT id, username, nickname, phone, avatar_url, role, create_time FROM users WHERE id = ?',
      [req.user.id]
    );
    if (users.length === 0) {
      return res.status(404).json({ code: 404, msg: '用户不存在' });
    }

    const user = users[0];

    // 统计打卡数
    const [reportCount] = await pool.query(
      'SELECT COUNT(*) as count FROM reports WHERE user_id = ? AND status = ?',
      [req.user.id, '已通过']
    );

    // 统计投喂数
    const [feedCount] = await pool.query(
      'SELECT COUNT(*) as count FROM feeds WHERE user_id = ?',
      [req.user.id]
    );

    // 统计解锁的猫咪数
    const [unlockedCats] = await pool.query(
      'SELECT COUNT(DISTINCT cat_id) as count FROM reports WHERE user_id = ? AND status = ?',
      [req.user.id, '已通过']
    );

    // 获取已解锁勋章
    const [badges] = await pool.query(
      `SELECT b.*, ub.unlock_time FROM user_badges ub
       JOIN badges b ON ub.badge_id = b.id
       WHERE ub.user_id = ?`,
      [req.user.id]
    );

    res.json({
      code: 200,
      msg: '获取成功',
      data: {
        ...user,
        reportCount: reportCount[0].count,
        feedCount: feedCount[0].count,
        unlockedCatCount: unlockedCats[0].count,
        badges: badges
      }
    });
  } catch (err) {
    res.status(500).json({ code: 500, msg: '服务器错误', error: err.message });
  }
});

// PUT /api/users/profile - 更新个人信息
router.put('/profile', authToken, async (req, res) => {
  try {
    const { nickname, phone, avatar_url } = req.body;
    const updates = [];
    const values = [];

    if (nickname) { updates.push('nickname = ?'); values.push(nickname); }
    if (phone) { updates.push('phone = ?'); values.push(phone); }
    if (avatar_url) { updates.push('avatar_url = ?'); values.push(avatar_url); }

    if (updates.length > 0) {
      values.push(req.user.id);
      await pool.query(`UPDATE users SET ${updates.join(', ')} WHERE id = ?`, values);
    }

    res.json({ code: 200, msg: '更新成功' });
  } catch (err) {
    res.status(500).json({ code: 500, msg: '更新失败', error: err.message });
  }
});

// GET /api/users - 管理员获取用户列表
router.get('/', authAdmin, async (req, res) => {
  try {
    const [rows] = await pool.query(
      'SELECT id, username, nickname, role, is_banned, create_time FROM users ORDER BY id'
    );
    res.json({ code: 200, msg: '获取成功', data: rows });
  } catch (err) {
    res.status(500).json({ code: 500, msg: '服务器错误', error: err.message });
  }
});

// PUT /api/users/:id/ban - 管理员封禁/解封用户
router.put('/:id/ban', authAdmin, async (req, res) => {
  try {
    const { is_banned } = req.body;
    const targetId = req.params.id;

    // 不能封禁自己
    if (targetId == req.user.id) {
      return res.status(400).json({ code: 400, msg: '不能封禁自己' });
    }

    await pool.query('UPDATE users SET is_banned = ? WHERE id = ?', [is_banned ? 1 : 0, targetId]);
    res.json({ code: 200, msg: is_banned ? '已封禁' : '已解封' });
  } catch (err) {
    res.status(500).json({ code: 500, msg: '操作失败', error: err.message });
  }
});

module.exports = router;
