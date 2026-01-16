/**
 * Worker Entry Point
 * Starts all background workers
 */

import './resume.worker.js';
import { logger } from '../utils/logger.js';

logger.info('All workers started');
