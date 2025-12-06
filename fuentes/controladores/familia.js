import Familia from '../modelos/familia.js';
import { UPLOADS_DIR } from '../utilidades/manejadorArchivos.js'; // Para manejar la ruta de los archivos
import fs from 'fs';
import path from 'path';

// @desc    Obtener todas las familias
// @route   GET /api/familias
// @access  Public
const obtenerFamilias = async (req, res) => {
  try {
    // Filtro para no mostrar las archivadas en la vista pública, a menos que se especifique
    const filtro = req.query.incluirArchivadas === 'true' ? {} : { isArchived: false };
    const familias = await Familia.find(filtro);
    res.status(200).json(familias);
  } catch (error) {
    console.error(error);
    res.status(500).json({ mensaje: 'Error del servidor al obtener familias.' });
  }
};

// @desc    Obtener una sola familia por ID
// @route   GET /api/familias/:id
// @access  Public
const obtenerFamiliaPorId = async (req, res) => {
  try {
    const familia = await Familia.findById(req.params.id);

    if (!familia) {
      return res.status(404).json({ mensaje: 'Familia no encontrada.' });
    }
    res.status(200).json(familia);
  } catch (error) {
    console.error(error);
    res.status(500).json({ mensaje: 'Error del servidor al obtener la familia.' });
  }
};

// @desc    Crear una nueva familia
// @route   POST /api/familias
// @access  Admin
const crearFamilia = async (req, res) => {
  const { nombre, descripcion, habitatGeneral, dietaGeneral, estadoConservacionGeneral, tagsHabitat, tagsConservacion, ubicacion, datosAdicionales } = req.body;

  if (!nombre) {
    return res.status(400).json({ mensaje: 'El nombre de la familia es obligatorio.' });
  }

  try {
    const familiaExiste = await Familia.findOne({ nombre });
    if (familiaExiste) {
      return res.status(400).json({ mensaje: 'Ya existe una familia con ese nombre.' });
    }

    // El archivo de imagen viene en req.file si se usó Multer
    const logoPath = req.file ? `/uploads/${req.file.filename}` : '/uploads/default_familia.png';

    const nuevaFamilia = await Familia.create({
      nombre,
      descripcion,
      habitatGeneral: Array.isArray(habitatGeneral) ? habitatGeneral : (habitatGeneral ? habitatGeneral.split(',').map(s => s.trim()) : []),
      dietaGeneral,
      estadoConservacionGeneral,
      tagsHabitat: Array.isArray(tagsHabitat) ? tagsHabitat : (tagsHabitat ? tagsHabitat.split(',').map(s => s.trim()) : []),
      tagsConservacion: Array.isArray(tagsConservacion) ? tagsConservacion : (tagsConservacion ? tagsConservacion.split(',').map(s => s.trim()) : []),
      logo: logoPath,
      ubicacion,
      datosAdicionales,
    });

    res.status(201).json(nuevaFamilia);
  } catch (error) {
    console.error(error);
    res.status(500).json({ mensaje: 'Error del servidor al crear la familia.' });
  }
};

// @desc    Actualizar una familia existente
// @route   PUT /api/familias/:id
// @access  Admin
const actualizarFamilia = async (req, res) => {
  const { nombre, descripcion, habitatGeneral, dietaGeneral, estadoConservacionGeneral, tagsHabitat, tagsConservacion, ubicacion, datosAdicionales, isArchived } = req.body;

  try {
    const familia = await Familia.findById(req.params.id);

    if (!familia) {
      return res.status(404).json({ mensaje: 'Familia no encontrada.' });
    }

    // Si se cambia el nombre, verificar que el nuevo nombre no exista ya para otra familia
    if (nombre && nombre !== familia.nombre) {
        const nombreExiste = await Familia.findOne({ nombre });
        if (nombreExiste && nombreExiste._id.toString() !== familia._id.toString()) {
            return res.status(400).json({ mensaje: 'Ya existe una familia con ese nombre.' });
        }
    }

    // Manejo de la imagen: si se sube un nuevo archivo, eliminar el antiguo y guardar el nuevo
    if (req.file) {
      if (familia.logo && familia.logo !== '/uploads/default_familia.png') {
        const oldImagePath = path.join(UPLOADS_DIR, path.basename(familia.logo));
        if (fs.existsSync(oldImagePath)) {
          fs.unlinkSync(oldImagePath);
        }
      }
      familia.logo = `/uploads/${req.file.filename}`;
    }

    familia.nombre = nombre || familia.nombre;
    familia.descripcion = descripcion || familia.descripcion;
    familia.habitatGeneral = Array.isArray(habitatGeneral) ? habitatGeneral : (habitatGeneral ? habitatGeneral.split(',').map(s => s.trim()) : familia.habitatGeneral);
    familia.dietaGeneral = dietaGeneral || familia.dietaGeneral;
    familia.estadoConservacionGeneral = estadoConservacionGeneral || familia.estadoConservacionGeneral;
    familia.tagsHabitat = Array.isArray(tagsHabitat) ? tagsHabitat : (tagsHabitat ? tagsHabitat.split(',').map(s => s.trim()) : familia.tagsHabitat);
    familia.tagsConservacion = Array.isArray(tagsConservacion) ? tagsConservacion : (tagsConservacion ? tagsConservacion.split(',').map(s => s.trim()) : familia.tagsConservacion);
    familia.ubicacion = ubicacion || familia.ubicacion;
    familia.datosAdicionales = datosAdicionales || familia.datosAdicionales;
    // isArchived se maneja por PATCH, pero se permite aquí también por consistencia con PUT completo
    if (typeof isArchived === 'boolean') {
        familia.isArchived = isArchived;
    }


    const familiaActualizada = await familia.save();
    res.status(200).json(familiaActualizada);
  } catch (error) {
    console.error(error);
    res.status(500).json({ mensaje: 'Error del servidor al actualizar la familia.' });
  }
};

// @desc    Archivar/Desarchivar una familia
// @route   PATCH /api/familias/:id/archivar
// @access  Admin
const alternarArchivoFamilia = async (req, res) => {
    try {
        const familia = await Familia.findById(req.params.id);

        if (!familia) {
            return res.status(404).json({ mensaje: 'Familia no encontrada.' });
        }

        familia.isArchived = !familia.isArchived;
        await familia.save();

        res.status(200).json({ 
            mensaje: `Familia ${familia.isArchived ? 'archivada' : 'desarchivada'} exitosamente.`,
            familia: familia
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ mensaje: 'Error del servidor al alternar el estado de archivo.' });
    }
};

// @desc    Eliminar una familia (borrado físico)
// @route   DELETE /api/familias/:id
// @access  Admin
const eliminarFamilia = async (req, res) => {
  try {
    const familia = await Familia.findById(req.params.id);

    if (!familia) {
      return res.status(404).json({ mensaje: 'Familia no encontrada.' });
    }

    // Eliminar el archivo de logo si no es el por defecto
    if (familia.logo && familia.logo !== '/uploads/default_familia.png') {
        const imagePath = path.join(UPLOADS_DIR, path.basename(familia.logo));
        if (fs.existsSync(imagePath)) {
            fs.unlinkSync(imagePath);
        }
    }

    await Familia.deleteOne({ _id: req.params.id });
    res.status(200).json({ mensaje: 'Familia eliminada exitosamente.' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ mensaje: 'Error del servidor al eliminar la familia.' });
  }
};

export {
  obtenerFamilias,
  obtenerFamiliaPorId,
  crearFamilia,
  actualizarFamilia,
  eliminarFamilia,
  alternarArchivoFamilia
};
