interface RouteMetric {
  count: number;
  errorCount: number;
  totalDurationMs: number;
  minDurationMs: number;
  maxDurationMs: number;
}

class MetricsService {
  private metrics: Map<string, RouteMetric> = new Map();

  record(route: string, durationMs: number, statusCode: number): void {
    const existing = this.metrics.get(route) ?? {
      count: 0,
      errorCount: 0,
      totalDurationMs: 0,
      minDurationMs: Infinity,
      maxDurationMs: 0,
    };

    existing.count += 1;
    if (statusCode >= 400) existing.errorCount += 1;
    existing.totalDurationMs += durationMs;
    if (durationMs < existing.minDurationMs) existing.minDurationMs = durationMs;
    if (durationMs > existing.maxDurationMs) existing.maxDurationMs = durationMs;

    this.metrics.set(route, existing);
  }

  getSummary(): Record<string, object> {
    const result: Record<string, object> = {};
    for (const [route, m] of this.metrics.entries()) {
      result[route] = {
        count: m.count,
        errorCount: m.errorCount,
        errorRate: m.count > 0 ? `${((m.errorCount / m.count) * 100).toFixed(1)}%` : '0%',
        avgDurationMs: m.count > 0 ? Math.round(m.totalDurationMs / m.count) : 0,
        minDurationMs: m.minDurationMs === Infinity ? 0 : m.minDurationMs,
        maxDurationMs: m.maxDurationMs,
      };
    }
    return result;
  }

  reset(): void {
    this.metrics.clear();
  }
}

export const metricsService = new MetricsService();
