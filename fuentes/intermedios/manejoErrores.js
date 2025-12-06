// Middleware para manejar errores específicos de la aplicación
const notFound = (req, res, next) => {
    const error = new Error(`No Encontrado - ${req.originalUrl}`);
    res.status(404);
    next(error);
  };
  
  // Middleware general para manejo de errores
  const errorHandler = (err, req, res, next) => {
    // Si el estado de la respuesta es 200 (OK), lo cambiamos a 500 (Internal Server Error)
    const statusCode = res.statusCode === 200 ? 500 : res.statusCode;
    res.status(statusCode);
    res.json({
      mensaje: err.message,
      // En producción, no queremos enviar el stack trace
      stack: process.env.NODE_ENV === 'production' ? null : err.stack,
    });
  };
  
  export { notFound, errorHandler };
