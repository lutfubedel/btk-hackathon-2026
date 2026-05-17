import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import { v4 as uuidv4 } from 'uuid';

// Dosya uzantısını mimetype'dan çıkar
const MIME_TO_EXT = {
  'image/jpeg': '.jpg',
  'image/png': '.png',
  'image/webp': '.webp',
  'image/gif': '.gif',
};

// S3-compatible client (Cloudflare R2) - Lazily initialized
let s3Client = null;

function getS3Client() {
  if (s3Client) return s3Client;

  const { R2_ACCOUNT_ID, R2_ACCESS_KEY_ID, R2_SECRET_ACCESS_KEY } = process.env;

  if (!R2_ACCOUNT_ID || !R2_ACCESS_KEY_ID || !R2_SECRET_ACCESS_KEY) {
    throw new Error('Cloudflare R2 yapılandırması eksik. Lütfen .env dosyasını kontrol edin.');
  }

  s3Client = new S3Client({
    region: 'auto',
    endpoint: `https://${R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
    credentials: {
      accessKeyId: R2_ACCESS_KEY_ID,
      secretAccessKey: R2_SECRET_ACCESS_KEY,
    },
  });

  return s3Client;
}

/**
 * Görseli Cloudflare R2'ye yükler (Buffer)
 * @param {Buffer} buffer - Görsel dosya içeriği
 * @param {string} mimetype - Dosyanın MIME tipi
 * @returns {Promise<{key: string, publicUrl: string}>}
 */
export async function uploadImage(buffer, mimetype) {
  const ext = MIME_TO_EXT[mimetype] || '.jpg';
  const key = `uploads/${uuidv4()}${ext}`;
  const client = getS3Client();

  const command = new PutObjectCommand({
    Bucket: process.env.R2_BUCKET_NAME,
    Key: key,
    Body: buffer,
    ContentType: mimetype,
  });

  await client.send(command);

  const publicUrl = `${process.env.R2_PUBLIC_URL}/${key}`;
  console.log(`✅ Görsel R2'ye yüklendi: ${publicUrl}`);

  return { key, publicUrl };
}

/**
 * Base64 görseli Cloudflare R2'ye yükler
 * @param {string} base64Data - Base64 encoded görsel verisi
 * @param {string} mimetype - Dosyanın MIME tipi
 * @returns {Promise<{key: string, publicUrl: string}>}
 */
export async function uploadBase64Image(base64Data, mimetype = 'image/png') {
  const buffer = Buffer.from(base64Data, 'base64');
  return uploadImage(buffer, mimetype);
}
