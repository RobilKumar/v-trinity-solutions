const router = require('express').Router();
const { query } = require('../config/database');
const { authenticate, authorize } = require('../middleware/auth');

router.use(authenticate);

router.get('/', authorize('settings.view'), async (req, res, next) => {
  try {
    const result = await query(`SELECT * FROM website_settings ORDER BY group_name, setting_key`);
    const grouped = {};
    result.rows.forEach(s => {
      if (!grouped[s.group_name]) grouped[s.group_name] = [];
      grouped[s.group_name].push(s);
    });
    res.json({ success: true, data: grouped });
  } catch (err) { next(err); }
});

router.put('/', authorize('settings.edit'), async (req, res, next) => {
  try {
    const { settings } = req.body;
    if (!Array.isArray(settings)) {
      return res.status(400).json({ success: false, message: 'settings must be an array' });
    }
    for (const { key, value } of settings) {
      await query(
        `UPDATE website_settings SET setting_value = $1, updated_at = NOW(), updated_by = $2 WHERE setting_key = $3`,
        [value, req.user.user_id, key]
      );
    }
    res.json({ success: true, message: 'Settings updated' });
  } catch (err) { next(err); }
});

router.get('/social', async (req, res, next) => {
  try {
    const result = await query(`SELECT * FROM social_links ORDER BY sort_order`);
    res.json({ success: true, data: result.rows });
  } catch (err) { next(err); }
});

router.put('/social/:id', authorize('settings.edit'), async (req, res, next) => {
  try {
    const { url, isActive } = req.body;
    await query(
      `UPDATE social_links SET url = $1, is_active = $2 WHERE social_id = $3`,
      [url, isActive, +req.params.id]
    );
    res.json({ success: true, message: 'Updated' });
  } catch (err) { next(err); }
});

module.exports = router;
