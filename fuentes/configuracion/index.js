import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

// Resolver __dirname en ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Cargar variables de entorno desde .env en la raiz del backend
dotenv.config({ path: path.resolve(__dirname, '../../.env') });

// VERIFICAR CARGA DE VARIABLES
console.log('🔧 Variables de entorno cargadas:');
console.log('  GROQ_MODEL:', process.env.GROQ_MODEL || 'NO DEFINIDO');
console.log('  GROQ_API_KEY:', process.env.GROQ_API_KEY ? 'DEFINIDA' : 'NO DEFINIDA');

const config = {
  PORT: process.env.PORT || 5000,
  MONGO_URI: process.env.MONGO_URI || 'mongodb://localhost:27017/ecoalas_db',
  JWT_SECRET: process.env.JWT_SECRET || 'supersecretoseguroparajwt',
  JWT_EXPIRE: process.env.JWT_EXPIRE || '30d',

  // Origenes permitidos para CORS
  CORS_ORIGIN: process.env.CORS_ORIGIN || 'http://localhost:5173,http://127.0.0.1:5173,http://localhost:3000,http://127.0.0.1:3000',

  // Configuración de LLM: Groq
  GROQ_API_KEY: process.env.GROQ_API_KEY,
  // VALOR POR DEFECTO CORREGIDO
  GROQ_MODEL: process.env.GROQ_MODEL || 'llama3-70b-8192',
  CHATBOT_ENABLED: process.env.CHATBOT_ENABLED === 'false' ? false : true,

  // Directorios para los documentos del chatbot
  DOCS_SOURCE_DIR: path.resolve(__dirname, '../../documentos'),
  CHUNKS_DIR: path.resolve(__dirname, '../../documentos_chunks'),
};

console.log('🔧 Configuración final:');
console.log('  Modelo Groq:', config.GROQ_MODEL);

export default config;