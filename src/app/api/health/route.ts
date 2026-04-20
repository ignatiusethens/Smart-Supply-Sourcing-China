/**
 * Health Check API Route
 * Demonstrates comprehensive error handling and database health monitoring
 * Validates: Requirements 22.1, 22.2, 22.3, 22.4, 22.5
 */

import { NextRequest } from 'next/server';
import { getPool } from '@/lib/database/connection';
import { getDatabaseHealth } from '@/lib/database/errorHandler';
import { withErrorHandler, successResponse } from '@/lib/middleware/apiErrorHandler';

async function handler(req: NextRequest) {
  const pool = getPool();
  
  // Get database health status
  const dbHealth = await getDatabaseHealth(pool);
  
  // Get system health
  const systemHealth = {
    uptime: process.uptime(),
    memory: process.memoryUsage(),
    timestamp: new Date().toISOString(),
  };
  
  // Overall health status
  const isHealthy = dbHealth.healthy;
  const status = isHealthy ? 200 : 503;
  
  return successResponse(
    {
      status: isHealthy ? 'healthy' : 'unhealthy',
      database: dbHealth,
      system: systemHealth,
    },
    status
  );
}

export const GET = withErrorHandler(handler);
