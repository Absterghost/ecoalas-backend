import Semillero from '../modelos/semillero.js';
import { UPLOADS_DIR } from '../utilidades/manejadorArchivos.js'; // Para manejar la ruta de los archivos
import fs from 'fs';
import path from 'path';

// @desc    Obtener todas las secciones del semillero
// @route   GET /api/semillero
// @access  Public
const obtenerSeccionesSemillero = async (req, res) => {
  try {
    const filtro = {}; // Ignorar el filtro de isArchived temporalmente
    const secciones = await Semillero.find(filtro);
    res.status(200).json(secciones);
  } catch (error) {
    console.error(error);
    res.status(500).json({ mensaje: 'Error del servidor al obtener las secciones del semillero.' });
  }
};

// @desc    Obtener una sección del semillero por ID
// @route   GET /api/semillero/:id
// @access  Public
const obtenerSeccionSemilleroPorId = async (req, res) => {
  try {
    const seccion = await Semillero.findById(req.params.id);
    if (!seccion) {
      return res.status(404).json({ mensaje: 'Sección del semillero no encontrada.' });
    }
    res.status(200).json(seccion);
  } catch (error) {
    console.error(error);
    res.status(500).json({ mensaje: 'Error del servidor al obtener la sección del semillero.' });
  }
};

// @desc    Crear una nueva sección del semillero
// @route   POST /api/semillero
// @access  Admin
const crearSeccionSemillero = async (req, res) => {
  const { title, description, subsections } = req.body;

  if (!title || !description) {
    return res.status(400).json({ mensaje: 'Los campos título y descripción son obligatorios.' });
  }

  try {
    const seccionExiste = await Semillero.findOne({ title });
    if (seccionExiste) {
      return res.status(400).json({ mensaje: 'Ya existe una sección con ese título.' });
    }

    // req.files es un array de archivos si se usó .array() en Multer
    const imagePaths = req.files ? req.files.map(file => `/uploads/${file.filename}`) : [];

    const nuevaSeccion = await Semillero.create({
      title,
      description,
      subsections: JSON.parse(subsections || '[]'), // Las subsecciones pueden venir como string JSON desde form-data
      images: imagePaths,
    });

    res.status(201).json(nuevaSeccion);
  } catch (error) {
    console.error(error);
    res.status(500).json({ mensaje: 'Error del servidor al crear la sección del semillero.' });
  }
};

// @desc    Actualizar una sección del semillero
// @route   PUT /api/semillero/:id
// @access  Admin
const actualizarSeccionSemillero = async (req, res) => {
  const { title, description, subsections, isArchived } = req.body;

  try {
    const seccion = await Semillero.findById(req.params.id);
    if (!seccion) {
      return res.status(404).json({ mensaje: 'Sección del semillero no encontrada.' });
    }

    seccion.title = title || seccion.title;
    seccion.description = description || seccion.description;
    if (subsections) {
      seccion.subsections = JSON.parse(subsections);
    }
    if (typeof isArchived === 'boolean') {
        seccion.isArchived = isArchived;
    }
    
    // Aquí se podría añadir lógica para añadir/eliminar imágenes existentes,
    // pero por simplicidad, por ahora solo se reemplazan si se suben nuevas.
    if (req.files && req.files.length > 0) {
      // Opcional: eliminar imágenes antiguas del sistema de archivos
      seccion.images.forEach(imagePath => {
        if (imagePath && imagePath !== '/uploads/default_semillero.png') {
          const oldImagePath = path.join(UPLOADS_DIR, path.basename(imagePath));
          if (fs.existsSync(oldImagePath)) {
            fs.unlinkSync(oldImagePath);
          }
        }
      });
      seccion.images = req.files.map(file => `/uploads/${file.filename}`);
    }

    const seccionActualizada = await seccion.save();
    res.status(200).json(seccionActualizada);
  } catch (error) {
    console.error(error);
    res.status(500).json({ mensaje: 'Error del servidor al actualizar la sección del semillero.' });
  }
};

// @desc    Archivar/Desarchivar una sección
// @route   PATCH /api/semillero/:id/archivar
// @access  Admin
const alternarArchivoSeccionSemillero = async (req, res) => {
    try {
        const seccion = await Semillero.findById(req.params.id);

        if (!seccion) {
            return res.status(404).json({ mensaje: 'Sección del semillero no encontrada.' });
        }

        seccion.isArchived = !seccion.isArchived;
        await seccion.save();

        res.status(200).json({ 
            mensaje: `Sección ${seccion.isArchived ? 'archivada' : 'desarchivada'} exitosamente.`,
            seccion: seccion
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ mensaje: 'Error del servidor al alternar el estado de archivo.' });
    }
};

// @desc    Eliminar una sección del semillero
// @route   DELETE /api/semillero/:id
// @access  Admin
const eliminarSeccionSemillero = async (req, res) => {
  try {
    const seccion = await Semillero.findById(req.params.id);
    if (!seccion) {
      return res.status(404).json({ mensaje: 'Sección del semillero no encontrada.' });
    }

    // Eliminar imágenes asociadas del sistema de archivos
    seccion.images.forEach(imagePath => {
        if (imagePath && imagePath !== '/uploads/default_semillero.png') {
          const oldImagePath = path.join(UPLOADS_DIR, path.basename(imagePath));
          if (fs.existsSync(oldImagePath)) {
            fs.unlinkSync(oldImagePath);
          }
        }
    });

    await Semillero.deleteOne({ _id: req.params.id });
    res.status(200).json({ mensaje: 'Sección del semillero eliminada exitosamente.' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ mensaje: 'Error del servidor al eliminar la sección.' });
  }
};


export {
  obtenerSeccionesSemillero,
  obtenerSeccionSemilleroPorId,
  crearSeccionSemillero,
  actualizarSeccionSemillero,
  eliminarSeccionSemillero,
  alternarArchivoSeccionSemillero
};