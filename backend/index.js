import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import fs from 'fs';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Render "Secret File" veya Lokal dosya için otomatik yol belirleme
const renderSecretPath = '/etc/secrets/service-account.json';
const localSecretPath = path.join(__dirname, 'service-account.json');

if (fs.existsSync(renderSecretPath)) {
  process.env.GOOGLE_APPLICATION_CREDENTIALS = renderSecretPath;
  console.log(`[AUTH] Render secret kullanılıyor: ${renderSecretPath}`);
} else if (fs.existsSync(localSecretPath)) {
  process.env.GOOGLE_APPLICATION_CREDENTIALS = localSecretPath;
  console.log(`[AUTH] Lokal servis hesabı kullanılıyor: ${localSecretPath}`);
} else {
  console.warn(`[AUTH] UYARI: service-account.json dosyası bulunamadı!`);
}

import express from 'express';
import cors from 'cors';
import apiRoutes from './routes/api.js';

const app = express();
const PORT = process.env.PORT || 3001;

// CORS — Frontend'den gelen isteklere izin ver
app.use(cors({
  origin: [
    'http://localhost:5173',
    'http://localhost:3000',
    'https://btk-hackathon-2026.vercel.app',
    'https://btk-hackathon-2026-gpqxrc5a5-lutfus-projects-595b23fb.vercel.app',
  ],
  methods: ['GET', 'POST'],
  allowedHeaders: ['Content-Type'],
}));

// JSON body parser — base64 görseller için büyük limit
app.use(express.json({ limit: '50mb' }));

// API route'ları
app.use('/api', apiRoutes);

// Sağlık kontrolü
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Sunucuyu başlat
const server = app.listen(PORT, () => {
  console.log(`\n🚀 BTK Hackathon Backend`);
  console.log(`   Sunucu çalışıyor: http://localhost:${PORT}`);
  console.log(`   Sağlık kontrolü:  http://localhost:${PORT}/health\n`);
});

server.keepAliveTimeout = 65000;
server.headersTimeout = 66000;
