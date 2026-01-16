/**
 * WebSocket Server for Real-time Progress Updates
 * Uses Socket.io for bidirectional communication
 */

import { Server as HTTPServer } from 'http';
import { Server as SocketIOServer } from 'socket.io';
import { logger } from '../utils/logger.js';

let io: SocketIOServer | null = null;

export function initializeWebSocket(server: HTTPServer) {
  io = new SocketIOServer(server, {
    cors: {
      origin: process.env.FRONTEND_URL || 'http://localhost:3000',
      methods: ['GET', 'POST'],
    },
    path: '/socket.io',
  });

  io.on('connection', (socket) => {
    logger.info(`WebSocket client connected: ${socket.id}`);

    socket.on('disconnect', () => {
      logger.info(`WebSocket client disconnected: ${socket.id}`);
    });

    // Join room for specific job uploads
    socket.on('join-upload-room', (jobId: string) => {
      socket.join(`upload-${jobId}`);
      logger.info(`Client ${socket.id} joined upload room for job ${jobId}`);
    });

    // Leave upload room
    socket.on('leave-upload-room', (jobId: string) => {
      socket.leave(`upload-${jobId}`);
      logger.info(`Client ${socket.id} left upload room`);
    });
  });

  logger.info('WebSocket server initialized');
  return io;
}

export function getIO(): SocketIOServer {
  if (!io) {
    throw new Error('WebSocket server not initialized');
  }
  return io;
}

/**
 * Emit progress update for resume processing
 */
export function emitUploadProgress(jobId: string, data: {
  candidateId: string;
  status: string;
  progress: number;
  current: number;
  total: number;
  message?: string;
}) {
  if (!io) return;

  io.to(`upload-${jobId}`).emit('upload-progress', data);
  logger.debug('Emitted upload progress', { jobId, ...data });
}

/**
 * Emit completion notification
 */
export function emitUploadComplete(jobId: string, data: {
  totalProcessed: number;
  totalFailed: number;
  results: Array<{ candidateId: string; success: boolean; error?: string }>;
}) {
  if (!io) return;

  io.to(`upload-${jobId}`).emit('upload-complete', data);
  logger.info('Emitted upload complete', { jobId, ...data });
}
