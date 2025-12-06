// backend/server.js

import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import dotenv from "dotenv";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";
import Groq from "groq-sdk";

// Rutas de usuario
import userRoutes from "./fuentes/rutas/usuario.js";

dotenv.config();

// =======================================
// CONFIGURACIÓN GENERAL
// =======================================
const app = express();
app.use(express.json());

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const CHATBOT_ENABLED = process.env.CHATBOT_ENABLED === "true";
const PORT = process.env.PORT || 3000;

// =======================================
// CORS GLOBAL
// =======================================
app.use(
  cors({
    origin: [
      "https://aviturismo-manizales.netlify.app",
      "http://localhost:5173",
      "http://localhost:3000"
    ],
    methods: ["GET", "POST", "PUT", "DELETE"],
  })
);

// =======================================
// CONEXIÓN A MONGO
// =======================================
mongoose
  .connect(process.env.MONGO_URI, { dbName: "ecoalas" })
  .then(() => console.log("📌 Conexión a MongoDB exitosa"))
  .catch((err) => console.error("❌ Error conectando a MongoDB:", err));

// =======================================
// RUTAS DE USUARIO
// =======================================
app.use("/api/usuarios", userRoutes);

// =======================================
// CHATBOT - SISTEMA COMPLETO UNIFICADO
// =======================================

// GROQ IA CONFIG
const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });
const GROQ_MODEL = process.env.GROQ_MODEL;

// CHUNKS
const CHUNKS_DIR = path.join(__dirname, "documentos_chunks");
let documentosChunks = {};

// Cargar chunks en memoria
if (fs.existsSync(CHUNKS_DIR)) {
  const archivos = fs
    .readdirSync(CHUNKS_DIR)
    .filter((f) => f.endsWith(".json"));

  for (const archivo of archivos) {
    try {
      documentosChunks[archivo] = JSON.parse(
        fs.readFileSync(path.join(CHUNKS_DIR, archivo), "utf8")
      );
    } catch (err) {
      console.error("❌ Error leyendo chunk:", archivo, err.message);
    }
  }

  console.log(`📚 Chunks cargados: ${Object.keys(documentosChunks).length}`);
} else {
  console.log("⚠️ No existe la carpeta documentos_chunks.");
}

// Buscador de texto
function buscarEnChunks(mensajeUsuario) {
  let resultados = [];

  for (const archivo in documentosChunks) {
    const listaChunks = documentosChunks[archivo];
    if (!Array.isArray(listaChunks)) continue;

    listaChunks.forEach((chunk, index) => {
      if (typeof chunk !== "string") return;

      if (chunk.toLowerCase().includes(mensajeUsuario.toLowerCase())) {
        resultados.push({
          archivo,
          chunkIndex: index,
          texto: chunk,
        });
      }
    });
  }

  return resultados;
}

// IA Groq
async function obtenerRespuestaIA(pregunta) {
  try {
    const completion = await groq.chat.completions.create({
      model: GROQ_MODEL,
      messages: [
        {
          role: "system",
          content:
            "Eres un experto en aves y aviturismo de Caldas. Responde siempre en español de forma clara.",
        },
        { role: "user", content: pregunta },
      ],
      temperature: 0.2,
      max_tokens: 200,
    });

    return completion.choices[0].message.content;
  } catch (error) {
    console.error("❌ Error IA:", error.message);
    return "⚠️ No se pudo obtener respuesta de la IA.";
  }
}

// =======================================
// ENDPOINT PRINCIPAL: /api/chatbot/chat
// =======================================
app.post("/api/chatbot/chat", async (req, res) => {
  const { message } = req.body;

  if (!message || message.trim() === "") {
    return res.status(400).json({ reply: "⚠️ El mensaje está vacío." });
  }

  let reply = "";

  // Buscar en documentación
  const encontrados = buscarEnChunks(message);

  if (encontrados.length > 0) {
    reply += "📄 **Información encontrada en documentos:**\n\n";
    for (const e of encontrados) {
      reply += `- **${e.archivo}** (fragmento ${e.chunkIndex}):\n${e.texto}\n\n`;
    }
  }

  // IA activada
  if (CHATBOT_ENABLED) {
    const ia = await obtenerRespuestaIA(message);
    reply = `🤖 **Respuesta de la IA:**\n${ia}\n\n${reply}`;
  }

  // Nada encontrado + IA off
  if (!CHATBOT_ENABLED && encontrados.length === 0) {
    reply = "⚠️ No encontré información en los documentos y la IA está desactivada.";
  }

  res.json({ reply });
});

// =======================================
// ACTIVAR / DESACTIVAR IA
// =======================================
app.post("/api/chatbot/toggleIA", (req, res) => {
  process.env.CHATBOT_ENABLED =
    process.env.CHATBOT_ENABLED === "true" ? "false" : "true";

  res.json({
    estado:
      process.env.CHATBOT_ENABLED === "true"
        ? "IA activada"
        : "IA desactivada",
  });
});

// =======================================
// INICIAR SERVIDOR
// =======================================
app.listen(PORT, () => {
  console.log(`🚀 Servidor unificado corriendo en http://localhost:${PORT}`);
});
