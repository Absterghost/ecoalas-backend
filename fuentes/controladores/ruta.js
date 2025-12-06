import Ruta from '../modelos/ruta.js';
// No se necesita importar manejadorArchivos.js aquí directamente,
// ya que Multer se usará en las rutas para procesar archivos antes de que lleguen aquí.

// @desc    Obtener todas las rutas
// @route   GET /api/rutas
// @access  Public
const obtenerRutas = async (req, res) => {
  try {
    const rutas = await Ruta.find({});
    res.status(200).json(rutas);
  } catch (error) {
    console.error(error);
    res.status(500).json({ mensaje: 'Error del servidor al obtener rutas.' });
  }
};

// @desc    Obtener una sola ruta por ID
// @route   GET /api/rutas/:id
// @access  Public
const obtenerRutaPorId = async (req, res) => {
  try {
    const ruta = await Ruta.findById(req.params.id);

    if (!ruta) {
      return res.status(404).json({ mensaje: 'Ruta no encontrada.' });
    }
    res.status(200).json(ruta);
  } catch (error) {
    console.error(error);
    res.status(500).json({ mensaje: 'Error del servidor al obtener la ruta.' });
  }
};

// @desc    Crear una nueva ruta
// @route   POST /api/rutas
// @access  Admin
const crearRuta = async (req, res) => {
  const { nombre, descripcion, geojson, distancia, terreno, dificultad } = req.body;

  if (!nombre || !geojson) {
    return res.status(400).json({ mensaje: 'Faltan campos obligatorios: nombre y geojson.' });
  }
  
  // Validación básica del GeoJSON
  if (!geojson.type || !geojson.coordinates || !['LineString', 'Polygon'].includes(geojson.type)) {
    return res.status(400).json({ mensaje: 'Formato GeoJSON inválido. Se espera LineString o Polygon.' });
  }

  try {
    const rutaExiste = await Ruta.findOne({ nombre });
    if (rutaExiste) {
      return res.status(400).json({ mensaje: 'Ya existe una ruta con ese nombre.' });
    }

    const nuevaRuta = await Ruta.create({
      nombre,
      descripcion,
      geojson,
      distancia,
      terreno,
      dificultad
    });

    res.status(201).json(nuevaRuta);
  } catch (error) {
    console.error(error);
    res.status(500).json({ mensaje: 'Error del servidor al crear la ruta.' });
  }
};

// @desc    Actualizar una ruta existente
// @route   PUT /api/rutas/:id
// @access  Admin
const actualizarRuta = async (req, res) => {
  const { nombre, descripcion, geojson, distancia, terreno, dificultad } = req.body;

  try {
    const ruta = await Ruta.findById(req.params.id);

    if (!ruta) {
      return res.status(404).json({ mensaje: 'Ruta no encontrada.' });
    }

    // Si se cambia el nombre, verificar que el nuevo nombre no exista ya para otra ruta
    if (nombre && nombre !== ruta.nombre) {
        const nombreExiste = await Ruta.findOne({ nombre });
        if (nombreExiste && nombreExiste._id.toString() !== ruta._id.toString()) {
            return res.status(400).json({ mensaje: 'Ya existe una ruta con ese nombre.' });
        }
    }

    // Validación básica del GeoJSON si se envía
    if (geojson && (!geojson.type || !geojson.coordinates || !['LineString', 'Polygon'].includes(geojson.type))) {
      return res.status(400).json({ mensaje: 'Formato GeoJSON inválido en la actualización. Se espera LineString o Polygon.' });
    }

    ruta.nombre = nombre || ruta.nombre;
    ruta.descripcion = descripcion || ruta.descripcion;
    ruta.geojson = geojson || ruta.geojson;
    ruta.distancia = distancia || ruta.distancia;
    ruta.terreno = terreno || ruta.terreno;
    ruta.dificultad = dificultad || ruta.dificultad;

    const rutaActualizada = await ruta.save();
    res.status(200).json(rutaActualizada);
  } catch (error) {
    console.error(error);
    res.status(500).json({ mensaje: 'Error del servidor al actualizar la ruta.' });
  }
};

// @desc    Eliminar una ruta
// @route   DELETE /api/rutas/:id
// @access  Admin
const eliminarRuta = async (req, res) => {
  try {
    const ruta = await Ruta.findById(req.params.id);

    if (!ruta) {
      return res.status(404).json({ mensaje: 'Ruta no encontrada.' });
    }

    await Ruta.deleteOne({ _id: req.params.id });
    res.status(200).json({ mensaje: 'Ruta eliminada exitosamente.' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ mensaje: 'Error del servidor al eliminar la ruta.' });
  }
};

export {
  obtenerRutas,
  obtenerRutaPorId,
  crearRuta,
  actualizarRuta,
  eliminarRuta
};
