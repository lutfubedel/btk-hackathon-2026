import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';

// .env dosyasını root'tan yükle
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.resolve(__dirname, '.env') });

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
    'https://btk-hackathon-2026-g7u17je0e-lutfus-projects-595b23fb.vercel.app',
    // Varsa ana Vercel domain'in de ekle:
    // 'https://visearchai.vercel.app'
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
