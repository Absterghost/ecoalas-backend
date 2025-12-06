// backend/servidor.js
import express from "express";
import cors from "cors";
import swaggerUi from "swagger-ui-express";
import swaggerJsdoc from "swagger-jsdoc";

import conectarDB from "./fuentes/bd/conexion.js";
import config from "./fuentes/configuracion/index.js";

import autenticacionRutas from "./fuentes/rutas/autenticacion.js";
import aveRutas from "./fuentes/rutas/ave.js";
import familiaRutas from "./fuentes/rutas/familia.js";
import rutaRutas from "./fuentes/rutas/ruta.js";
import avistamientoRutas from "./fuentes/rutas/avistamiento.js";
import semilleroRutas from "./fuentes/rutas/semillero.js";
import { router as chatbotRutas, inicializarChatbotServicio } from "./fuentes/rutas/chat.js";

import logger from "./fuentes/configuracion/logger.js";
import { UPLOADS_DIR } from "./fuentes/utilidades/manejadorArchivos.js";
import { notFound, errorHandler } from "./fuentes/intermedios/manejoErrores.js";

const app = express();

/* 1. Conexión a BD */
(async () => {
  try {
    await conectarDB();
    logger.info("✔ Base de datos conectada correctamente");
  } catch (error) {
    logger.error("❌ Error crítico al conectar la base de datos:", error);
    process.exit(1);
  }
})();

/* 2. CORS */
const whitelist = config.CORS_ORIGIN ? config.CORS_ORIGIN.split(",") : [];

const corsOptions = {
  origin: (origin, callback) => {
    const permitido =
      !origin || whitelist.includes(origin) || process.env.NODE_ENV !== "production";

    permitido ? callback(null, true) : callback(new Error("Origen no permitido por CORS"));
  },
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "PATCH"],
  allowedHeaders: ["Content-Type", "Authorization", "Accept"],
};

app.use(cors(corsOptions));
app.use(express.json({ limit: "10mb" }));

/* 3. Archivos estáticos */
app.use("/uploads", express.static(UPLOADS_DIR));

/* 4. Swagger */
let swaggerSpec = {};
try {
  swaggerSpec = swaggerJsdoc(await import("./swagger.js"));
} catch (error) {
  logger.error("⚠ Error cargando Swagger:", error);
}

app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));

/* 5. Rutas */
app.use("/api/autenticacion", autenticacionRutas);
app.use("/api/aves", aveRutas);
app.use("/api/familias", familiaRutas);
app.use("/api/rutas", rutaRutas);
app.use("/api/avistamientos", avistamientoRutas);
app.use("/api/semillero", semilleroRutas);

if (config.CHATBOT_ENABLED) {
  app.use("/api/documentos", chatbotRutas);
  logger.info("🤖 Chatbot habilitado");
} else {
  logger.warn("⚠ Chatbot deshabilitado");
}

/* 6. Ruta base */
app.get("/", (req, res) => {
  res.send("API de EcoAlas - Bienvenido!");
});

/* 7. Manejo de errores */
app.use(notFound);
app.use(errorHandler);

/* 8. Servidor */
app.listen(config.PORT, async () => {
  logger.info(`🚀 Servidor ejecutándose en http://localhost:${config.PORT}`);
  logger.info(`📘 Swagger disponible en /api-docs`);

  if (config.CHATBOT_ENABLED) {
    try {
      await inicializarChatbotServicio();
      logger.info("🤖 Chatbot inicializado correctamente");
    } catch (error) {
      logger.error("❌ Error al iniciar chatbot:", error);
    }
  }
});
