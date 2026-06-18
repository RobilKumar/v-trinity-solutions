const router = require('express').Router();
const { query } = require('../config/database');
const { authenticate, authorize } = require('../middleware/auth');

router.get('/:slug', async (req, res, next) => {
  try {
    const result = await query(`SELECT * FROM seo_pages WHERE page_slug = $1`, [req.params.slug]);
    res.json({ success: true, data: result.rows[0] || null });
  } catch (err) { next(err); }
});

router.put('/:slug', authenticate, authorize('seo.edit'), async (req, res, next) => {
  try {
    const { metaTitle, metaDescription, keywords, ogTitle, ogDescription, ogImage, canonicalURL } = req.body;
    await query(
      `INSERT INTO seo_pages (page_slug, meta_title, meta_description, keywords, og_title, og_description, og_image, canonical_url, updated_at)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,NOW())
       ON CONFLICT (page_slug) DO UPDATE SET
         meta_title       = EXCLUDED.meta_title,
         meta_description = EXCLUDED.meta_description,
         keywords         = EXCLUDED.keywords,
         og_title         = EXCLUDED.og_title,
         og_description   = EXCLUDED.og_description,
         og_image         = EXCLUDED.og_image,
         canonical_url    = EXCLUDED.canonical_url,
         updated_at       = NOW()`,
      [req.params.slug, metaTitle || null, metaDescription || null, keywords || null,
       ogTitle || null, ogDescription || null, ogImage || null, canonicalURL || null]
    );
    res.json({ success: true, message: 'SEO settings saved' });
  } catch (err) { next(err); }
});

router.get('/', authenticate, authorize('seo.view'), async (req, res, next) => {
  try {
    const result = await query(`SELECT * FROM seo_pages ORDER BY page_slug`);
    res.json({ success: true, data: result.rows });
  } catch (err) { next(err); }
});

module.exports = router;
