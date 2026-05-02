const bcrypt = require('bcryptjs');
const mysql = require('mysql2/promise');

async function fix() {
  const conn = await mysql.createConnection({
    host: 'gateway01.ap-southeast-1.prod.aws.tidbcloud.com',
    port: 4000,
    user: '8azFVJyEQzJrC9q.root',
    password: 'jm8MkmONhWL7PLVp',
    database: 'stray_cats',
    ssl: { rejectUnauthorized: false }
  });

  const hashedPwd = await bcrypt.hash('admin123', 10);
  await conn.query('UPDATE users SET password = ? WHERE username = ?', [hashedPwd, 'admin']);
  console.log('✅ 管理员密码已更新: admin / admin123');

  const [rows] = await conn.query('SELECT username, password FROM users WHERE username = ?', ['admin']);
  console.log('当前密码哈希:', rows[0].password.substring(0, 20) + '...');

  await conn.end();
}

fix().catch(err => {
  console.error('失败:', err);
  process.exit(1);
});
