/**
 * routes/public.js — Public unauthenticated data endpoints (PostgreSQL).
 */
const router = require('express').Router();
const { query } = require('../config/database');

router.get('/home', async (req, res, next) => {
  try {
    const [banners, stats, services, projects, testimonials] = await Promise.all([
      query(`SELECT hb.*, mf.file_url AS image_url FROM hero_banners hb LEFT JOIN media_files mf ON hb.image_id = mf.file_id WHERE hb.is_active = true ORDER BY hb.sort_order`),
      query(`SELECT * FROM site_statistics WHERE is_active = true ORDER BY sort_order`),
      query(`SELECT s.service_id, s.title, s.slug, s.short_desc, s.icon, mf.file_url AS thumbnail_url, sc.name AS category_name FROM services s LEFT JOIN media_files mf ON s.thumbnail_id = mf.file_id LEFT JOIN service_categories sc ON s.category_id = sc.category_id WHERE s.is_active = true AND s.is_featured = true ORDER BY s.sort_order`),
      query(`SELECT p.project_id, p.project_name, p.slug, p.client_name, p.location, mf.file_url AS thumbnail_url, i.name AS industry_name FROM projects p LEFT JOIN media_files mf ON p.thumbnail_id = mf.file_id LEFT JOIN industries i ON p.industry_id = i.industry_id WHERE p.is_active = true AND p.is_featured = true ORDER BY p.completion_date DESC NULLS LAST`),
      query(`SELECT t.*, mf.file_url AS avatar_url FROM testimonials t LEFT JOIN media_files mf ON t.avatar_id = mf.file_id WHERE t.is_active = true ORDER BY t.sort_order`),
    ]);
    res.json({ success: true, data: {
      banners:          banners.rows,
      stats:            stats.rows,
      featuredServices: services.rows,
      featuredProjects: projects.rows,
      testimonials:     testimonials.rows,
    }});
  } catch (err) { next(err); }
});

router.get('/settings', async (req, res, next) => {
  try {
    const [settings, social] = await Promise.all([
      query(`SELECT setting_key, setting_value FROM website_settings WHERE group_name != 'Email' AND setting_key NOT LIKE 'smtp%'`),
      query(`SELECT * FROM social_links WHERE is_active = true ORDER BY sort_order`),
    ]);
    const settingsObj = {};
    settings.rows.forEach(s => { settingsObj[s.setting_key] = s.setting_value; });
    res.json({ success: true, data: { settings: settingsObj, socialLinks: social.rows, locations: [] } });
  } catch (err) { next(err); }
});

router.get('/menu/:location', async (req, res, next) => {
  try {
    const result = await query(
      `SELECT mi.* FROM menu_items mi JOIN menus m ON mi.menu_id = m.menu_id WHERE m.location = $1 AND mi.is_active = true ORDER BY mi.sort_order`,
      [req.params.location]
    );
    const items = result.rows;
    const tree = items.filter(i => !i.parent_id).map(parent => ({
      ...parent, children: items.filter(i => i.parent_id === parent.item_id),
    }));
    res.json({ success: true, data: tree });
  } catch (err) { next(err); }
});

router.get('/industries', async (req, res, next) => {
  try {
    const result = await query(`SELECT i.*, mf.file_url AS thumbnail_url FROM industries i LEFT JOIN media_files mf ON i.thumbnail_id = mf.file_id WHERE i.is_active = true ORDER BY i.sort_order`);
    res.json({ success: true, data: result.rows });
  } catch (err) { next(err); }
});

router.get('/about', async (req, res, next) => {
  try {
    const [team, timeline] = await Promise.all([
      query(`SELECT tm.*, mf.file_url AS photo_url FROM team_members tm LEFT JOIN media_files mf ON tm.photo_id = mf.file_id WHERE tm.is_active = true ORDER BY tm.sort_order`),
      query(`SELECT * FROM company_timeline WHERE is_active = true ORDER BY year`),
    ]);
    res.json({ success: true, data: { team: team.rows, timeline: timeline.rows, awards: [], certifications: [] } });
  } catch (err) { next(err); }
});

module.exports = router;
