import mongoose from 'mongoose';

/**
 * @swagger
 * components:
 *   schemas:
 *     Avistamiento:
 *       type: object
 *       required:
 *         - usuario
 *         - ave
 *         - ubicacion
 *         - fechaAvistamiento
 *       properties:
 *         _id:
 *           type: string
 *           description: ID único del avistamiento.
 *           example: 60d0fe4f5e2a2b0015b7b7a1
 *         usuario:
 *           type: string
 *           description: ID del usuario que realizó el avistamiento.
 *           example: 60d0fe4f5e2a2b0015b7b7a2
 *         ave:
 *           type: string
 *           description: ID del ave avistada.
 *           example: 60d0fe4f5e2a2b0015b7b7a3
 *         ubicacion:
 *           $ref: '#/components/schemas/GeoJSONPoint'
 *           description: Ubicación geográfica exacta del avistamiento en formato GeoJSON Point.
 *         fechaAvistamiento:
 *           type: string
 *           format: date-time
 *           description: Fecha y hora en que se realizó el avistamiento.
 *           example: 2023-10-27T14:30:00.000Z
 *         descripcion:
 *           type: string
 *           description: Descripción opcional del avistamiento.
 *           example: Observado un ejemplar macho en buen estado de salud.
 *           maxLength: 500
 *         foto:
 *           type: string
 *           description: URL o ruta de la foto del avistamiento.
 *           example: /uploads/avistamiento_colibri_2023.jpg
 *         fechaRegistro:
 *           type: string
 *           format: date-time
 *           description: Fecha de registro del avistamiento en el sistema.
 *           example: 2023-10-27T15:00:00.000Z
 *         createdAt:
 *           type: string
 *           format: date-time
 *           description: Marca de tiempo de creación del documento.
 *           example: 2023-10-27T15:00:00.000Z
 *         updatedAt:
 *           type: string
 *           format: date-time
 *           description: Marca de tiempo de la última actualización del documento.
 *           example: 2023-10-27T15:05:00.000Z
 */
const avistamientoSchema = new mongoose.Schema({
  usuario: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Usuario',
    required: [true, 'El usuario que registra el avistamiento es obligatorio']
  },
  ave: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Ave',
    required: [true, 'El ave avistada es obligatoria']
  },
  // GeoJSON 'Point' para la ubicación exacta del avistamiento
  ubicacion: {
    type: {
      type: String,
      enum: ['Point'],
      required: true
    },
    coordinates: {
      type: [Number], // [longitud, latitud]
      required: 'Las coordenadas de ubicación son obligatorias',
      index: '2dsphere' // Índice geoespacial
    }
  },
  fechaAvistamiento: {
    type: Date,
    required: [true, 'La fecha del avistamiento es obligatoria'],
    default: Date.now
  },
  descripcion: {
    type: String,
    trim: true,
    maxlength: [500, 'La descripción no puede exceder los 500 caracteres']
  },
  foto: {
    type: String, // URL o ruta de la foto del avistamiento
    default: '/uploads/default_avistamiento.png'
  },
  fechaRegistro: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true // Añade createdAt y updatedAt automáticamente
});

const Avistamiento = mongoose.model('Avistamiento', avistamientoSchema);

export default Avistamiento;