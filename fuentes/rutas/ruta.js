import express from 'express';
import {
  obtenerRutas,
  obtenerRutaPorId,
  crearRuta,
  actualizarRuta,
  eliminarRuta
} from '../controladores/ruta.js';
import protegerRuta from '../intermedios/autenticacionJWT.js';
import autorizarRoles from '../intermedios/autorizacion.js';

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Rutas
 *   description: Gestión de rutas geográficas para avistamiento de aves
 */

/**
 * @swagger
 * /rutas:
 *   get:
 *     summary: Obtener todas las rutas geográficas
 *     tags: [Rutas]
 *     responses:
 *       200:
 *         description: Lista de rutas obtenida exitosamente.
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Ruta'
 *       500:
 *         description: Error del servidor.
 *   post:
 *     summary: Crear una nueva ruta geográfica (requiere rol de admin)
 *     tags: [Rutas]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - nombre
 *               - geojson
 *             properties:
 *               nombre:
 *                 type: string
 *                 description: Nombre único de la ruta.
 *                 example: Sendero El Colibrí
 *               descripcion:
 *                 type: string
 *                 description: Descripción de la ruta.
 *                 example: Ruta corta y fácil para observar colibríes.
 *               geojson:
 *                 $ref: '#/components/schemas/GeoJSONLineString'
 *               distancia:
 *                 type: string
 *                 description: Distancia de la ruta (ej. "2.5 km").
 *                 example: 2.5 km
 *               terreno:
 *                 type: string
 *                 description: Tipo de terreno de la ruta (ej. "Montañoso").
 *                 example: Bosque, sendero de tierra
 *               dificultad:
 *                 type: string
 *                 description: Nivel de dificultad (ej. "Fácil").
 *                 example: Fácil
 *     responses:
 *       201:
 *         description: Ruta creada exitosamente.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Ruta'
 *       400:
 *         description: Datos inválidos o campos obligatorios faltantes.
 *       401:
 *         description: No autorizado.
 *       403:
 *         description: Acceso denegado.
 *       500:
 *         description: Error del servidor.
 */

/**
 * @swagger
 * /rutas/{id}:
 *   get:
 *     summary: Obtener una ruta geográfica por su ID
 *     tags: [Rutas]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: ID de la ruta a obtener.
 *         example: 60d0fe4f5e2a2b0015b7b7a1
 *     responses:
 *       200:
 *         description: Información de la ruta obtenida exitosamente.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Ruta'
 *       404:
 *         description: Ruta no encontrada.
 *       500:
 *         description: Error del servidor.
 *   put:
 *     summary: Actualizar una ruta geográfica existente (requiere rol de admin)
 *     tags: [Rutas]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: ID de la ruta a actualizar.
 *         example: 60d0fe4f5e2a2b0015b7b7a1
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               nombre:
 *                 type: string
 *                 description: Nuevo nombre de la ruta.
 *                 example: Sendero La Cascada
 *               descripcion:
 *                 type: string
 *                 description: Nueva descripción de la ruta.
 *                 example: Ruta de dificultad moderada con vistas a una cascada.
 *               geojson:
 *                 $ref: '#/components/schemas/GeoJSONLineString'
 *               distancia:
 *                 type: string
 *                 description: Nueva distancia de la ruta.
 *                 example: 3.0 km
 *               terreno:
 *                 type: string
 *                 description: Nuevo tipo de terreno.
 *                 example: Montaña
 *               dificultad:
 *                 type: string
 *                 description: Nuevo nivel de dificultad.
 *                 example: Moderada
 *     responses:
 *       200:
 *         description: Ruta actualizada exitosamente.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Ruta'
 *       400:
 *         description: Datos inválidos.
 *       401:
 *         description: No autorizado.
 *       403:
 *         description: Acceso denegado.
 *       404:
 *         description: Ruta no encontrada.
 *       500:
 *         description: Error del servidor.
 *   delete:
 *     summary: Eliminar una ruta geográfica por su ID (requiere rol de admin)
 *     tags: [Rutas]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: ID de la ruta a eliminar.
 *         example: 60d0fe4f5e2a2b0015b7b7a1
 *     responses:
 *       200:
 *         description: Ruta eliminada exitosamente.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 mensaje:
 *                   type: string
 *                   example: Ruta eliminada exitosamente.
 *       401:
 *         description: No autorizado.
 *       403:
 *         description: Acceso denegado.
 *       404:
 *         description: Ruta no encontrada.
 *       500:
 *         description: Error del servidor.
 */

router.route('/')
  .get(obtenerRutas)
  .post(protegerRuta, autorizarRoles('admin'), crearRuta);

router.route('/:id')
  .get(obtenerRutaPorId)
  .put(protegerRuta, autorizarRoles('admin'), actualizarRuta)
  .delete(protegerRuta, autorizarRoles('admin'), eliminarRuta);

export default router;