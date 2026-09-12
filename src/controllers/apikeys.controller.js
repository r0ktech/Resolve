const prisma = require('../db/prisma');
const crypto = require('crypto');

async function getApiKeys(req, res) {
  try {
    const keys = await prisma.aPIKey.findMany({
      where: {
        organizationId: req.organization.id,
        revokedAt: null,
      },
      select: {
        id: true,
        name: true,
        keyPrefix: true,
        lastUsedAt: true,
        createdAt: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    return res.json({ keys });
  } catch (err) {
    return res.status(500).json({ error: 'Failed to fetch API keys' });
  }
}

async function createApiKey(req, res) {
  try {
    const { name } = req.body;
    if (!name) {
      return res.status(400).json({ error: 'API key name is required' });
    }

    const randomBytes = crypto.randomBytes(24).toString('hex');
    const secretKey = `res_live_${randomBytes}`;
    const keyPrefix = `res_live_${randomBytes.substring(0, 6)}`;
    const hashedSecret = crypto.createHash('sha256').update(secretKey).digest('hex');

    const apiKey = await prisma.aPIKey.create({
      data: {
        organizationId: req.organization.id,
        name,
        keyPrefix,
        hashedSecret,
      },
    });

    // Return the secret ONLY ONCE
    return res.status(201).json({
      apiKey: {
        id: apiKey.id,
        name: apiKey.name,
        keyPrefix: apiKey.keyPrefix,
        createdAt: apiKey.createdAt,
        secretKey, // Displayed once to user!
      },
    });
  } catch (err) {
    return res.status(500).json({ error: 'Failed to create API key' });
  }
}

async function revokeApiKey(req, res) {
  try {
    const { id } = req.params;

    const apiKey = await prisma.aPIKey.findFirst({
      where: {
        id,
        organizationId: req.organization.id,
      },
    });

    if (!apiKey) {
      return res.status(404).json({ error: 'API Key not found' });
    }

    await prisma.aPIKey.update({
      where: { id },
      data: { revokedAt: new Date() },
    });

    return res.json({ success: true, message: 'API key revoked' });
  } catch (err) {
    return res.status(500).json({ error: 'Failed to revoke API key' });
  }
}

module.exports = {
  getApiKeys,
  createApiKey,
  revokeApiKey,
};
