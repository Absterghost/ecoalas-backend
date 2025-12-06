// backend/server.js (Servidor principal con DB, usuarios y chatbot)

import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import dotenv from "dotenv";


// Importar rutas
import userRoutes from "./fuentes/rutas/usuario.js";

// Importar chatbot (como módulo, NO servidor)
import chatbot from "./chatbot.js";

// Inicializar dotenv
dotenv.config();

const app = express();

app.use(cors({
  origin: [
    "https://aviturismo-manizales.netlify.app",
    "http://localhost:5173"
  ],
  methods: ["GET", "POST", "PUT", "DELETE"],
  credentials: true
}));

// ====== Middleware ======
app.use(express.json());
app.use(cors({
  origin: (process.env.CORS_ORIGIN || "").split(","),
  methods: ["GET", "POST", "PUT", "DELETE"],
  credentials: true
}));

// ====== Conexión BD ======
mongoose.connect(process.env.MONGO_URI, {
  dbName: "ecoalas"
})
.then(() => console.log("📌 Conexión a MongoDB exitosa"))
.catch(err => console.error("❌ Error conectando a MongoDB:", err));

// ====== Rutas del backend ======
app.use("/api/usuarios", userRoutes);

// ====== Rutas del chatbot ======
app.use("/api/chatbot", chatbot);

// ====== Servidor ======
const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`🚀 Servidor principal corriendo en http://localhost:${PORT}`);
});
