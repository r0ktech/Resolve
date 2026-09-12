const prisma = require('../db/prisma');
const { processKnowledgeSource } = require('../services/kb.service');
const { retrieveKnowledgeContext } = require('../services/rag.service');

async function getSources(req, res) {
  try {
    const sources = await prisma.knowledgeSource.findMany({
      where: {
        knowledgeBase: {
          organizationId: req.organization.id,
        },
      },
      orderBy: { updatedAt: 'desc' },
    });

    return res.json({ sources });
  } catch (err) {
    return res.status(500).json({ error: 'Failed to fetch knowledge sources' });
  }
}

async function createSource(req, res) {
  try {
    const { name, type, content, url } = req.body;

    if (!name || !content) {
      return res.status(400).json({ error: 'Name and content are required' });
    }

    // Get default knowledge base
    let kb = await prisma.knowledgeBase.findFirst({
      where: { organizationId: req.organization.id },
    });

    if (!kb) {
      kb = await prisma.knowledgeBase.create({
        data: {
          organizationId: req.organization.id,
          name: 'General Knowledge Base',
        },
      });
    }

    const source = await prisma.knowledgeSource.create({
      data: {
        knowledgeBaseId: kb.id,
        name,
        type: type || 'TEXT',
        content,
        url: url || null,
        status: 'PROCESSING',
      },
    });

    // Asynchronously chunk and index
    processKnowledgeSource(source.id).catch((err) => {
      console.error(`Error processing knowledge source ${source.id}:`, err);
    });

    return res.status(201).json({ source });
  } catch (err) {
    return res.status(500).json({ error: 'Failed to create knowledge source' });
  }
}

async function deleteSource(req, res) {
  try {
    const { id } = req.params;

    const source = await prisma.knowledgeSource.findFirst({
      where: {
        id,
        knowledgeBase: {
          organizationId: req.organization.id,
        },
      },
    });

    if (!source) {
      return res.status(404).json({ error: 'Knowledge source not found' });
    }

    await prisma.knowledgeSource.delete({ where: { id } });

    return res.json({ success: true, message: 'Source deleted successfully' });
  } catch (err) {
    return res.status(500).json({ error: 'Failed to delete knowledge source' });
  }
}

async function reprocessSource(req, res) {
  try {
    const { id } = req.params;

    const source = await prisma.knowledgeSource.findFirst({
      where: {
        id,
        knowledgeBase: {
          organizationId: req.organization.id,
        },
      },
    });

    if (!source) {
      return res.status(404).json({ error: 'Knowledge source not found' });
    }

    const updated = await processKnowledgeSource(id);
    return res.json({ source: updated });
  } catch (err) {
    return res.status(500).json({ error: 'Failed to reprocess source' });
  }
}

async function testSearch(req, res) {
  try {
    const { query } = req.query;
    if (!query) {
      return res.status(400).json({ error: 'Search query is required' });
    }

    const result = await retrieveKnowledgeContext(req.organization.id, query, 5);
    return res.json(result);
  } catch (err) {
    return res.status(500).json({ error: 'Knowledge search failed' });
  }
}

module.exports = {
  getSources,
  createSource,
  deleteSource,
  reprocessSource,
  testSearch,
};
