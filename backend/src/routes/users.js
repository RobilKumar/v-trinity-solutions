/**
 * routes/users.js — Admin user management endpoints (PostgreSQL).
 */
const router = require('express').Router();
const bcrypt = require('bcryptjs');
const { body } = require('express-validator');
const { query } = require('../config/database');
const { authenticate, authorize } = require('../middleware/auth');
const validate = require('../middleware/validate');

router.use(authenticate, authorize('users.view'));

router.get('/', async (req, res, next) => {
  try {
    const page   = parseInt(req.query.page)  || 1;
    const limit  = parseInt(req.query.limit) || 15;
    const offset = (page - 1) * limit;

    const total = await query(`SELECT COUNT(*) AS cnt FROM users`);
    const result = await query(
      `SELECT u.user_id, u.first_name, u.last_name, u.email, u.phone,
              u.is_active, u.last_login_at, u.created_at, u.role_id,
              r.role_name,
              STRING_AGG(p.permission_key, ',') AS permissions
       FROM users u
       JOIN roles r ON u.role_id = r.role_id
       LEFT JOIN role_permissions rp ON rp.role_id = u.role_id
       LEFT JOIN permissions p ON p.permission_id = rp.permission_id
       GROUP BY u.user_id, u.first_name, u.last_name, u.email, u.phone,
                u.is_active, u.last_login_at, u.created_at, u.role_id, r.role_name
       ORDER BY u.created_at DESC
       LIMIT $1 OFFSET $2`,
      [limit, offset]
    );

    res.json({
      success: true,
      data: result.rows,
      pagination: { total: parseInt(total.rows[0].cnt), page, limit },
    });
  } catch (err) { next(err); }
});

router.post('/', authorize('users.create'), [
  body('email').isEmail().normalizeEmail(),
  body('password').isLength({ min: 8 }),
  body('firstName').notEmpty(),
  body('lastName').notEmpty(),
  body('roleId').isInt(),
], validate, async (req, res, next) => {
  try {
    const { email, password, firstName, lastName, roleId, phone } = req.body;

    const existing = await query(`SELECT user_id FROM users WHERE email = $1`, [email]);
    if (existing.rows.length) {
      return res.status(409).json({ success: false, message: 'A user with this email already exists.' });
    }

    const hash = await bcrypt.hash(password, parseInt(process.env.BCRYPT_ROUNDS) || 12);
    const result = await query(
      `INSERT INTO users (role_id, first_name, last_name, email, password_hash, phone, is_verified, is_active)
       VALUES ($1,$2,$3,$4,$5,$6,true,true) RETURNING user_id`,
      [+roleId, firstName, lastName, email, hash, phone || null]
    );

    res.status(201).json({ success: true, data: { userId: result.rows[0].user_id } });
  } catch (err) { next(err); }
});

router.put('/:id', authorize('users.edit'), async (req, res, next) => {
  try {
    const { firstName, lastName, email, phone, roleId, isActive, password } = req.body;

    let hashUpdate = '';
    const params = [
      firstName ?? null, lastName ?? null, email ?? null, phone ?? null,
      roleId ?? null, isActive !== undefined ? isActive : null,
    ];

    if (password && password.length >= 8) {
      const hash = await bcrypt.hash(password, parseInt(process.env.BCRYPT_ROUNDS) || 12);
      params.push(hash);
      hashUpdate = `, password_hash = COALESCE($${params.length}, password_hash)`;
    }

    params.push(+req.params.id);
    const idPos = params.length;

    await query(
      `UPDATE users SET
         first_name = COALESCE($1, first_name),
         last_name  = COALESCE($2, last_name),
         email      = COALESCE($3, email),
         phone      = COALESCE($4, phone),
         role_id    = COALESCE($5, role_id),
         is_active  = COALESCE($6, is_active)
         ${hashUpdate},
         updated_at = NOW()
       WHERE user_id = $${idPos}`,
      params
    );

    res.json({ success: true, message: 'User updated successfully.' });
  } catch (err) { next(err); }
});

router.delete('/:id', authorize('users.delete'), async (req, res, next) => {
  try {
    if (+req.params.id === req.user.user_id) {
      return res.status(400).json({ success: false, message: 'You cannot deactivate your own account.' });
    }
    await query(
      `UPDATE users SET is_active = false, updated_at = NOW() WHERE user_id = $1`,
      [+req.params.id]
    );
    res.json({ success: true, message: 'User deactivated.' });
  } catch (err) { next(err); }
});

router.get('/roles/all', async (req, res, next) => {
  try {
    const result = await query(`SELECT role_id, role_name, description FROM roles ORDER BY role_id`);
    res.json({ success: true, data: result.rows });
  } catch (err) { next(err); }
});

module.exports = router;
