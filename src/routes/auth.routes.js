const express = require('express');
const router = express.Router();
const authController = require('../controllers/auth.controller');
const { verifyAuth } = require('../middleware/auth');

router.post('/signup', authController.signup);
router.post('/login', authController.login);
router.get('/me', verifyAuth, authController.getMe);
router.post('/logout', authController.logout);

module.exports = router;
