const express = require('express');
const router = express.Router();
const prisma = require('../db/prisma');
const { verifyAuth } = require('../middleware/auth');

router.use(verifyAuth);

router.get('/', async (req, res) => {
  try {
    const period = new Date().toISOString().slice(0, 7);

    let usage = await prisma.usageRecord.findUnique({
      where: {
        organizationId_period: {
          organizationId: req.organization.id,
          period,
        },
      },
    });

    if (!usage) {
      usage = await prisma.usageRecord.create({
        data: {
          organizationId: req.organization.id,
          period,
        },
      });
    }

    // Counts for current organization
    const knowledgeSourcesCount = await prisma.knowledgeSource.count({
      where: { knowledgeBase: { organizationId: req.organization.id } },
    });

    const teamMembersCount = await prisma.membership.count({
      where: { organizationId: req.organization.id },
    });

    // Plan limits
    const limits = {
      aiMessagesLimit: 1000,
      knowledgeSourcesLimit: 25,
      teamMembersLimit: 10,
      apiRequestsLimit: 10000,
    };

    return res.json({
      period,
      usage: {
        aiMessagesCount: usage.aiMessagesCount,
        conversationsCount: usage.conversationsCount,
        knowledgeSourcesCount,
        teamMembersCount,
        apiRequestsCount: usage.apiRequestsCount,
      },
      limits,
      plan: req.organization.plan || 'PRO',
    });
  } catch (err) {
    return res.status(500).json({ error: 'Failed to fetch usage statistics' });
  }
});

module.exports = router;
