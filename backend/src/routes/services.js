const router = require('express').Router();
const ctrl = require('../controllers/servicesController');
const { authenticate, authorize } = require('../middleware/auth');

// Public
router.get('/',          ctrl.getAll);
router.get('/categories',ctrl.getCategories);
router.get('/:slug',     ctrl.getBySlug);

// Admin
router.post('/',     authenticate, authorize('services.create'), ctrl.create);
router.put('/:id',   authenticate, authorize('services.edit'),   ctrl.update);
router.delete('/:id',authenticate, authorize('services.delete'), ctrl.remove);

module.exports = router;
