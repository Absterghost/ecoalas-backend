import express from "express";
import mongoose from "mongoose";
import dotenv from "dotenv";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";
import Groq from "groq-sdk";

// Rutas
import userRoutes from "./fuentes/rutas/usuario.js";

dotenv.config();

// =======================================
// CONFIGURACIÓN GENERAL
// =======================================
const app = express();
app.use(express.json());

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

let CHATBOT_ENABLED = process.env.CHATBOT_ENABLED === "true";
const PORT = process.env.PORT || 3000;

// =======================================
// CORS DEFINITIVO (RENDER + LOCAL ✅)
// =======================================
const allowedOrigins = [
  "http://localhost:5173",
  "https://ecoalas-frontend.onrender.com"
];

app.use((req, res, next) => {
  const origin = req.headers.origin;

  if (allowedOrigins.includes(origin)) {
    res.setHeader("Access-Control-Allow-Origin", origin);
  }

  res.setHeader("Access-Control-Allow-Methods", "GET,POST,PUT,DELETE,OPTIONS");
  res.setHeader(
    "Access-Control-Allow-Headers",
    "Content-Type, Authorization"
  );
  res.setHeader("Access-Control-Allow-Credentials", "true");

  if (req.method === "OPTIONS") {
    return res.sendStatus(200);
  }

  next();
});

// =======================================
// CONEXIÓN A MONGO
// =======================================
mongoose
  .connect(process.env.MONGO_URI, {
    dbName: "ecoalas"
  })
  .then(() => console.log("✅ Conectado a MongoDB"))
  .catch((err) => console.error("❌ Error MongoDB:", err));

// =======================================
// RUTAS
// =======================================
app.use("/api/usuarios", userRoutes);

// =======================================
// GROQ CONFIG
// =======================================
const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });
const GROQ_MODEL = process.env.GROQ_MODEL || "llama3-8b-8192";

// =======================================
// CARGAR DOCUMENTOS
// =======================================
const CHUNKS_DIR = path.join(__dirname, "documentos_chunks");
let documentosChunks = {};

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
      console.error(`❌ Error leyendo ${archivo}:`, err.message);
    }
  }

  console.log(
    `📚 Chunks cargados: ${Object.keys(documentosChunks).length}`
  );
} else {
  console.warn("⚠️ No existe la carpeta documentos_chunks");
}

// =======================================
// BUSCADOR DE TEXTO
// =======================================
function buscarEnChunks(texto) {
  const resultados = [];

  for (const archivo in documentosChunks) {
    const chunks = documentosChunks[archivo];
    if (!Array.isArray(chunks)) continue;

    chunks.forEach((chunk, index) => {
      if (
        typeof chunk === "string" &&
        chunk.toLowerCase().includes(texto.toLowerCase())
      ) {
        resultados.push({ archivo, index, texto: chunk });
      }
    });
  }

  return resultados;
}

// =======================================
// FUNCIÓN IA
// =======================================
async function obtenerRespuestaIA(pregunta) {
  try {
    const completion = await groq.chat.completions.create({
      model: GROQ_MODEL,
      messages: [
        {
          role: "system",
          content:
            "Eres un experto en aves y aviturismo de Caldas. Responde siempre en español de forma clara."
        },
        { role: "user", content: pregunta }
      ],
      temperature: 0.2,
      max_tokens: 200
    });

    return completion.choices[0].message.content;
  } catch (error) {
    console.error("❌ Error Groq:", error.message);
    return "⚠️ Error obteniendo respuesta de IA.";
  }
}

// =======================================
// ENDPOINT CHATBOT
// =======================================
app.post("/api/chatbot/chat", async (req, res) => {
  const { message } = req.body;

  if (!message?.trim()) {
    return res.status(400).json({ reply: "⚠️ Mensaje vacío." });
  }

  let reply = "";

  const encontrados = buscarEnChunks(message);

  if (encontrados.length > 0) {
    reply += "📄 Información encontrada en documentos:\n\n";
    encontrados.forEach((e) => {
      reply += `• ${e.archivo} (fragmento ${e.index}):\n${e.texto}\n\n`;
    });
  }

  if (CHATBOT_ENABLED) {
    const ia = await obtenerRespuestaIA(message);
    reply = `🤖 Respuesta IA:\n${ia}\n\n${reply}`;
  }

  if (!CHATBOT_ENABLED && encontrados.length === 0) {
    reply =
      "⚠️ No encontré información y la IA está desactivada.";
  }

  res.json({ reply });
});

// =======================================
// TOGGLE IA
// =======================================
app.post("/api/chatbot/toggleIA", (req, res) => {
  CHATBOT_ENABLED = !CHATBOT_ENABLED;

  res.json({
    estado: CHATBOT_ENABLED ? "IA activada" : "IA desactivada"
  });
});

// =======================================
// INICIO SERVIDOR
// =======================================
app.listen(PORT, "0.0.0.0", () => {
  console.log(`🚀 Backend activo en puerto ${PORT}`);
});

