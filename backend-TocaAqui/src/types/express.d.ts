import 'express';

declare module 'express' {
  interface Request {
    /** TraceID único por requisição — gerado em traceId.middleware.ts */
    traceId?: string;
  }
}
