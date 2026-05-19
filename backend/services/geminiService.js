import { GoogleGenAI } from '@google/genai';

let aiClient = null;

// Gemini API bağlantısını başlat
function getClient() {
  if (aiClient) return aiClient;

  if (!process.env.GEMINI_API_KEY) {
    throw new Error('GEMINI_API_KEY yapılandırması eksik. Lütfen .env dosyasını kontrol edin.');
  }

  aiClient = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
  return aiClient;
}

const MODERATION_PROMPT = `Sen bir içerik denetleme asistanısın. Kullanıcının aşağıdaki promptunu analiz et ve
yalnızca "EVET" veya "HAYIR" ile yanıtla.

Soru: Bu prompt, internette satılabilecek somut bir ürünün (örneğin: ayakkabı, kalem, elbise,
çanta, telefon kılıfı, kulaklık, saat, kitap, mobilya, elektronik ürün vb.) resmi üretmek
için mi kullanılıyor?

Aşağıdaki kategoriler için HAYIR de:
- Doğa (dağ, orman, nehir, gökyüzü, gün batımı vb.)
- Hayvanlar (kedi, köpek, kuş, balık vb.)
- İnsanlar veya insan yüzleri
- Soyut sanat
- Manzara fotoğrafları
- Fantastik veya mitolojik varlıklar
- Bitkiler veya çiçekler (ürün olarak satılmıyorsa)

Kullanıcı promptu:
"{user_prompt}"

Yanıt (sadece EVET veya HAYIR):`;

export async function checkProductPrompt(prompt) {
  console.log(`🔍 Prompt kontrol ediliyor: "${prompt.substring(0, 60)}..."`);
  
  const ai = getClient();
  const moderationText = MODERATION_PROMPT.replace('{user_prompt}', prompt);

  const response = await ai.models.generateContent({
    model: 'gemini-2.5-flash',
    contents: [moderationText],
  });

  const answer = response.candidates?.[0]?.content?.parts?.[0]?.text?.trim().toUpperCase() || '';
  const isProduct = answer.startsWith('EVET');

  const reason = isProduct
    ? 'Prompt ürün ile ilgili, resim üretiliyor...'
    : 'Hata: Yalnızca internette satılabilecek ürünlerin resimleri üretilebilir. ';

  console.log(reason);

  return { isProduct, reason };
}

const EDIT_MODERATION_PROMPT = `Sen bir içerik denetleme asistanısın. Sana bir ürün görseli ve kullanıcının bu görsel üzerinde yapmak istediği düzenleme isteği verilecek.
Yalnızca "EVET" veya "HAYIR" ile yanıtla.

Soru: Bu düzenleme isteği, GÖRSELDE ZATEN VAR OLAN ürünü koruyarak o ürün üzerinde bir değişiklik mi yapıyor?
(Örneğin renk, arka plan, doku, materyal, ışık değiştirme gibi.)

HAYIR de eğer:
- Kullanıcı görseldeki ürünü tamamen farklı bir ürüne veya nesneye dönüştürmek istiyorsa (elbise varken kulaklık, çanta varken ayakkabı gibi)
- Doğa, manzara, hayvan, insan veya soyut sanat üretimi isteniyorsa
- Görseldeki ürünle alakasız yeni bir sahne yaratılmak isteniyorsa
- "Yeni bir şey yap", "farklı ürün oluştur" gibi ifadeler kullanılıyorsa

Düzenleme isteği: "{edit_prompt}"

Yanıt (sadece EVET veya HAYIR):`;

