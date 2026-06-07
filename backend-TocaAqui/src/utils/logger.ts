import winston from 'winston';
// eslint-disable-next-line @typescript-eslint/no-require-imports
const { ElasticsearchTransport } = require('winston-elasticsearch');

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

// Adiciona transport para Elasticsearch quando a URL estiver configurada
if (process.env.ELASTICSEARCH_URL) {
  logger.add(
    new ElasticsearchTransport({
      level: 'info',
      clientOpts: { node: process.env.ELASTICSEARCH_URL },
      index: 'toca-aqui-logs',
    })
  );
}

export default logger;
