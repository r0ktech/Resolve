const express = require('express');
const router = express.Router();
const teamController = require('../controllers/team.controller');
const { verifyAuth, requireRole } = require('../middleware/auth');

router.use(verifyAuth);

router.get('/members', teamController.getMembers);
router.post('/invite', requireRole('ADMIN'), teamController.inviteMember);
router.patch('/members/:id/role', requireRole('ADMIN'), teamController.updateMemberRole);
router.delete('/members/:id', requireRole('ADMIN'), teamController.removeMember);

module.exports = router;
