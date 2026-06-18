const router = require('express').Router();
const { body } = require('express-validator');
const rateLimit = require('express-rate-limit');
const { query } = require('../config/database');
const emailService = require('../services/emailService');
const { authenticate, authorize } = require('../middleware/auth');
const validate = require('../middleware/validate');

const limiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 10,
  validate: { xForwardedForHeader: false },
});

router.post('/', limiter, [
  body('name').trim().notEmpty().isLength({ max: 200 }),
  body('email').isEmail().normalizeEmail(),
  body('message').trim().notEmpty().isLength({ max: 5000 }),
], validate, async (req, res, next) => {
  try {
    const { name, email, phone, subject, message } = req.body;

    await query(
      `INSERT INTO contact_submissions (name, email, phone, subject, message, ip_address)
       VALUES ($1,$2,$3,$4,$5,$6)`,
      [name, email, phone || null, subject || null, message, req.ip]
    );

    emailService.sendTemplate('contact_notification', process.env.ADMIN_EMAIL, { Name: name, Email: email, Message: message })
      .catch(() => {});

    res.json({ success: true, message: 'Message sent successfully. We will get back to you soon.' });
  } catch (err) { next(err); }
});

router.get('/', authenticate, authorize('settings.view'), async (req, res, next) => {
  try {
    const { page = 1, limit = 20, status } = req.query;
    const offset = (page - 1) * limit;
    const params = [+limit, +offset];
    const where = status ? `WHERE status = '${status.replace(/'/g, "''")}'` : '';
    const result = await query(
      `SELECT * FROM contact_submissions ${where} ORDER BY created_at DESC LIMIT $1 OFFSET $2`,
      params
    );
    res.json({ success: true, data: result.rows });
  } catch (err) { next(err); }
});

module.exports = router;