export async function checkEditPrompt(editPrompt, imageBase64 = null, mimeType = 'image/png') {
  console.log(`🔍 Düzenleme isteği kontrol ediliyor: "${editPrompt.substring(0, 60)}..."`);

  const ai = getClient();
  const moderationText = EDIT_MODERATION_PROMPT.replace('{edit_prompt}', editPrompt);

  // Orijinal görsel varsa multimodal (görsel + metin) olarak kontrol et
  // Bu sayede "elbise varken kulaklık isteniyor" gibi konu değiştirmeler tespit edilir
  const parts = [];
  if (imageBase64) {
    const cleanBase64 = imageBase64.replace(/^data:image\/\w+;base64,/, '');
    parts.push({ inlineData: { mimeType, data: cleanBase64 } });
  }
  parts.push({ text: moderationText });

  const response = await ai.models.generateContent({
    model: 'gemini-2.5-flash',
    contents: [{ role: 'user', parts }],
  });

  const answer = response.candidates?.[0]?.content?.parts?.[0]?.text?.trim().toUpperCase() || '';
  const isValidEdit = answer.startsWith('EVET');

  const reason = isValidEdit
    ? 'Düzenleme isteği geçerli, görsel güncelleniyor...'
    : 'Hata: Bu düzenleme isteği görseldeki ürünle uyumsuz. Yalnızca mevcut ürün üzerinde değişiklik yapılabilir (renk, arka plan, doku vb.).';

  console.log(isValidEdit ? `✅ ${reason}` : `❌ ${reason}`);

  return { isValidEdit, reason };
}

// [LEGACY] Gemini tabanlı — şu anda Imagen kullanılıyor
// Gemini API ile sıfırdan görsel üretir
export async function generateImage(prompt) {
  console.log(`🎨 Gemini görsel üretimi başlatılıyor: "${prompt.substring(0, 60)}..."`);

  const ai = getClient();

  const response = await ai.models.generateContent({
    model: 'gemini-2.5-flash-image',
    contents: [prompt],
  });

  return extractImageFromResponse(response);
}

// [LEGACY] Gemini tabanlı — şu anda Imagen kullanılıyor
// Gemini API ile mevcut görseli prompt'a göre düzenler
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
 * [LEGACY] Gemini tabanlı — şu anda Imagen kullanılıyor
 * Chatbot entegrasyonu: Kullanıcı mesajına göre görseli düzenler ve
 * hem güncellenmiş görseli hem de Türkçe dostane bir cevap döndürür.
 */
export async function chatAndEditImage(userMessage, imageBase64, mimeType = 'image/png') {
  console.log(`💬 Chat+Edit isteği: "${userMessage.substring(0, 60)}..."`);

  const ai = getClient();
  let result = { imageBase64: null, mimeType: null, text: null };

  try {
    console.log(`🎨 Görsel düzenleniyor...`);
    const imageResponse = await ai.models.generateContent({
      model: 'gemini-2.5-flash-image',
      contents: [
        {
          role: 'user',
          parts: [
            { inlineData: { mimeType, data: imageBase64 } },
            { text: userMessage },
          ],
        },
      ],
    });
    
    const imgResult = extractImageFromResponse(imageResponse);
    result.imageBase64 = imgResult.imageBase64;
    result.mimeType = imgResult.mimeType;
  } catch (err) {
    console.error('🎨 Görsel üretilirken hata:', err.message);
  }

  try {
    console.log(`💬 Metin yanıtı üretiliyor...`);
    const textResponse = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: [
        {
          role: 'user',
          parts: [
            { text: `Sen bir AI tasarım asistanısın. Kullanıcı şu isteği yaptı: "${userMessage}". Bu değişikliği uyguladığını belirten, Türkçe, samimi ve 1-2 cümlelik kısa bir mesaj yaz. Yanıtında kesinlikle emoji veya herhangi bir simge (simge, ikon, emoji vb.) kullanma. Asla emoji içermemelidir.` },
          ],
        },
      ],
    });
    result.text = textResponse.candidates?.[0]?.content?.parts?.[0]?.text?.trim();
  } catch (err) {
    console.error('💬 Metin yanıtı üretilirken hata:', err.message);
  }

  // Eğer metin üretilemediyse varsayılan bir yanıt ekle
  if (!result.text) {
    result.text = `"${userMessage}" isteğin uygulandı! Görselin güncellendi.`;
  }

  return result;
}

