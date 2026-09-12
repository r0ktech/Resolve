const jwt = require('jsonwebtoken');
const prisma = require('../db/prisma');
const crypto = require('crypto');

const JWT_SECRET = process.env.JWT_SECRET || 'resolve_super_secret_jwt_key_2026_prod_key';

// Role hierarchy weights
const ROLE_WEIGHTS = {
  OWNER: 40,
  ADMIN: 30,
  AGENT: 20,
  VIEWER: 10,
};

async function verifyAuth(req, res, next) {
  try {
    let token = null;
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer ')) {
      token = req.headers.authorization.split(' ')[1];
    } else if (req.cookies && req.cookies.token) {
      token = req.cookies.token;
    }

    if (!token) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;

    // Fetch active membership & organization if organizationId provided
    const orgId = req.headers['x-organization-id'] || decoded.organizationId;

    if (orgId) {
      const membership = await prisma.membership.findFirst({
        where: {
          userId: decoded.id,
          organizationId: orgId,
        },
        include: {
          organization: true,
        },
      });

      if (membership) {
        req.organization = membership.organization;
        req.membership = membership;
        req.role = membership.role;
      }
    }

    next();
  } catch (err) {
    return res.status(401).json({ error: 'Invalid or expired token' });
  }
}

function requireRole(minRole) {
  return (req, res, next) => {
    if (!req.membership || !req.role) {
      return res.status(403).json({ error: 'Workspace access denied' });
    }

    const userWeight = ROLE_WEIGHTS[req.role] || 0;
    const requiredWeight = ROLE_WEIGHTS[minRole] || 0;

    if (userWeight < requiredWeight) {
      return res.status(403).json({
        error: `Action requires ${minRole} permission level or higher`,
      });
    }

    next();
  };
}

async function verifyApiKey(req, res, next) {
  try {
    const apiKeyHeader = req.headers['x-api-key'];
    if (!apiKeyHeader) {
      return res.status(401).json({ error: 'API key missing' });
    }

    const prefix = apiKeyHeader.split('_')[0] + '_' + apiKeyHeader.split('_')[1];
    const hashedSecret = crypto.createHash('sha256').update(apiKeyHeader).digest('hex');

    const apiKey = await prisma.aPIKey.findFirst({
      where: {
        keyPrefix: prefix,
        hashedSecret: hashedSecret,
        revokedAt: null,
      },
      include: {
        organization: true,
      },
    });

    if (!apiKey) {
      return res.status(401).json({ error: 'Invalid or revoked API key' });
    }

    // Update last used
    await prisma.aPIKey.update({
      where: { id: apiKey.id },
      data: { lastUsedAt: new Date() },
    });

    req.organization = apiKey.organization;
    req.apiKey = apiKey;
    next();
  } catch (err) {
    return res.status(500).json({ error: 'API key validation failed' });
  }
}

module.exports = {
  verifyAuth,
  requireRole,
  verifyApiKey,
  JWT_SECRET,
};
