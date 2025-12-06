import { fileURLToPath } from 'url';
import path from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const swaggerOptions = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'API de EcoAlas',
      version: '1.0.0',
      description: 'Documentación de la API del backend para la aplicación EcoAlas.',
      contact: {
        name: 'EcoAlas Team',
        url: 'https://ecoalas.com', // Replace with actual project URL
      },
    },
    servers: [
      {
        url: 'http://localhost:5000/api', // Base URL for the API
        description: 'Servidor de Desarrollo',
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
          description: 'Introduce el token JWT de acceso (Bearer Token).',
        },
      },
    },
    security: [
      {
        bearerAuth: [],
      },
    ],
  },
  apis: [
    path.join(__dirname, './rutas/*.js'), // Path to API routes
    path.join(__dirname, './modelos/*.js'), // Path to Mongoose models for schema definitions
  ],
};

export default swaggerOptions;
