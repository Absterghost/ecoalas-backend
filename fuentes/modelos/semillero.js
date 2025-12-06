import mongoose from 'mongoose';

/**
 * @swagger
 * components:
 *   schemas:
 *     Subseccion:
 *       type: object
 *       required:
 *         - title
 *         - description
 *       properties:
 *         title:
 *           type: string
 *           description: Título de la subsección.
 *           example: Tipos de Polinizadores
 *         description:
 *           type: string
 *           description: Descripción detallada de la subsección.
 *           example: Incluye abejas, mariposas, colibríes, murciélagos.
 *     Semillero:
 *       type: object
 *       required:
 *         - title
 *         - description
 *       properties:
 *         _id:
 *           type: string
 *           description: ID único de la sección del semillero.
 *           example: 60d0fe4f5e2a2b0015b7b7a1
 *         title:
 *           type: string
 *           description: Título de la sección.
 *           example: Importancia de los Polinizadores
 *         description:
 *           type: string
 *           description: Descripción principal de la sección.
 *           example: Los polinizadores son cruciales para la biodiversidad.
 *         subsections:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/Subseccion'
 *           description: Lista de subsecciones con contenido más específico.
 *         images:
 *           type: array
 *           items:
 *             type: string
 *           description: URLs o rutas a las imágenes de la sección.
 *           example: ["/uploads/imagen1.jpg", "/uploads/imagen2.png"]
 *         isArchived:
 *           type: boolean
 *           description: Indica si la sección ha sido archivada (soft-delete).
 *           example: false
 *         createdAt:
 *           type: string
 *           format: date-time
 *           description: Marca de tiempo de creación del documento.
 *           example: 2023-01-15T10:30:00.000Z
 *         updatedAt:
 *           type: string
 *           format: date-time
 *           description: Marca de tiempo de la última actualización del documento.
 *           example: 2023-01-15T11:00:00.000Z
 */
// Esquema para las subsecciones
const subseccionSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    required: true,
    trim: true
  }
});

// Esquema principal para una sección del semillero
const semilleroSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'El título de la sección es obligatorio'],
    trim: true,
    unique: true
  },
  description: {
    type: String,
    required: [true, 'La descripción es obligatoria'],
    trim: true
  },
  subsections: [subseccionSchema], // Array de subdocumentos
  images: [{
    type: String // Array de URLs o rutas a las imágenes
  }],
  isArchived: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true // Añade createdAt y updatedAt automáticamente
});

const Semillero = mongoose.model('Semillero', semilleroSchema);

export default Semillero;