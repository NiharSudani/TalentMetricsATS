import { createServer } from 'http';
import { app } from './app.js';
import { config } from './config/env.js';
import { logger } from './utils/logger.js';
import { initializeWebSocket } from './server/websocket.js';

const PORT = config.port;

const httpServer = createServer(app);

// Initialize WebSocket server
initializeWebSocket(httpServer);

const server = httpServer.listen(PORT, () => {
  logger.info(`🚀 AURA-ATS Backend running on port ${PORT}`);
  logger.info(`📊 Environment: ${config.nodeEnv}`);
  logger.info(`🔌 WebSocket server ready`);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  logger.info('SIGTERM signal received: closing HTTP server');
  server.close(() => {
    logger.info('HTTP server closed');
    process.exit(0);
  });
});

process.on('SIGINT', () => {
  logger.info('SIGINT signal received: closing HTTP server');
  server.close(() => {
    logger.info('HTTP server closed');
    process.exit(0);
  });
});
