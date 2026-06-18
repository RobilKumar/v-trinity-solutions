const router = require('express').Router();
const ctrl = require('../controllers/mediaController');
const { authenticate, authorize } = require('../middleware/auth');
const upload = require('../middleware/upload');

router.use(authenticate);

router.post('/upload', authorize('media.upload'), upload.single('file'), ctrl.upload);
router.get('/',        authorize('media.view'),   ctrl.getFiles);
router.delete('/:id',  authorize('media.delete'), ctrl.deleteFile);
router.get('/folders',         authorize('media.view'),   ctrl.getFolders);
router.post('/folders',        authorize('media.upload'), ctrl.createFolder);

module.exports = router;
