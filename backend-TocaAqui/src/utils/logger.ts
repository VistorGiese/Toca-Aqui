import winston from 'winston';
import TransportStream from 'winston-transport';
import http from 'http';

const { combine, timestamp, colorize, printf } = winston.format;

const devFormat = combine(
  colorize(),
  timestamp({ format: 'HH:mm:ss' }),
  printf(({ level, message, timestamp: ts, traceId, ...meta }) => {
    const trace = traceId ? ` [${traceId}]` : '';
    const extra = Object.keys(meta).length ? ` ${JSON.stringify(meta)}` : '';
    return `${ts} ${level}${trace}: ${message}${extra}`;
  })
);

class LokiHttpTransport extends TransportStream {
  private lokiUrl: URL;
  private batch: Array<{ labels: Record<string, string>; line: string; ts: string }> = [];
  private flushTimer: NodeJS.Timeout | null = null;

  constructor(lokiUrl: string) {
    super();
    this.lokiUrl = new URL('/loki/api/v1/push', lokiUrl);
  }

  log(info: any, callback: () => void): void {
    const ts = (BigInt(Date.now()) * 1_000_000n).toString();
    const line = JSON.stringify({
      level: info.level,
      message: info.message,
      ...Object.fromEntries(
        Object.entries(info).filter(([k]) => !['level', 'message', Symbol.for('level'), Symbol.for('splat'), Symbol.for('message')].includes(k as any))
      ),
    });

    this.batch.push({ labels: { app: 'toca-aqui-api', level: info.level }, line, ts });

    if (!this.flushTimer) {
      this.flushTimer = setTimeout(() => this.flush(), 3000);
    }

    callback();
  }

  private flush(): void {
    this.flushTimer = null;
    if (this.batch.length === 0) return;

    const entries = this.batch.splice(0);
    const body = JSON.stringify({
      streams: [{
        stream: { app: 'toca-aqui-api' },
        values: entries.map(e => [e.ts, e.line]),
      }],
    });

    const buf = Buffer.from(body);
    const req = http.request({
      hostname: this.lokiUrl.hostname,
      port: parseInt(this.lokiUrl.port) || 3100,
      path: this.lokiUrl.pathname,
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Content-Length': buf.length },
    }, (res) => {
      if (res.statusCode && res.statusCode >= 400) {
        let errBody = '';
        res.on('data', (d: Buffer) => { errBody += d; });
        res.on('end', () => console.error(`[Loki] Erro ${res.statusCode}:`, errBody.substring(0, 200)));
      }
    });
    req.on('error', (e) => console.error('[Loki] Erro de conexão:', e.message));
    req.write(buf);
    req.end();
  }
}

const logger = winston.createLogger({
  level: process.env.LOG_LEVEL ?? 'info',
  defaultMeta: { service: 'toca-aqui-api' },
  transports: [
    new winston.transports.Console({
      format: devFormat,
      silent: process.env.NODE_ENV === 'test',
    }),
  ],
});

if (process.env.LOKI_URL) {
  logger.add(new LokiHttpTransport(process.env.LOKI_URL));
}

export default logger;
