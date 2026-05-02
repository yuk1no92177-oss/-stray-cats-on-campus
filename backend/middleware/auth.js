const jwt = require('jsonwebtoken');
const JWT_SECRET = 'stray_cats_jwt_secret_2024';

// 验证JWT token
function authToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ code: 401, msg: '请先登录' });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    return res.status(401).json({ code: 401, msg: '登录已过期，请重新登录' });
  }
}

// 管理员权限验证
function authAdmin(req, res, next) {
  authToken(req, res, () => {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ code: 403, msg: '无管理员权限' });
    }
    next();
  });
}

module.exports = { authToken, authAdmin, JWT_SECRET };
