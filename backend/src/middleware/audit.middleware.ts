import { Request, Response, NextFunction } from 'express';
import { PrismaClient } from '@prisma/client';
import { logger } from '../utils/logger.js';

const prisma = new PrismaClient();

export const auditMiddleware = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  // Skip audit for GET requests and health checks
  if (req.method === 'GET' || req.path === '/health') {
    next();
    return;
  }

  // Store original json method
  const originalJson = res.json.bind(res);

  // Override json method to capture response
  res.json = function (body: any) {
    // Log audit after response is sent
    setImmediate(async () => {
      try {
        const userId = (req as any).user?.id || 'system';
        const action = determineAction(req.method, req.path);
        const entityType = determineEntityType(req.path);
        const entityId = extractEntityId(req.path, body);

        if (action && entityType) {
          await prisma.auditLog.create({
            data: {
              action,
              entityType,
              entityId: entityId || 'unknown',
              userId,
              oldValue: req.body ? JSON.parse(JSON.stringify(req.body)) : null,
              newValue: body ? JSON.parse(JSON.stringify(body)) : null,
              metadata: {
                method: req.method,
                path: req.path,
                ip: req.ip,
                userAgent: req.get('user-agent'),
              },
            },
          });
        }
      } catch (error) {
        logger.error('Failed to create audit log', { error });
      }
    });

    return originalJson(body);
  };

  next();
};

function determineAction(method: string, path: string): string | null {
  if (method === 'POST') return 'CREATED';
  if (method === 'PUT' || method === 'PATCH') return 'UPDATED';
  if (method === 'DELETE') return 'DELETED';
  if (path.includes('/status')) return 'STATUS_CHANGED';
  if (path.includes('/score')) return 'SCORED';
  if (path.includes('/upload')) return 'UPLOADED';
  return null;
}

function determineEntityType(path: string): string | null {
  if (path.includes('/jobs')) return 'job';
  if (path.includes('/candidates')) return 'candidate';
  if (path.includes('/pipeline')) return 'pipeline';
  return null;
}

function extractEntityId(path: string, body: any): string | null {
  // Try to extract from URL params
  const pathParts = path.split('/');
  const idIndex = pathParts.findIndex((part) => part.match(/^[0-9a-f-]{36}$/i));
  if (idIndex !== -1) {
    return pathParts[idIndex];
  }

  // Try to extract from response body
  if (body?.id) return body.id;
  if (body?.data?.id) return body.data.id;

  return null;
}
