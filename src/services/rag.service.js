const prisma = require('../db/prisma');
const { generateTermFrequencyVector } = require('./kb.service');

/**
 * Calculates Cosine Similarity between query term frequency vector and chunk vector
 */
function calculateSimilarity(queryVec, chunkVec) {
  let dotProduct = 0;
  let queryMag = 0;
  let chunkMag = 0;

  for (const word in queryVec) {
    queryMag += queryVec[word] * queryVec[word];
    if (chunkVec[word]) {
      dotProduct += queryVec[word] * chunkVec[word];
    }
  }

  for (const word in chunkVec) {
    chunkMag += chunkVec[word] * chunkVec[word];
  }

  queryMag = Math.sqrt(queryMag);
  chunkMag = Math.sqrt(chunkMag);

  if (queryMag === 0 || chunkMag === 0) return 0;
  return dotProduct / (queryMag * chunkMag);
}

/**
 * Retrieve top relevant knowledge chunks for a query within an organization
 */
async function retrieveKnowledgeContext(organizationId, query, topK = 3) {
  const queryVec = generateTermFrequencyVector(query);
  const queryWords = Object.keys(queryVec);

  if (queryWords.length === 0) {
    return { chunks: [], confidence: 0, sources: [] };
  }

  // Get all ready knowledge sources for this org
  const sources = await prisma.knowledgeSource.findMany({
    where: {
      knowledgeBase: {
        organizationId,
      },
      status: 'READY',
    },
    include: {
      chunks: true,
      knowledgeBase: true,
    },
  });

  const scoredChunks = [];

  for (const source of sources) {
    for (const chunk of source.chunks) {
      let chunkVec = {};
      try {
        chunkVec = JSON.parse(chunk.embedding || '{}');
      } catch (e) {
        chunkVec = generateTermFrequencyVector(chunk.content);
      }

      // Base similarity
      let score = calculateSimilarity(queryVec, chunkVec);

      // Boost score if exact keyword phrases appear in chunk content
      const lowerContent = chunk.content.toLowerCase();
      queryWords.forEach((word) => {
        if (lowerContent.includes(word)) {
          score += 0.05;
        }
      });

      if (score > 0.05) {
        scoredChunks.push({
          id: chunk.id,
          content: chunk.content,
          score,
          sourceName: source.name,
          sourceType: source.type,
          sourceUrl: source.url,
        });
      }
    }
  }

  // Sort by highest score descending
  scoredChunks.sort((a, b) => b.score - a.score);

  const topChunks = scoredChunks.slice(0, topK);
  
  // Calculate average confidence from top result
  const maxScore = topChunks.length > 0 ? topChunks[0].score : 0;
  const confidence = Math.min(1.0, Math.max(0.0, maxScore));

  const uniqueSources = Array.from(
    new Set(topChunks.map((c) => c.sourceName))
  ).map((name) => {
    const item = topChunks.find((c) => c.sourceName === name);
    return { name: item.sourceName, type: item.sourceType, url: item.sourceUrl };
  });

  return {
    chunks: topChunks,
    confidence,
    sources: uniqueSources,
  };
}

module.exports = {
  calculateSimilarity,
  retrieveKnowledgeContext,
};
