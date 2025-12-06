import express from 'express';
import {
  obtenerAves,
  obtenerAvePorId,
  crearAve,
  actualizarAve,
  eliminarAve
} from '../controladores/ave.js';
import protegerRuta from '../intermedios/autenticacionJWT.js';
import autorizarRoles from '../intermedios/autorizacion.js';
import { subirImagen } from '../utilidades/manejadorArchivos.js'; // Middleware para subir imágenes

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Aves
 *   description: Gestión de información sobre aves
 */

/**
 * @swagger
 * /aves:
 *   get:
 *     summary: Obtener todas las aves
 *     tags: [Aves]
 *     responses:
 *       200:
 *         description: Lista de aves obtenida exitosamente.
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Ave'
 *       500:
 *         description: Error del servidor.
 *   post:
 *     summary: Crear una nueva ave (requiere rol de admin)
 *     tags: [Aves]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required:
 *               - familia
 *               - nombre
 *             properties:
 *               familia:
 *                 type: string
 *                 description: ID de la familia a la que pertenece el ave.
 *                 example: 60d0fe4f5e2a2b0015b7b7a1
 *               nombre:
 *                 type: string
 *                 description: Nombre del ave.
 *                 example: Colibrí Esmeralda
 *               imagen:
 *                 type: string
 *                 format: binary
 *                 description: Archivo de imagen del ave (JPG, PNG, GIF, WEBP).
 *               habitat:
 *                 type: string
 *                 description: Descripción del hábitat del ave.
 *                 example: Bosques húmedos tropicales
 *               dieta:
 *                 type: string
 *                 description: Dieta principal del ave.
 *                 example: Néctar, pequeños insectos
 *               conservacion:
 *                 type: string
 *                 description: Estado de conservación (ej. "Preocupación Menor").
 *                 example: Preocupación Menor
 *     responses:
 *       201:
 *         description: Ave creada exitosamente.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Ave'
 *       400:
 *         description: Datos inválidos o campos obligatorios faltantes.
 *       401:
 *         description: No autorizado (token no válido o no proporcionado).
 *       403:
 *         description: Acceso denegado (el usuario no tiene rol de admin).
 *       500:
 *         description: Error del servidor.
 */

/**
 * @swagger
 * /aves/{id}:
 *   get:
 *     summary: Obtener un ave por su ID
 *     tags: [Aves]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: ID del ave a obtener.
 *         example: 60d0fe4f5e2a2b0015b7b7a1
 *     responses:
 *       200:
 *         description: Información del ave obtenida exitosamente.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Ave'
 *       404:
 *         description: Ave no encontrada.
 *       500:
 *         description: Error del servidor.
 *   put:
 *     summary: Actualizar un ave existente (requiere rol de admin)
 *     tags: [Aves]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: ID del ave a actualizar.
 *         example: 60d0fe4f5e2a2b0015b7b7a1
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               familia:
 *                 type: string
 *                 description: Nuevo ID de la familia del ave.
 *                 example: 60d0fe4f5e2a2b0015b7b7a2
 *               nombre:
 *                 type: string
 *                 description: Nuevo nombre del ave.
 *                 example: Colibrí Cola-de-Espátula
 *               imagen:
 *                 type: string
 *                 format: binary
 *                 description: Nuevo archivo de imagen del ave (JPG, PNG, GIF, WEBP).
 *               habitat:
 *                 type: string
 *                 description: Nueva descripción del hábitat.
 *                 example: Bosques montanos húmedos
 *               dieta:
 *                 type: string
 *                 description: Nueva dieta.
 *                 example: Néctar, ocasionalmente insectos
 *               conservacion:
 *                 type: string
 *                 description: Nuevo estado de conservación.
 *                 example: Casi Amenazado
 *     responses:
 *       200:
 *         description: Ave actualizada exitosamente.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Ave'
 *       400:
 *         description: Datos inválidos.
 *       401:
 *         description: No autorizado.
 *       403:
 *         description: Acceso denegado.
 *       404:
 *         description: Ave no encontrada.
 *       500:
 *         description: Error del servidor.
 *   delete:
 *     summary: Eliminar un ave por su ID (requiere rol de admin)
 *     tags: [Aves]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: ID del ave a eliminar.
 *         example: 60d0fe4f5e2a2b0015b7b7a1
 *     responses:
 *       200:
 *         description: Ave eliminada exitosamente.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 mensaje:
 *                   type: string
 *                   example: Ave eliminada exitosamente.
 *       401:
 *         description: No autorizado.
 *       403:
 *         description: Acceso denegado.
 *       404:
 *         description: Ave no encontrada.
 *       500:
 *         description: Error del servidor.
 */

router.route('/')
  .get(obtenerAves)
  .post(protegerRuta, autorizarRoles('admin'), subirImagen.single('imagen'), crearAve);

router.route('/:id')
  .get(obtenerAvePorId)
  .put(protegerRuta, autorizarRoles('admin'), subirImagen.single('imagen'), actualizarAve)
  .delete(protegerRuta, autorizarRoles('admin'), eliminarAve);

export default router;