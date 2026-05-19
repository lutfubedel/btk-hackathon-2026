import { GoogleGenAI } from '@google/genai';
import { GoogleAuth } from 'google-auth-library';
import { checkSafetyAndProductPrompt } from './geminiService.js';

let aiClient = null;

// Gemini API bağlantısını başlat (Agent Platform API Key)
function getGenAIClient() {
  if (aiClient) return aiClient;

  if (!process.env.IMAGEN_API_KEY) {
    throw new Error('IMAGEN_API_KEY yapılandırması eksik.');
  }

  aiClient = new GoogleGenAI({ apiKey: process.env.IMAGEN_API_KEY });
  return aiClient;
}

// Vertex AI REST API için Google Auth
const auth = new GoogleAuth({
  scopes: 'https://www.googleapis.com/auth/cloud-platform'
});

// Merkezi, dayanıklı ve yedekli Vertex AI istek motoru (503 yoğunluk hatalarını çözer)
async function callVertexAIWithRetry(prompt, imageBase64 = null, maskBase64 = null, isInpaint = false) {
  const projectId = process.env.GOOGLE_CLOUD_PROJECT_ID;
  const location = process.env.GOOGLE_CLOUD_LOCATION || 'us-central1';
  
  if (!projectId) {
    throw new Error('GOOGLE_CLOUD_PROJECT_ID yapılandırması eksik.');
  }

  const client = await auth.getClient();
  const token = await client.getAccessToken();

  // Ana model yoğunsa hızlı yedek modele (fast) otomatik geçiş yap (Fast model inpainting desteklemez)
  const modelsToTry = isInpaint 
    ? ['imagen-3.0-capability-001'] 
    : ['imagen-3.0-generate-002', 'imagen-3.0-fast-generate-001'];

  let lastError = null;

  for (const model of modelsToTry) {
    const endpoint = `https://${location}-aiplatform.googleapis.com/v1/projects/${projectId}/locations/${location}/publishers/google/models/${model}:predict`;

    const payload = {
      instances: isInpaint ? [
        {
          prompt: prompt,
          referenceImages: [
            {
              referenceId: 1,
              referenceType: 'REFERENCE_TYPE_RAW',
              referenceImage: {
                bytesBase64Encoded: imageBase64.replace(/^data:image\/\w+;base64,/, ''),
                mimeType: 'image/png'
              }
            },
            {
              referenceId: 2,
              referenceType: 'REFERENCE_TYPE_MASK',
              referenceImage: {
                bytesBase64Encoded: maskBase64.replace(/^data:image\/\w+;base64,/, ''),
                mimeType: 'image/png'
              },
              maskImageConfig: {
                maskMode: 'MASK_MODE_USER_PROVIDED'
              }
            }
          ]
        }
      ] : [
        {
          prompt: prompt
        }
      ],
      parameters: isInpaint ? {
        editMode: 'EDIT_MODE_INPAINT_INSERTION',
        sampleCount: 1,
      } : {
        sampleCount: 1,
        aspectRatio: '1:1',
        outputMimeType: 'image/png'
      }
    };

    // 503 durumlarında her model için 5 kez üstel gecikmeli (exponential backoff) olarak yeniden dene
    const maxAttempts = 5;
    for (let attempt = 1; attempt <= maxAttempts; attempt++) {
      try {
        console.log(`📡 [Model: ${model}] İstek gönderiliyor (Deneme ${attempt}/${maxAttempts})...`);
        const response = await fetch(endpoint, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token.token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(payload)
        });

        if (!response.ok) {
          const errorText = await response.text();
          let parsedError = {};
          try { parsedError = JSON.parse(errorText); } catch(e) {}
          
          const statusCode = response.status;
          console.warn(`⚠️ [Model: ${model}] Hata yanıtı aldık: ${statusCode}`);
          
          // Eğer geçici yoğunluk (503 / UNAVAILABLE / high demand) ise bekle ve tekrar dene
          if (statusCode === 503 || (parsedError.error && parsedError.error.code === 503) || errorText.includes('UNAVAILABLE') || errorText.includes('high demand')) {
            const delayMs = Math.min(8000, Math.pow(1.8, attempt) * 1000); // 1.8s, 3.24s, 5.83s, 8s, 8s
            console.log(`⏳ Vertex AI yoğun. ${attempt}/${maxAttempts} deneme başarısız. ${(delayMs / 1000).toFixed(1)}s bekleniyor ve yeniden denenecek...`);
            await new Promise(resolve => setTimeout(resolve, delayMs));
            lastError = new Error(errorText);
            continue; 
          }
          
          throw new Error(`Vertex AI hatası: ${statusCode} - ${errorText}`);
        }

        const data = await response.json();
        if (!data.predictions || data.predictions.length === 0) {
          throw new Error('Vertex AI prediction sonucu döndürmedi.');
        }

        console.log(`✅ [Model: ${model}] Görsel başarıyla üretildi/düzenlendi.`);
        return data.predictions[0].bytesBase64Encoded;

      } catch (err) {
        lastError = err;
        // 503 ve geçici ağ sorunları dışındaki (403, 400 vb.) kritik hatalarda doğrudan hata fırlat
        if (!err.message.includes('503') && !err.message.includes('UNAVAILABLE') && !err.message.includes('high demand')) {
          throw err;
        }

        // Ağ veya geçici yoğunluk durumlarında bekle ve tekrar dene
        if (attempt < maxAttempts) {
          const delayMs = Math.min(8000, Math.pow(1.8, attempt) * 1000);
          console.log(`⏳ Vertex AI bağlantı hatası/yoğunluk. ${attempt}/${maxAttempts} deneme başarısız. ${(delayMs / 1000).toFixed(1)}s bekleniyor...`);
          await new Promise(resolve => setTimeout(resolve, delayMs));
        }
      }
    }
  }

  throw lastError || new Error("Görsel üretimi tüm denemelere ve yedek modellere rağmen başarısız oldu.");
}

// Sıfırdan görsel üretir (Imagen 3 / Vertex AI - Dayanıklı & Yedekli)
export async function generateImageWithImagen(prompt) {
  console.log(`\n🎨 Vertex AI Imagen görsel üretimi başlatılıyor: "${prompt.substring(0, 60)}..."`);
  
  const moderation = await checkSafetyAndProductPrompt(prompt);
  if (moderation.status !== 'VALID') {
    throw new Error(moderation.reason);
  }

  const imageBase64 = await callVertexAIWithRetry(prompt, null, null, false);
  return { imageBase64, mimeType: 'image/png' };
}

// Mask-based inpainting (Vertex AI - Dayanıklı & Yedekli)
export async function inpaintImageWithImagen(prompt, imageBase64, maskBase64) {
  console.log(`\n🖌️ Imagen bölgesel düzenleme (Inpainting) başlatılıyor: "${prompt.substring(0, 60)}..."`);
  
  const moderation = await checkSafetyAndProductPrompt(prompt);
  if (moderation.status === 'BLOCKED') {
    throw new Error(moderation.reason);
  }

  const resultBase64 = await callVertexAIWithRetry(prompt, imageBase64, maskBase64, true);
  return { imageBase64: resultBase64, mimeType: 'image/png' };
}
