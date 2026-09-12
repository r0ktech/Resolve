const { retrieveKnowledgeContext } = require('./rag.service');
const prisma = require('../db/prisma');

/**
 * Generates AI response using RAG retrieval context and LLM completion handler
 */
async function generateAgentResponse({
  organizationId,
  userMessage,
  conversationHistory = [],
}) {
  // Fetch AI configuration for the organization
  let aiConfig = await prisma.aPIKey ? await prisma.aIConfiguration.findUnique({
    where: { organizationId },
  }) : null;

  if (!aiConfig) {
    aiConfig = {
      agentName: 'Resolve AI',
      tone: 'professional',
      welcomeMessage: 'Hello! How can I help you today?',
      systemPrompt: 'You are a helpful customer support agent.',
      confidenceThreshold: 0.55,
      escalationBehavior: 'OFFER_HUMAN',
      maxResponseLength: 250,
    };
  }

  // 1. Retrieve Knowledge Context
  const { chunks, confidence, sources } = await retrieveKnowledgeContext(
    organizationId,
    userMessage
  );

  const threshold = aiConfig.confidenceThreshold || 0.55;
  const isConfident = confidence >= threshold;

  // 2. If confidence is below threshold, offer human escalation without hallucinating
  if (!isConfident && chunks.length === 0) {
    return {
      agentName: aiConfig.agentName,
      content: `I'm sorry, I don't have enough information in our knowledge base to answer your question accurately. Would you like me to connect you with a member of our support team?`,
      confidence,
      sources: [],
      shouldEscalate: true,
      reason: 'Low confidence / missing knowledge base match',
    };
  }

  // 3. Assemble response based on retrieved chunks
  const contextText = chunks.map((c) => `[Source: ${c.sourceName}]\n${c.content}`).join('\n\n');

  let responseContent = '';

  // If OpenAI key is set, call OpenAI API
  if (process.env.OPENAI_API_KEY) {
    try {
      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
        },
        body: JSON.stringify({
          model: 'gpt-3.5-turbo',
          messages: [
            {
              role: 'system',
              content: `${aiConfig.systemPrompt}\n\nTone: ${aiConfig.tone}.\nBusiness Info: ${aiConfig.businessDescription || ''}\n\nStrict Guidelines:\n- Rely ONLY on the provided context below.\n- Cite sources using [Source: Name].\n- If the context does not answer the question, state that clearly.\n\nContext:\n${contextText}`,
            },
            ...conversationHistory.slice(-4).map((m) => ({
              role: m.senderType === 'CUSTOMER' ? 'user' : 'assistant',
              content: m.content,
            })),
            { role: 'user', content: userMessage },
          ],
          max_tokens: aiConfig.maxResponseLength || 250,
          temperature: 0.3,
        }),
      });

      const data = await response.json();
      if (data.choices && data.choices[0] && data.choices[0].message) {
        responseContent = data.choices[0].message.content;
      }
    } catch (err) {
      console.warn('OpenAI API call failed, falling back to local synthesis engine:', err.message);
    }
  }

  // Fallback / Built-in Synthesis Engine when OpenAI key is absent or fails
  if (!responseContent) {
    // Synthesize structured answer from top matched chunks
    const primaryChunk = chunks[0];
    let synthesizedText = primaryChunk ? primaryChunk.content : '';

    // Apply tone styling
    if (aiConfig.tone === 'concise') {
      synthesizedText = synthesizedText.split('\n')[0];
    } else if (aiConfig.tone === 'friendly') {
      synthesizedText = `Thanks for asking! ${synthesizedText}`;
    } else if (aiConfig.tone === 'technical') {
      synthesizedText = `Technical details:\n${synthesizedText}`;
    }

    if (sources.length > 0) {
      synthesizedText += `\n\n*(Source: ${sources.map((s) => s.name).join(', ')})*`;
    }

    responseContent = synthesizedText;
  }

  return {
    agentName: aiConfig.agentName,
    content: responseContent,
    confidence,
    sources,
    shouldEscalate: !isConfident,
    reason: isConfident ? null : 'Moderate confidence - human assistance recommended',
  };
}

module.exports = {
  generateAgentResponse,
};
