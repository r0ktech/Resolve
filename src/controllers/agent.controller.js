const prisma = require('../db/prisma');
const { generateAgentResponse } = require('../services/llm.service');

async function getConfig(req, res) {
  try {
    let config = await prisma.aIConfiguration.findUnique({
      where: { organizationId: req.organization.id },
    });

    if (!config) {
      config = await prisma.aIConfiguration.create({
        data: {
          organizationId: req.organization.id,
          agentName: 'Resolve AI',
          welcomeMessage: 'Hello! How can I help you today?',
          systemPrompt: 'You are a helpful support agent.',
        },
      });
    }

    return res.json({ config });
  } catch (err) {
    return res.status(500).json({ error: 'Failed to fetch AI configuration' });
  }
}

async function updateConfig(req, res) {
  try {
    const {
      agentName,
      tone,
      welcomeMessage,
      systemPrompt,
      businessDescription,
      confidenceThreshold,
      escalationBehavior,
      maxResponseLength,
      language,
    } = req.body;

    const config = await prisma.aIConfiguration.upsert({
      where: { organizationId: req.organization.id },
      update: {
        agentName,
        tone,
        welcomeMessage,
        systemPrompt,
        businessDescription,
        confidenceThreshold: parseFloat(confidenceThreshold),
        escalationBehavior,
        maxResponseLength: parseInt(maxResponseLength, 10),
        language,
      },
      create: {
        organizationId: req.organization.id,
        agentName: agentName || 'Resolve AI',
        tone: tone || 'professional',
        welcomeMessage: welcomeMessage || 'Hello! How can I help you today?',
        systemPrompt: systemPrompt || 'You are a helpful support agent.',
        businessDescription,
        confidenceThreshold: parseFloat(confidenceThreshold) || 0.65,
        escalationBehavior: escalationBehavior || 'OFFER_HUMAN',
        maxResponseLength: parseInt(maxResponseLength, 10) || 250,
        language: language || 'en',
      },
    });

    return res.json({ config });
  } catch (err) {
    console.error('Update agent config error:', err);
    return res.status(500).json({ error: 'Failed to update AI configuration' });
  }
}

async function testPrompt(req, res) {
  try {
    const { message, history } = req.body;
    if (!message) {
      return res.status(400).json({ error: 'Message is required' });
    }

    const response = await generateAgentResponse({
      organizationId: req.organization.id,
      userMessage: message,
      conversationHistory: history || [],
    });

    return res.json(response);
  } catch (err) {
    return res.status(500).json({ error: 'Agent execution failed' });
  }
}

module.exports = {
  getConfig,
  updateConfig,
  testPrompt,
};
