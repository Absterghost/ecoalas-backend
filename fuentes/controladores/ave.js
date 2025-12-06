import Ave from '../modelos/ave.js';
import Familia from '../modelos/familia.js'; // Necesario para verificar la familia
import fs from 'fs'; // Para manejar archivos
import path from 'path'; // Para manejar rutas de archivos
import { UPLOADS_DIR } from '../utilidades/manejadorArchivos.js'; // Para obtener el directorio de subidas

// @desc    Obtener todas las aves
// @route   GET /api/aves
// @access  Public
const obtenerAves = async (req, res) => {
  try {
    const aves = await Ave.find({}).populate('familia', 'nombre'); // Populate para mostrar el nombre de la familia
    res.status(200).json(aves);
  } catch (error) {
    console.error(error);
    res.status(500).json({ mensaje: 'Error del servidor al obtener aves.' });
  }
};

// @desc    Obtener una sola ave por ID
// @route   GET /api/aves/:id
// @access  Public
const obtenerAvePorId = async (req, res) => {
  try {
    const ave = await Ave.findById(req.params.id).populate('familia', 'nombre');

    if (!ave) {
      return res.status(404).json({ mensaje: 'Ave no encontrada.' });
    }
    res.status(200).json(ave);
  } catch (error) {
    console.error(error);
    res.status(500).json({ mensaje: 'Error del servidor al obtener el ave.' });
  }
};

// @desc    Crear una nueva ave
// @route   POST /api/aves
// @access  Admin
const crearAve = async (req, res) => {
  const { familia, nombre, habitat, dieta, conservacion } = req.body;
  const imagenPath = req.file ? `/uploads/${req.file.filename}` : undefined; // Ruta relativa de la imagen subida

  if (!familia || !nombre) {
    // Si no se proporcionaron campos obligatorios, eliminar el archivo subido si existe
    if (req.file) {
      fs.unlinkSync(req.file.path);
    }
    return res.status(400).json({ mensaje: 'Faltan campos obligatorios: familia y nombre.' });
  }

  try {
    // Verificar si la familia existe
    const familiaExiste = await Familia.findById(familia);
    if (!familiaExiste) {
      if (req.file) {
        fs.unlinkSync(req.file.path);
      }
      return res.status(400).json({ mensaje: 'La familia especificada no existe.' });
    }

    const aveExiste = await Ave.findOne({ nombre });
    if (aveExiste) {
      if (req.file) {
        fs.unlinkSync(req.file.path);
      }
      return res.status(400).json({ mensaje: 'Ya existe un ave con ese nombre.' });
    }

    const nuevaAve = await Ave.create({
      familia,
      nombre,
      imagen: imagenPath, // Usar la ruta del archivo subido
      habitat,
      dieta,
      conservacion
    });

    res.status(201).json(nuevaAve);
  } catch (error) {
    console.error(error);
    if (req.file) {
      fs.unlinkSync(req.file.path); // Asegurarse de eliminar el archivo si algo sale mal
    }
    res.status(500).json({ mensaje: 'Error del servidor al crear el ave.' });
  }
};

// @desc    Actualizar un ave existente
// @route   PUT /api/aves/:id
// @access  Admin
const actualizarAve = async (req, res) => {
  const { familia, nombre, habitat, dieta, conservacion } = req.body;
  const nuevaImagenPath = req.file ? `/uploads/${req.file.filename}` : undefined; // Nueva ruta de la imagen

  try {
    const ave = await Ave.findById(req.params.id);

    if (!ave) {
      if (req.file) {
        fs.unlinkSync(req.file.path);
      }
      return res.status(404).json({ mensaje: 'Ave no encontrada.' });
    }

    // Si se proporciona una nueva familia, verificar que exista
    if (familia && familia.toString() !== ave.familia.toString()) {
        const familiaExiste = await Familia.findById(familia);
        if (!familiaExiste) {
            if (req.file) {
              fs.unlinkSync(req.file.path);
            }
            return res.status(400).json({ mensaje: 'La nueva familia especificada no existe.' });
        }
    }

    // Si se cambia el nombre, verificar que el nuevo nombre no exista ya
    if (nombre && nombre !== ave.nombre) {
        const nombreExiste = await Ave.findOne({ nombre });
        if (nombreExiste) {
            if (req.file) {
              fs.unlinkSync(req.file.path);
            }
            return res.status(400).json({ mensaje: 'Ya existe un ave con ese nombre.' });
        }
    }

    // Si se subió una nueva imagen, eliminar la antigua (si no es la por defecto)
    if (nuevaImagenPath) {
      // Evitar eliminar la imagen por defecto si el ave la tenía
      const defaultImagePath = Ave.schema.path('imagen').defaultValue;
      if (ave.imagen && ave.imagen !== defaultImagePath) {
        const oldImagePath = path.join(UPLOADS_DIR, path.basename(ave.imagen));
        if (fs.existsSync(oldImagePath)) {
          fs.unlinkSync(oldImagePath);
        }
      }
      ave.imagen = nuevaImagenPath;
    }


    ave.familia = familia || ave.familia;
    ave.nombre = nombre || ave.nombre;
    ave.habitat = habitat || ave.habitat;
    ave.dieta = dieta || ave.dieta;
    ave.conservacion = conservacion || ave.conservacion;

    const aveActualizada = await ave.save();
    res.status(200).json(aveActualizada);
  } catch (error) {
    console.error(error);
    if (req.file) {
      fs.unlinkSync(req.file.path); // Asegurarse de eliminar el archivo si algo sale mal
    }
    res.status(500).json({ mensaje: 'Error del servidor al actualizar el ave.' });
  }
};

// @desc    Eliminar un ave
// @route   DELETE /api/aves/:id
// @access  Admin
const eliminarAve = async (req, res) => {
  try {
    const ave = await Ave.findById(req.params.id);

    if (!ave) {
      return res.status(404).json({ mensaje: 'Ave no encontrada.' });
    }

    // Eliminar la imagen asociada si no es la imagen por defecto
    const defaultImagePath = Ave.schema.path('imagen').defaultValue;
    if (ave.imagen && ave.imagen !== defaultImagePath) {
      const imagePath = path.join(UPLOADS_DIR, path.basename(ave.imagen));
      if (fs.existsSync(imagePath)) {
        fs.unlinkSync(imagePath);
      }
    }

    await Ave.deleteOne({ _id: req.params.id });
    res.status(200).json({ mensaje: 'Ave eliminada exitosamente.' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ mensaje: 'Error del servidor al eliminar el ave.' });
  }
};

export {
  obtenerAves,
  obtenerAvePorId,
  crearAve,
  actualizarAve,
  eliminarAve
};
