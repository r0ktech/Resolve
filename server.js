const express = require('express');
const http = require('http');
const next = require('next');
const path = require('path');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const helmet = require('helmet');
require('dotenv').config();

const { initializeSocket } = require('./src/services/socket.service');

// Import Routers
const authRoutes = require('./src/routes/auth.routes');
const kbRoutes = require('./src/routes/kb.routes');
const agentRoutes = require('./src/routes/agent.routes');
const conversationsRoutes = require('./src/routes/conversations.routes');
const customersRoutes = require('./src/routes/customers.routes');
const analyticsRoutes = require('./src/routes/analytics.routes');
const teamRoutes = require('./src/routes/team.routes');
const apikeysRoutes = require('./src/routes/apikeys.routes');
const widgetRoutes = require('./src/routes/widget.routes');
const usageRoutes = require('./src/routes/usage.routes');

const port = parseInt(process.env.PORT || '3000', 10);
const dev = process.env.NODE_ENV !== 'production';
const nextApp = next({ dev });
const handle = nextApp.getRequestHandler();

nextApp.prepare().then(() => {
  const app = express();
  const server = http.createServer(app);

  // Initialize Socket.io
  const io = initializeSocket(server);
  app.set('io', io);

  // Middleware
  app.use(cors({ origin: true, credentials: true }));
  app.use(
    helmet({
      contentSecurityPolicy: false, // Allow inline widget & Next.js scripts
      frameguard: false,
    })
  );
  app.use(express.json({ limit: '10mb' }));
  app.use(express.urlencoded({ extended: true, limit: '10mb' }));
  app.use(cookieParser());

  // Static Assets (disable index: false so Express doesn't intercept Next.js root route)
  app.use(express.static(path.join(__dirname, 'public'), { index: false }));

  // API Routes
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

  // Next.js page requests
  const { parse } = require('url');
  app.all('*', (req, res) => {
    const parsedUrl = parse(req.url, true);
    return handle(req, res, parsedUrl);
  });

  server.listen(port, (err) => {
    if (err) throw err;
    console.log(`> Resolve SaaS Server running on http://localhost:${port}`);
  });
});
