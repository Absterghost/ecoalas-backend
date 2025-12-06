import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import conectarDB from "./fuentes/bd/conexion.js"; 
import logger from "./fuentes/configuracion/logger.js";

dotenv.config();

const app = express();

// Middlewares
app.use(cors());
app.use(express.json());

// Conexión a la base de datos
conectarDB();

// Ruta básica para comprobar funcionamiento
app.get("/", (req, res) => {
  res.send("API funcionando correctamente 🚀");
});

// Puerto para Render
const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  logger.info(`🚀 Servidor iniciado en el puerto ${PORT}`);
});
