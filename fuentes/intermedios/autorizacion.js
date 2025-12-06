const autorizarRoles = (...roles) => {
  return (req, res, next) => {
    if (!req.usuario || !roles.includes(req.usuario.rol)) {
      return res.status(403).json({ mensaje: 'Acceso denegado, no tiene los permisos necesarios' });
    }
    next();
  };
};

export default autorizarRoles;
