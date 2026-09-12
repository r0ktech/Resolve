const prisma = require('../db/prisma');
const crypto = require('crypto');

async function getMembers(req, res) {
  try {
    const members = await prisma.membership.findMany({
      where: { organizationId: req.organization.id },
      include: {
        user: {
          select: { id: true, name: true, email: true, avatarUrl: true, createdAt: true },
        },
      },
      orderBy: { createdAt: 'asc' },
    });

    const invitations = await prisma.teamInvitation.findMany({
      where: { organizationId: req.organization.id },
    });

    return res.json({ members, invitations });
  } catch (err) {
    return res.status(500).json({ error: 'Failed to fetch team members' });
  }
}

async function inviteMember(req, res) {
  try {
    const { email, role } = req.body;

    if (!email) {
      return res.status(400).json({ error: 'Email address is required' });
    }

    const validRole = ['ADMIN', 'AGENT', 'VIEWER'].includes(role) ? role : 'AGENT';

    // Check if user is already a member
    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      const existingMem = await prisma.membership.findFirst({
        where: {
          userId: existingUser.id,
          organizationId: req.organization.id,
        },
      });
      if (existingMem) {
        return res.status(400).json({ error: 'User is already a member of this workspace' });
      }
    }

    const token = crypto.randomBytes(32).toString('hex');
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7);

    const invitation = await prisma.teamInvitation.create({
      data: {
        organizationId: req.organization.id,
        email,
        role: validRole,
        token,
        expiresAt,
      },
    });

    return res.status(201).json({ invitation });
  } catch (err) {
    return res.status(500).json({ error: 'Failed to send team invitation' });
  }
}

async function updateMemberRole(req, res) {
  try {
    const { id } = req.params; // membership ID
    const { role } = req.body;

    if (!['ADMIN', 'AGENT', 'VIEWER'].includes(role)) {
      return res.status(400).json({ error: 'Invalid role specified' });
    }

    const membership = await prisma.membership.findFirst({
      where: {
        id,
        organizationId: req.organization.id,
      },
    });

    if (!membership) {
      return res.status(404).json({ error: 'Team member not found' });
    }

    if (membership.role === 'OWNER') {
      return res.status(400).json({ error: 'Cannot change role of workspace Owner' });
    }

    const updated = await prisma.membership.update({
      where: { id },
      data: { role },
      include: {
        user: { select: { id: true, name: true, email: true } },
      },
    });

    return res.json({ member: updated });
  } catch (err) {
    return res.status(500).json({ error: 'Failed to update team member role' });
  }
}

async function removeMember(req, res) {
  try {
    const { id } = req.params;

    const membership = await prisma.membership.findFirst({
      where: {
        id,
        organizationId: req.organization.id,
      },
    });

    if (!membership) {
      return res.status(404).json({ error: 'Team member not found' });
    }

    if (membership.role === 'OWNER') {
      return res.status(400).json({ error: 'Cannot remove workspace Owner' });
    }

    await prisma.membership.delete({ where: { id } });

    return res.json({ success: true, message: 'Member removed from workspace' });
  } catch (err) {
    return res.status(500).json({ error: 'Failed to remove team member' });
  }
}

module.exports = {
  getMembers,
  inviteMember,
  updateMemberRole,
  removeMember,
};
