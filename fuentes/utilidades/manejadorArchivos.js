import multer from 'multer';
import path from 'path';
import fs from 'fs';

// Directorio donde se guardarán las subidas
const UPLOADS_DIR = path.join(process.cwd(), 'backend', 'uploads');

// Crear el directorio de subidas si no existe
if (!fs.existsSync(UPLOADS_DIR)) {
  fs.mkdirSync(UPLOADS_DIR, { recursive: true });
}

// Configuración de almacenamiento para Multer
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    // Aquí puedes definir subcarpetas dinámicamente si es necesario, por ejemplo:
    // const subfolder = req.body.tipo || 'general';
    // const dest = path.join(UPLOADS_DIR, subfolder);
    // if (!fs.existsSync(dest)) {
    //   fs.mkdirSync(dest, { recursive: true });
    // }
    cb(null, UPLOADS_DIR);
  },
  filename: (req, file, cb) => {
    // Generar un nombre de archivo único
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

// Filtro para aceptar solo imágenes
const fileFilter = (req, file, cb) => {
  const filetypes = /jpeg|jpg|png|gif|webp/;
  const mimetype = filetypes.test(file.mimetype);
  const extname = filetypes.test(path.extname(file.originalname).toLowerCase());

  if (mimetype && extname) {
    return cb(null, true);
  }
  cb(new Error('Solo se permiten imágenes (jpeg, jpg, png, gif, webp)!'));
};

const subirImagen = multer({
  storage: storage,
  limits: { fileSize: 1024 * 1024 * 5 }, // 5MB límite de tamaño
  fileFilter: fileFilter
});

export { subirImagen, UPLOADS_DIR };
