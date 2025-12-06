import Avistamiento from '../modelos/avistamiento.js';
import Usuario from '../modelos/usuario.js'; // Para verificar si el usuario existe
import Ave from '../modelos/ave.js'; // Para verificar si el ave existe
import { UPLOADS_DIR } from '../utilidades/manejadorArchivos.js'; // Para manejar la ruta de los archivos
import fs from 'fs';
import path from 'path';

// @desc    Obtener todos los avistamientos
// @route   GET /api/avistamientos
// @access  Public
const obtenerAvistamientos = async (req, res) => {
  try {
    const avistamientos = await Avistamiento.find({})
      .populate('usuario', 'nombreUsuario')
      .populate('ave', 'nombre');
    res.status(200).json(avistamientos);
  } catch (error) {
    console.error(error);
    res.status(500).json({ mensaje: 'Error del servidor al obtener avistamientos.' });
  }
};

// @desc    Obtener un avistamiento por ID
// @route   GET /api/avistamientos/:id
// @access  Public
const obtenerAvistamientoPorId = async (req, res) => {
  try {
    const avistamiento = await Avistamiento.findById(req.params.id)
      .populate('usuario', 'nombreUsuario')
      .populate('ave', 'nombre');

    if (!avistamiento) {
      return res.status(404).json({ mensaje: 'Avistamiento no encontrado.' });
    }
    res.status(200).json(avistamiento);
  } catch (error) {
    console.error(error);
    res.status(500).json({ mensaje: 'Error del servidor al obtener el avistamiento.' });
  }
};

// @desc    Crear un nuevo avistamiento
// @route   POST /api/avistamientos
// @access  Private (Usuario autenticado)
const crearAvistamiento = async (req, res) => {
  const { ave, ubicacion, fechaAvistamiento, descripcion } = req.body;
  const usuario = req.usuario._id; // ID del usuario autenticado

  if (!usuario || !ave || !ubicacion || !fechaAvistamiento) {
    return res.status(400).json({ mensaje: 'Faltan campos obligatorios: usuario, ave, ubicación y fecha.' });
  }

  try {
    // Verificar si el ave y el usuario existen
    const aveExiste = await Ave.findById(ave);
    if (!aveExiste) {
      return res.status(400).json({ mensaje: 'El ave especificada no existe.' });
    }
    const usuarioExiste = await Usuario.findById(usuario);
    if (!usuarioExiste) {
      return res.status(400).json({ mensaje: 'El usuario especificado no existe.' });
    }

    // Validar GeoJSON de ubicación
    if (!ubicacion.type || ubicacion.type !== 'Point' || !ubicacion.coordinates || !Array.isArray(ubicacion.coordinates) || ubicacion.coordinates.length !== 2) {
      return res.status(400).json({ mensaje: 'Formato GeoJSON de ubicación inválido. Se espera un Point [longitud, latitud].' });
    }

    const fotoPath = req.file ? `/uploads/${req.file.filename}` : '/uploads/default_avistamiento.png';

    const nuevoAvistamiento = await Avistamiento.create({
      usuario,
      ave,
      ubicacion,
      fechaAvistamiento,
      descripcion,
      foto: fotoPath,
    });

    res.status(201).json(nuevoAvistamiento);
  } catch (error) {
    console.error(error);
    res.status(500).json({ mensaje: 'Error del servidor al crear el avistamiento.' });
  }
};

// @desc    Actualizar un avistamiento existente
// @route   PUT /api/avistamientos/:id
// @access  Private (Usuario autenticado - solo puede actualizar sus avistamientos o admins)
const actualizarAvistamiento = async (req, res) => {
  const { ave, ubicacion, fechaAvistamiento, descripcion } = req.body;

  try {
    const avistamiento = await Avistamiento.findById(req.params.id);

    if (!avistamiento) {
      return res.status(404).json({ mensaje: 'Avistamiento no encontrado.' });
    }

    // Verificar si el usuario es el dueño del avistamiento o un admin
    if (avistamiento.usuario.toString() !== req.usuario._id.toString() && req.usuario.rol !== 'admin') {
      return res.status(403).json({ mensaje: 'No autorizado para actualizar este avistamiento.' });
    }

    // Verificar si el ave existe si se proporciona una nueva
    if (ave && ave.toString() !== avistamiento.ave.toString()) {
        const aveExiste = await Ave.findById(ave);
        if (!aveExiste) {
            return res.status(400).json({ mensaje: 'El ave especificada no existe.' });
        }
    }

    // Validar GeoJSON de ubicación si se envía
    if (ubicacion && (!ubicacion.type || ubicacion.type !== 'Point' || !ubicacion.coordinates || !Array.isArray(ubicacion.coordinates) || ubicacion.coordinates.length !== 2)) {
      return res.status(400).json({ mensaje: 'Formato GeoJSON de ubicación inválido. Se espera un Point [longitud, latitud].' });
    }

    // Manejo de la imagen
    if (req.file) {
      if (avistamiento.foto && avistamiento.foto !== '/uploads/default_avistamiento.png') {
        const oldImagePath = path.join(UPLOADS_DIR, path.basename(avistamiento.foto));
        if (fs.existsSync(oldImagePath)) {
          fs.unlinkSync(oldImagePath);
        }
      }
      avistamiento.foto = `/uploads/${req.file.filename}`;
    }

    avistamiento.ave = ave || avistamiento.ave;
    avistamiento.ubicacion = ubicacion || avistamiento.ubicacion;
    avistamiento.fechaAvistamiento = fechaAvistamiento || avistamiento.fechaAvistamiento;
    avistamiento.descripcion = descripcion || avistamiento.descripcion;

    const avistamientoActualizado = await avistamiento.save();
    res.status(200).json(avistamientoActualizado);
  } catch (error) {
    console.error(error);
    res.status(500).json({ mensaje: 'Error del servidor al actualizar el avistamiento.' });
  }
};

// @desc    Eliminar un avistamiento
// @route   DELETE /api/avistamientos/:id
// @access  Private (Usuario autenticado - solo puede eliminar sus avistamientos o admins)
const eliminarAvistamiento = async (req, res) => {
  try {
    const avistamiento = await Avistamiento.findById(req.params.id);

    if (!avistamiento) {
      return res.status(404).json({ mensaje: 'Avistamiento no encontrado.' });
    }

    // Verificar si el usuario es el dueño del avistamiento o un admin
    if (avistamiento.usuario.toString() !== req.usuario._id.toString() && req.usuario.rol !== 'admin') {
      return res.status(403).json({ mensaje: 'No autorizado para eliminar este avistamiento.' });
    }

    // Eliminar el archivo de foto si no es el por defecto
    if (avistamiento.foto && avistamiento.foto !== '/uploads/default_avistamiento.png') {
        const imagePath = path.join(UPLOADS_DIR, path.basename(avistamiento.foto));
        if (fs.existsSync(imagePath)) {
            fs.unlinkSync(imagePath);
        }
    }

    await Avistamiento.deleteOne({ _id: req.params.id });
    res.status(200).json({ mensaje: 'Avistamiento eliminado exitosamente.' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ mensaje: 'Error del servidor al eliminar el avistamiento.' });
  }
};

export {
  obtenerAvistamientos,
  obtenerAvistamientoPorId,
  crearAvistamiento,
  actualizarAvistamiento,
  eliminarAvistamiento
};
