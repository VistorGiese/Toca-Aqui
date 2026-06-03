import { Router } from 'express';
import { metricsService } from '../services/MetricsService';

const router = Router();

router.get('/', (_req, res) => {
  res.json({
    uptime: process.uptime(),
    memory: process.memoryUsage(),
    timestamp: new Date().toISOString(),
    routes: metricsService.getSummary(),
  });
});

export default router;
