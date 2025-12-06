import fs from 'fs';
import path from 'path';
import { S3Client, ListObjectsV2Command, GetObjectCommand, PutObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import stream from 'stream';
import { promisify } from 'util';
import config from '../configuracion/index.js';

const pipeline = promisify(stream.pipeline);

function createS3Client() {
  return new S3Client({
    region: config.S3_REGION,
    credentials: {
      accessKeyId: config.S3_ACCESS_KEY_ID,
      secretAccessKey: config.S3_SECRET_ACCESS_KEY
    }
  });
}

async function descargarTodosDesdeS3(destDir) {
  if (!config.S3_ENABLED || !config.S3_BUCKET) {
    console.log('🟡 S3 no está habilitado o no hay bucket configurado');
    return;
  }

  const s3 = createS3Client();
  console.log(`⬇️ Descargando PDFs desde S3 bucket: ${config.S3_BUCKET} → ${destDir}`);

  try {
    const listCmd = new ListObjectsV2Command({ Bucket: config.S3_BUCKET });
    const listResp = await s3.send(listCmd);
    const objetos = listResp.Contents || [];

    for (const obj of objetos) {
      if (!obj.Key.toLowerCase().endsWith('.pdf')) continue;
      const key = obj.Key;
      const filename = path.basename(key);
      const destino = path.join(destDir, filename);

      // Evitar volver a descargar si ya existe
      if (fs.existsSync(destino)) {
        console.log(`   - Saltando (ya existe): ${filename}`);
        continue;
      }

      console.log(`   - Descargando: ${key}`);
      const getCmd = new GetObjectCommand({ Bucket: config.S3_BUCKET, Key: key });
      const resp = await s3.send(getCmd);
      const bodyStream = resp.Body;

      await pipeline(bodyStream, fs.createWriteStream(destino));
      console.log(`     ✅ Guardado: ${destino}`);
    }
  } catch (err) {
    console.error('❌ Error descargando desde S3:', err.message || err);
  }
}

async function uploadFileToS3(localPath, key) {
  if (!config.S3_ENABLED || !config.S3_BUCKET) {
    throw new Error('S3 no está habilitado en la configuración');
  }

  const s3 = createS3Client();
  const fileStream = fs.createReadStream(localPath);
  const putCmd = new PutObjectCommand({
    Bucket: config.S3_BUCKET,
    Key: key,
    Body: fileStream
  });

  await s3.send(putCmd);
  return key;
}

// Generar URL presignada para subir (PUT)
async function generatePresignedUploadUrl(key, expiresIn = 900) {
  if (!config.S3_ENABLED || !config.S3_BUCKET) {
    throw new Error('S3 no está habilitado en la configuración');
  }
  const s3 = createS3Client();
  const cmd = new PutObjectCommand({ Bucket: config.S3_BUCKET, Key: key });
  const url = await getSignedUrl(s3, cmd, { expiresIn });
  return url;
}

// Descargar un objeto específico desde S3 a una ruta local
async function descargarObjetoDesdeS3(key, destinoPath) {
  if (!config.S3_ENABLED || !config.S3_BUCKET) {
    throw new Error('S3 no está habilitado en la configuración');
  }
  const s3 = createS3Client();
  const getCmd = new GetObjectCommand({ Bucket: config.S3_BUCKET, Key: key });
  const resp = await s3.send(getCmd);
  const bodyStream = resp.Body;
  await pipeline(bodyStream, fs.createWriteStream(destinoPath));
  return destinoPath;
}

export { descargarTodosDesdeS3, uploadFileToS3, generatePresignedUploadUrl, descargarObjetoDesdeS3 };
