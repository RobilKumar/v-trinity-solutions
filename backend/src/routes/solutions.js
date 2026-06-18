const router = require('express').Router();
const { query } = require('../config/database');
const { authenticate, authorize } = require('../middleware/auth');
const slugify = require('slug');

router.get('/', async (req, res, next) => {
  try {
    const result = await query(
      `SELECT s.*, mf.file_url AS thumbnail_url FROM solutions s
       LEFT JOIN media_files mf ON s.thumbnail_id = mf.file_id
       WHERE s.is_active = true ORDER BY s.sort_order`
    );
    res.json({ success: true, data: result.rows });
  } catch (err) { next(err); }
});

router.get('/:slug', async (req, res, next) => {
  try {
    const result = await query(
      `SELECT s.*, banner.file_url AS banner_url, thumb.file_url AS thumbnail_url
       FROM solutions s
       LEFT JOIN media_files banner ON s.banner_id = banner.file_id
       LEFT JOIN media_files thumb ON s.thumbnail_id = thumb.file_id
       WHERE s.slug = $1 AND s.is_active = true`,
      [req.params.slug]
    );
    if (!result.rows.length) return res.status(404).json({ success: false, message: 'Solution not found' });
    res.json({ success: true, data: result.rows[0] });
  } catch (err) { next(err); }
});

router.post('/', authenticate, authorize('solutions.create'), async (req, res, next) => {
  try {
    const { title, shortDesc, fullDesc, icon, keyFeatures, useCases } = req.body;
    const slug = slugify(title, { lower: true });
    const result = await query(
      `INSERT INTO solutions (title, slug, short_desc, full_desc, icon, key_features, use_cases)
       VALUES ($1,$2,$3,$4,$5,$6,$7) RETURNING solution_id`,
      [title, slug, shortDesc || null, fullDesc || null, icon || null,
       keyFeatures ? JSON.stringify(keyFeatures) : null,
       useCases ? JSON.stringify(useCases) : null]
    );
    res.status(201).json({ success: true, data: { solutionId: result.rows[0].solution_id, slug } });
  } catch (err) { next(err); }
});

router.put('/:id', authenticate, authorize('solutions.edit'), async (req, res, next) => {
  try {
    const { title, shortDesc, fullDesc, icon, bannerId, thumbnailId, isActive, isFeatured, keyFeatures, useCases } = req.body;
    await query(
      `UPDATE solutions SET
         title        = COALESCE($1, title),
         short_desc   = COALESCE($2, short_desc),
         full_desc    = COALESCE($3, full_desc),
         icon         = COALESCE($4, icon),
         banner_id    = COALESCE($5, banner_id),
         thumbnail_id = COALESCE($6, thumbnail_id),
         is_active    = COALESCE($7, is_active),
         is_featured  = COALESCE($8, is_featured),
         key_features = COALESCE($9, key_features),
         use_cases    = COALESCE($10, use_cases),
         updated_at   = NOW()
       WHERE solution_id = $11`,
      [title ?? null, shortDesc ?? null, fullDesc ?? null, icon ?? null,
       bannerId ?? null, thumbnailId ?? null,
       isActive !== undefined ? isActive : null,
       isFeatured !== undefined ? isFeatured : null,
       keyFeatures ? JSON.stringify(keyFeatures) : null,
       useCases ? JSON.stringify(useCases) : null,
       +req.params.id]
    );
    res.json({ success: true, message: 'Solution updated' });
  } catch (err) { next(err); }
});

router.delete('/:id', authenticate, authorize('solutions.delete'), async (req, res, next) => {
  try {
    await query(`DELETE FROM solutions WHERE solution_id = $1`, [+req.params.id]);
    res.json({ success: true, message: 'Solution deleted' });
  } catch (err) { next(err); }
});

module.exports = router;
