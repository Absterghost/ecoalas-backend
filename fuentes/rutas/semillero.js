import express from 'express';
import {
  obtenerSeccionesSemillero,
  obtenerSeccionSemilleroPorId,
  crearSeccionSemillero,
  actualizarSeccionSemillero,
  eliminarSeccionSemillero,
  alternarArchivoSeccionSemillero
} from '../controladores/semillero.js';
import protegerRuta from '../intermedios/autenticacionJWT.js';
import autorizarRoles from '../intermedios/autorizacion.js';
import { subirImagen } from '../utilidades/manejadorArchivos.js'; // Middleware para subir imágenes

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Semillero
 *   description: Gestión de secciones de contenido para el módulo "Semillero"
 */

/**
 * @swagger
 * /semillero:
 *   get:
 *     summary: Obtener todas las secciones del semillero
 *     tags: [Semillero]
 *     parameters:
 *       - in: query
 *         name: incluirArchivadas
 *         schema:
 *           type: boolean
 *         description: Incluir secciones archivadas en la respuesta.
 *         example: false
 *     responses:
 *       200:
 *         description: Lista de secciones del semillero obtenida exitosamente.
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Semillero'
 *       500:
 *         description: Error del servidor.
 *   post:
 *     summary: Crear una nueva sección del semillero (requiere rol de admin)
 *     tags: [Semillero]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required:
 *               - title
 *               - description
 *             properties:
 *               title:
 *                 type: string
 *                 description: Título de la sección.
 *                 example: Importancia de los Polinizadores
 *               description:
 *                 type: string
 *                 description: Descripción principal de la sección.
 *                 example: Texto explicativo sobre la función de los polinizadores.
 *               subsections:
 *                 type: string
 *                 description: JSON string de un array de subsecciones.
 *                 example: '[{"title":"Tipos de polinizadores","description":"Abejas, mariposas, colibríes."}]'
 *               images:
 *                 type: array
 *                 items:
 *                   type: string
 *                   format: binary
 *                 description: Array de archivos de imagen para la sección (hasta 25).
 *     responses:
 *       201:
 *         description: Sección creada exitosamente.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Semillero'
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
 * /semillero/{id}:
 *   get:
 *     summary: Obtener una sección del semillero por su ID
 *     tags: [Semillero]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: ID de la sección a obtener.
 *         example: 60d0fe4f5e2a2b0015b7b7a1
 *     responses:
 *       200:
 *         description: Información de la sección obtenida exitosamente.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Semillero'
 *       404:
 *         description: Sección no encontrada.
 *       500:
 *         description: Error del servidor.
 *   put:
 *     summary: Actualizar una sección del semillero existente (requiere rol de admin)
 *     tags: [Semillero]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: ID de la sección a actualizar.
 *         example: 60d0fe4f5e2a2b0015b7b7a1
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *                 description: Nuevo título de la sección.
 *                 example: Conservación de Especies Nativas
 *               description:
 *                 type: string
 *                 description: Nueva descripción principal de la sección.
 *               subsections:
 *                 type: string
 *                 description: Nuevo JSON string de un array de subsecciones.
 *               images:
 *                 type: array
 *                 items:
 *                   type: string
 *                   format: binary
 *                 description: Array de nuevos archivos de imagen para la sección (hasta 25).
 *               isArchived:
 *                 type: boolean
 *                 description: Estado de archivado de la sección.
 *     responses:
 *       200:
 *         description: Sección actualizada exitosamente.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Semillero'
 *       400:
 *         description: Datos inválidos.
 *       401:
 *         description: No autorizado.
 *       403:
 *         description: Acceso denegado.
 *       404:
 *         description: Sección no encontrada.
 *       500:
 *         description: Error del servidor.
 *   delete:
 *     summary: Eliminar una sección del semillero por su ID (requiere rol de admin)
 *     tags: [Semillero]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: ID de la sección a eliminar.
 *         example: 60d0fe4f5e2a2b0015b7b7a1
 *     responses:
 *       200:
 *         description: Sección eliminada exitosamente.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 mensaje:
 *                   type: string
 *                   example: Sección eliminada exitosamente.
 *       401:
 *         description: No autorizado.
 *       403:
 *         description: Acceso denegado.
 *       404:
 *         description: Sección no encontrada.
 *       500:
 *         description: Error del servidor.
 */

/**
 * @swagger
 * /semillero/{id}/archivar:
 *   patch:
 *     summary: Archivar o desarchivar una sección del semillero (requiere rol de admin)
 *     tags: [Semillero]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: ID de la sección a archivar/desarchivar.
 *         example: 60d0fe4f5e2a2b0015b7b7a1
 *     responses:
 *       200:
 *         description: Estado de archivado de la sección actualizado exitosamente.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 mensaje:
 *                   type: string
 *                   example: Sección archivada exitosamente.
 *                 seccion:
 *                   $ref: '#/components/schemas/Semillero'
 *       401:
 *         description: No autorizado.
 *       403:
 *         description: Acceso denegado.
 *       404:
 *         description: Sección no encontrada.
 *       500:
 *         description: Error del servidor.
 */

router.route('/')
  .get(obtenerSeccionesSemillero)
  .post(protegerRuta, autorizarRoles('admin'), subirImagen.array('images', 25), crearSeccionSemillero);

router.route('/:id')
  .get(obtenerSeccionSemilleroPorId)
  .put(protegerRuta, autorizarRoles('admin'), subirImagen.array('images', 25), actualizarSeccionSemillero)
  .delete(protegerRuta, autorizarRoles('admin'), eliminarSeccionSemillero);

router.patch('/:id/archivar', protegerRuta, autorizarRoles('admin'), alternarArchivoSeccionSemillero);

export default router;