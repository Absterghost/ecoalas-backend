import express from 'express';
import {
  getEstadoDocumentos,
  procesarDocumentos,
  chatearConDocumentos
} from '../controladores/chat.js';
import { chatServicio } from '../servicios/chatServicio.js';
import protegerRuta from '../intermedios/autenticacionJWT.js'; // Necesario para 'procesar'
import autorizarRoles from '../intermedios/autorizacion.js'; // Necesario para 'procesar'

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Chatbot de Documentos
 *   description: Interacción con el asistente de documentos y gestión del procesamiento
 */

/**
 * @swagger
 * /documentos/estado:
 *   get:
 *     summary: Obtener el estado actual del sistema de documentos del chatbot
 *     tags: [Chatbot de Documentos]
 *     responses:
 *       200:
 *         description: Estado del sistema de documentos.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 servidor:
 *                   type: string
 *                   example: "🟢 ACTIVO"
 *                 documentos:
 *                   type: number
 *                   description: Cantidad de documentos cargados en memoria.
 *                   example: 2
 *                 chunksTotales:
 *                   type: number
 *                   description: Número total de chunks procesados.
 *                   example: 1500
 *                 procesando:
 *                   type: boolean
 *                   description: Indica si el sistema está actualmente procesando documentos.
 *                   example: false
 *                 ultimaActualizacion:
 *                   type: string
 *                   description: Fecha y hora de la última actualización/procesamiento.
 *                   example: "2023-11-20, 10:00:00"
 *                 modelo:
 *                   type: string
 *                   description: Nombre del modelo de IA utilizado.
 *                   example: gemma:2b
 *                 timestamp:
 *                   type: string
 *                   description: Marca de tiempo de la solicitud.
 *                   example: "2023-11-20, 10:05:30"
 *       500:
 *         description: Error del servidor.
 */
router.get('/estado', getEstadoDocumentos);

/**
 * @swagger
 * /documentos/procesar:
 *   post:
 *     summary: Solicitar el reprocesamiento manual de todos los documentos fuente
 *     tags: [Chatbot de Documentos]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Documentos procesados exitosamente o ya en proceso.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: Documentos procesados exitosamente
 *                 documentos:
 *                   type: number
 *                   example: 2
 *                 ultimaActualizacion:
 *                   type: string
 *                   example: "2023-11-20, 10:00:00"
 *       401:
 *         description: No autorizado.
 *       403:
 *         description: Acceso denegado (el usuario no tiene rol de admin).
 *       500:
 *         description: Error del servidor durante el procesamiento.
 */
router.post('/procesar', protegerRuta, autorizarRoles('admin'), procesarDocumentos);
// Nota: la subida de documentos no está disponible en esta versión base

/**
 * @swagger
 * /documentos/chat:
 *   post:
 *     summary: Enviar un mensaje al chatbot para obtener una respuesta basada en documentos
 *     tags: [Chatbot de Documentos]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - message
 *             properties:
 *               message:
 *                 type: string
 *                 description: La pregunta o mensaje del usuario para el chatbot.
 *                 example: ¿Cuáles son las aves endémicas de Caldas?
 *               modoEstricto:
 *                 type: boolean
 *                 description: Si es verdadero, el chatbot solo usará los documentos cargados.
 *                 example: true
 *     responses:
 *       200:
 *         description: Respuesta del chatbot.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 reply:
 *                   type: string
 *                   example: Las aves endémicas de Caldas incluyen el Colibrí Esmeralda.
 *                 modoUsado:
 *                   type: string
 *                   example: estricto
 *                 documentosEncontrados:
 *                   type: number
 *                   example: 3
 *                 fuentes:
 *                   type: array
 *                   items:
 *                     type: string
 *                   example: ["guia_aves_caldas.pdf", "articulo_colibri.txt"]
 *       400:
 *         description: Mensaje vacío o formato incorrecto.
 *       500:
 *         description: Error interno del servidor o problemas con la IA.
 */
router.post('/chat', chatearConDocumentos);

// Exportar la función de inicialización del chatbot directamente desde aquí
// para que servidor.js pueda llamarla.
export const inicializarChatbotServicio = chatServicio.inicializarChatbotServicio;
export { router };