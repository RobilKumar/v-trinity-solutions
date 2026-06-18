const router = require('express').Router();
const { query } = require('../config/database');
const { authenticate, authorize } = require('../middleware/auth');
const slugify = require('slug');
const xss = require('xss');

// Public: list posts
router.get('/', async (req, res, next) => {
  try {
    const { page = 1, limit = 10, category, search, featured } = req.query;
    const offset = (page - 1) * limit;

    const conditions = [`bp.status = 'published'`];
    const params = [];

    if (category) {
      params.push(category);
      conditions.push(`bc.slug = $${params.length}`);
    }
    if (search) {
      params.push(`%${search}%`);
      const n = params.length;
      conditions.push(`(bp.title ILIKE $${n} OR bp.excerpt ILIKE $${n})`);
    }
    if (featured === 'true') conditions.push(`bp.is_featured = true`);

    const where = 'WHERE ' + conditions.join(' AND ');

    const [countR, dataR] = await Promise.all([
      query(`SELECT COUNT(*) AS total FROM blog_posts bp LEFT JOIN blog_categories bc ON bp.category_id = bc.category_id ${where}`, params),
      query(
        `SELECT bp.post_id, bp.title, bp.slug, bp.excerpt, bp.publish_at, bp.view_count,
                bc.name AS category_name, bc.slug AS category_slug,
                u.first_name || ' ' || u.last_name AS author_name,
                mf.file_url AS featured_image
         FROM blog_posts bp
         LEFT JOIN blog_categories bc ON bp.category_id = bc.category_id
         LEFT JOIN users u ON bp.author_id = u.user_id
         LEFT JOIN media_files mf ON bp.featured_img_id = mf.file_id
         ${where} ORDER BY bp.publish_at DESC
         LIMIT $${params.length + 1} OFFSET $${params.length + 2}`,
        [...params, +limit, +offset]
      ),
    ]);

    res.json({ success: true, data: dataR.rows, pagination: { page: +page, limit: +limit, total: parseInt(countR.rows[0].total) } });
  } catch (err) { next(err); }
});

// Public: single post
router.get('/:slug', async (req, res, next) => {
  try {
    const result = await query(
      `SELECT bp.*, bc.name AS category_name, bc.slug AS category_slug,
              u.first_name || ' ' || u.last_name AS author_name,
              mf.file_url AS featured_image
       FROM blog_posts bp
       LEFT JOIN blog_categories bc ON bp.category_id = bc.category_id
       LEFT JOIN users u ON bp.author_id = u.user_id
       LEFT JOIN media_files mf ON bp.featured_img_id = mf.file_id
       WHERE bp.slug = $1 AND bp.status = 'published'`,
      [req.params.slug]
    );

    if (!result.rows.length) return res.status(404).json({ success: false, message: 'Post not found' });
    const post = result.rows[0];

    query(`UPDATE blog_posts SET view_count = view_count + 1 WHERE post_id = $1`, [post.post_id]).catch(() => {});

    const related = await query(
      `SELECT post_id, title, slug, excerpt, mf.file_url AS featured_image
       FROM blog_posts bp LEFT JOIN media_files mf ON bp.featured_img_id = mf.file_id
       WHERE bp.category_id = $1 AND bp.post_id != $2 AND bp.status = 'published'
       ORDER BY bp.publish_at DESC LIMIT 3`,
      [post.category_id, post.post_id]
    );

    res.json({ success: true, data: { ...post, related: related.rows } });
  } catch (err) { next(err); }
});

// Admin: create
router.post('/', authenticate, authorize('blog.create'), async (req, res, next) => {
  try {
    const { title, categoryId, excerpt, content, featuredImgId, status, publishAt, isFeatured, allowComments } = req.body;
    const slug = slugify(title, { lower: true });
    const safeContent = xss(content);

    const result = await query(
      `INSERT INTO blog_posts (category_id, author_id, title, slug, excerpt, content, featured_img_id, status, publish_at, is_featured, allow_comments)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11) RETURNING post_id`,
      [categoryId || null, req.user.user_id, title, slug, excerpt || null, safeContent,
       featuredImgId || null, status || 'draft', publishAt || null,
       isFeatured || false, allowComments !== false]
    );

    res.status(201).json({ success: true, data: { postId: result.rows[0].post_id, slug } });
  } catch (err) { next(err); }
});

// Admin: update
router.put('/:id', authenticate, authorize('blog.edit'), async (req, res, next) => {
  try {
    const { title, categoryId, excerpt, content, featuredImgId, status, publishAt, isFeatured } = req.body;
    const safeContent = content ? xss(content) : null;

    await query(
      `UPDATE blog_posts SET
         title          = COALESCE($1, title),
         category_id    = COALESCE($2, category_id),
         excerpt        = COALESCE($3, excerpt),
         content        = COALESCE($4, content),
         featured_img_id= COALESCE($5, featured_img_id),
         status         = COALESCE($6, status),
         publish_at     = COALESCE($7, publish_at),
         is_featured    = COALESCE($8, is_featured),
         updated_at     = NOW()
       WHERE post_id = $9`,
      [title ?? null, categoryId ?? null, excerpt ?? null, safeContent,
       featuredImgId ?? null, status ?? null, publishAt ?? null,
       isFeatured !== undefined ? isFeatured : null,
       +req.params.id]
    );

    res.json({ success: true, message: 'Post updated' });
  } catch (err) { next(err); }
});

router.delete('/:id', authenticate, authorize('blog.delete'), async (req, res, next) => {
  try {
    await query(`DELETE FROM blog_posts WHERE post_id = $1`, [+req.params.id]);
    res.json({ success: true, message: 'Post deleted' });
  } catch (err) { next(err); }
});

router.get('/meta/categories', async (req, res, next) => {
  try {
    const result = await query(`SELECT * FROM blog_categories WHERE is_active = true`);
    res.json({ success: true, data: result.rows });
  } catch (err) { next(err); }
});

module.exports = router;
