import { Router } from 'express';
import upload from '../middleware/upload.js';
import { uploadImage, uploadBase64Image } from '../services/r2Service.js';
import { searchByImage } from '../services/serpApiService.js';
import { generateImage, editImage, generateSearchQueryFromImage, chatAndEditImage, checkProductPrompt, checkSafetyAndProductPrompt, checkEditPrompt, enrichProductPrompt, enrichInpaintPrompt, generatePersonalizedProductPreview } from '../services/geminiService.js';
import { generateImageWithImagen, inpaintImageWithImagen } from '../services/imagenService.js';

const router = Router();

/**
 * POST /api/search
 * Dosya yükle → R2'ye kaydet → Google Lens ile ara → Sonuçları döndür
 */
router.post('/search', upload.single('image'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        error: 'Lütfen bir görsel dosyası yükleyin.',
      });
    }

    console.log(`\n📤 Yeni arama isteği: ${req.file.originalname} (${(req.file.size / 1024).toFixed(1)} KB)`);

    // 1. Görseli Cloudflare R2'ye yükle
    const { publicUrl } = await uploadImage(req.file.buffer, req.file.mimetype);

    // Görseli analiz edip e-ticaret arama sorgusu üret
    const base64Image = req.file.buffer.toString('base64');
    const searchQuery = await generateSearchQueryFromImage(base64Image, req.file.mimetype);

    // 2. SerpAPI Google Lens ile ara (auto_crop ve q filtrelemesiyle)
    const results = await searchByImage(publicUrl, searchQuery);

    // 3. Sonuçları döndür
    return res.json({
      success: true,
      uploadedImageUrl: publicUrl,
      results,
      totalResults: results.length,
    });

  } catch (error) {
    console.error('❌ Arama hatası:', error.message);

    if (error.code === 'LIMIT_FILE_SIZE') {
      return res.status(413).json({
        success: false,
        error: 'Dosya boyutu çok büyük. Maksimum 10MB desteklenir.',
      });
    }

    return res.status(500).json({
      success: false,
      error: error.message || 'Beklenmeyen bir hata oluştu.',
    });
  }
});

/**
 * POST /api/search-by-base64
 * Base64 görsel → R2'ye yükle → Google Lens ile ara → Sonuçları döndür
 */
router.post('/search-by-base64', async (req, res) => {
  try {
    const { imageBase64, mimeType } = req.body;

    if (!imageBase64) {
      return res.status(400).json({
        success: false,
        error: 'Lütfen bir görsel verisi gönderin.',
      });
    }

    console.log(`\n📤 Base64 arama isteği alındı`);

    // 1. Base64 görseli R2'ye yükle
    const { publicUrl } = await uploadBase64Image(imageBase64, mimeType || 'image/png');

    // Görseli analiz edip e-ticaret arama sorgusu üret
    const searchQuery = await generateSearchQueryFromImage(imageBase64, mimeType || 'image/png');

    // 2. SerpAPI Google Lens ile ara (auto_crop ve q filtrelemesiyle)
    const results = await searchByImage(publicUrl, searchQuery);

    // 3. Sonuçları döndür
    return res.json({
      success: true,
      uploadedImageUrl: publicUrl,
      results,
      totalResults: results.length,
    });

  } catch (error) {
    console.error('❌ Base64 arama hatası:', error.message);
    return res.status(500).json({
      success: false,
      error: error.message || 'Beklenmeyen bir hata oluştu.',
    });
  }
});

/**
 * POST /api/generate
 * Gemini ile görsel üret veya düzenle
 * Body: { prompt: string, imageBase64?: string, mimeType?: string }
 */
router.post('/generate', async (req, res) => {
  try {
    const { prompt, imageBase64, mimeType } = req.body;

    if (!prompt) {
      return res.status(400).json({
        success: false,
        error: 'Lütfen bir açıklama (prompt) gönderin.',
      });
    }

    console.log(`\n🎨 Görsel üretim isteği: "${prompt.substring(0, 60)}..."`);

    // Orijinal prompt üzerinde Güvenlik ve Etik kontrolü uygula
    const moderation = await checkSafetyAndProductPrompt(prompt);
    if (moderation.status === 'BLOCKED') {
      return res.status(400).json({
        success: false,
        error: moderation.reason
      });
    }
    if (moderation.status === 'INVALID') {
      return res.status(400).json({
        success: false,
        error: moderation.reason
      });
    }

    let result;

    if (imageBase64) {
      // Mevcut görseli düzenle
      result = await editImage(prompt, imageBase64, mimeType || 'image/png');
    } else {
      // Promptu İngilizce ürün tasarım promptuna dönüştür ve zenginleştir
      const enrichedPrompt = await enrichProductPrompt(prompt);

      // Sıfırdan üret (Imagen 3 / Vertex AI ile)
      result = await generateImageWithImagen(enrichedPrompt);
    }

    return res.json({
      success: true,
      imageBase64: result.imageBase64,
      mimeType: result.mimeType,
      text: result.text,
    });

  } catch (error) {
    console.error('❌ Görsel üretim hatası:', error.message);
    return res.status(500).json({
      success: false,
      error: error.message || 'Görsel üretimi sırasında bir hata oluştu.',
    });
  }
});

