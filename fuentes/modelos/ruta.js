import mongoose from 'mongoose';

/**
 * @swagger
 * components:
 *   schemas:
 *     GeoJSONPoint:
 *       type: object
 *       required:
 *         - type
 *         - coordinates
 *       properties:
 *         type:
 *           type: string
 *           enum: [Point]
 *           example: Point
 *         coordinates:
 *           type: array
 *           items:
 *             type: number
 *           minItems: 2
 *           maxItems: 2
 *           description: Longitud y latitud [longitude, latitude].
 *           example: [-75.56, 5.07]
 *     GeoJSONLineString:
 *       type: object
 *       required:
 *         - type
 *         - coordinates
 *       properties:
 *         type:
 *           type: string
 *           enum: [LineString]
 *           example: LineString
 *         coordinates:
 *           type: array
 *           items:
 *             type: array
 *             items:
 *               type: number
 *             minItems: 2
 *             maxItems: 2
 *           description: Array de coordenadas [longitude, latitude] formando una línea.
 *           example: [[-75.56, 5.07], [-75.57, 5.08], [-75.58, 5.07]]
 *     GeoJSONPolygon:
 *       type: object
 *       required:
 *         - type
 *         - coordinates
 *       properties:
 *         type:
 *           type: string
 *           enum: [Polygon]
 *           example: Polygon
 *         coordinates:
 *           type: array
 *           items:
 *             type: array
 *             items:
 *               type: array
 *               items:
 *                 type: number
 *               minItems: 2
 *               maxItems: 2
 *           description: Array de arrays de coordenadas formando un polígono.
 *           example: [[[-75.56, 5.07], [-75.57, 5.08], [-75.58, 5.07], [-75.56, 5.07]]]
 *     Ruta:
 *       type: object
 *       required:
 *         - nombre
 *         - geojson
 *       properties:
 *         _id:
 *           type: string
 *           description: ID único de la ruta.
 *           example: 60d0fe4f5e2a2b0015b7b7a1
 *         nombre:
 *           type: string
 *           description: Nombre de la ruta.
 *           example: Sendero del Quindío
 *         descripcion:
 *           type: string
 *           description: Descripción detallada de la ruta.
 *           example: Una ruta escénica a través de la región cafetera.
 *         geojson:
 *           oneOf:
 *             - $ref: '#/components/schemas/GeoJSONLineString'
 *             - $ref: '#/components/schemas/GeoJSONPolygon'
 *           description: Datos geográficos de la ruta en formato GeoJSON.
 *         distancia:
 *           type: string
 *           description: Distancia total de la ruta.
 *           example: 10.5 km
 *         terreno:
 *           type: string
 *           description: Tipo de terreno (ej. montañoso, plano).
 *           example: Montañoso
 *         dificultad:
 *           type: string
 *           description: Nivel de dificultad (ej. fácil, moderada, difícil).
 *           example: Moderada
 *         fechaCreacion:
 *           type: string
 *           format: date-time
 *           description: Fecha de creación del registro.
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
const rutaSchema = new mongoose.Schema({
  nombre: {
    type: String,
    required: [true, 'El nombre de la ruta es obligatorio'],
    unique: true,
    trim: true
  },
  descripcion: {
    type: String,
    trim: true
  },
  // GeoJSON 'LineString' para las coordenadas de la ruta
  geojson: {
    type: {
      type: String,
      enum: ['LineString', 'Polygon'], // Las rutas pueden ser LineString o Polygon (para límites)
      required: true
    },
    coordinates: {
      type: Array, // Array de [longitud, latitud] para LineString, o array de arrays para Polygon
      required: 'Las coordenadas GeoJSON son obligatorias'
    }
  },
  distancia: {
    type: String, // Se guarda como string (ej: "15.2 km")
    trim: true
  },
  terreno: {
    type: String,
    trim: true
  },
  dificultad: {
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

// Crear un índice geoespacial en el campo geojson.coordinates para consultas eficientes
rutaSchema.index({ geojson: '2dsphere' });

const Ruta = mongoose.model('Ruta', rutaSchema);

export default Ruta;