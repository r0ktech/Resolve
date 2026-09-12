const prisma = require('../db/prisma');

/**
 * Splits raw content text into clean semantic chunks with overlap.
 */
function chunkText(text, chunkSize = 400, overlap = 80) {
  if (!text || typeof text !== 'string') return [];
  
  const cleanText = text.replace(/\r\n/g, '\n').trim();
  if (cleanText.length <= chunkSize) {
    return [cleanText];
  }

  const chunks = [];
  let startIndex = 0;

  while (startIndex < cleanText.length) {
    let endIndex = startIndex + chunkSize;
    
    // Try to break at paragraph or sentence boundary if possible
    if (endIndex < cleanText.length) {
      const nextNewline = cleanText.indexOf('\n', endIndex - 50);
      if (nextNewline !== -1 && nextNewline < endIndex + 50) {
        endIndex = nextNewline;
      } else {
        const nextPeriod = cleanText.indexOf('. ', endIndex - 40);
        if (nextPeriod !== -1 && nextPeriod < endIndex + 40) {
          endIndex = nextPeriod + 1;
        }
      }
    }

    const chunk = cleanText.slice(startIndex, endIndex).trim();
    if (chunk.length > 10) {
      chunks.push(chunk);
    }

    startIndex = Math.max(startIndex + chunkSize - overlap, endIndex);
    if (startIndex >= cleanText.length) break;
  }

  return chunks;
}

/**
 * Generates a term-frequency vector representation for TF-IDF / Cosine similarity matching
 */
function generateTermFrequencyVector(text) {
  const words = text
    .toLowerCase()
    .replace(/[^\w\s]/g, '')
    .split(/\s+/)
    .filter((w) => w.length > 2);

  const freq = {};
  words.forEach((w) => {
    freq[w] = (freq[w] || 0) + 1;
  });

  return freq;
}

/**
 * Process a Knowledge Source by creating chunks and term frequency embeddings
 */
async function processKnowledgeSource(sourceId) {
  try {
    // Set status to PROCESSING
    await prisma.knowledgeSource.update({
      where: { id: sourceId },
      data: { status: 'PROCESSING', errorMessage: null },
    });

    const source = await prisma.knowledgeSource.findUnique({
      where: { id: sourceId },
    });

    if (!source) throw new Error('Source not found');

    // Delete old chunks
    await prisma.knowledgeChunk.deleteMany({
      where: { sourceId },
    });

    // Generate chunks
    const textChunks = chunkText(source.content);
    
    const chunkPromises = textChunks.map((content, index) => {
      const vector = generateTermFrequencyVector(content);
      return prisma.knowledgeChunk.create({
        data: {
          sourceId,
          chunkIndex: index,
          content,
          embedding: JSON.stringify(vector),
          metadata: JSON.stringify({
            sourceName: source.name,
            sourceType: source.type,
            sourceUrl: source.url,
          }),
        },
      });
    });

    await Promise.all(chunkPromises);

    // Update status to READY
    const updatedSource = await prisma.knowledgeSource.update({
      where: { id: sourceId },
      data: {
        status: 'READY',
        chunkCount: textChunks.length,
        lastSyncedAt: new Date(),
      },
    });

    return updatedSource;
  } catch (err) {
    await prisma.knowledgeSource.update({
      where: { id: sourceId },
      data: {
        status: 'FAILED',
        errorMessage: err.message,
      },
    });
    throw err;
  }
}

module.exports = {
  chunkText,
  generateTermFrequencyVector,
  processKnowledgeSource,
};
