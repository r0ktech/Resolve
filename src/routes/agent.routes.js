const express = require('express');
const router = express.Router();
const agentController = require('../controllers/agent.controller');
const { verifyAuth, requireRole } = require('../middleware/auth');

router.use(verifyAuth);

router.get('/config', agentController.getConfig);
router.put('/config', requireRole('ADMIN'), agentController.updateConfig);
router.post('/test', agentController.testPrompt);

module.exports = router;
