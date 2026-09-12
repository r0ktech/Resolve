const { getOrganizationAnalytics } = require('../services/analytics.service');

async function getAnalytics(req, res) {
  try {
    const days = parseInt(req.query.days || '30', 10);
    const analytics = await getOrganizationAnalytics(req.organization.id, days);
    return res.json(analytics);
  } catch (err) {
    console.error('Analytics controller error:', err);
    return res.status(500).json({ error: 'Failed to generate analytics metrics' });
  }
}

module.exports = {
  getAnalytics,
};
