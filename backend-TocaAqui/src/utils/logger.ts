import winston from 'winston';
import LokiTransport from 'winston-loki';

const { combine, timestamp, json, colorize, printf } = winston.format;

const devFormat = combine(
  colorize(),
  timestamp({ format: 'HH:mm:ss' }),
  printf(({ level, message, timestamp: ts, traceId, ...meta }) => {
    const trace = traceId ? ` [${traceId}]` : '';
    const extra = Object.keys(meta).length ? ` ${JSON.stringify(meta)}` : '';
    return `${ts} ${level}${trace}: ${message}${extra}`;
  })
);

const prodFormat = combine(
  timestamp(),
  json()
);

const logger = winston.createLogger({
  level: process.env.LOG_LEVEL ?? 'info',
  defaultMeta: { service: 'toca-aqui-api' },
  format: process.env.NODE_ENV === 'production' ? prodFormat : prodFormat,
  transports: [
    new winston.transports.Console({
      format: devFormat,
      silent: process.env.NODE_ENV === 'test',
    }),
  ],
});

// Adiciona transport para Loki quando a URL estiver configurada
if (process.env.LOKI_URL) {
  logger.add(
    new LokiTransport({
      host: process.env.LOKI_URL,
      labels: { app: 'toca-aqui-api' },
      json: true,
      format: winston.format.json(),
      replaceTimestamp: true,
      onConnectionError: (err) => console.error('Loki connection error:', err),
    })
  );
}

export default logger;
