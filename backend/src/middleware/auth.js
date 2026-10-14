const jwt = require('jsonwebtoken');
const { error } = require('../utils/response');
const { query } = require('../config/db');

async function authenticate(req, res, next) {
  try {
    const header = req.headers.authorization;
    if (!header || !header.startsWith('Bearer ')) {
      return error(res, 'Authentication required', 401);
    }

    const token = header.slice(7);
    let payload;
    try {
      payload = jwt.verify(token, process.env.JWT_SECRET);
    } catch {
      return error(res, 'Invalid or expired token', 401);
    }

    const users = await query(
      'SELECT id, name, email, address, role, created_at FROM users WHERE id = ? LIMIT 1',
      [payload.userId]
    );

    if (!users.length) {
      return error(res, 'User no longer exists', 401);
    }

    req.user = users[0];
    return next();
  } catch (err) {
    console.error('authenticate error:', err);
    return error(res, 'Authentication failed', 500);
  }
}

function authorize(...roles) {
  return (req, res, next) => {
    if (!req.user) {
      return error(res, 'Authentication required', 401);
    }
    if (!roles.includes(req.user.role)) {
      return error(res, 'You do not have permission to perform this action', 403);
    }
    return next();
  };
}

module.exports = { authenticate, authorize };
