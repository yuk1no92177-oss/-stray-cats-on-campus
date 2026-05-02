const mysql = require('mysql2/promise');
const fs = require('fs');
const path = require('path');

async function init() {
  // 先不指定数据库，连接后创建
  const conn = await mysql.createConnection({
    host: 'gateway01.ap-southeast-1.prod.aws.tidbcloud.com',
    port: 4000,
    user: '8azFVJyEQzJrC9q.root',
    password: 'jm8MkmONhWL7PLVp',
    ssl: { rejectUnauthorized: false },
    multipleStatements: true
  });

  // 创建 stray_cats 数据库
  await conn.query('CREATE DATABASE IF NOT EXISTS stray_cats DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci');
  await conn.query('USE stray_cats');

  // 读取并执行 init.sql
  const sql = fs.readFileSync(path.join(__dirname, '../../sql/init.sql'), 'utf8');

  // 跳过 CREATE DATABASE 和 USE 语句（已执行）
  const statements = sql.split(';').filter(s => s.trim().length > 0);
  for (const stmt of statements) {
    const trimmed = stmt.trim();
    if (trimmed.startsWith('CREATE DATABASE') || trimmed.startsWith('USE ')) continue;
    try {
      await conn.query(trimmed);
    } catch (err) {
      console.error('SQL Error:', err.message);
    }
  }

  console.log('✅ 数据库初始化完成！');
  await conn.end();
}

init().catch(err => {
  console.error('初始化失败:', err);
  process.exit(1);
});
