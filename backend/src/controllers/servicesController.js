const { query } = require('../config/database');
const slugify = require('slug');

exports.getAll = async (req, res, next) => {
  try {
    const { page = 1, limit = 20, category, featured, search } = req.query;
    const offset = (page - 1) * limit;

    const conditions = ['1=1'];
    const params = [];

    if (category) {
      params.push(category);
      conditions.push(`sc.slug = $${params.length}`);
    }
    if (featured === 'true') {
      conditions.push(`s.is_featured = true`);
    }
    if (search) {
      params.push(`%${search}%`);
      conditions.push(`(s.title ILIKE $${params.length} OR s.short_desc ILIKE $${params.length})`);
    }
    if (!req.isAdmin) {
      conditions.push(`s.is_active = true`);
    }

    const where = 'WHERE ' + conditions.join(' AND ');

    const countResult = await query(
      `SELECT COUNT(*) AS total FROM services s LEFT JOIN service_categories sc ON s.category_id = sc.category_id ${where}`,
      params
    );

    params.push(+limit, +offset);
    const result = await query(
      `SELECT s.*, sc.name AS category_name, sc.slug AS category_slug, mf.file_url AS thumbnail_url
       FROM services s
       LEFT JOIN service_categories sc ON s.category_id = sc.category_id
       LEFT JOIN media_files mf ON s.thumbnail_id = mf.file_id
       ${where}
       ORDER BY s.sort_order, s.title
       LIMIT $${params.length - 1} OFFSET $${params.length}`,
      params
    );

    const total = parseInt(countResult.rows[0].total);
    res.json({
      success: true,
      data: result.rows,
      pagination: { page: +page, limit: +limit, total, pages: Math.ceil(total / limit) },
    });
  } catch (err) { next(err); }
};

exports.getBySlug = async (req, res, next) => {
  try {
    const result = await query(
      `SELECT s.*, sc.name AS category_name, sc.slug AS category_slug,
              banner.file_url AS banner_url, thumb.file_url AS thumbnail_url
       FROM services s
       LEFT JOIN service_categories sc ON s.category_id = sc.category_id
       LEFT JOIN media_files banner ON s.banner_id = banner.file_id
       LEFT JOIN media_files thumb ON s.thumbnail_id = thumb.file_id
       WHERE s.slug = $1 AND s.is_active = true`,
      [req.params.slug]
    );

    if (!result.rows.length) {
      return res.status(404).json({ success: false, message: 'Service not found' });
    }

    const service = result.rows[0];
    const faqs = await query(`SELECT * FROM service_faqs WHERE service_id = $1 ORDER BY sort_order`, [service.service_id]);

    res.json({ success: true, data: { ...service, faqs: faqs.rows } });
  } catch (err) { next(err); }
};

exports.create = async (req, res, next) => {
  try {
    const { categoryId, title, shortDesc, fullDesc, icon, sortOrder, isActive, isFeatured } = req.body;
    const slug = slugify(title, { lower: true });

    const existing = await query(`SELECT service_id FROM services WHERE slug = $1`, [slug]);
    if (existing.rows.length) {
      return res.status(409).json({ success: false, message: 'A service with this title already exists' });
    }

    const result = await query(
      `INSERT INTO services (category_id, title, slug, short_desc, full_desc, icon, sort_order, is_active, is_featured)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9) RETURNING service_id`,
      [categoryId || null, title, slug, shortDesc || null, fullDesc || null, icon || null,
       sortOrder || 0, isActive !== false, isFeatured || false]
    );

    res.status(201).json({ success: true, data: { serviceId: result.rows[0].service_id, slug } });
  } catch (err) { next(err); }
};

exports.update = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { title, categoryId, shortDesc, fullDesc, icon, bannerId, thumbnailId, sortOrder, isActive, isFeatured } = req.body;

    const existing = await query(`SELECT service_id FROM services WHERE service_id = $1`, [+id]);
    if (!existing.rows.length) {
      return res.status(404).json({ success: false, message: 'Service not found' });
    }

    await query(
      `UPDATE services SET
         category_id  = COALESCE($1, category_id),
         title        = COALESCE($2, title),
         short_desc   = COALESCE($3, short_desc),
         full_desc    = COALESCE($4, full_desc),
         icon         = COALESCE($5, icon),
         banner_id    = COALESCE($6, banner_id),
         thumbnail_id = COALESCE($7, thumbnail_id),
         sort_order   = COALESCE($8, sort_order),
         is_active    = COALESCE($9, is_active),
         is_featured  = COALESCE($10, is_featured),
         updated_at   = NOW()
       WHERE service_id = $11`,
      [categoryId ?? null, title ?? null, shortDesc ?? null, fullDesc ?? null, icon ?? null,
       bannerId ?? null, thumbnailId ?? null, sortOrder ?? null,
       isActive !== undefined ? isActive : null,
       isFeatured !== undefined ? isFeatured : null, +id]
    );

    res.json({ success: true, message: 'Service updated' });
  } catch (err) { next(err); }
};

exports.remove = async (req, res, next) => {
  try {
    await query(`DELETE FROM services WHERE service_id = $1`, [+req.params.id]);
    res.json({ success: true, message: 'Service deleted' });
  } catch (err) { next(err); }
};

exports.getCategories = async (req, res, next) => {
  try {
    const result = await query(`SELECT * FROM service_categories WHERE is_active = true ORDER BY sort_order`);
    res.json({ success: true, data: result.rows });
  } catch (err) { next(err); }
};
