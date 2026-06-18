const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { v4: uuidv4 } = require('uuid');
const { query } = require('../config/database');
const logger = require('../utils/logger');

const generateTokens = (userId) => {
  const accessToken = jwt.sign(
    { userId },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || '15m' }
  );
  const refreshToken = jwt.sign(
    { userId, jti: uuidv4() },
    process.env.JWT_REFRESH_SECRET,
    { expiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '7d' }
  );
  return { accessToken, refreshToken };
};

exports.login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    const result = await query(
      `SELECT u.user_id, u.email, u.password_hash, u.first_name, u.last_name,
              u.is_active, u.avatar, r.role_name
       FROM users u JOIN roles r ON u.role_id = r.role_id
       WHERE u.email = $1`,
      [email]
    );

    const user = result.rows[0];
    if (!user || !await bcrypt.compare(password, user.password_hash)) {
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }

    if (!user.is_active) {
      return res.status(403).json({ success: false, message: 'Account is deactivated' });
    }

    const { accessToken, refreshToken } = generateTokens(user.user_id);

    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
    await query(
      `INSERT INTO refresh_tokens (user_id, token, expires_at) VALUES ($1, $2, $3)`,
      [user.user_id, refreshToken, expiresAt]
    );

    await query(`UPDATE users SET last_login_at = NOW() WHERE user_id = $1`, [user.user_id]);

    res.json({
      success: true,
      data: {
        accessToken,
        refreshToken,
        user: {
          id:        user.user_id,
          firstName: user.first_name,
          lastName:  user.last_name,
          email:     user.email,
          role:      user.role_name,
          avatar:    user.avatar,
        },
      },
    });
  } catch (err) { next(err); }
};

exports.refresh = async (req, res, next) => {
  try {
    const { refreshToken } = req.body;
    if (!refreshToken) {
      return res.status(400).json({ success: false, message: 'Refresh token required' });
    }

    const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);

    const result = await query(
      `SELECT * FROM refresh_tokens WHERE token = $1 AND is_revoked = false AND expires_at > NOW()`,
      [refreshToken]
    );

    if (!result.rows.length) {
      return res.status(401).json({ success: false, message: 'Invalid or expired refresh token' });
    }

    await query(`UPDATE refresh_tokens SET is_revoked = true WHERE token = $1`, [refreshToken]);

    const { accessToken, refreshToken: newRefresh } = generateTokens(decoded.userId);
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

    await query(
      `INSERT INTO refresh_tokens (user_id, token, expires_at) VALUES ($1, $2, $3)`,
      [decoded.userId, newRefresh, expiresAt]
    );

    res.json({ success: true, data: { accessToken, refreshToken: newRefresh } });
  } catch (err) {
    if (err.name === 'JsonWebTokenError') {
      return res.status(401).json({ success: false, message: 'Invalid refresh token' });
    }
    next(err);
  }
};

exports.logout = async (req, res, next) => {
  try {
    const { refreshToken } = req.body;
    if (refreshToken) {
      await query(`UPDATE refresh_tokens SET is_revoked = true WHERE token = $1`, [refreshToken]);
    }
    res.json({ success: true, message: 'Logged out successfully' });
  } catch (err) { next(err); }
};

exports.me = async (req, res) => {
  const permsResult = await query(
    `SELECT p.permission_key FROM role_permissions rp
     JOIN permissions p ON rp.permission_id = p.permission_id
     WHERE rp.role_id = $1`,
    [req.user.role_id]
  );

  res.json({
    success: true,
    data: {
      id:          req.user.user_id,
      firstName:   req.user.first_name,
      lastName:    req.user.last_name,
      email:       req.user.email,
      role:        req.user.role_name,
      avatar:      req.user.avatar,
      permissions: permsResult.rows.map(r => r.permission_key),
    },
  });
};

exports.changePassword = async (req, res, next) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const result = await query(
      `SELECT password_hash FROM users WHERE user_id = $1`,
      [req.user.user_id]
    );

    const match = await bcrypt.compare(currentPassword, result.rows[0].password_hash);
    if (!match) {
      return res.status(400).json({ success: false, message: 'Current password is incorrect' });
    }

    const hash = await bcrypt.hash(newPassword, parseInt(process.env.BCRYPT_ROUNDS) || 12);
    await query(
      `UPDATE users SET password_hash = $1, updated_at = NOW() WHERE user_id = $2`,
      [hash, req.user.user_id]
    );

    await query(`UPDATE refresh_tokens SET is_revoked = true WHERE user_id = $1`, [req.user.user_id]);

    res.json({ success: true, message: 'Password updated successfully' });
  } catch (err) { next(err); }
};
