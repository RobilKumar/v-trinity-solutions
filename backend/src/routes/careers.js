const router = require('express').Router();
const { body } = require('express-validator');
const { query } = require('../config/database');
const { authenticate, authorize } = require('../middleware/auth');
const upload = require('../middleware/upload');
const emailService = require('../services/emailService');
const validate = require('../middleware/validate');
const slugify = require('slug');

// Public: list active jobs
router.get('/', async (req, res, next) => {
  try {
    const { type } = req.query;
    const params = [];
    const conditions = [`jl.status = 'active' AND (jl.expires_at IS NULL OR jl.expires_at >= CURRENT_DATE)`];

    if (type) { params.push(type); conditions.push(`jl.job_type = $${params.length}`); }

    const result = await query(
      `SELECT * FROM job_listings jl WHERE ${conditions.join(' AND ')} ORDER BY jl.created_at DESC`,
      params
    );
    res.json({ success: true, data: result.rows });
  } catch (err) { next(err); }
});

router.get('/:slug', async (req, res, next) => {
  try {
    const result = await query(
      `SELECT * FROM job_listings WHERE slug = $1 AND status = 'active'`,
      [req.params.slug]
    );
    if (!result.rows.length) return res.status(404).json({ success: false, message: 'Job not found' });
    res.json({ success: true, data: result.rows[0] });
  } catch (err) { next(err); }
});

// Public: apply
router.post('/:id/apply', upload.single('resume'), [
  body('fullName').trim().notEmpty(),
  body('email').isEmail().normalizeEmail(),
  body('phone').trim().notEmpty(),
], validate, async (req, res, next) => {
  try {
    const { fullName, email, phone, currentCompany, currentRole, experience, coverLetter, linkedInURL } = req.body;
    const jobId = +req.params.id;

    const job = await query(`SELECT job_id, title FROM job_listings WHERE job_id = $1 AND status = 'active'`, [jobId]);
    if (!job.rows.length) return res.status(404).json({ success: false, message: 'Job not found' });

    res.status(201).json({ success: true, message: 'Application submitted successfully' });
  } catch (err) { next(err); }
});

// Admin: create job
router.post('/', authenticate, authorize('careers.create'), async (req, res, next) => {
  try {
    const { title, location, jobType, experienceMin, experienceMax, salary, description, requirements, benefits, expiresAt } = req.body;
    const slug = slugify(title, { lower: true });
    const result = await query(
      `INSERT INTO job_listings (title, slug, location, job_type, experience_min, experience_max, salary, description, requirements, benefits, expires_at)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11) RETURNING job_id`,
      [title, slug, location || null, jobType || null, experienceMin || null, experienceMax || null,
       salary || null, description || null, requirements || null, benefits || null, expiresAt || null]
    );
    res.status(201).json({ success: true, data: { jobId: result.rows[0].job_id, slug } });
  } catch (err) { next(err); }
});

module.exports = router;
