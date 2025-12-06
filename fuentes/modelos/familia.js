import mongoose from 'mongoose';

/**
 * @swagger
 * components:
 *   schemas:
 *     Familia:
 *       type: object
 *       required:
 *         - nombre
 *       properties:
 *         _id:
 *           type: string
 *           description: ID único de la familia.
 *           example: 60d0fe4f5e2a2b0015b7b7a1
 *         nombre:
 *           type: string
 *           description: Nombre de la familia de aves.
 *           example: Trochilidae (Colibríes)
 *         descripcion:
 *           type: string
 *           description: Descripción general de la familia.
 *           example: Familia de aves pequeñas, conocidas por su vuelo estacionario.
 *         habitatGeneral:
 *           type: array
 *           items:
 *             type: string
 *           description: Hábitats generales donde se encuentran estas familias.
 *           example: ["Bosques húmedos", "Jardines", "Montañas"]
 *         dietaGeneral:
 *           type: string
 *           description: Dieta general de las aves de esta familia.
 *           example: Néctar, pequeños insectos.
 *         estadoConservacionGeneral:
 *           type: string
 *           description: Estado de conservación general de la familia.
 *           example: Preocupación Menor
 *         tagsHabitat:
 *           type: array
 *           items:
 *             type: string
 *           description: Etiquetas relacionadas con el hábitat.
 *           example: ["amazonia", "andes"]
 *         tagsConservacion:
 *           type: array
 *           items:
 *             type: string
 *           description: Etiquetas relacionadas con la conservación.
 *           example: ["endemico", "vulnerable"]
 *         logo:
 *           type: string
 *           description: URL o ruta al logo de la familia.
 *           example: /uploads/logo_colibri.png
 *         ubicacion:
 *           type: string
 *           description: Ubicación geográfica general.
 *           example: América
 *         datosAdicionales:
 *           type: string
 *           description: Información adicional o curiosidades.
 *           example: Son los únicos vertebrados capaces de volar hacia atrás.
 *         isArchived:
 *           type: boolean
 *           description: Indica si la familia ha sido archivada (soft-delete).
 *           example: false
 *         fechaCreacion:
 *           type: string
 *           format: date-time
 *           description: Fecha de creación del registro de la familia.
 *           example: 2023-01-15T10:30:00.000Z
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
const familiaSchema = new mongoose.Schema({
  nombre: {
    type: String,
    required: [true, 'El nombre de la familia es obligatorio'],
    unique: true,
    trim: true
  },
  descripcion: {
    type: String,
    trim: true
  },
  habitatGeneral: {
    type: [String], // Array de strings
    default: []
  },
  dietaGeneral: {
    type: String,
    trim: true
  },
  estadoConservacionGeneral: {
    type: String,
    trim: true
  },
  tagsHabitat: {
    type: [String], // Array de strings
    default: []
  },
  tagsConservacion: {
    type: [String], // Array de strings
    default: []
  },
  logo: {
    type: String, // URL o ruta del logo
    default: '/uploads/default_familia.png'
  },
  ubicacion: {
    type: String,
    trim: true // Campo añadido del análisis de EcoAlasContent
  },
  datosAdicionales: {
    type: String,
    trim: true // Campo añadido del análisis de EcoAlasContent
  },
  isArchived: {
    type: Boolean,
    default: false // Campo para soft-delete
  },
  fechaCreacion: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true // Añade createdAt y updatedAt automáticamente
});

const Familia = mongoose.model('Familia', familiaSchema);

export default Familia;