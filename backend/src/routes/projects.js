const router = require('express').Router();
const { query } = require('../config/database');
const { authenticate, authorize } = require('../middleware/auth');
const slugify = require('slug');

router.get('/', async (req, res, next) => {
  try {
    const { page = 1, limit = 12, industry, featured, search } = req.query;
    const offset = (page - 1) * limit;

    const conditions = ['p.is_active = true'];
    const params = [];

    if (industry) {
      params.push(industry);
      conditions.push(`i.slug = $${params.length}`);
    }
    if (featured === 'true') conditions.push(`p.is_featured = true`);
    if (search) {
      params.push(`%${search}%`);
      const n = params.length;
      conditions.push(`(p.project_name ILIKE $${n} OR p.client_name ILIKE $${n})`);
    }

    const where = 'WHERE ' + conditions.join(' AND ');

    const [countR, dataR] = await Promise.all([
      query(`SELECT COUNT(*) AS total FROM projects p LEFT JOIN industries i ON p.industry_id = i.industry_id ${where}`, params),
      query(
        `SELECT p.project_id, p.project_name, p.slug, p.client_name, p.location,
                p.completion_date, p.is_featured,
                i.name AS industry_name, mf.file_url AS thumbnail_url
         FROM projects p
         LEFT JOIN industries i ON p.industry_id = i.industry_id
         LEFT JOIN media_files mf ON p.thumbnail_id = mf.file_id
         ${where} ORDER BY p.completion_date DESC NULLS LAST
         LIMIT $${params.length + 1} OFFSET $${params.length + 2}`,
        [...params, +limit, +offset]
      ),
    ]);

    res.json({
      success: true,
      data: dataR.rows,
      pagination: { page: +page, limit: +limit, total: parseInt(countR.rows[0].total) },
    });
  } catch (err) { next(err); }
});

router.get('/:slug', async (req, res, next) => {
  try {
    const result = await query(
      `SELECT p.*, i.name AS industry_name,
              banner.file_url AS banner_url, thumb.file_url AS thumbnail_url
       FROM projects p
       LEFT JOIN industries i ON p.industry_id = i.industry_id
       LEFT JOIN media_files banner ON p.banner_id = banner.file_id
       LEFT JOIN media_files thumb ON p.thumbnail_id = thumb.file_id
       WHERE p.slug = $1 AND p.is_active = true`,
      [req.params.slug]
    );
    if (!result.rows.length) return res.status(404).json({ success: false, message: 'Project not found' });
    res.json({ success: true, data: result.rows[0] });
  } catch (err) { next(err); }
});

router.post('/', authenticate, authorize('projects.create'), async (req, res, next) => {
  try {
    const { projectName, clientName, industryId, location, description, challenge, solution, results, technologies, projectValue, currency, startDate, completionDate } = req.body;
    const slug = slugify(projectName, { lower: true });
    const result = await query(
      `INSERT INTO projects (industry_id, project_name, slug, client_name, location, description, challenge, solution, results, technologies, project_value, currency, start_date, completion_date)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14) RETURNING project_id`,
      [industryId || null, projectName, slug, clientName || null, location || null,
       description || null, challenge || null, solution || null, results || null,
       technologies ? JSON.stringify(technologies) : null,
       projectValue || null, currency || 'INR', startDate || null, completionDate || null]
    );
    res.status(201).json({ success: true, data: { projectId: result.rows[0].project_id, slug } });
  } catch (err) { next(err); }
});

router.put('/:id', authenticate, authorize('projects.edit'), async (req, res, next) => {
  try {
    const { projectName, clientName, industryId, location, description, challenge, solution, results, technologies, projectValue, startDate, completionDate, bannerId, thumbnailId, isFeatured, isActive } = req.body;
    await query(
      `UPDATE projects SET
         industry_id     = COALESCE($1, industry_id),
         project_name    = COALESCE($2, project_name),
         client_name     = COALESCE($3, client_name),
         location        = COALESCE($4, location),
         description     = COALESCE($5, description),
         challenge       = COALESCE($6, challenge),
         solution        = COALESCE($7, solution),
         results         = COALESCE($8, results),
         technologies    = COALESCE($9, technologies),
         project_value   = COALESCE($10, project_value),
         start_date      = COALESCE($11, start_date),
         completion_date = COALESCE($12, completion_date),
         banner_id       = COALESCE($13, banner_id),
         thumbnail_id    = COALESCE($14, thumbnail_id),
         is_featured     = COALESCE($15, is_featured),
         is_active       = COALESCE($16, is_active),
         updated_at      = NOW()
       WHERE project_id = $17`,
      [industryId ?? null, projectName ?? null, clientName ?? null, location ?? null,
       description ?? null, challenge ?? null, solution ?? null, results ?? null,
       technologies ? JSON.stringify(technologies) : null,
       projectValue ?? null, startDate ?? null, completionDate ?? null,
       bannerId ?? null, thumbnailId ?? null,
       isFeatured !== undefined ? isFeatured : null,
       isActive !== undefined ? isActive : null,
       +req.params.id]
    );
    res.json({ success: true, message: 'Project updated' });
  } catch (err) { next(err); }
});

router.delete('/:id', authenticate, authorize('projects.delete'), async (req, res, next) => {
  try {
    await query(`DELETE FROM projects WHERE project_id = $1`, [+req.params.id]);
    res.json({ success: true, message: 'Project deleted' });
  } catch (err) { next(err); }
});

module.exports = router;
