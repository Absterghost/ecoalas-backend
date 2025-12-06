import mongoose from 'mongoose';
import bcrypt from 'bcrypt';
import config from './configuracion/index.js';
import Usuario from './modelos/usuario.js';

const ADMIN_USERNAME = 'admin';
const ADMIN_PASSWORD = 'admin123'; // Contraseña con 6+ caracteres

const crearAdmin = async () => {
  try {
    console.log('--- Iniciando script para crear usuario administrador ---');
    
    // Conectar a la base de datos
    console.log('Conectando a MongoDB Atlas...');
    await mongoose.connect(config.MONGO_URI);
    console.log('Conexión a MongoDB exitosa.');

    // 1. Verificar si el usuario 'admin' ya existe
    const adminExistente = await Usuario.findOne({ nombreUsuario: ADMIN_USERNAME });

    if (adminExistente) {
      console.log(`El usuario '${ADMIN_USERNAME}' ya existe en la base de datos de Atlas.`);
      return;
    }

    console.log(`El usuario '${ADMIN_USERNAME}' no existe. Procediendo a crearlo...`);

    // 2. Si no existe, crear el nuevo usuario administrador
    const nuevoAdmin = new Usuario({
      nombreUsuario: ADMIN_USERNAME,
      contrasena: ADMIN_PASSWORD, // La contraseña se hasheará gracias al hook pre-save del modelo
      rol: 'admin' // Asignar el rol de administrador
    });

    await nuevoAdmin.save();

    console.log('--------------------------------------------------');
    console.log('¡Usuario administrador creado exitosamente en Atlas!');
    console.log(`   Usuario: ${ADMIN_USERNAME}`);
    console.log(`   Contraseña: ${ADMIN_PASSWORD}`);
    console.log('--------------------------------------------------');
    console.log('Ahora puedes iniciar el servidor (`npm run dev`) y usar estas credenciales para iniciar sesión.');

  } catch (error) {
    console.error('Ocurrió un error durante la ejecución del script:', error);
  } finally {
    // 3. Desconectar de la base de datos
    await mongoose.disconnect();
    console.log('Desconectado de MongoDB.');
    console.log('--- Fin del script ---');
  }
};

crearAdmin();
