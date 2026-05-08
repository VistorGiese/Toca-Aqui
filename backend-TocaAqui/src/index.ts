import { env } from "./config/env"; // validate env vars at startup
import express from "express";
import cors from "cors";
import helmet from "helmet";
import path from "path";
import swaggerUi from "swagger-ui-express";
import { swaggerSpec } from "./config/swagger";

import AddressRoutes from "./routes/AddressRoutes";
import BandRoutes from "./routes/BandRoutes";
import BookingRoutes from "./routes/BookingRoutes";
import BandApplicationRoutes from "./routes/BandApplicationRoutes";
import FavoriteRoutes from "./routes/FavoriteRoutes";
import UserRoutes from "./routes/UserRoutes";
import BandManagementRoutes from "./routes/BandManagementRoutes";
import AdminRoutes from "./routes/AdminRoutes";
import EstablishmentRoutes from "./routes/EstablishmentRoutes";
import NotificationRoutes from "./routes/NotificationRoutes";
import ContractRoutes from "./routes/ContractRoutes";
// STRIPE — previsto para produção, desativado no MVP/TCC
// import PaymentRoutes from "./routes/PaymentRoutes";
// import WebhookRoutes from "./routes/WebhookRoutes";
import ShowRoutes from "./routes/ShowRoutes";
import IngressoRoutes from "./routes/IngressoRoutes";
import AvaliacaoShowRoutes from "./routes/AvaliacaoShowRoutes";
import ComentarioShowRoutes from "./routes/ComentarioShowRoutes";
import ArtistaPublicoRoutes from "./routes/ArtistaPublicoRoutes";
import MockPaymentRoutes from "./routes/MockPaymentRoutes";
import { errorHandler } from "./middleware/errorHandler";

import './models/associations';
import sequelize from "./config/database";
import redisService from './config/redis';
import pubSubService from './services/PubSubService';
import { generalLimiter } from './middleware/rateLimiter';
import { initCronJobs } from './services/CronService';

const app = express();

if (env.NODE_ENV === 'production') {
  // Necessary behind reverse proxy (Nginx) so rate limiter sees client IP.
  app.set('trust proxy', 1);
}

app.disable('x-powered-by');

// CORS — em desenvolvimento libera todas as origens (mobile app não envia origin)
app.use(cors({
  origin: true,
  credentials: true,
}));
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      imgSrc: ["'self'", "data:", "blob:"],
    },
  },
}));
// Stripe webhook precisa do body raw ANTES do express.json()
// STRIPE — previsto para produção, desativado no MVP/TCC
// app.use('/webhooks', express.raw({ type: 'application/json' }), WebhookRoutes);

app.use(express.json());
app.use(generalLimiter);

// Swagger UI — apenas em desenvolvimento
if (env.NODE_ENV !== 'production') {
  app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec, {
    customCss: '.swagger-ui .topbar { display: none }',
    customSiteTitle: 'Toca Aqui API Docs',
  }));
}

// Uploads estáticos com headers de segurança
app.use('/uploads', (_req, res, next) => {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('Content-Disposition', 'inline');
  next();
}, express.static(path.join(__dirname, '../uploads')));

app.use("/enderecos", AddressRoutes);
app.use("/bandas", BandRoutes);
app.use("/agendamentos", BookingRoutes);
app.use("/eventos", BandApplicationRoutes);
app.use("/favoritos", FavoriteRoutes);
app.use("/usuarios", UserRoutes);
app.use("/gerenciamento-bandas", BandManagementRoutes);
app.use("/admin", AdminRoutes);
app.use("/estabelecimentos", EstablishmentRoutes);
app.use("/notificacoes", NotificationRoutes);
app.use("/contratos", ContractRoutes);
// STRIPE — previsto para produção, desativado no MVP/TCC
// app.use("/pagamentos", PaymentRoutes);
app.use("/shows", ShowRoutes);
app.use("/ingressos", IngressoRoutes);
app.use("/avaliacoes", AvaliacaoShowRoutes);
app.use("/comentarios", ComentarioShowRoutes);
app.use("/artistas", ArtistaPublicoRoutes);

// @dev APENAS PARA DESENVOLVIMENTO E TCC — mock do webhook do Stripe
if (env.NODE_ENV !== 'production') {
  app.use("/dev", MockPaymentRoutes);
}

app.get("/", (_req, res) => {
  res.json({ message: "API funcionando!" });
});

app.get("/health", async (_req, res) => {
  try {
    const dbHealthy = await sequelize.authenticate().then(() => true).catch(() => false);
    const redisHealthy = await redisService.healthCheck();

    const health = {
      status: dbHealthy && redisHealthy ? "healthy" : "unhealthy",
      timestamp: new Date().toISOString(),
      services: {
        database: dbHealthy ? "up" : "down",
        redis: redisHealthy ? "up" : "down",
      },
    };

    const statusCode = health.status === "healthy" ? 200 : 503;
    res.status(statusCode).json(health);
  } catch (error) {
    res.status(503).json({
      status: "unhealthy",
      timestamp: new Date().toISOString(),
      error: "Health check failed",
    });
  }
});

// Handler de erros centralizado — deve vir após todas as rotas
app.use(errorHandler);

sequelize
  .authenticate()
  .then(async () => {
    console.log("Banco de dados conectado com sucesso!");

    await pubSubService.initializeSubscribers();
    console.log("Redis Pub/Sub subscribers inicializados");

    initCronJobs();

    app.listen(env.PORT, () => {
      console.log(`Servidor rodando na porta ${env.PORT}`);
    });
  })
  .catch((error) => {
    console.error("Erro ao conectar ao banco de dados:", error);
    process.exit(1);
  });

export default app;
