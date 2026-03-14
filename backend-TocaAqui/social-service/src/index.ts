import express from "express";
import cors from "cors";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import dotenv from "dotenv";

dotenv.config();

import sequelize from "./config/database";
import redisService from "./config/redis";
import { errorHandler } from "./middleware/errorHandler";

import "./models/FavoriteModel";
import "./models/CommentModel";
import "./models/RatingModel";

import FavoriteRoutes from "./routes/FavoriteRoutes";
import CommentRoutes from "./routes/CommentRoutes";
import RatingRoutes from "./routes/RatingRoutes";

const app = express();
const PORT = Number(process.env.PORT) || 3001;

if (process.env.NODE_ENV === 'production') {
  app.set('trust proxy', 1);
}

app.disable('x-powered-by');

app.use(cors({
  origin: process.env.NODE_ENV === 'production' ? process.env.FRONTEND_URL : '*',
  credentials: true,
}));
app.use(helmet());
app.use(express.json());

const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: { error: "Muitas requisições. Tente novamente mais tarde." },
});
app.use(generalLimiter);

app.use("/favoritos", FavoriteRoutes);
app.use("/comentarios", CommentRoutes);
app.use("/avaliacoes", RatingRoutes);

app.get("/health", async (_req, res) => {
  try {
    const dbHealthy = await sequelize.authenticate().then(() => true).catch(() => false);
    const redisHealthy = await redisService.healthCheck();

    const health = {
      service: "social-service",
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
      service: "social-service",
      status: "unhealthy",
      timestamp: new Date().toISOString(),
      error: "Health check failed",
    });
  }
});

app.use(errorHandler);

sequelize
  .authenticate()
  .then(() => {
    console.log("[Social Service] Banco de dados conectado com sucesso!");
    app.listen(PORT, () => {
      console.log(`[Social Service] Servidor rodando na porta ${PORT}`);
    });
  })
  .catch((error) => {
    console.error("[Social Service] Erro ao conectar ao banco de dados:", error);
    process.exit(1);
  });

export default app;
