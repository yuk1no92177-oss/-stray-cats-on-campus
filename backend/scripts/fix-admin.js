const bcrypt = require('bcryptjs');
const mysql = require('mysql2/promise');

async function fix() {
  const conn = await mysql.createConnection({
    host: 'gateway01.ap-southeast-1.prod.aws.tidbcloud.com',
    port: 4000,
    user: '8azFVJyEQzJrC9q.root',
    password: 'jm8MkmONhWL7PLVp',
    database: 'stray_cats',
    ssl: { minVersion: 'TLSv1.2', rejectUnauthorized: true }
  });

  // 更新用户名和密码
  const hashedPwd = await bcrypt.hash('666', 10);
  await conn.query('UPDATE users SET username = ?, password = ? WHERE id = 1', ['xhx', hashedPwd]);
  console.log('✅ 管理员账号已更新: xhx / 666');

  // 验证
  const [rows] = await conn.query('SELECT id, username, password FROM users WHERE id = 1');
  console.log('当前账号:', rows[0].username);
  console.log('密码哈希:', rows[0].password.substring(0, 25) + '...');

  await conn.end();
}

fix().catch(err => {
  console.error('失败:', err);
  process.exit(1);
});
