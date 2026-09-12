const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const prisma = require('../db/prisma');
const { JWT_SECRET } = require('../middleware/auth');

function generateToken(user, organizationId, role) {
  return jwt.sign(
    {
      id: user.id,
      email: user.email,
      name: user.name,
      organizationId: organizationId || null,
      role: role || null,
    },
    JWT_SECRET,
    { expiresIn: '30d' }
  );
}

async function signup(req, res) {
  try {
    const { name, email, password, companyName } = req.body;

    if (!email || !password || !name) {
      return res.status(400).json({ error: 'Name, email, and password are required' });
    }

    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      return res.status(400).json({ error: 'User with this email already exists' });
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const orgName = companyName || `${name}'s Workspace`;
    const slug = orgName.toLowerCase().replace(/[^a-z0-9]+/g, '-') + '-' + Math.floor(Math.random() * 1000);

    // Create User, Organization, Membership, Default KB & AI Config in a transaction
    const result = await prisma.$transaction(async (tx) => {
      const user = await tx.user.create({
        data: { name, email, passwordHash },
      });

      const org = await tx.organization.create({
        data: {
          name: orgName,
          slug,
        },
      });

      const membership = await tx.membership.create({
        data: {
          userId: user.id,
          organizationId: org.id,
          role: 'OWNER',
        },
      });

      // Default AI Configuration
      await tx.aIConfiguration.create({
        data: {
          organizationId: org.id,
          agentName: 'Resolve Assistant',
          welcomeMessage: `Hi there! I'm the AI assistant for ${orgName}. How can I help you today?`,
          systemPrompt: `You are an AI support assistant for ${orgName}. Answer questions concisely and accurately using company knowledge.`,
        },
      });

      // Default Knowledge Base
      await tx.knowledgeBase.create({
        data: {
          organizationId: org.id,
          name: 'General Support Knowledge Base',
          description: 'Primary customer support documentation and FAQs',
        },
      });

      // Default Usage Record
      const period = new Date().toISOString().slice(0, 7);
      await tx.usageRecord.create({
        data: {
          organizationId: org.id,
          period,
        },
      });

      return { user, org, membership };
    });

    const token = generateToken(result.user, result.org.id, 'OWNER');

    res.cookie('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      maxAge: 30 * 24 * 60 * 60 * 1000,
    });

    return res.status(201).json({
      token,
      user: {
        id: result.user.id,
        name: result.user.name,
        email: result.user.email,
      },
      organization: result.org,
      role: 'OWNER',
    });
  } catch (err) {
    console.error('Signup error:', err);
    return res.status(500).json({ error: 'Signup failed. Please try again.' });
  }
}

async function login(req, res) {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    const user = await prisma.user.findUnique({
      where: { email },
      include: {
        memberships: {
          include: {
            organization: true,
          },
        },
      },
    });

    if (!user) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    const valid = await bcrypt.compare(password, user.passwordHash);
    if (!valid) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    const primaryMembership = user.memberships[0];
    const orgId = primaryMembership ? primaryMembership.organizationId : null;
    const role = primaryMembership ? primaryMembership.role : null;

    const token = generateToken(user, orgId, role);

    res.cookie('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      maxAge: 30 * 24 * 60 * 60 * 1000,
    });

    return res.json({
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
      },
      organization: primaryMembership ? primaryMembership.organization : null,
      role,
      organizations: user.memberships.map((m) => ({
        id: m.organization.id,
        name: m.organization.name,
        role: m.role,
      })),
    });
  } catch (err) {
    console.error('Login error:', err);
    return res.status(500).json({ error: 'Login failed. Please try again.' });
  }
}

async function getMe(req, res) {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
      include: {
        memberships: {
          include: {
            organization: true,
          },
        },
      },
    });

    if (!user) {
      return res.status(4404).json({ error: 'User not found' });
    }

    return res.json({
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        avatarUrl: user.avatarUrl,
      },
      organization: req.organization || (user.memberships[0] ? user.memberships[0].organization : null),
      role: req.role || (user.memberships[0] ? user.memberships[0].role : 'VIEWER'),
      organizations: user.memberships.map((m) => ({
        id: m.organization.id,
        name: m.organization.name,
        role: m.role,
      })),
    });
  } catch (err) {
    return res.status(500).json({ error: 'Failed to fetch current user' });
  }
}

async function logout(req, res) {
  res.clearCookie('token');
  return res.json({ success: true, message: 'Logged out successfully' });
}

module.exports = {
  signup,
  login,
  getMe,
  logout,
};
