import express from "express";
import cors from "cors";
import dotenv from "dotenv";

import sequelize from "./config/database";
import redisService from "./config/redis";

import "./models/FavoriteModel";
import "./models/CommentModel";
import "./models/RatingModel";

import FavoriteRoutes from "./routes/FavoriteRoutes";
import CommentRoutes from "./routes/CommentRoutes";
import RatingRoutes from "./routes/RatingRoutes";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

sequelize
  .authenticate()
  .then(() => {
    console.log("[Social Service] Banco de dados conectado com sucesso!");
    // Sincronizar tabelas
    sequelize.sync().then(() => {
      console.log("[Social Service] Sincronização do banco concluída!");
    });
  })
  .catch((error) => {
    console.error("[Social Service] Erro ao conectar ao banco de dados:", error);
  });

app.use("/favoritos", FavoriteRoutes);
app.use("/comentarios", CommentRoutes);
app.use("/avaliacoes", RatingRoutes);

app.get("/health", async (req, res) => {
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


app.listen(PORT, () => {
  console.log(`[Social Service] Servidor rodando na porta ${PORT}`);
});

export default app;
