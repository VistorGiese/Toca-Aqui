import express from "express";
import cors from "cors";
import dotenv from "dotenv";
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

import './models/associations';
import redisService from './config/redis';
import pubSubService from './services/PubSubService';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

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

import sequelize from "./config/database"; 


sequelize
  .authenticate()
  .then(async () => {
    console.log("Banco de dados conectado com sucesso!");
    // Para criar as tabelas automaticamente 
    await sequelize.sync();
    console.log("Sincronização do banco concluída!");
    
    await pubSubService.initializeSubscribers();
    console.log("Redis Pub/Sub subscribers inicializados");
  })
  .catch((error) => {
    console.error("Erro ao conectar ao banco de dados:", error);
  });

app.get("/", (req, res) => {
  res.json({ message: "API funcionando!" });
});

app.get("/health", async (req, res) => {
  try {
    const dbHealthy = sequelize.authenticate().then(() => true).catch(() => false);
    const redisHealthy = await redisService.healthCheck();
    
    const health = {
      status: (await dbHealthy) && redisHealthy ? "healthy" : "unhealthy",
      timestamp: new Date().toISOString(),
      services: {
        database: await dbHealthy ? "up" : "down",
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

app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});

export default app;
