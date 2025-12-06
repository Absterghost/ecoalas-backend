// backend/chatbot.js (Servidor del chatbot separado)
import express from "express";
import cors from "cors";
import fs from "fs";
import path from "path";
import dotenv from "dotenv";
import { fileURLToPath } from "url";
import Groq from "groq-sdk";

dotenv.config();

// CONFIGURACIÓN
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PORT = 5500; // O el que tú quieras
const CHATBOT_ENABLED = process.env.CHATBOT_ENABLED === "true";

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });
const GROQ_MODEL = process.env.GROQ_MODEL;

const CHUNKS_DIR = path.join(__dirname, "documentos_chunks");

const app = express();
app.use(express.json());
app.use(
  cors({
    origin: (process.env.CORS_ORIGIN || "").split(","),
    methods: ["GET", "POST"],
    credentials: true,
  })
);

// CARGAR CHUNKS
let documentosChunks = {};

if (fs.existsSync(CHUNKS_DIR)) {
  const archivos = fs.readdirSync(CHUNKS_DIR).filter((f) => f.endsWith(".json"));

  for (const archivo of archivos) {
    try {
      const ruta = path.join(CHUNKS_DIR, archivo);
      documentosChunks[archivo] = JSON.parse(fs.readFileSync(ruta, "utf8"));
    } catch (err) {
      console.error("❌ Error cargando chunks:", archivo, err.message);
    }
  }

  console.log(`📚 Chunks cargados: ${Object.keys(documentosChunks).length}`);
} else {
  console.log("⚠️ No existe la carpeta documentos_chunks.");
}

// BUSCADOR
function buscarEnChunks(query) {
  const resultados = [];

  for (const [archivo, listaChunks] of Object.entries(documentosChunks)) {
    listaChunks.forEach((chunk, i) => {
      if (chunk.toLowerCase().includes(query.toLowerCase())) {
        resultados.push({
          archivo,
          chunkIndex: i + 1,
          texto: chunk,
        });
      }
    });
  }
  return resultados;
}

// IA GROQ
async function obtenerRespuestaIA(pregunta) {
  try {
    const completion = await groq.chat.completions.create({
      model: GROQ_MODEL,
      messages: [
        {
          role: "system",
          content:
            "Eres un experto en aves y aviturismo. Responde SIEMPRE en español, de forma clara.",
        },
        { role: "user", content: pregunta },
      ],
      temperature: 0.2,
      max_tokens: 500,
    });

    return completion.choices[0].message.content;
  } catch (error) {
    console.error("❌ Error IA:", error.message);
    return "⚠️ No se pudo obtener respuesta de la IA.";
  }
}

// ENDPOINT /chat
app.post("/chat", async (req, res) => {
  const { message } = req.body;

  if (!message || message.trim() === "") {
    return res.status(400).json({ reply: "⚠️ El mensaje está vacío." });
  }

  let reply = "";

  const encontrados = buscarEnChunks(message);

  if (encontrados.length > 0) {
    reply += "📄 **Información encontrada en documentos:**\n\n";
    encontrados.forEach((e) => {
      reply += `- **${e.archivo}** (chunk ${e.chunkIndex}):\n${e.texto}\n\n`;
    });
  }

  if (CHATBOT_ENABLED) {
    const ia = await obtenerRespuestaIA(message);
    reply = `🤖 **Respuesta de la IA:**\n${ia}\n\n` + (reply || "");
  }

  if (!CHATBOT_ENABLED && encontrados.length === 0) {
    reply = "⚠️ No encontré información en PDFs y la IA está desactivada.";
  }

  res.json({ reply });
});

// ACTIVADOR DE IA
app.post("/toggleIA", (req, res) => {
  process.env.CHATBOT_ENABLED =
    process.env.CHATBOT_ENABLED === "true" ? "false" : "true";

  return res.json({
    estado:
      process.env.CHATBOT_ENABLED === "true"
        ? "IA activada"
        : "IA desactivada",
  });
});

export default app;
