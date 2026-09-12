const express = require('express');
const router = express.Router();
const apikeysController = require('../controllers/apikeys.controller');
const { verifyAuth, requireRole } = require('../middleware/auth');

router.use(verifyAuth);

router.get('/', apikeysController.getApiKeys);
router.post('/', requireRole('ADMIN'), apikeysController.createApiKey);
router.delete('/:id', requireRole('ADMIN'), apikeysController.revokeApiKey);

module.exports = router;
