const prisma = require('../db/prisma');
const { generateAgentResponse } = require('../services/llm.service');

async function getWidgetConfig(req, res) {
  try {
    const { workspaceId } = req.query;
    if (!workspaceId) {
      return res.status(400).json({ error: 'workspaceId query parameter is required' });
    }

    const org = await prisma.organization.findFirst({
      where: {
        OR: [{ id: workspaceId }, { slug: workspaceId }],
      },
      include: {
        aiConfiguration: true,
      },
    });

    if (!org) {
      return res.status(404).json({ error: 'Workspace not found' });
    }

    const config = org.aiConfiguration || {
      agentName: 'Resolve AI',
      welcomeMessage: `Hello! How can we help you today?`,
    };

    return res.json({
      workspace: {
        id: org.id,
        name: org.name,
        logoUrl: org.logoUrl,
      },
      agent: {
        name: config.agentName,
        welcomeMessage: config.welcomeMessage,
      },
    });
  } catch (err) {
    return res.status(500).json({ error: 'Failed to fetch widget configuration' });
  }
}

async function startWidgetConversation(req, res) {
  try {
    const { workspaceId, customerEmail, customerName } = req.body;

    if (!workspaceId) {
      return res.status(400).json({ error: 'workspaceId is required' });
    }

    const org = await prisma.organization.findFirst({
      where: { OR: [{ id: workspaceId }, { slug: workspaceId }] },
    });

    if (!org) {
      return res.status(404).json({ error: 'Workspace not found' });
    }

    // Find or create customer
    let customer = null;
    if (customerEmail) {
      customer = await prisma.customer.findFirst({
        where: { organizationId: org.id, email: customerEmail },
      });

      if (!customer) {
        customer = await prisma.customer.create({
          data: {
            organizationId: org.id,
            email: customerEmail,
            name: customerName || 'Website Visitor',
          },
        });
      }
    } else {
      customer = await prisma.customer.create({
        data: {
          organizationId: org.id,
          name: customerName || 'Anonymous Visitor',
        },
      });
    }

    const conversation = await prisma.conversation.create({
      data: {
        organizationId: org.id,
        customerId: customer.id,
        status: 'OPEN',
        channel: 'WIDGET',
      },
      include: { customer: true },
    });

    return res.status(201).json({
      conversationId: conversation.id,
      customer: conversation.customer,
    });
  } catch (err) {
    console.error('Start widget conversation error:', err);
    return res.status(500).json({ error: 'Failed to initialize conversation' });
  }
}

async function sendWidgetMessage(req, res) {
  try {
    const { id } = req.params; // conversationId
    const { content } = req.body;

    if (!content || !content.trim()) {
      return res.status(400).json({ error: 'Message content required' });
    }

    const conversation = await prisma.conversation.findUnique({
      where: { id },
      include: {
        organization: true,
        messages: {
          orderBy: { createdAt: 'asc' },
          take: 10,
        },
      },
    });

    if (!conversation) {
      return res.status(404).json({ error: 'Conversation not found' });
    }

    // Save Customer message
    const userMsg = await prisma.message.create({
      data: {
        conversationId: id,
        senderType: 'CUSTOMER',
        content,
      },
    });

    // If conversation is already escalated or answered by human agent, do not auto-respond with AI
    if (conversation.status === 'ESCALATED' || conversation.status === 'WAITING') {
      const io = req.app.get('io');
      if (io) {
        io.to(`org:${conversation.organizationId}`).emit('message:new', {
          conversationId: id,
          message: userMsg,
        });
      }

      return res.json({
        userMessage: userMsg,
        aiMessage: null,
        status: conversation.status,
      });
    }

    // Generate AI response via RAG Engine
    const aiResponse = await generateAgentResponse({
      organizationId: conversation.organizationId,
      userMessage: content,
      conversationHistory: conversation.messages,
    });

    // Store AI response message
    const aiMsg = await prisma.message.create({
      data: {
        conversationId: id,
        senderType: 'AI',
        content: aiResponse.content,
        confidence: aiResponse.confidence,
        sources: JSON.stringify(aiResponse.sources || []),
      },
    });

    let newStatus = conversation.status;
    let isAiResolved = false;

    if (aiResponse.shouldEscalate) {
      newStatus = 'ESCALATED';
      await prisma.conversation.update({
        where: { id },
        data: {
          status: 'ESCALATED',
          escalatedAt: new Date(),
          escalatedReason: aiResponse.reason || 'AI low confidence threshold',
        },
      });
    } else {
      isAiResolved = true;
      await prisma.conversation.update({
        where: { id },
        data: { isAiResolved: true, updatedAt: new Date() },
      });
    }

    // Update Usage Record count
    const period = new Date().toISOString().slice(0, 7);
    await prisma.usageRecord.upsert({
      where: {
        organizationId_period: {
          organizationId: conversation.organizationId,
          period,
        },
      },
      update: {
        aiMessagesCount: { increment: 1 },
      },
      create: {
        organizationId: conversation.organizationId,
        period,
        aiMessagesCount: 1,
      },
    });

    // Broadcast Socket.io event for Inbox
    const io = req.app.get('io');
    if (io) {
      io.to(`org:${conversation.organizationId}`).emit('message:new', {
        conversationId: id,
        message: aiMsg,
        status: newStatus,
      });
    }

    return res.json({
      userMessage: userMsg,
      aiMessage: aiMsg,
      sources: aiResponse.sources,
      shouldEscalate: aiResponse.shouldEscalate,
      status: newStatus,
    });
  } catch (err) {
    console.error('Send widget message error:', err);
    return res.status(500).json({ error: 'Failed to process message' });
  }
}

async function submitWidgetFeedback(req, res) {
  try {
    const { id } = req.params;
    const { score, comment } = req.body;

    const conversation = await prisma.conversation.findUnique({
      where: { id },
    });

    if (!conversation) {
      return res.status(404).json({ error: 'Conversation not found' });
    }

    const updated = await prisma.conversation.update({
      where: { id },
      data: {
        satisfactionScore: parseInt(score, 10),
        satisfactionComment: comment || null,
      },
    });

    // Also update Customer average CSAT if customer exists
    if (conversation.customerId) {
      const convs = await prisma.conversation.findMany({
        where: { customerId: conversation.customerId, satisfactionScore: { not: null } },
      });
      const avg = convs.reduce((acc, c) => acc + c.satisfactionScore, 0) / convs.length;
      await prisma.customer.update({
        where: { id: conversation.customerId },
        data: { csatAvg: parseFloat(avg.toFixed(1)) },
      });
    }

    return res.json({ success: true, conversation: updated });
  } catch (err) {
    return res.status(500).json({ error: 'Failed to submit feedback' });
  }
}

module.exports = {
  getWidgetConfig,
  startWidgetConversation,
  sendWidgetMessage,
  submitWidgetFeedback,
};
