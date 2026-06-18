const router = require('express').Router();
const { body } = require('express-validator');
const rateLimit = require('express-rate-limit');
const ctrl = require('../controllers/inquiriesController');
const { authenticate, authorize } = require('../middleware/auth');
const validate = require('../middleware/validate');
const upload = require('../middleware/upload');

const submitLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 5,
  message: { success: false, message: 'Too many submissions. Try again later.' },
});

router.post('/',
  submitLimiter,
  upload.single('attachment'),
  [
    body('name').trim().notEmpty().isLength({ max: 200 }),
    body('email').isEmail().normalizeEmail(),
    body('phone').trim().notEmpty(),
    body('description').trim().notEmpty().isLength({ max: 5000 }),
    body('inquiryType').notEmpty(),
  ],
  validate,
  ctrl.submit
);

// Admin routes
router.get('/',      authenticate, authorize('inquiries.view'),   ctrl.getAll);
router.get('/stats', authenticate, authorize('inquiries.view'),   ctrl.getStats);
router.get('/:id',   authenticate, authorize('inquiries.view'),   ctrl.getById);
router.patch('/:id', authenticate, authorize('inquiries.manage'), ctrl.updateStatus);

module.exports = router;
