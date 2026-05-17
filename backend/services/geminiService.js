import { GoogleGenAI } from '@google/genai';

let aiClient = null;

function getClient() {
  if (aiClient) return aiClient;

  if (!process.env.GEMINI_API_KEY) {
    throw new Error('GEMINI_API_KEY yapılandırması eksik. Lütfen .env dosyasını kontrol edin.');
  }

  aiClient = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
  return aiClient;
}

/**
 * Gemini API ile sıfırdan görsel üretir
 * @param {string} prompt - Görsel üretim açıklaması
 * @returns {Promise<{imageBase64: string, mimeType: string, text?: string}>}
 */
export async function generateImage(prompt) {
  console.log(`🎨 Gemini görsel üretimi başlatılıyor: "${prompt.substring(0, 60)}..."`);

  const ai = getClient();

  const response = await ai.models.generateContent({
    model: 'gemini-2.5-flash-image',
    contents: [prompt],
  });

  return extractImageFromResponse(response);
}

/**
 * Gemini API ile mevcut görseli prompt'a göre düzenler
 * @param {string} prompt - Düzenleme açıklaması
 * @param {string} imageBase64 - Mevcut görselin base64 verisi
 * @param {string} mimeType - Görselin MIME tipi
 * @returns {Promise<{imageBase64: string, mimeType: string, text?: string}>}
 */
export async function editImage(prompt, imageBase64, mimeType = 'image/png') {
  console.log(`✏️ Gemini görsel düzenleme başlatılıyor: "${prompt.substring(0, 60)}..."`);

  const ai = getClient();

  const response = await ai.models.generateContent({
    model: 'gemini-2.5-flash-image',
    contents: [
      {
        role: 'user',
        parts: [
          { inlineData: { mimeType, data: imageBase64 } },
          { text: prompt },
        ],
      },
    ],
  });

  return extractImageFromResponse(response);
}

/**
 * Gemini yanıtından görsel verisini çıkarır
 */
function extractImageFromResponse(response) {
  let text = null;
  let imageBase64 = null;
  let mimeType = null;

  if (!response.candidates || !response.candidates[0]?.content?.parts) {
    throw new Error('Gemini API geçerli bir yanıt döndürmedi.');
  }

  for (const part of response.candidates[0].content.parts) {
    if (part.text) {
      text = part.text;
    }
    if (part.inlineData) {
      imageBase64 = part.inlineData.data;
      mimeType = part.inlineData.mimeType;
    }
  }

  if (imageBase64) {
    console.log(`✅ Görsel başarıyla üretildi (${mimeType})`);
  } else if (text) {
    console.log(`💬 Gemini metin yanıtı döndürdü: "${text.substring(0, 60)}..."`);
  } else {
    throw new Error('Gemini API herhangi bir görsel veya metin üretmedi.');
  }

  return { imageBase64, mimeType, text };
}
