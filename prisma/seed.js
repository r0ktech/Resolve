const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding Resolve database with realistic Acme Cloud Solutions SaaS demo data...');

  // Clean existing data
  await prisma.usageRecord.deleteMany();
  await prisma.activityLog.deleteMany();
  await prisma.aPIKey.deleteMany();
  await prisma.message.deleteMany();
  await prisma.conversation.deleteMany();
  await prisma.customer.deleteMany();
  await prisma.knowledgeChunk.deleteMany();
  await prisma.knowledgeSource.deleteMany();
  await prisma.knowledgeBase.deleteMany();
  await prisma.aIConfiguration.deleteMany();
  await prisma.membership.deleteMany();
  await prisma.organization.deleteMany();
  await prisma.user.deleteMany();

  const passwordHash = await bcrypt.hash('password123', 10);

  // 1. Create Users
  const alexOwner = await prisma.user.create({
    data: {
      email: 'alex@acmecloud.io',
      name: 'Alex Rivera',
      passwordHash,
      avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
    },
  });

  const sarahAgent = await prisma.user.create({
    data: {
      email: 'sarah@acmecloud.io',
      name: 'Sarah Chen',
      passwordHash,
      avatarUrl: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150',
    },
  });

  const davidViewer = await prisma.user.create({
    data: {
      email: 'david@acmecloud.io',
      name: 'David Miller',
      passwordHash,
    },
  });

  // 2. Create Organization
  const acmeOrg = await prisma.organization.create({
    data: {
      name: 'Acme Cloud Solutions',
      slug: 'acme-cloud',
      industry: 'Developer Infrastructure SaaS',
      domain: 'acmecloud.io',
      plan: 'PRO',
    },
  });

  // 3. Memberships
  await prisma.membership.createMany({
    data: [
      { userId: alexOwner.id, organizationId: acmeOrg.id, role: 'OWNER' },
      { userId: sarahAgent.id, organizationId: acmeOrg.id, role: 'AGENT' },
      { userId: davidViewer.id, organizationId: acmeOrg.id, role: 'VIEWER' },
    ],
  });

  // 4. AI Agent Configuration
  await prisma.aIConfiguration.create({
    data: {
      organizationId: acmeOrg.id,
      agentName: 'Acme Support AI',
      tone: 'professional',
      welcomeMessage: 'Welcome to Acme Cloud Support! How can I assist with your database or billing today?',
      systemPrompt: 'You are an expert customer support agent for Acme Cloud Solutions. Answer questions accurately based on company documentation. If unsure, offer human support escalation.',
      businessDescription: 'Acme Cloud Solutions provides managed PostgreSQL databases and cloud scaling infrastructure for high-growth tech companies.',
      confidenceThreshold: 0.65,
      escalationBehavior: 'OFFER_HUMAN',
      maxResponseLength: 300,
    },
  });

  // 5. Knowledge Base & Sources
  const kb = await prisma.knowledgeBase.create({
    data: {
      organizationId: acmeOrg.id,
      name: 'Acme Product & Billing Documentation',
      description: 'Official knowledge base for Acme Cloud database products and subscriptions',
    },
  });

  const source1Content = `
# Billing & Refund Policy
Eligible monthly subscription refunds are processed within 5-7 business days of request.
All Acme Cloud Pro plans include up to 10 database clusters and 500GB storage.
If you cancel your subscription during a billing cycle, your service remains active until the end of the current period, and unused time is prorated as platform credits.
Invoices can be downloaded as PDF documents directly from Settings > Billing.
`;

  const source2Content = `
# API Rate Limits & Authentication
Acme Cloud APIs require Bearer token authentication via the HTTP Authorization header:
Authorization: Bearer res_live_...

Rate limits are strictly enforced at 1,000 requests per minute per IP address.
Exceeding the rate limit returns a 429 Too Many Requests HTTP status code with a Retry-After header.
API keys can be generated and revoked in the Resolve Dashboard under Settings > API Keys.
`;

  const source3Content = `
# Database Backup & Failover FAQ
Q: How often are database backups created?
A: Automated daily snapshots are performed every 24 hours at 00:00 UTC. Continuous Write-Ahead Logging (WAL) enables Point-In-Time Recovery (PITR) up to the past 14 days.

Q: Is multi-region failover supported?
A: Yes, Pro and Enterprise plans include cross-region read replicas with automated failover within 30 seconds of primary node disruption.
`;

  const s1 = await prisma.knowledgeSource.create({
    data: {
      knowledgeBaseId: kb.id,
      name: 'Billing & Refund Policy',
      type: 'TEXT',
      content: source1Content.trim(),
      status: 'READY',
      chunkCount: 2,
    },
  });

  const s2 = await prisma.knowledgeSource.create({
    data: {
      knowledgeBaseId: kb.id,
      name: 'API Rate Limits & Auth',
      type: 'TEXT',
      content: source2Content.trim(),
      status: 'READY',
      chunkCount: 2,
    },
  });

  const s3 = await prisma.knowledgeSource.create({
    data: {
      knowledgeBaseId: kb.id,
      name: 'Database Backup & Failover FAQ',
      type: 'FAQ',
      content: source3Content.trim(),
      status: 'READY',
      chunkCount: 2,
    },
  });

  // Create chunks with term frequency vectors
  const { chunkText, generateTermFrequencyVector } = require('../src/services/kb.service');

  const sourcesToChunk = [s1, s2, s3];
  for (const src of sourcesToChunk) {
    const chunks = chunkText(src.content);
    for (let i = 0; i < chunks.length; i++) {
      const vec = generateTermFrequencyVector(chunks[i]);
      await prisma.knowledgeChunk.create({
        data: {
          sourceId: src.id,
          chunkIndex: i,
          content: chunks[i],
          embedding: JSON.stringify(vec),
        },
      });
    }
  }

  // 6. Customers
  const customer1 = await prisma.customer.create({
    data: {
      organizationId: acmeOrg.id,
      name: 'Emily Watson',
      email: 'emily@fintechio.com',
      tags: JSON.stringify(['Enterprise', 'VIP']),
      csatAvg: 5.0,
    },
  });

  const customer2 = await prisma.customer.create({
    data: {
      organizationId: acmeOrg.id,
      name: 'Marcus Vance',
      email: 'marcus@devscale.app',
      tags: JSON.stringify(['Growth']),
      csatAvg: 4.5,
    },
  });

  const customer3 = await prisma.customer.create({
    data: {
      organizationId: acmeOrg.id,
      name: 'TechCorp Admin',
      email: 'admin@techcorp.io',
      tags: JSON.stringify(['Evaluation']),
    },
  });

  // 7. Conversations & Messages
  // Conv 1: Resolved by AI
  const conv1 = await prisma.conversation.create({
    data: {
      organizationId: acmeOrg.id,
      customerId: customer1.id,
      status: 'RESOLVED',
      priority: 'MEDIUM',
      channel: 'WIDGET',
      subject: 'Invoice download and refund policy inquiry',
      isAiResolved: true,
      satisfactionScore: 5,
      satisfactionComment: 'Quick and accurate answer!',
      closedAt: new Date(),
    },
  });

  await prisma.message.createMany({
    data: [
      {
        conversationId: conv1.id,
        senderType: 'CUSTOMER',
        content: 'Hi, how quickly are subscription refunds processed if we update our billing details?',
        createdAt: new Date(Date.now() - 3600000 * 5),
      },
      {
        conversationId: conv1.id,
        senderType: 'AI',
        content: 'According to our Billing & Refund Policy, eligible monthly subscription refunds are processed within 5–7 business days of request. Unused time is prorated as platform credits.',
        confidence: 0.92,
        sources: JSON.stringify([{ name: 'Billing & Refund Policy' }]),
        createdAt: new Date(Date.now() - 3600000 * 5 + 3000),
      },
    ],
  });

  // Conv 2: Escalated to Human Support
  const conv2 = await prisma.conversation.create({
    data: {
      organizationId: acmeOrg.id,
      customerId: customer2.id,
      status: 'ESCALATED',
      priority: 'HIGH',
      assignedToId: sarahAgent.id,
      channel: 'WIDGET',
      subject: 'Custom SOC2 compliance and BAA enterprise addendum',
      isAiResolved: false,
      escalatedAt: new Date(Date.now() - 1800000),
      escalatedReason: 'Out of knowledge base scope - custom legal contract request',
    },
  });

  await prisma.message.createMany({
    data: [
      {
        conversationId: conv2.id,
        senderType: 'CUSTOMER',
        content: 'Do you support custom SOC2 Type II compliance reports and HIPAA BAA addendums for dedicated clusters?',
        createdAt: new Date(Date.now() - 3600000 * 2),
      },
      {
        conversationId: conv2.id,
        senderType: 'AI',
        content: "I don't have detailed information regarding custom HIPAA BAA addendums in our public documentation. Would you like me to connect you with our Enterprise support team?",
        confidence: 0.42,
        createdAt: new Date(Date.now() - 3600000 * 2 + 2000),
      },
      {
        conversationId: conv2.id,
        senderType: 'CUSTOMER',
        content: 'Yes please, transfer me to human support.',
        createdAt: new Date(Date.now() - 1800000),
      },
      {
        conversationId: conv2.id,
        senderType: 'HUMAN_AGENT',
        senderId: sarahAgent.id,
        content: "Hi Marcus, Sarah from Acme support team here! I'd be happy to send over our SOC2 Type II compliance package and draft BAA agreement for your legal team.",
        createdAt: new Date(Date.now() - 900000),
      },
    ],
  });

  // Conv 3: Open conversation
  const conv3 = await prisma.conversation.create({
    data: {
      organizationId: acmeOrg.id,
      customerId: customer3.id,
      status: 'OPEN',
      priority: 'MEDIUM',
      channel: 'WIDGET',
      subject: 'Setting up cross-region read replicas',
    },
  });

  await prisma.message.createMany({
    data: [
      {
        conversationId: conv3.id,
        senderType: 'CUSTOMER',
        content: 'What is the maximum failover time for read replicas in the Pro plan?',
        createdAt: new Date(Date.now() - 600000),
      },
      {
        conversationId: conv3.id,
        senderType: 'AI',
        content: 'According to our Database Backup & Failover FAQ, Pro and Enterprise plans include cross-region read replicas with automated failover within 30 seconds of primary node disruption.',
        confidence: 0.88,
        sources: JSON.stringify([{ name: 'Database Backup & Failover FAQ' }]),
        createdAt: new Date(Date.now() - 590000),
      },
    ],
  });

  // 8. Usage Record
  const currentPeriod = new Date().toISOString().slice(0, 7);
  await prisma.usageRecord.create({
    data: {
      organizationId: acmeOrg.id,
      period: currentPeriod,
      aiMessagesCount: 820,
      conversationsCount: 142,
      knowledgeSourcesCount: 3,
      apiRequestsCount: 2450,
    },
  });

  // 9. API Key
  const crypto = require('crypto');
  const rawKey = 'res_live_demo1234567890acmecloudkey';
  const hashedSecret = crypto.createHash('sha256').update(rawKey).digest('hex');

  await prisma.aPIKey.create({
    data: {
      organizationId: acmeOrg.id,
      name: 'Production Website Widget Key',
      keyPrefix: 'res_live_demo12',
      hashedSecret,
    },
  });

  console.log('✅ Seeding completed successfully!');
  console.log('\nDemo User Credentials:');
  console.log('Owner:  alex@acmecloud.io  / password123');
  console.log('Agent:  sarah@acmecloud.io / password123');
  console.log('Viewer: david@acmecloud.io / password123');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
