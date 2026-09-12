const { Server } = require('socket.io');

function initializeSocket(httpServer) {
  const io = new Server(httpServer, {
    cors: {
      origin: '*',
      methods: ['GET', 'POST'],
    },
  });

  io.on('connection', (socket) => {
    // Join Organization room for support agent workspace
    socket.on('join:org', (orgId) => {
      if (orgId) {
        socket.join(`org:${orgId}`);
      }
    });

    // Join Conversation room for live chat stream
    socket.on('join:conversation', (convId) => {
      if (convId) {
        socket.join(`conv:${convId}`);
      }
    });

    // Agent or Customer typing indicators
    socket.on('typing:start', ({ convId, senderName }) => {
      socket.to(`conv:${convId}`).emit('typing:start', { senderName });
    });

    socket.on('typing:stop', ({ convId }) => {
      socket.to(`conv:${convId}`).emit('typing:stop');
    });

    socket.on('disconnect', () => {
      // Disconnected
    });
  });

  return io;
}

module.exports = {
  initializeSocket,
};
