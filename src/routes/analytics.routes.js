const express = require('express');
const router = express.Router();
const analyticsController = require('../controllers/analytics.controller');
const { verifyAuth } = require('../middleware/auth');

router.use(verifyAuth);

router.get('/', analyticsController.getAnalytics);

module.exports = router;