// Kullanici fotografi + urun tasarimi ile kisisel onizleme gorseli uretir
export async function generatePersonalizedProductPreview({
  userPhotoBase64,
  userPhotoMimeType = 'image/png',
  productImageBase64,
  productImageMimeType = 'image/png',
  prompt = '',
}) {
  console.log('Kisisel urun onizleme istegi alindi.');

  const ai = getClient();
  const cleanUserPhoto = userPhotoBase64.replace(/^data:image\/\w+;base64,/, '');
  const cleanProductImage = productImageBase64.replace(/^data:image\/\w+;base64,/, '');
  const userNote = prompt?.trim()
    ? `\nAdditional user preference: ${prompt.trim()}`
    : '';

  const response = await ai.models.generateContent({
    model: 'gemini-2.5-flash-image',
    contents: [
      {
        role: 'user',
        parts: [
          { inlineData: { mimeType: userPhotoMimeType, data: cleanUserPhoto } },
          { inlineData: { mimeType: productImageMimeType, data: cleanProductImage } },
          {
            text: `You are creating a photorealistic personalized product preview for an e-commerce design tool.

Image 1 is the user's own photo. Image 2 is the product design generated by the user.

Create one new image that shows the same person from Image 1 naturally wearing or using the product from Image 2. Preserve the person's identity, face, skin tone, age, body proportions, and general pose as much as possible. Preserve the product's color, shape, material, logo/text details, and visual style as faithfully as possible.

Adapt the product placement to its category:
- dresses, shirts, jackets, pants and wearable clothing should be fitted on the body;
- glasses should be placed on the face;
- watches, bracelets and rings should be placed on the correct hand or wrist;
- bags, shoes and accessories should be shown naturally with the person.

Make the final image realistic, clean, well lit, and suitable for an online shopping preview. Avoid watermarks, captions, extra text, distorted hands, duplicated limbs, or changing the product into a different object.${userNote}`,
          },
        ],
      },
    ],
  });

  const result = extractImageFromResponse(response);
  if (!result.imageBase64) {
    throw new Error(result.text || 'Kisisel onizleme icin gorsel uretilemedi.');
  }

  return result;
}

// Gemini yanıtından görsel verisini çıkarır
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

// Görseli analiz ederek SerpAPI/Google Lens araması için en doğru e-ticaret arama terimini (query) oluşturur.
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

// Türkçe promptu profesyonel İngilizce Imagen ürün promptuna dönüştürür ve zenginleştirir
export async function enrichProductPrompt(userPrompt) {
  console.log(`🤖 Prompt zenginleştiriliyor ve çevriliyor: "${userPrompt.substring(0, 60)}..."`);
  
  try {
    const ai = getClient();
    
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: [
        {
          role: 'user',
          parts: [
            {
              text: `Sen profesyonel bir yapay zeka görsel tasarım uzmanısın (Prompt Engineer). 
              Kullanıcının Türkçe olarak girdiği ürün tasarım isteğini analiz et ve onu Imagen 3 modelinin kusursuzca anlayabileceği, son derece detaylı, profesyonel stüdyo kalitesinde bir İngilizce ürün tasarımı promptuna dönüştür.
              
              Kurallar:
              1. Eğer kullanıcı promptta hangi ürünü tasarlamak istediğini açıkça belirtmediyse (örn: sadece "arka planı yeşil, üzerinde kız kulesi olan" dediyse), bunu otomatik olarak bir "sneaker shoe" (spor ayakkabı) tasarımı olarak ele al ve promptu ayakkabı tasarımına uyarla.
              2. Yerel ve kültürel ifadeleri doğru tercüme et (örn: "Kız Kulesi" -> "Maiden's Tower (historical tower in Istanbul)").
              3. Promptu profesyonel stüdyo detaylarıyla zenginleştir: "commercial product photography", "studio lighting", "high details", "sharp focus", "clean background", "realistic textures".
              4. Yanıtında sadece ve sadece bu İngilizce prompt yer alsın. Açıklama, tırnak işareti veya ek metin kesinlikle ekleme.
              
              Kullanıcı İsteyi: "${userPrompt}"
              
              Zenginleştirilmiş İngilizce Prompt:`
            }
          ]
        }
      ]
    });

    const enrichedPrompt = response.candidates?.[0]?.content?.parts?.[0]?.text?.trim() || userPrompt;
    console.log(`✨ Zenginleştirilmiş Prompt: "${enrichedPrompt}"`);
    return enrichedPrompt;
  } catch (error) {
    console.error('❌ Prompt zenginleştirme hatası:', error.message);
    return userPrompt; // Hata durumunda orijinal promptu döndür
  }
}

