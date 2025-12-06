import { chatServicio } from '../servicios/chatServicio.js';

// @desc    Obtener estado del sistema de documentos
// @route   GET /api/documentos/estado
// @access  Public
const getEstadoDocumentos = (req, res) => {
  const totalChunks = chatServicio.getTotalChunks();
  const documentosCargados = chatServicio.getDocumentosChunksSize();
  const estaProcesando = chatServicio.getEstaProcesando();
  const ultimaActualizacion = chatServicio.getUltimaActualizacion();

  res.json({
    servidor: "🟢 ACTIVO",
    documentos: documentosCargados,
    chunksTotales: totalChunks,
    procesando: estaProcesando,
    ultimaActualizacion: ultimaActualizacion,
    modelo: chatServicio.OLLAMA_MODEL, // OLLAMA_MODEL se exporta directamente desde config
    timestamp: new Date().toLocaleString('es-CO')
  });
};

// @desc    Solicitar reprocesamiento de documentos
// @route   POST /api/documentos/procesar
// @access  Admin (se añadirá middleware de autorización más adelante)
const procesarDocumentos = async (req, res) => {
  try {
    console.log('🔄 Solicitud de reprocesamiento manual');
    const resultado = await chatServicio.procesarDocumentosAutomatico();
    
    res.json({
      success: resultado,
      message: resultado ? "Documentos procesados exitosamente" : "Error al procesar documentos",
      documentos: chatServicio.getDocumentosChunksSize(),
      ultimaActualizacion: chatServicio.getUltimaActualizacion()
    });
  } catch (error) {
    console.error('❌ Error en reprocesamiento:', error);
    res.status(500).json({
      success: false, 
      message: "Error interno: " + error.message 
    });
  }
};

// @desc    Endpoint del Chatbot
// @route   POST /api/documentos/chat
// @access  Public
const chatearConDocumentos = async (req, res) => {
  const { message, modoEstricto = true } = req.body;
  
  if (!message?.trim()) {
    return res.json({
      reply: "⚠️ Por favor, escribe tu pregunta sobre las aves de Caldas.",
      fuentes: [],
      documentosEncontrados: 0,
      modoUsado: "none"
    });
  }

  const pregunta = message.trim();
  
  try {
    // Verificar documentos
    if (chatServicio.getDocumentosChunksSize() === 0) {
      return res.json({
        reply: `📚 No hay documentos cargados.\n\nPor favor:\n1. Coloca documentos en la carpeta 'documentos'\n2. Ejecuta: POST /api/documentos/procesar\n3. O reinicia el servidor`,
        fuentes: [],
        documentosEncontrados: 0,
        modoUsado: "none"
      });
    }

    // Búsqueda
    const resultados = chatServicio.buscarEnDocumentos(pregunta);
    let contexto = "";
    let fuentes = [];

    if (resultados.length > 0) {
      fuentes = [...new Set(resultados.map(r => r.archivo))];
      contexto = "INFORMACIÓN RELEVANTE:\n\n";
      
      resultados.forEach((resultado, idx) => {
        contexto += `--- Fragmento ${idx + 1} (${resultado.archivo}) ---\n`;
        contexto += resultado.texto + "\n\n";
      });
    } else {
      contexto = "No se encontró información específica sobre: " + pregunta;
    }

    // Generar respuesta
    const respuesta = await chatServicio.obtenerRespuestaIA(pregunta, contexto, modoEstricto);

    res.json({
      reply: respuesta,
      modoUsado: modoEstricto ? "estricto" : "investigativo",
      documentosEncontrados: resultados.length,
      fuentes: fuentes,
      chunksAnalizados: resultados.length
    });

  } catch (error) {
    console.error("❌ ERROR en /api/documentos/chat:", error);
    res.status(500).json({
      reply: "❌ Error interno del servidor. Intenta nuevamente.",
      documentosEncontrados: 0,
      fuentes: []
    });
  }
};

// exports consolidated at end of file

export { getEstadoDocumentos, procesarDocumentos, chatearConDocumentos };
