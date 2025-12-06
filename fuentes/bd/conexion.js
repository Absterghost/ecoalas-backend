import mongoose from 'mongoose';
import config from '../configuracion/index.js'; // Importar la configuración
import logger from '../configuracion/logger.js'; // Importar el logger

const conectarDB = async () => {
  try {
    await mongoose.connect(config.MONGO_URI, {
      // useCreateIndex: true, // No longer supported in Mongoose 6+
      // useFindAndModify: false // No longer supported in Mongoose 6+
    });
    logger.info('✅ MongoDB Conectado...');
  } catch (err) {
    logger.error('❌ Error de conexión a MongoDB: %s', err.message);
    // Salir del proceso con fallo
    process.exit(1);
  }
};

export default conectarDB;
