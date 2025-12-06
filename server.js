// backend/server.js

import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import dotenv from "dotenv";

// Rutas
import userRoutes from "./fuentes/rutas/usuario.js";

// Chatbot (router, no servidor)
import chatbotRoutes from "./chatbot.js";

dotenv.config();

const app = express();

// =======================
// CORS CONFIGURACIÓN REAL
// =======================
app.use(cors({
  origin: [
  "https://aviturismo-manizales.netlify.app",
  "http://localhost:5173",
  "http://localhost:3000"
],
  methods: ["GET", "POST", "PUT", "DELETE"],
  credentials: true
}));

app.use(express.json());

// =======================
// CONEXIÓN A MONGO
// =======================
mongoose.connect(process.env.MONGO_URI, {
  dbName: "ecoalas"
})
.then(() => console.log("📌 Conexión a MongoDB exitosa"))
.catch(err => console.error("❌ Error conectando a MongoDB:", err));

// =======================
// RUTAS
// =======================
app.use("/api/usuarios", userRoutes);
app.use("/api/chatbot", chatbotRoutes);

// =======================
// SERVIDOR
// =======================
const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`🚀 Servidor corriendo en http://localhost:${PORT}`);
});
