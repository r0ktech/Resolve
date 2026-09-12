const express = require('express');
const router = express.Router();
const widgetController = require('../controllers/widget.controller');

// Public endpoints for embeddable chat widget
router.get('/config', widgetController.getWidgetConfig);
router.post('/conversations', widgetController.startWidgetConversation);
router.post('/conversations/:id/messages', widgetController.sendWidgetMessage);
router.post('/conversations/:id/feedback', widgetController.submitWidgetFeedback);

module.exports = router;
