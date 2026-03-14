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
import { errorHandler } from "./middleware/errorHandler";

import './models/associations';
import sequelize from "./config/database";
import redisService from './config/redis';
import pubSubService from './services/PubSubService';
import { generalLimiter } from './middleware/rateLimiter';
import { initCronJobs } from './services/CronService';

const app = express();

app.use(cors({
  origin: env.NODE_ENV === 'production' ? env.FRONTEND_URL : '*',
  credentials: true,
}));
app.use(helmet({ contentSecurityPolicy: false }));
app.use(express.json());
app.use(generalLimiter);

// Swagger UI
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec, {
  customCss: '.swagger-ui .topbar { display: none }',
  customSiteTitle: 'Toca Aqui API Docs',
}));

app.use('/uploads', express.static(path.join(__dirname, '../uploads')));
console.log(`Pasta uploads disponível em: /uploads`);

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
