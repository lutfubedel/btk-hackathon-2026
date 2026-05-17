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

/**
 * Görseli analiz ederek SerpAPI/Google Lens araması için en doğru e-ticaret arama terimini (query) oluşturur.
 * @param {string} imageBase64 - Base64 formatında görsel
 * @param {string} mimeType - Görselin MIME tipi
 * @returns {Promise<string>} - Arama terimi (örnek: "Siyah baskılı Rammstein tişört")
 */
export async function generateSearchQueryFromImage(imageBase64, mimeType = 'image/png') {
  console.log(`🤖 Gemini ile görselden e-ticaret arama sorgusu üretiliyor...`);
  
  try {
    const ai = getClient();
    
    // Base64 formatını temizle (eğer data:image/png;base64, ile başlıyorsa)
    const cleanBase64 = imageBase64.replace(/^data:image\/\w+;base64,/, '');

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: [
        {
          role: 'user',
          parts: [
            { inlineData: { mimeType, data: cleanBase64 } },
            { 
              text: `Sen profesyonel bir e-ticaret ürün uzmanı ve görsel analiz uzmanısın. 
              Bu görseldeki ana ürünü son derece BİLİMSEL ve SPESİFİK ayrıntılarıyla analiz et. Genel ve yüzeysel tanımlamalardan (sadece "dolma kalem", "tişört", "ayakkabı" gibi) kesinlikle kaçın!
              Ürünün e-ticaret sitelerinde ve arama motorlarında birebir eşini veya en özel modelini bulabilmek için maksimum düzeyde SPESİFİK, TEKNİK ve AYRINTILI bir arama sorgusu (yaklaşık 8-15 kelime) oluştur.
              
              Sorguyu oluştururken şu kurallara kesinlikle uy:
              1. Genel terimler yerine profesyonel terimler kullan: Dolma kalem yerine "fountain pen with converter/cartridge", Tişört yerine "heavyweight cotton graphic streetwear tee", Spor ayakkabı yerine "retro chunky lifestyle running sneaker".
              2. Ürünün tasarım dilini ve estetiğini belirt: "vintage classic", "minimalist luxury", "gothic/punk", "modern sleek", "industrial".
              3. Malzeme ve doku detaylarını spesifik olarak yaz: "highly polished resin", "matte brushed aluminum", "knurled grip", "suede overlays", "premium leather".
              4. Benzersiz görsel imza veya mekanik unsurları ekle: "engraved dual-tone 18k gold nib", "screw-on cap", "gold plated arrow clip", "split sole", "contrast stitching".
              5. Varsa üzerindeki metinleri, yazıları veya özel logoları/sembolleri tam olarak dahil et.
              
              Örnek Arama Sorguları:
              - "burgundy resin luxury fountain pen gold plated trims engraved arrow clip hooded nib"
              - "heavyweight black cotton drop-shoulder graphic tee metal band print distressed edge"
              - "retro chunky white running sneaker suede leather overlays gum outsole split tongue"
              
              Yanıtında sadece ve sadece bu spesifik arama sorgusu yer alsın. Açıklama, tırnak işareti, başlık, kod blokları veya ekstra hiçbir şey yazma.`
            },
          ],
        },
      ],
    });

    const query = response.candidates?.[0]?.content?.parts?.[0]?.text?.trim() || '';
    console.log(`🔍 Üretilen Arama Sorgusu: "${query}"`);
    return query;
  } catch (error) {
    console.error('❌ Arama sorgusu üretme hatası:', error.message);
    return ''; // Hata durumunda boş döner
  }
}
