const express = require('express');
const cors = require('cors');
const path = require('path');
const bcrypt = require('bcryptjs');
const pool = require('./config/db');

const app = express();
const PORT = 3000;

// 中间件
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
app.use(express.static(path.join(__dirname, '../frontend')));

// 初始化管理员密码（如果尚未设置）
async function initAdmin() {
  try {
    const [rows] = await pool.query('SELECT password FROM users WHERE username = ?', ['admin']);
    if (rows.length > 0 && rows[0].password.startsWith('$2b$10$placeholder')) {
      const hashedPwd = await bcrypt.hash('admin123', 10);
      await pool.query('UPDATE users SET password = ? WHERE username = ?', [hashedPwd, 'admin']);
      console.log('管理员密码已初始化 (admin / admin123)');
    }
  } catch (err) {
    console.error('初始化管理员失败:', err.message);
  }
}

// 路由
app.use('/api/cats', require('./routes/cats'));
app.use('/api/users', require('./routes/users'));
app.use('/api/reports', require('./routes/reports'));
app.use('/api/feeds', require('./routes/feeds'));
app.use('/api/comments', require('./routes/comments'));
app.use('/api/stats', require('./routes/stats'));

// 启动
app.listen(PORT, () => {
  console.log(`🐱 校园流浪猫地图系统启动成功！`);
  console.log(`📡 服务地址: http://localhost:${PORT}`);
  console.log(`🗺️  地图页面: http://localhost:${PORT}/`);
  initAdmin();
});
