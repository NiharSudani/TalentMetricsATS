'use client';

import { useEffect, useState, useCallback } from 'react';
import { io, Socket } from 'socket.io-client';

interface UploadProgress {
  candidateId: string;
  status: string;
  progress: number;
  current: number;
  total: number;
  message?: string;
}

interface UploadComplete {
  totalProcessed: number;
  totalFailed: number;
  results: Array<{ candidateId: string; success: boolean; error?: string }>;
}

export function useWebSocket(jobId: string | null) {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [progress, setProgress] = useState<Record<string, UploadProgress>>({});
  const [completed, setCompleted] = useState<UploadComplete | null>(null);
  const [connected, setConnected] = useState(false);

  useEffect(() => {
    const wsUrl = process.env.NEXT_PUBLIC_WS_URL || 'http://localhost:3001';
    const newSocket = io(wsUrl, {
      path: '/socket.io',
    });

    newSocket.on('connect', () => {
      setConnected(true);
      if (jobId) {
        newSocket.emit('join-upload-room', jobId);
      }
    });

    newSocket.on('disconnect', () => {
      setConnected(false);
    });

    newSocket.on('upload-progress', (data: UploadProgress) => {
      setProgress((prev) => ({
        ...prev,
        [data.candidateId]: data,
      }));
    });

    newSocket.on('upload-complete', (data: UploadComplete) => {
      setCompleted(data);
    });

    setSocket(newSocket);

    return () => {
      if (jobId) {
        newSocket.emit('leave-upload-room', jobId);
      }
      newSocket.close();
    };
  }, [jobId]);

  return {
    socket,
    progress,
    completed,
    connected,
  };
}
