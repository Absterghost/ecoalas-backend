import express from 'express';
import {
  registrarUsuario,
  iniciarSesion,
  cerrarSesion,
  obtenerPerfilUsuario
} from '../controladores/autenticacion.js';
import protegerRuta from '../intermedios/autenticacionJWT.js';

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Autenticación
 *   description: Gestión de usuarios y autenticación
 */

/**
 * @swagger
 * /autenticacion/registro:
 *   post:
 *     summary: Registrar un nuevo usuario
 *     tags: [Autenticación]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - nombreUsuario
 *               - contrasena
 *             properties:
 *               nombreUsuario:
 *                 type: string
 *                 description: Nombre de usuario único
 *                 example: nuevoUsuario
 *               contrasena:
 *                 type: string
 *                 description: Contraseña del usuario (mínimo 6 caracteres)
 *                 example: password123
 *     responses:
 *       201:
 *         description: Usuario registrado exitosamente. Retorna el token JWT.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 _id:
 *                   type: string
 *                   example: 60d0fe4f5e2a2b0015b7b7a1
 *                 nombreUsuario:
 *                   type: string
 *                   example: nuevoUsuario
 *                 rol:
 *                   type: string
 *                   example: usuario
 *                 token:
 *                   type: string
 *                   example: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
 *                 mensaje:
 *                   type: string
 *                   example: Usuario registrado exitosamente.
 *       400:
 *         description: Campos obligatorios faltantes o nombre de usuario ya registrado.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 mensaje:
 *                   type: string
 *                   example: El nombre de usuario ya está registrado.
 *       500:
 *         description: Error del servidor.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 mensaje:
 *                   type: string
 *                   example: Error del servidor al registrar usuario.
 */
router.post('/registro', registrarUsuario);
/**
 * @swagger
 * /autenticacion/login:
 *   post:
 *     summary: Iniciar sesión de usuario
 *     tags: [Autenticación]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - nombreUsuario
 *               - contrasena
 *             properties:
 *               nombreUsuario:
 *                 type: string
 *                 description: Nombre de usuario registrado
 *                 example: usuarioExistente
 *               contrasena:
 *                 type: string
 *                 description: Contraseña del usuario
 *                 example: password123
 *     responses:
 *       200:
 *         description: Inicio de sesión exitoso. Retorna el token JWT.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 _id:
 *                   type: string
 *                   example: 60d0fe4f5e2a2b0015b7b7a1
 *                 nombreUsuario:
 *                   type: string
 *                   example: usuarioExistente
 *                 rol:
 *                   type: string
 *                   example: usuario
 *                 token:
 *                   type: string
 *                   example: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
 *                 mensaje:
 *                   type: string
 *                   example: Inicio de sesión exitoso.
 *       401:
 *         description: Credenciales inválidas.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 mensaje:
 *                   type: string
 *                   example: Credenciales inválidas.
 *       500:
 *         description: Error del servidor.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 mensaje:
 *                   type: string
 *                   example: Error del servidor al iniciar sesión.
 */
router.post('/login', iniciarSesion);
/**
 * @swagger
 * /autenticacion/logout:
 *   post:
 *     summary: Cerrar sesión de usuario (eliminación de token en cliente)
 *     tags: [Autenticación]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Sesión cerrada exitosamente (el token debe ser eliminado por el cliente).
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 mensaje:
 *                   type: string
 *                   example: Sesión cerrada exitosamente (token debe ser eliminado por el cliente).
 *       500:
 *         description: Error del servidor.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 mensaje:
 *                   type: string
 *                   example: Error del servidor al cerrar sesión.
 */
router.post('/logout', cerrarSesion); // La lógica principal de logout es del cliente, pero este endpoint puede servir de confirmación o para invalidación en el futuro.
/**
 * @swagger
 * /autenticacion/perfil:
 *   get:
 *     summary: Obtener el perfil del usuario autenticado
 *     tags: [Autenticación]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Datos del perfil del usuario.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 _id:
 *                   type: string
 *                   example: 60d0fe4f5e2a2b0015b7b7a1
 *                 nombreUsuario:
 *                   type: string
 *                   example: usuarioExistente
 *                 rol:
 *                   type: string
 *                   example: usuario
 *                 fechaRegistro:
 *                   type: string
 *                   format: date-time
 *                   example: 2023-10-27T10:00:00.000Z
 *       401:
 *         description: No autorizado - Token no proporcionado o inválido.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 mensaje:
 *                   type: string
 *                   example: No autorizado, no hay token.
 *       403:
 *         description: Acceso denegado - Token inválido o expirado.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 mensaje:
 *                   type: string
 *                   example: Acceso denegado, token inválido.
 *       404:
 *         description: Usuario no encontrado.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 mensaje:
 *                   type: string
 *                   example: Usuario no encontrado.
 *       500:
 *         description: Error del servidor.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 mensaje:
 *                   type: string
 *                   example: Error del servidor al obtener perfil.
 */
router.get('/perfil', protegerRuta, obtenerPerfilUsuario);

export default router;