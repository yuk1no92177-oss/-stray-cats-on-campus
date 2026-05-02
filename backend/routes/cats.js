const express = require('express');
const router = express.Router();
const pool = require('../config/db');
const { authToken, authAdmin } = require('../middleware/auth');

// GET /api/cats - 获取所有猫咪
router.get('/', async (req, res) => {
  try {
    const [rows] = await pool.query(
      'SELECT id, cat_name, color, gender, age, character_desc, health_status, is_neutered, location, longitude, latitude, photo_url, area, is_active, create_time FROM cats WHERE is_active = 1 ORDER BY id'
    );
    res.json({ code: 200, msg: '获取成功', data: rows });
  } catch (err) {
    res.status(500).json({ code: 500, msg: '服务器错误', error: err.message });
  }
});

// GET /api/cats/:id - 获取猫咪详情
router.get('/:id', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM cats WHERE id = ?', [req.params.id]);
    if (rows.length === 0) {
      return res.status(404).json({ code: 404, msg: '猫咪不存在' });
    }

    const cat = rows[0];

    // 获取最近的打卡记录
    const [reports] = await pool.query(
      `SELECT r.*, u.nickname FROM reports r
       LEFT JOIN users u ON r.user_id = u.id
       WHERE r.cat_id = ? AND r.status = '已通过'
       ORDER BY r.create_time DESC LIMIT 10`,
      [req.params.id]
    );

    // 获取投喂统计
    const [feedCount] = await pool.query(
      'SELECT COUNT(*) as count FROM feeds WHERE cat_id = ?',
      [req.params.id]
    );

    // 获取打卡统计
    const [reportCount] = await pool.query(
      'SELECT COUNT(*) as count FROM reports WHERE cat_id = ? AND status = ?',
      [req.params.id, '已通过']
    );

    res.json({
      code: 200,
      msg: '获取成功',
      data: {
        ...cat,
        reports: reports || [],
        feedCount: feedCount[0].count,
        reportCount: reportCount[0].count
      }
    });
  } catch (err) {
    res.status(500).json({ code: 500, msg: '服务器错误', error: err.message });
  }
});

// POST /api/cats - 管理员新增猫咪
router.post('/', authAdmin, async (req, res) => {
  try {
    const { cat_name, color, gender, age, character_desc, health_status, is_neutered, location, longitude, latitude, photo_url, area } = req.body;
    const [result] = await pool.query(
      'INSERT INTO cats (cat_name, color, gender, age, character_desc, health_status, is_neutered, location, longitude, latitude, photo_url, area) VALUES (?,?,?,?,?,?,?,?,?,?,?,?)',
      [cat_name, color, gender || '未知', age, character_desc, health_status || '健康', is_neutered || 0, location, longitude, latitude, photo_url, area || '西校区']
    );
    res.json({ code: 200, msg: '新增成功', data: { id: result.insertId } });
  } catch (err) {
    res.status(500).json({ code: 500, msg: '新增失败', error: err.message });
  }
});

// PUT /api/cats/:id - 管理员更新猫咪
router.put('/:id', authAdmin, async (req, res) => {
  try {
    const fields = ['cat_name', 'color', 'gender', 'age', 'character_desc', 'health_status', 'is_neutered', 'location', 'longitude', 'latitude', 'photo_url', 'area', 'is_active'];
    const updates = [];
    const values = [];

    for (const field of fields) {
      if (req.body[field] !== undefined) {
        updates.push(`${field} = ?`);
        values.push(req.body[field]);
      }
    }

    if (updates.length === 0) {
      return res.status(400).json({ code: 400, msg: '没有需要更新的字段' });
    }

    values.push(req.params.id);
    await pool.query(`UPDATE cats SET ${updates.join(', ')} WHERE id = ?`, values);
    res.json({ code: 200, msg: '更新成功' });
  } catch (err) {
    res.status(500).json({ code: 500, msg: '更新失败', error: err.message });
  }
});

// DELETE /api/cats/:id - 管理员删除猫咪
router.delete('/:id', authAdmin, async (req, res) => {
  try {
    await pool.query('UPDATE cats SET is_active = 0 WHERE id = ?', [req.params.id]);
    res.json({ code: 200, msg: '删除成功' });
  } catch (err) {
    res.status(500).json({ code: 500, msg: '删除失败', error: err.message });
  }
});

module.exports = router;
