/**
 * routes/auth.js — Authentication routes.
 * Handles login, token refresh, logout, and current-user lookup.
 * Login endpoint is rate-limited to prevent brute-force attacks.
 */

const router = require('express').Router();
const { body } = require('express-validator');
const rateLimit = require('express-rate-limit');
const authCtrl = require('../controllers/authController');
const { authenticate } = require('../middleware/auth');
const validate = require('../middleware/validate');

// Strict rate limiter for login — 20 attempts per 15 min per IP.
// xForwardedForHeader validation disabled because trust proxy is set globally.
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: parseInt(process.env.AUTH_RATE_LIMIT_MAX) || 20,
  message: { success: false, message: 'Too many login attempts. Try again in 15 minutes.' },
  standardHeaders: true,
  legacyHeaders: false,
  validate: { xForwardedForHeader: false },
});

// POST /api/auth/login — validate credentials, return access + refresh tokens
router.post('/login', loginLimiter, [
  body('email').isEmail().normalizeEmail(),
  body('password').isLength({ min: 6 }),
], validate, authCtrl.login);

// POST /api/auth/refresh — swap a valid refresh token for a new access token
router.post('/refresh', authCtrl.refresh);

// POST /api/auth/logout — revoke the refresh token stored in DB
router.post('/logout', authCtrl.logout);

// GET /api/auth/me — return the currently authenticated user's profile
router.get('/me', authenticate, authCtrl.me);

// POST /api/auth/change-password — change password (requires current password)
router.post('/change-password', authenticate, [
  body('currentPassword').notEmpty(),
  body('newPassword').isLength({ min: 8 }),
], validate, authCtrl.changePassword);

module.exports = router;
