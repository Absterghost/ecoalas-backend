import jwt from 'jsonwebtoken';
import config from '../configuracion/index.js';
import Usuario from '../rutas/usuario.js';

const protegerRuta = async (req, res, next) => {
  let token;

  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    try {
      // Obtener token del encabezado
      token = req.headers.authorization.split(' ')[1];

      // Verificar token
      const decodificado = jwt.verify(token, config.JWT_SECRET);

      // Adjuntar usuario de la base de datos a la solicitud (sin la contraseña)
      req.usuario = await Usuario.findById(decodificado.id).select('-contrasena');

      if (!req.usuario) {
        return res.status(401).json({ mensaje: 'No autorizado, usuario no encontrado' });
      }

      next();
    } catch (error) {
      console.error(error);
      return res.status(401).json({ mensaje: 'No autorizado, token fallido' });
    }
  }

  if (!token) {
    return res.status(401).json({ mensaje: 'No autorizado, no hay token' });
  }
};

export default protegerRuta;
