const { chunkText, generateTermFrequencyVector } = require('../src/services/kb.service');
const { calculateSimilarity } = require('../src/services/rag.service');

describe('RAG & Knowledge Base Engine Tests', () => {
  test('chunkText splits text into overlapping chunks', () => {
    const sampleText = 'Sentence one. Sentence two. Sentence three. Sentence four. Sentence five.';
    const chunks = chunkText(sampleText, 30, 10);
    expect(chunks.length).toBeGreaterThan(1);
    expect(chunks[0]).toContain('Sentence one');
  });

  test('generateTermFrequencyVector counts word frequencies correctly', () => {
    const text = 'refund policy refund customer';
    const vec = generateTermFrequencyVector(text);
    expect(vec.refund).toBe(2);
    expect(vec.policy).toBe(1);
    expect(vec.customer).toBe(1);
  });

  test('calculateSimilarity returns 1.0 for identical vectors', () => {
    const vec1 = { refund: 2, policy: 1 };
    const vec2 = { refund: 2, policy: 1 };
    const score = calculateSimilarity(vec1, vec2);
    expect(score).toBeCloseTo(1.0);
  });

  test('calculateSimilarity returns 0.0 for completely disjoint vectors', () => {
    const vec1 = { refund: 2, policy: 1 };
    const vec2 = { database: 3, cluster: 1 };
    const score = calculateSimilarity(vec1, vec2);
    expect(score).toBe(0.0);
  });
});
