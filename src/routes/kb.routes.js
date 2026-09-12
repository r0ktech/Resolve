const express = require('express');
const router = express.Router();
const kbController = require('../controllers/kb.controller');
const { verifyAuth, requireRole } = require('../middleware/auth');

router.use(verifyAuth);

router.get('/sources', kbController.getSources);
router.post('/sources', requireRole('AGENT'), kbController.createSource);
router.delete('/sources/:id', requireRole('ADMIN'), kbController.deleteSource);
router.post('/sources/:id/reprocess', requireRole('AGENT'), kbController.reprocessSource);
router.get('/search', kbController.testSearch);

module.exports = router;
