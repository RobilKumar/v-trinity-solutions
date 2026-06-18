const router = require('express').Router();
const { query } = require('../config/database');
const { authenticate, authorize } = require('../middleware/auth');

router.use(authenticate, authorize('dashboard.view'));

router.get('/stats', async (req, res, next) => {
  try {
    const [overview, recentInquiries, inquiryStatus] = await Promise.all([
      query(`SELECT
               (SELECT COUNT(*) FROM inquiries) AS total_inquiries,
               (SELECT COUNT(*) FROM inquiries WHERE status = 'new') AS new_inquiries,
               (SELECT COUNT(*) FROM users WHERE is_active = true) AS total_users,
               (SELECT COUNT(*) FROM services WHERE is_active = true) AS total_services,
               (SELECT COUNT(*) FROM projects WHERE is_active = true) AS total_projects,
               (SELECT COUNT(*) FROM blog_posts WHERE status = 'published') AS total_posts`),
      query(`SELECT i.inquiry_id, i.name, i.email, i.phone, i.inquiry_type, i.status, i.created_at
             FROM inquiries i ORDER BY i.created_at DESC LIMIT 10`),
      query(`SELECT status, COUNT(*) AS count FROM inquiries GROUP BY status`),
    ]);

    res.json({
      success: true,
      data: {
        overview:        overview.rows[0] || {},
        recentInquiries: recentInquiries.rows,
        inquiryStatus:   inquiryStatus.rows,
      },
    });
  } catch (err) { next(err); }
});

module.exports = router;
