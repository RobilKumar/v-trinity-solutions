/**
 * routes/case-studies.js — CRUD for case_studies table (PostgreSQL).
 */
const router = require('express').Router();
const { query } = require('../config/database');
const { authenticate, authorize } = require('../middleware/auth');

router.get('/', async (req, res, next) => {
  try {
    const page   = parseInt(req.query.page)  || 1;
    const limit  = parseInt(req.query.limit) || 10;
    const offset = (page - 1) * limit;

    const total  = await query(`SELECT COUNT(*) AS cnt FROM case_studies WHERE is_active = true`);
    const result = await query(
      `SELECT cs.*, p.project_name FROM case_studies cs
       LEFT JOIN projects p ON cs.project_id = p.project_id
       WHERE cs.is_active = true
       ORDER BY cs.created_at DESC
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

router.get('/:slug', async (req, res, next) => {
  try {
    const result = await query(
      `SELECT cs.*, p.project_name, p.technologies FROM case_studies cs
       LEFT JOIN projects p ON cs.project_id = p.project_id
       WHERE cs.slug = $1`,
      [req.params.slug]
    );
    if (!result.rows[0]) return res.status(404).json({ success: false, message: 'Not found' });
    res.json({ success: true, data: result.rows[0] });
  } catch (err) { next(err); }
});

router.post('/', authenticate, authorize('projects.create'), async (req, res, next) => {
  try {
    const { Title, Client, Industry, Challenge, Solution, Results, IsActive } = req.body;
    const slug = Title.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '').substring(0, 200);
    await query(
      `INSERT INTO case_studies (title, slug, client, industry, challenge, solution, results, is_active)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8)`,
      [Title, slug, Client || '', Industry || '', Challenge || '', Solution || '', Results || '', IsActive !== false]
    );
    res.status(201).json({ success: true });
  } catch (err) { next(err); }
});

router.put('/:id', authenticate, authorize('projects.edit'), async (req, res, next) => {
  try {
    const { Title, Client, Industry, Challenge, Solution, Results, IsActive } = req.body;
    await query(
      `UPDATE case_studies SET title=$1, client=$2, industry=$3, challenge=$4, solution=$5, results=$6, is_active=$7
       WHERE case_study_id = $8`,
      [Title, Client || '', Industry || '', Challenge || '', Solution || '', Results || '', IsActive !== false, +req.params.id]
    );
    res.json({ success: true });
  } catch (err) { next(err); }
});

router.delete('/:id', authenticate, authorize('projects.delete'), async (req, res, next) => {
  try {
    await query(`DELETE FROM case_studies WHERE case_study_id = $1`, [+req.params.id]);
    res.json({ success: true });
  } catch (err) { next(err); }
});

module.exports = router;
