import mongoose from 'mongoose';

/**
 * @swagger
 * components:
 *   schemas:
 *     Ave:
 *       type: object
 *       required:
 *         - familia
 *         - nombre
 *       properties:
 *         _id:
 *           type: string
 *           description: ID único del ave.
 *           example: 60d0fe4f5e2a2b0015b7b7a1
 *         familia:
 *           type: string
 *           description: ID de la familia a la que pertenece el ave.
 *           example: 60d0fe4f5e2a2b0015b7b7a2
 *         nombre:
 *           type: string
 *           description: Nombre del ave.
 *           example: Colibrí Esmeralda
 *         imagen:
 *           type: string
 *           description: URL o ruta a la imagen del ave.
 *           example: /uploads/colibri_esmeralda.jpg
 *         habitat:
 *           type: string
 *           description: Descripción del hábitat del ave.
 *           example: Bosques húmedos tropicales de Colombia
 *         dieta:
 *           type: string
 *           description: Descripción de la dieta del ave.
 *           example: Néctar de flores, pequeños insectos.
 *         conservacion:
 *           type: string
 *           description: Estado de conservación del ave (ej. "Preocupación Menor").
 *           example: Preocupación Menor
 *         fechaCreacion:
 *           type: string
 *           format: date-time
 *           description: Fecha de creación del registro del ave.
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
const aveSchema = new mongoose.Schema({
  familia: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Familia', // Referencia al modelo Familia
    required: [true, 'La familia del ave es obligatoria']
  },
  nombre: {
    type: String,
    required: [true, 'El nombre del ave es obligatorio'],
    trim: true,
    unique: true // Asegura que el nombre del ave sea único
  },
  imagen: {
    type: String, // URL o ruta de la imagen
    default: '/uploads/default_ave.png'
  },
  habitat: {
    type: String,
    trim: true
  },
  dieta: {
    type: String,
    trim: true
  },
  conservacion: {
    type: String,
    trim: true
  },
  fechaCreacion: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true // Añade createdAt y updatedAt automáticamente
});

const Ave = mongoose.model('Ave', aveSchema);

export default Ave;