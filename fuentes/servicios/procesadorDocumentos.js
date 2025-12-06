// backend/procesarDocumentos.js
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const DOCS_SOURCE_DIR = path.join(__dirname, '..', 'documentos');
const DOCS_PROCESS_DIR = path.join(__dirname, 'documentos');
const CHUNKS_DIR = path.join(__dirname, 'documentos_chunks');
const CHUNK_SIZE = 800;
const OVERLAP = 150;

// Crear directorios
for (const dir of [DOCS_PROCESS_DIR, CHUNKS_DIR]) {
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
}

// ✅ Extraer texto de PDF
async function extraerTextoDePDF(rutaPDF) {
  try {
    console.log(`   📄 Leyendo PDF: ${path.basename(rutaPDF)}`);
    
    const pdfParse = await import('pdf-parse');
    const dataBuffer = fs.readFileSync(rutaPDF);
    const data = await pdfParse.default(dataBuffer);

    let texto = data.text
      .replace(/\n+/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();

    console.log(`   ✅ PDF procesado: ${texto.length} caracteres`);
    return texto;
  } catch (error) {
    console.error(`   ❌ Error: ${error.message}`);

    try {
      const contenidoBruto = fs.readFileSync(rutaPDF, 'utf8');
      console.log(`   🔄 Fallback: ${contenidoBruto.length} caracteres`);
      return contenidoBruto.slice(0, 5000);
    } catch {
      console.log(`   ⚠️ Fallback falló`);
      return '';
    }
  }
}

// Copiar archivos
function copiarArchivosDeOrigen() {
  if (!fs.existsSync(DOCS_SOURCE_DIR)) {
    console.log(`❌ No existe: ${DOCS_SOURCE_DIR}`);
    fs.mkdirSync(DOCS_SOURCE_DIR, { recursive: true });
    console.log(`✅ Carpeta creada. Coloca PDFs en: ${DOCS_SOURCE_DIR}`);
    return [];
  }

  const archivosFuente = fs.readdirSync(DOCS_SOURCE_DIR).filter(archivo =>
    archivo.endsWith('.pdf') || archivo.endsWith('.txt') || archivo.endsWith('.json')
  );

  if (archivosFuente.length === 0) {
    console.log(`ℹ️ Sin documentos en: ${DOCS_SOURCE_DIR}`);
    return [];
  }

  console.log(`\n📁 Copiando ${archivosFuente.length} archivos...`);

  const archivosCopiados = [];
  for (const archivo of archivosFuente) {
    const origen = path.join(DOCS_SOURCE_DIR, archivo);
    const destino = path.join(DOCS_PROCESS_DIR, archivo);
    try {
      fs.copyFileSync(origen, destino);
      archivosCopiados.push(archivo);
      console.log(`   ✅ ${archivo}`);
    } catch (error) {
      console.log(`   ❌ Error: ${error.message}`);
    }
  }
  return archivosCopiados;
}

// Dividir en chunks
function dividirEnChunks(texto, chunkSize = CHUNK_SIZE, overlap = OVERLAP) {
  const chunks = [];
  if (texto.length <= chunkSize) return [texto];

  let start = 0;
  while (start < texto.length) {
    let end = start + chunkSize;

    if (end < texto.length) {
      const ultimoEspacio = texto.lastIndexOf(' ', end);
      const ultimoPunto = texto.lastIndexOf('.', end);
      const ultimoSalto = texto.lastIndexOf('\n', end);

      if (ultimoSalto > start + chunkSize * 0.5) end = ultimoSalto + 1;
      else if (ultimoPunto > start + chunkSize * 0.5) end = ultimoPunto + 1;
      else if (ultimoEspacio > start + chunkSize * 0.5) end = ultimoEspacio + 1;
    }

    const chunk = texto.slice(start, end).trim();
    if (chunk.length > 50) chunks.push(chunk);
    start = end - overlap;
  }

  return chunks;
}

// Procesar documento
async function procesarDocumento(archivo) {
  try {
    const rutaCompleta = path.join(DOCS_PROCESS_DIR, archivo);
    let contenido = '';

    console.log(`\n🔄 Procesando: ${archivo}`);

    if (archivo.endsWith('.txt')) {
      contenido = fs.readFileSync(rutaCompleta, 'utf-8');
      console.log(`   ✅ TXT: ${contenido.length} chars`);
    } else if (archivo.endsWith('.json')) {
      const data = JSON.parse(fs.readFileSync(rutaCompleta, 'utf-8'));
      contenido = Array.isArray(data) ? data.join('\n') : JSON.stringify(data, null, 2);
      console.log(`   ✅ JSON: ${contenido.length} chars`);
    } else if (archivo.endsWith('.pdf')) {
      contenido = await extraerTextoDePDF(rutaCompleta);
      if (!contenido) {
        console.log(`   ❌ PDF vacío`);
        return 0;
      }
    } else {
      console.log(`   ⚠️ Formato no soportado`);
      return 0;
    }

    const textoLimpio = contenido
      .replace(/\r\n/g, '\n')
      .replace(/\t/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();

    const chunks = dividirEnChunks(textoLimpio);

    const nombreSalida = archivo.replace(/\.[^/.]+$/, '') + '.json';
    const rutaSalida = path.join(CHUNKS_DIR, nombreSalida);

    fs.writeFileSync(rutaSalida, JSON.stringify(chunks, null, 2), 'utf8');
    console.log(`   ✅ ${chunks.length} chunks guardados`);

    return chunks.length;
  } catch (error) {
    console.error(`   ❌ Error: ${error.message}`);
    return 0;
  }
}

// Procesar todos
async function procesarTodosLosDocumentos() {
  console.log('🚀 PROCESAMIENTO DE DOCUMENTOS');
  console.log('================================\n');

  const archivos = copiarArchivosDeOrigen();
  if (archivos.length === 0) {
    console.log('\n💡 Sin documentos para procesar.');
    console.log(`📍 Coloca archivos en: ${DOCS_SOURCE_DIR}`);
    return;
  }

  console.log(`\n📚 Procesando ${archivos.length} documentos...`);
  let totalChunks = 0;
  let documentosProcesados = 0;

  for (const archivo of archivos) {
    const chunks = await procesarDocumento(archivo);
    if (chunks > 0) {
      totalChunks += chunks;
      documentosProcesados++;
    }
  }

  console.log('\n🎉 COMPLETADO');
  console.log('==============');
  console.log(`   📄 Procesados: ${documentosProcesados}/${archivos.length}`);
  console.log(`   🧩 Total chunks: ${totalChunks}`);
  console.log(`   📂 Chunks en: ${CHUNKS_DIR}`);
  console.log(`   📁 Fuente: ${DOCS_SOURCE_DIR}`);

  if (documentosProcesados === 0) {
    console.log('\n⚠️  No se procesó ningún documento.');
  } else {
    console.log('\n🚀 Ahora ejecuta: node server.js');
  }
}

// Ver estado
function verificarEstado() {
  console.log('\n🔍 ESTADO DEL SISTEMA');
  console.log('=====================');

  if (fs.existsSync(DOCS_SOURCE_DIR)) {
    const archivosFuente = fs.readdirSync(DOCS_SOURCE_DIR).filter(f =>
      f.endsWith('.pdf') || f.endsWith('.txt') || f.endsWith('.json')
    );
    console.log(`📍 Fuente: ${DOCS_SOURCE_DIR}`);
    console.log(`   📁 Archivos: ${archivosFuente.length}`);
    archivosFuente.forEach(a => console.log(`      - ${a}`));
  } else {
    console.log(`❌ No existe: ${DOCS_SOURCE_DIR}`);
  }

  if (fs.existsSync(CHUNKS_DIR)) {
    const archivosChunks = fs.readdirSync(CHUNKS_DIR).filter(f => f.endsWith('.json'));
    console.log(`\n📂 Chunks: ${CHUNKS_DIR}`);
    console.log(`   🧩 Archivos: ${archivosChunks.length}`);
    archivosChunks.forEach(a => console.log(`      - ${a}`));
  } else {
    console.log(`\n❌ No existe: ${CHUNKS_DIR}`);
  }
}

// Main
async function main() {
  const arg = process.argv[2];
  if (arg === '--estado' || arg === '-e') {
    verificarEstado();
  } else {
    await procesarTodosLosDocumentos();
  }
}

main().catch(console.error);