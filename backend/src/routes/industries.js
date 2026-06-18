/**
 * routes/industries.js — CRUD for the industries table (PostgreSQL).
 */
const router = require('express').Router();
const { query } = require('../config/database');
const { authenticate, authorize } = require('../middleware/auth');

router.get('/', async (req, res, next) => {
  try {
    const result = await query(`SELECT * FROM industries WHERE is_active = true ORDER BY sort_order`);
    res.json({ success: true, data: result.rows });
  } catch (err) { next(err); }
});

router.post('/', authenticate, authorize('industries.create'), async (req, res, next) => {
  try {
    const { Name, Slug, Description, Icon } = req.body;
    const slug = Slug || Name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
    await query(
      `INSERT INTO industries (name, slug, description, icon, is_active) VALUES ($1,$2,$3,$4,true)`,
      [Name, slug, Description || '', Icon || '']
    );
    res.status(201).json({ success: true });
  } catch (err) { next(err); }
});

router.put('/:id', authenticate, authorize('industries.edit'), async (req, res, next) => {
  try {
    const { Name, Description, Icon, IsActive } = req.body;
    await query(
      `UPDATE industries SET name=$1, description=$2, icon=$3, is_active=$4 WHERE industry_id=$5`,
      [Name, Description || '', Icon || '', IsActive, +req.params.id]
    );
    res.json({ success: true });
  } catch (err) { next(err); }
});

router.delete('/:id', authenticate, authorize('industries.delete'), async (req, res, next) => {
  try {
    await query(`DELETE FROM industries WHERE industry_id = $1`, [+req.params.id]);
    res.json({ success: true });
  } catch (err) { next(err); }
});

module.exports = router;