/**
 * POST /api/inpaint
 * Imagen ile mask-based inpainting işlemi
 * Body: { prompt: string, imageBase64: string, maskBase64: string, mimeType?: string }
 */
router.post('/inpaint', async (req, res) => {
  try {
    const { prompt, imageBase64, maskBase64, mimeType } = req.body;

    if (!prompt || !imageBase64 || !maskBase64) {
      return res.status(400).json({
        success: false,
        error: 'Eksik parametreler: prompt, imageBase64 ve maskBase64 gereklidir.',
      });
    }

    // Orijinal prompt üzerinde Güvenlik ve Etik kontrolü uygula
    const moderation = await checkSafetyAndProductPrompt(prompt);
    if (moderation.status === 'BLOCKED') {
      return res.status(400).json({
        success: false,
        error: moderation.reason
      });
    }
    if (moderation.status === 'INVALID') {
      return res.status(400).json({
        success: false,
        error: moderation.reason
      });
    }

    // Inpainting promptundaki UI referanslarını temizle ve İngilizceye çevir
    const enrichedPrompt = await enrichInpaintPrompt(prompt);

    const result = await inpaintImageWithImagen(enrichedPrompt, imageBase64, maskBase64);

    return res.json({
      success: true,
      imageBase64: result.imageBase64,
      mimeType: result.mimeType,
      text: 'Görsel başarıyla düzenlendi.',
    });

  } catch (error) {
    console.error('❌ Inpainting hatası:', error.message);
    return res.status(500).json({
      success: false,
      error: error.message || 'Görsel düzenlenirken bir hata oluştu.',
    });
  }
});

/**
 * POST /api/chat-edit
 * Chatbot: Kullanıcı mesajı + mevcut görsel → Güncellenmiş görsel + Türkçe cevap
 * Body: { message: string, imageBase64?: string, mimeType?: string }
 */
router.post('/chat-edit', async (req, res) => {
  try {
    const { message, imageBase64, mimeType } = req.body;

    if (!message) {
      return res.status(400).json({
        success: false,
        error: 'Lütfen bir mesaj gönderin.',
      });
    }

    if (!imageBase64) {
      return res.status(400).json({
        success: false,
        error: 'Düzenlenecek bir görsel bulunamadı.',
      });
    }

    console.log(`\n💬 Chat-Edit isteği: "${message.substring(0, 60)}..."`);

    // Orijinal prompt üzerinde Güvenlik ve Etik kontrolü uygula
    const moderation = await checkSafetyAndProductPrompt(message);
    if (moderation.status === 'BLOCKED') {
      return res.status(400).json({
        success: false,
        error: moderation.reason
      });
    }
    if (moderation.status === 'INVALID') {
      return res.status(400).json({
        success: false,
        error: moderation.reason
      });
    }

    const result = await chatAndEditImage(message, imageBase64, mimeType || 'image/png');

    return res.json({
      success: true,
      imageBase64: result.imageBase64,
      mimeType: result.mimeType,
      reply: result.text,
    });

  } catch (error) {
    console.error('❌ Chat-Edit hatası:', error.message);
    return res.status(500).json({
      success: false,
      error: error.message || 'Bir hata oluştu.',
    });
  }
});

/**
 * POST /api/personalized-preview
 * Kullanici fotografi + uretilen urun gorseli -> kisisel urun onizlemesi
 * Body: { userPhotoBase64, productImageBase64, userPhotoMimeType?, productImageMimeType?, prompt? }
 */
router.post('/personalized-preview', async (req, res) => {
  try {
    const {
      userPhotoBase64,
      productImageBase64,
      userPhotoMimeType,
      productImageMimeType,
      prompt,
    } = req.body;

    if (!userPhotoBase64 || !productImageBase64) {
      return res.status(400).json({
        success: false,
        error: 'Kullanici fotografi ve urun gorseli gereklidir.',
      });
    }

    console.log('\nKisisel urun onizleme istegi alindi.');

    const result = await generatePersonalizedProductPreview({
      userPhotoBase64,
      userPhotoMimeType: userPhotoMimeType || 'image/png',
      productImageBase64,
      productImageMimeType: productImageMimeType || 'image/png',
      prompt,
    });

    return res.json({
      success: true,
      imageBase64: result.imageBase64,
      mimeType: result.mimeType || 'image/png',
      text: result.text,
    });
  } catch (error) {
    console.error('Kisisel onizleme hatasi:', error.message);
    return res.status(500).json({
      success: false,
      error: error.message || 'Kisisel onizleme uretilirken bir hata olustu.',
    });
  }
});

/**
 * GET /api/status
 * API durumunu kontrol et
 */
router.get('/status', (req, res) => {
  const hasR2Config = !!(process.env.R2_ACCOUNT_ID && process.env.R2_ACCESS_KEY_ID && process.env.R2_SECRET_ACCESS_KEY);
  const hasSerpApiConfig = !!process.env.SERPAPI_API_KEY;
  const hasGeminiConfig = !!process.env.GEMINI_API_KEY;

  res.json({
    status: 'ok',
    config: {
      r2: hasR2Config ? 'configured' : 'missing',
      serpapi: hasSerpApiConfig ? 'configured' : 'missing',
      gemini: hasGeminiConfig ? 'configured' : 'missing',
    },
  });
});

export default router;
