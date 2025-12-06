import express from 'express';
import {
  obtenerAvistamientos,
  obtenerAvistamientoPorId,
  crearAvistamiento,
  actualizarAvistamiento,
  eliminarAvistamiento
} from '../controladores/avistamiento.js';
import protegerRuta from '../intermedios/autenticacionJWT.js';
import autorizarRoles from '../intermedios/autorizacion.js';
import { subirImagen } from '../utilidades/manejadorArchivos.js'; // Middleware para subir imágenes

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Avistamientos
 *   description: Gestión de registros de avistamientos de aves por usuarios
 */

/**
 * @swagger
 * /avistamientos:
 *   get:
 *     summary: Obtener todos los avistamientos registrados
 *     tags: [Avistamientos]
 *     responses:
 *       200:
 *         description: Lista de avistamientos obtenida exitosamente.
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Avistamiento'
 *       500:
 *         description: Error del servidor.
 *   post:
 *     summary: Registrar un nuevo avistamiento (requiere usuario autenticado)
 *     tags: [Avistamientos]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required:
 *               - ave
 *               - ubicacion
 *               - fechaAvistamiento
 *             properties:
 *               ave:
 *                 type: string
 *                 description: ID del ave avistada.
 *                 example: 60d0fe4f5e2a2b0015b7b7a1
 *               ubicacion:
 *                 type: string
 *                 description: Ubicación del avistamiento en formato GeoJSON Point string.
 *                 example: '{"type":"Point","coordinates":[-75.56, 5.07]}'
 *               fechaAvistamiento:
 *                 type: string
 *                 format: date-time
 *                 description: Fecha y hora del avistamiento.
 *                 example: 2023-10-27T14:30:00.000Z
 *               descripcion:
 *                 type: string
 *                 description: Descripción opcional del avistamiento.
 *                 example: Avistamiento de un colibrí esmeralda en el jardín.
 *               foto:
 *                 type: string
 *                 format: binary
 *                 description: Archivo de la foto del avistamiento (JPG, PNG, GIF, WEBP).
 *     responses:
 *       201:
 *         description: Avistamiento registrado exitosamente.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Avistamiento'
 *       400:
 *         description: Datos inválidos o campos obligatorios faltantes.
 *       401:
 *         description: No autorizado.
 *       500:
 *         description: Error del servidor.
 */

/**
 * @swagger
 * /avistamientos/{id}:
 *   get:
 *     summary: Obtener un avistamiento por su ID
 *     tags: [Avistamientos]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: ID del avistamiento a obtener.
 *         example: 60d0fe4f5e2a2b0015b7b7a1
 *     responses:
 *       200:
 *         description: Información del avistamiento obtenida exitosamente.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Avistamiento'
 *       404:
 *         description: Avistamiento no encontrado.
 *       500:
 *         description: Error del servidor.
 *   put:
 *     summary: Actualizar un avistamiento existente (requiere usuario autenticado, dueño o admin)
 *     tags: [Avistamientos]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: ID del avistamiento a actualizar.
 *         example: 60d0fe4f5e2a2b0015b7b7a1
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               ave:
 *                 type: string
 *                 description: Nuevo ID del ave avistada.
 *                 example: 60d0fe4f5e2a2b0015b7b7a2
 *               ubicacion:
 *                 type: string
 *                 description: Nueva ubicación del avistamiento en formato GeoJSON Point string.
 *                 example: '{"type":"Point","coordinates":[-75.57, 5.08]}'
 *               fechaAvistamiento:
 *                 type: string
 *                 format: date-time
 *                 description: Nueva fecha y hora del avistamiento.
 *                 example: 2023-10-28T10:00:00.000Z
 *               descripcion:
 *                 type: string
 *                 description: Nueva descripción del avistamiento.
 *                 example: Visto cerca de un alimentador de colibríes.
 *               foto:
 *                 type: string
 *                 format: binary
 *                 description: Nuevo archivo de foto del avistamiento.
 *     responses:
 *       200:
 *         description: Avistamiento actualizado exitosamente.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Avistamiento'
 *       400:
 *         description: Datos inválidos.
 *       401:
 *         description: No autorizado.
 *       403:
 *         description: Acceso denegado (no es el dueño ni admin).
 *       404:
 *         description: Avistamiento no encontrado.
 *       500:
 *         description: Error del servidor.
 *   delete:
 *     summary: Eliminar un avistamiento por su ID (requiere usuario autenticado, dueño o admin)
 *     tags: [Avistamientos]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: ID del avistamiento a eliminar.
 *         example: 60d0fe4f5e2a2b0015b7b7a1
 *     responses:
 *       200:
 *         description: Avistamiento eliminado exitosamente.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 mensaje:
 *                   type: string
 *                   example: Avistamiento eliminado exitosamente.
 *       401:
 *         description: No autorizado.
 *       403:
 *         description: Acceso denegado (no es el dueño ni admin).
 *       404:
 *         description: Avistamiento no encontrado.
 *       500:
 *         description: Error del servidor.
 */

router.route('/')
  .get(obtenerAvistamientos) // Puede ser público, o protegido para ver todos
  .post(protegerRuta, subirImagen.single('foto'), crearAvistamiento); // Usuario autenticado puede crear

router.route('/:id')
  .get(obtenerAvistamientoPorId)
  .put(protegerRuta, subirImagen.single('foto'), actualizarAvistamiento) // Usuario autenticado (dueño o admin) puede actualizar
  .delete(protegerRuta, eliminarAvistamiento); // Usuario autenticado (dueño o admin) puede eliminar

export default router;