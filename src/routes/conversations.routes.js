const express = require('express');
const router = express.Router();
const convController = require('../controllers/conversations.controller');
const { verifyAuth, requireRole } = require('../middleware/auth');

router.use(verifyAuth);

router.get('/', convController.getConversations);
router.get('/:id', convController.getConversationById);
router.post('/:id/messages', requireRole('AGENT'), convController.postMessage);
router.patch('/:id', requireRole('AGENT'), convController.updateConversationStatus);
router.post('/:id/escalate', requireRole('AGENT'), convController.escalateConversation);

module.exports = router;
