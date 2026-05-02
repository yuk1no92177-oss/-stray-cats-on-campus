const mysql = require('mysql2/promise');

async function check() {
  const conn = await mysql.createConnection({
    host: 'gateway01.ap-southeast-1.prod.aws.tidbcloud.com',
    port: 4000,
    user: '8azFVJyEQzJrC9q.root',
    password: 'jm8MkmONhWL7PLVp',
    database: 'stray_cats',
    ssl: { rejectUnauthorized: false }
  });

  const [users] = await conn.query('SELECT id, username, password, role FROM users');
  console.log('用户列表:', JSON.stringify(users, null, 2));

  const [cats] = await conn.query('SELECT id, cat_name FROM cats');
  console.log('猫咪列表:', JSON.stringify(cats, null, 2));

  await conn.end();
}

check().catch(err => {
  console.error('错误:', err);
  process.exit(1);
});