// Türkçe inpainting promptundaki UI/çizim referanslarını temizler ve profesyonel İngilizce açıklamaya dönüştürür
export async function enrichInpaintPrompt(userPrompt) {
  console.log(`🤖 Inpainting promptu zenginleştiriliyor: "${userPrompt.substring(0, 60)}..."`);
  
  try {
    const ai = getClient();
    
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: [
        {
          role: 'user',
          parts: [
            {
              text: `Sen profesyonel bir yapay zeka görsel tasarım uzmanısın (Prompt Engineer).
              Sana kullanıcının bir ürün görseli üzerinde fırçayla boyadığı/seçtiği alana yeni bir şey eklemek veya mevcut bir şeyi değiştirmek için yazdığı Türkçe istek verilecek.
              
              Görevin:
              1. Kullanıcının Türkçe isteğindeki "yuvarlak içine aldığım", "boyadığım", "seçtiğim" gibi çizim/UI yönergelerini tamamen TEMİZLE.
              2. Kullanıcının o alanda görmek istediği NİHAİ nesneyi/özelliği tespit et.
              3. Bu nihai nesneyi/özelliği Imagen 3 modelinin kusursuzca anlayabileceği profesyonel stüdyo kalitesinde detaylı bir İngilizce prompta dönüştür.
              
              KRİTİK DİFÜZYON KURALLARI (DOKUNULMAZ):
              - SADECE NİHAİ NESNEYİ TANIMLA: Prompt, seçili alanda **sadece görünmesini istediğimiz yeni nesneyi** tasvir etmelidir.
              - ASLA İŞLEM TALİMATI YAZMA: Prompt içerisinde asla "replace" (yerine koy), "erase" (sil), "delete" (yok et), "instead of" (yerine) gibi eylem kelimeleri **kullanılmamalıdır**.
              - ASLA ESKİ NESNEYİ ANMA: Prompt içerisinde silinecek/değişecek olan eski nesnenin veya eski yazının adı (örn: "Rammstein" veya "gold") **kesinlikle geçmemelidir**! Çünkü difüzyon modelleri olumsuzlama anlamaz ve eski nesnenin adını görünce onu yok etmek yerine tekrar çizmeye çalışır ya da kafası karışıp hiçbir değişiklik yapmaz.
              - METİN YAZDIRMA (TEXT WRITING): Eğer kullanıcı alana bir metin yazdırmak istiyorsa, promptta yazılacak metni tırnak içinde büyük harflerle tam haliyle belirt (örn: reads exactly "YASA FENERBAHCE" in uppercase). Metnin son derece temiz, okunaklı, sans-serif fontta ve hatasız (no typos, sharp characters) olacağını vurgula.
              
              Doğru Örnekler:
              - "seçili alan içerisindeki rammstein yazısını silip bunun yerine yaşa fenerbahçe yaz" -> "A clean, sharp white printed text that reads exactly 'YASA FENERBAHCE' in uppercase bold sans-serif font, highly detailed, photorealistic"
              - "yuvarlak içerisine aldığım alana bir beyaz haç çiz" -> "A clean, sharp white cross mark, highly detailed, photorealistic"
              - "seçtiğim alanın içerisine küçük bir siyah kedi koy" -> "A small, cute black cat, realistic textures, highly detailed, photorealistic"
              - "boyadığım yeri deri kaplama yap" -> "Premium leather texture, fine stitching, highly detailed realistic leather"
              - "altın rengi logoyu mavi yap" -> "A rich, vibrant solid blue color with premium metallic texture"
              
              Yanıtında sadece ve sadece bu İngilizce açıklayıcı prompt yer alsın. Açıklama, tırnak işareti veya ek metin kesinlikle ekleme.
              
              Kullanıcı İsteyi: "${userPrompt}"
              
              Zenginleştirilmiş İngilizce Inpainting Prompt:`
            }
          ]
        }
      ]
    });

    const enrichedPrompt = response.candidates?.[0]?.content?.parts?.[0]?.text?.trim() || userPrompt;
    console.log(`✨ Zenginleştirilmiş Inpainting Prompt: "${enrichedPrompt}"`);
    return enrichedPrompt;
  } catch (error) {
    console.error('❌ Inpainting prompt zenginleştirme hatası:', error.message);
    return userPrompt;
  }
}

