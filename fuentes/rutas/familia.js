import express from 'express';
import {
  obtenerFamilias,
  obtenerFamiliaPorId,
  crearFamilia,
  actualizarFamilia,
  eliminarFamilia,
  alternarArchivoFamilia
} from '../controladores/familia.js';
import protegerRuta from '../intermedios/autenticacionJWT.js';
import autorizarRoles from '../intermedios/autorizacion.js';
import { subirImagen } from '../utilidades/manejadorArchivos.js'; // Middleware para subir imágenes

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Familias
 *   description: Gestión de familias de aves
 */

/**
 * @swagger
 * /familias:
 *   get:
 *     summary: Obtener todas las familias de aves
 *     tags: [Familias]
 *     parameters:
 *       - in: query
 *         name: incluirArchivadas
 *         schema:
 *           type: boolean
 *         description: Incluir familias archivadas en la respuesta.
 *         example: false
 *     responses:
 *       200:
 *         description: Lista de familias obtenida exitosamente.
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Familia'
 *       500:
 *         description: Error del servidor.
 *   post:
 *     summary: Crear una nueva familia de aves (requiere rol de admin)
 *     tags: [Familias]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required:
 *               - nombre
 *             properties:
 *               nombre:
 *                 type: string
 *                 description: Nombre de la familia de aves.
 *                 example: Colibríes
 *               descripcion:
 *                 type: string
 *                 description: Descripción general de la familia.
 *                 example: Aves pequeñas, conocidas por su vuelo estacionario.
 *               habitatGeneral:
 *                 type: string
 *                 description: Hábitat general (separado por comas si es múltiple).
 *                 example: Bosques, jardines, montañas
 *               dietaGeneral:
 *                 type: string
 *                 description: Dieta general.
 *                 example: Néctar
 *               estadoConservacionGeneral:
 *                 type: string
 *                 description: Estado de conservación.
 *                 example: Preocupación Menor
 *               tagsHabitat:
 *                 type: string
 *                 description: Etiquetas de hábitat (separado por comas).
 *                 example: amazonia, andes, litoral
 *               tagsConservacion:
 *                 type: string
 *                 description: Etiquetas de conservación (separado por comas).
 *                 example: endemico, en-peligro
 *               logo:
 *                 type: string
 *                 format: binary
 *                 description: Archivo de logo de la familia.
 *               ubicacion:
 *                 type: string
 *                 description: Ubicación geográfica general.
 *                 example: América
 *               datosAdicionales:
 *                 type: string
 *                 description: Datos adicionales.
 *                 example: Curiosidades sobre la familia.
 *     responses:
 *       201:
 *         description: Familia creada exitosamente.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Familia'
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
 * /familias/{id}:
 *   get:
 *     summary: Obtener una familia por su ID
 *     tags: [Familias]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: ID de la familia a obtener.
 *         example: 60d0fe4f5e2a2b0015b7b7a1
 *     responses:
 *       200:
 *         description: Información de la familia obtenida exitosamente.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Familia'
 *       404:
 *         description: Familia no encontrada.
 *       500:
 *         description: Error del servidor.
 *   put:
 *     summary: Actualizar una familia existente (requiere rol de admin)
 *     tags: [Familias]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: ID de la familia a actualizar.
 *         example: 60d0fe4f5e2a2b0015b7b7a1
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               nombre:
 *                 type: string
 *                 description: Nuevo nombre de la familia.
 *                 example: Pájaros Carpinteros
 *               descripcion:
 *                 type: string
 *                 description: Nueva descripción general.
 *               habitatGeneral:
 *                 type: string
 *                 description: Nuevo hábitat general (separado por comas).
 *               dietaGeneral:
 *                 type: string
 *                 description: Nueva dieta general.
 *               estadoConservacionGeneral:
 *                 type: string
 *                 description: Nuevo estado de conservación.
 *               tagsHabitat:
 *                 type: string
 *                 description: Nuevas etiquetas de hábitat (separado por comas).
 *               tagsConservacion:
 *                 type: string
 *                 description: Nuevas etiquetas de conservación (separado por comas).
 *               logo:
 *                 type: string
 *                 format: binary
 *                 description: Nuevo archivo de logo de la familia.
 *               ubicacion:
 *                 type: string
 *                 description: Nueva ubicación geográfica general.
 *               datosAdicionales:
 *                 type: string
 *                 description: Nuevos datos adicionales.
 *               isArchived:
 *                 type: boolean
 *                 description: Estado de archivado de la familia.
 *     responses:
 *       200:
 *         description: Familia actualizada exitosamente.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Familia'
 *       400:
 *         description: Datos inválidos.
 *       401:
 *         description: No autorizado.
 *       403:
 *         description: Acceso denegado.
 *       404:
 *         description: Familia no encontrada.
 *       500:
 *         description: Error del servidor.
 *   delete:
 *     summary: Eliminar una familia por su ID (requiere rol de admin)
 *     tags: [Familias]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: ID de la familia a eliminar.
 *         example: 60d0fe4f5e2a2b0015b7b7a1
 *     responses:
 *       200:
 *         description: Familia eliminada exitosamente.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 mensaje:
 *                   type: string
 *                   example: Familia eliminada exitosamente.
 *       401:
 *         description: No autorizado.
 *       403:
 *         description: Acceso denegado.
 *       404:
 *         description: Familia no encontrada.
 *       500:
 *         description: Error del servidor.
 */

/**
 * @swagger
 * /familias/{id}/archivar:
 *   patch:
 *     summary: Archivar o desarchivar una familia (requiere rol de admin)
 *     tags: [Familias]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: ID de la familia a archivar/desarchivar.
 *         example: 60d0fe4f5e2a2b0015b7b7a1
 *     responses:
 *       200:
 *         description: Estado de archivado de la familia actualizado exitosamente.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 mensaje:
 *                   type: string
 *                   example: Familia archivada exitosamente.
 *                 familia:
 *                   $ref: '#/components/schemas/Familia'
 *       401:
 *         description: No autorizado.
 *       403:
 *         description: Acceso denegado.
 *       404:
 *         description: Familia no encontrada.
 *       500:
 *         description: Error del servidor.
 */

router.route('/')
  .get(obtenerFamilias)
  .post(protegerRuta, autorizarRoles('admin'), subirImagen.single('logo'), crearFamilia);

router.route('/:id')
  .get(obtenerFamiliaPorId)
  .put(protegerRuta, autorizarRoles('admin'), subirImagen.single('logo'), actualizarFamilia)
  .delete(protegerRuta, autorizarRoles('admin'), eliminarFamilia);

router.patch('/:id/archivar', protegerRuta, autorizarRoles('admin'), alternarArchivoFamilia);

export default router;