const prisma = require('../db/prisma');

async function getConversations(req, res) {
  try {
    const { status, priority, search, limit = 50, offset = 0 } = req.query;

    const where = {
      organizationId: req.organization.id,
    };

    if (status && status !== 'ALL') {
      where.status = status;
    }

    if (priority) {
      where.priority = priority;
    }

    if (search) {
      where.OR = [
        { customer: { name: { contains: search } } },
        { customer: { email: { contains: search } } },
        { subject: { contains: search } },
      ];
    }

    const conversations = await prisma.conversation.findMany({
      where,
      include: {
        customer: true,
        assignedTo: {
          select: { id: true, name: true, email: true, avatarUrl: true },
        },
        messages: {
          orderBy: { createdAt: 'desc' },
          take: 1,
        },
      },
      orderBy: { updatedAt: 'desc' },
      take: parseInt(limit, 10),
      skip: parseInt(offset, 10),
    });

    const totalCount = await prisma.conversation.count({ where });

    return res.json({
      conversations,
      totalCount,
    });
  } catch (err) {
    console.error('Fetch conversations error:', err);
    return res.status(500).json({ error: 'Failed to fetch conversations' });
  }
}

async function getConversationById(req, res) {
  try {
    const { id } = req.params;

    const conversation = await prisma.conversation.findFirst({
      where: {
        id,
        organizationId: req.organization.id,
      },
      include: {
        customer: true,
        assignedTo: {
          select: { id: true, name: true, email: true, avatarUrl: true },
        },
        messages: {
          orderBy: { createdAt: 'asc' },
        },
      },
    });

    if (!conversation) {
      return res.status(404).json({ error: 'Conversation not found' });
    }

    return res.json({ conversation });
  } catch (err) {
    return res.status(500).json({ error: 'Failed to fetch conversation details' });
  }
}

async function postMessage(req, res) {
  try {
    const { id } = req.params;
    const { content, isInternalNote } = req.body;

    if (!content || !content.trim()) {
      return res.status(400).json({ error: 'Message content cannot be empty' });
    }

    const conversation = await prisma.conversation.findFirst({
      where: {
        id,
        organizationId: req.organization.id,
      },
    });

    if (!conversation) {
      return res.status(404).json({ error: 'Conversation not found' });
    }

    const message = await prisma.message.create({
      data: {
        conversationId: id,
        senderType: 'HUMAN_AGENT',
        senderId: req.user.id,
        content,
        isInternalNote: !!isInternalNote,
      },
    });

    // Update conversation state
    const updatedConv = await prisma.conversation.update({
      where: { id },
      data: {
        status: isInternalNote ? conversation.status : 'WAITING',
        updatedAt: new Date(),
      },
      include: {
        customer: true,
        assignedTo: { select: { id: true, name: true, email: true } },
      },
    });

    // Emit Socket.io real-time update
    const io = req.app.get('io');
    if (io) {
      io.to(`org:${req.organization.id}`).emit('message:new', {
        conversationId: id,
        message,
        conversation: updatedConv,
      });
    }

    return res.status(201).json({ message, conversation: updatedConv });
  } catch (err) {
    return res.status(500).json({ error: 'Failed to post message' });
  }
}

async function updateConversationStatus(req, res) {
  try {
    const { id } = req.params;
    const { status, priority, assignedToId } = req.body;

    const conversation = await prisma.conversation.findFirst({
      where: {
        id,
        organizationId: req.organization.id,
      },
    });

    if (!conversation) {
      return res.status(404).json({ error: 'Conversation not found' });
    }

    const updateData = {};
    if (status) updateData.status = status;
    if (priority) updateData.priority = priority;
    if (assignedToId !== undefined) updateData.assignedToId = assignedToId;
    if (status === 'RESOLVED') updateData.closedAt = new Date();

    const updated = await prisma.conversation.update({
      where: { id },
      data: updateData,
      include: {
        customer: true,
        assignedTo: { select: { id: true, name: true, email: true } },
      },
    });

    const io = req.app.get('io');
    if (io) {
      io.to(`org:${req.organization.id}`).emit('conversation:updated', updated);
    }

    return res.json({ conversation: updated });
  } catch (err) {
    return res.status(500).json({ error: 'Failed to update conversation status' });
  }
}

async function escalateConversation(req, res) {
  try {
    const { id } = req.params;
    const { reason } = req.body;

    const conversation = await prisma.conversation.findFirst({
      where: {
        id,
        organizationId: req.organization.id,
      },
    });

    if (!conversation) {
      return res.status(404).json({ error: 'Conversation not found' });
    }

    const updated = await prisma.conversation.update({
      where: { id },
      data: {
        status: 'ESCALATED',
        escalatedAt: new Date(),
        escalatedReason: reason || 'Escalated to human agent',
      },
      include: { customer: true },
    });

    // Add system notification message
    await prisma.message.create({
      data: {
        conversationId: id,
        senderType: 'SYSTEM',
        content: `Conversation escalated to human support team. Reason: ${reason || 'Human assistance requested'}`,
      },
    });

    const io = req.app.get('io');
    if (io) {
      io.to(`org:${req.organization.id}`).emit('conversation:escalated', updated);
    }

    return res.json({ conversation: updated });
  } catch (err) {
    return res.status(500).json({ error: 'Failed to escalate conversation' });
  }
}

module.exports = {
  getConversations,
  getConversationById,
  postMessage,
  updateConversationStatus,
  escalateConversation,
};
