const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const pool = require('../config/db');
const { authToken, authAdmin } = require('../middleware/auth');

// 配置文件上传
const storage = multer.diskStorage({
  destination: path.join(__dirname, '../uploads'),
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  }
});
const upload = multer({ storage, limits: { fileSize: 5 * 1024 * 1024 } }); // 5MB

// POST /api/reports - 提交打卡
router.post('/', authToken, upload.single('photo'), async (req, res) => {
  try {
    const { cat_id, description, location, longitude, latitude, health_status, report_type } = req.body;
    const photo_url = req.file ? `/uploads/${req.file.filename}` : null;

    const [result] = await pool.query(
      `INSERT INTO reports (user_id, cat_id, description, location, longitude, latitude, photo_url, health_status, report_type, status)
       VALUES (?,?,?,?,?,?,?,?,?,?)`,
      [req.user.id, cat_id || null, description, location, longitude || null, latitude || null, photo_url, health_status, report_type || '偶遇', '待审核']
    );

    res.json({ code: 200, msg: '打卡提交成功，等待管理员审核', data: { id: result.insertId } });
  } catch (err) {
    res.status(500).json({ code: 500, msg: '提交失败', error: err.message });
  }
});

// GET /api/reports - 获取打卡记录
router.get('/', async (req, res) => {
  try {
    const { cat_id, user_id, status } = req.query;
    let sql = `SELECT r.*, u.nickname, u.avatar_url, c.cat_name
               FROM reports r
               LEFT JOIN users u ON r.user_id = u.id
               LEFT JOIN cats c ON r.cat_id = c.id
               WHERE 1=1`;
    const params = [];

    if (cat_id) { sql += ' AND r.cat_id = ?'; params.push(cat_id); }
    if (user_id) { sql += ' AND r.user_id = ?'; params.push(user_id); }
    if (status) { sql += ' AND r.status = ?'; params.push(status); }
    else { sql += " AND r.status IN ('已通过','待审核')"; }

    sql += ' ORDER BY r.create_time DESC LIMIT 50';

    const [rows] = await pool.query(sql, params);
    res.json({ code: 200, msg: '获取成功', data: rows });
  } catch (err) {
    res.status(500).json({ code: 500, msg: '服务器错误', error: err.message });
  }
});

// GET /api/reports/map - 获取已通过的打卡点位（地图标注用）
router.get('/map', async (req, res) => {
  try {
    const [rows] = await pool.query(
      `SELECT r.id, r.cat_id, r.location, r.longitude, r.latitude, r.description, r.report_type, r.create_time,
              c.cat_name, c.photo_url as cat_photo
       FROM reports r
       LEFT JOIN cats c ON r.cat_id = c.id
       WHERE r.status = '已通过' AND r.longitude IS NOT NULL AND r.latitude IS NOT NULL
       ORDER BY r.create_time DESC
       LIMIT 100`
    );
    res.json({ code: 200, msg: '获取成功', data: rows });
  } catch (err) {
    res.status(500).json({ code: 500, msg: '服务器错误', error: err.message });
  }
});

// GET /api/reports/mine - 获取我的打卡记录
router.get('/mine', authToken, async (req, res) => {
  try {
    const [rows] = await pool.query(
      `SELECT r.*, c.cat_name, c.photo_url as cat_photo
       FROM reports r
       LEFT JOIN cats c ON r.cat_id = c.id
       WHERE r.user_id = ?
       ORDER BY r.create_time DESC`,
      [req.user.id]
    );
    res.json({ code: 200, msg: '获取成功', data: rows });
  } catch (err) {
    res.status(500).json({ code: 500, msg: '服务器错误', error: err.message });
  }
});

// PUT /api/reports/:id/status - 管理员审核
router.put('/:id/status', authAdmin, async (req, res) => {
  try {
    const { status } = req.body;
    if (!['待审核', '已通过', '已驳回'].includes(status)) {
      return res.status(400).json({ code: 400, msg: '无效的状态值' });
    }

    await pool.query('UPDATE reports SET status = ? WHERE id = ?', [status, req.params.id]);

    // 如果通过审核，检查并解锁勋章
    if (status === '已通过') {
      const [report] = await pool.query('SELECT user_id, cat_id FROM reports WHERE id = ?', [req.params.id]);
      if (report.length > 0) {
        const { user_id, cat_id } = report[0];

        // 检查"初露锋芒"勋章
        await checkAndAwardBadge(user_id, 'report_count', 1);

        // 检查"热心铲屎官"
        const [count] = await pool.query('SELECT COUNT(*) as c FROM reports WHERE user_id = ? AND status = ?', [user_id, '已通过']);
        await checkAndAwardBadge(user_id, 'report_count', count[0].c);
      }
    }

    res.json({ code: 200, msg: '审核完成' });
  } catch (err) {
    res.status(500).json({ code: 500, msg: '操作失败', error: err.message });
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
