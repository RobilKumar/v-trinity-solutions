/**
 * middleware/auth.js — JWT authentication and RBAC authorization middleware.
 *
 * authenticate  — verifies Bearer token and attaches req.user
 * authorize     — checks req.user has at least one of the given permission keys
 * requireRole   — checks req.user's role_name matches one of the given roles
 */

const jwt = require('jsonwebtoken');
const { query } = require('../config/database');
const logger = require('../utils/logger');

const authenticate = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader?.startsWith('Bearer ')) {
      return res.status(401).json({ success: false, message: 'Access token required' });
    }

    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const result = await query(
      `SELECT u.user_id, u.first_name, u.last_name, u.email, u.role_id, u.is_active, u.avatar,
              r.role_name,
              STRING_AGG(p.permission_key, ',') AS permissions
       FROM users u
       JOIN roles r ON u.role_id = r.role_id
       LEFT JOIN role_permissions rp ON rp.role_id = u.role_id
       LEFT JOIN permissions p ON p.permission_id = rp.permission_id
       WHERE u.user_id = $1
       GROUP BY u.user_id, u.first_name, u.last_name, u.email, u.role_id, u.is_active, u.avatar, r.role_name`,
      [decoded.userId]
    );

    if (!result.rows.length || !result.rows[0].is_active) {
      return res.status(401).json({ success: false, message: 'User not found or inactive' });
    }

    const user = result.rows[0];
    req.user = {
      ...user,
      permissions: user.permissions ? user.permissions.split(',') : [],
    };
    next();

  } catch (err) {
    if (err.name === 'TokenExpiredError') {
      return res.status(401).json({ success: false, message: 'Token expired', code: 'TOKEN_EXPIRED' });
    }
    logger.error('Auth middleware error:', err);
    return res.status(401).json({ success: false, message: 'Invalid token' });
  }
};

const authorize = (...permissions) => (req, res, next) => {
  if (!req.user) return res.status(401).json({ success: false, message: 'Not authenticated' });
  const hasPermission = permissions.some(p => req.user.permissions.includes(p));
  if (!hasPermission) {
    return res.status(403).json({ success: false, message: 'Insufficient permissions' });
  }
  next();
};

const requireRole = (...roles) => (req, res, next) => {
  if (!roles.includes(req.user?.role_name)) {
    return res.status(403).json({ success: false, message: 'Access denied' });
  }
  next();
};

module.exports = { authenticate, authorize, requireRole };
