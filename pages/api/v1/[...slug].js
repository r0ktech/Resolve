const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');

const authRoutes = require('../../../src/routes/auth.routes');
const kbRoutes = require('../../../src/routes/kb.routes');
const agentRoutes = require('../../../src/routes/agent.routes');
const conversationsRoutes = require('../../../src/routes/conversations.routes');
const customersRoutes = require('../../../src/routes/customers.routes');
const analyticsRoutes = require('../../../src/routes/analytics.routes');
const teamRoutes = require('../../../src/routes/team.routes');
const apikeysRoutes = require('../../../src/routes/apikeys.routes');
const widgetRoutes = require('../../../src/routes/widget.routes');
const usageRoutes = require('../../../src/routes/usage.routes');

const app = express();

app.use(cors({ origin: true, credentials: true }));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(cookieParser());

app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/knowledge', kbRoutes);
app.use('/api/v1/agent', agentRoutes);
app.use('/api/v1/conversations', conversationsRoutes);
app.use('/api/v1/customers', customersRoutes);
app.use('/api/v1/analytics', analyticsRoutes);
app.use('/api/v1/team', teamRoutes);
app.use('/api/v1/api-keys', apikeysRoutes);
app.use('/api/v1/widget', widgetRoutes);
app.use('/api/v1/usage', usageRoutes);

module.exports = app;
