const router = require('express').Router();
const { query } = require('../config/database');
const { authenticate, requireRole } = require('../middleware/auth');

router.use(authenticate);

const customerOnly = requireRole('Customer');

router.get('/profile', customerOnly, async (req, res, next) => {
  try {
    const result = await query(
      `SELECT u.user_id, u.first_name, u.last_name, u.email, u.phone
       FROM users u WHERE u.user_id = $1`,
      [req.user.user_id]
    );
    res.json({ success: true, data: result.rows[0] || null });
  } catch (err) { next(err); }
});

router.get('/tickets', customerOnly, async (req, res, next) => {
  try {
    res.json({ success: true, data: [] });
  } catch (err) { next(err); }
});

router.post('/tickets', customerOnly, async (req, res, next) => {
  try {
    const { subject, description, priority, category } = req.body;
    res.status(201).json({ success: true, message: 'Ticket submitted' });
  } catch (err) { next(err); }
});

module.exports = router;
