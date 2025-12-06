export default {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "EcoAlas API",
      version: "1.0.0",
      description: "Documentación de la API EcoAlas",
    },
  },
  apis: ["./fuentes/rutas/*.js"],
};
