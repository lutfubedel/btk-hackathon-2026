import { getJson } from 'serpapi';

/**
 * Web sayfasının HTML'ini (sadece ilk 300KB) indirerek içindeki fiyat meta etiketlerini arar.
 * İşlemi hızlı tutmak için 4 saniyelik timeout uygulanır.
 * NOT: Dinamik JS ile yüklenen siteler (Trendyol, Hepsiburada vb.) bu yöntemle çekilemez.
 */
async function fetchPriceFromWeb(url) {
  if (!url || url === '#') return null;
  try {
    const controller = new AbortController();
    const id = setTimeout(() => controller.abort(), 4000);

    const response = await fetch(url, {
      signal: controller.signal,
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
        'Accept-Language': 'tr-TR,tr;q=0.9,en-US;q=0.8,en;q=0.7',
      }
    });

    clearTimeout(id);
    if (!response.ok) return null;

    // Sadece ilk 300KB'i alarak performansı artır
    const reader = response.body.getReader();
    const decoder = new TextDecoder('utf-8');
    let html = '';
    let bytesRead = 0;

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      bytesRead += value.length;
      html += decoder.decode(value, { stream: true });
      if (bytesRead > 300000) {
        reader.cancel();
        break;
      }
    }

    // 1. Meta og:price:amount veya product:price:amount
    const amountMatch = html.match(/<meta\s+(?:property|name)="[^"]*price:amount"\s+content="([^"]+)"/i);
    const currencyMatch = html.match(/<meta\s+(?:property|name)="[^"]*price:currency"\s+content="([^"]+)"/i);

    // 2. JSON-LD içinde price arama
    const jsonLdMatch = html.match(/"price"\s*:\s*"?(\d+(?:[.,]\d{1,2})?)"?/i);
    const jsonLdCurrencyMatch = html.match(/"priceCurrency"\s*:\s*"([^"]+)"/i);

    if (amountMatch?.[1]) {
      const currency = currencyMatch?.[1] ?? 'TL';
      return `${amountMatch[1]} ${currency}`;
    }

    if (jsonLdMatch?.[1]) {
      const currency = jsonLdCurrencyMatch?.[1] ?? 'TL';
      return `${jsonLdMatch[1]} ${currency}`;
    }

    return null;
  } catch {
    return null;
  }
}

/**
 * SerpAPI'den gelen ham price nesnesini güvenli şekilde string'e çevirir.
 * Fiyat bilgisi yoksa null döner.
 */
function parseSerpPrice(priceField) {
  if (!priceField) return null;

  if (typeof priceField === 'string') {
    const cleaned = priceField.replace(/\*/g, '').trim();
    return cleaned.length > 0 ? cleaned : null;
  }

  if (priceField.value) {
    const cleaned = priceField.value.replace(/\*/g, '').trim();
    return cleaned.length > 0 ? cleaned : null;
  }

  if (priceField.extracted_value != null) {
    const currency = priceField.currency ?? 'TL';
    return `${priceField.extracted_value} ${currency}`;
  }

  return null;
}

const NON_ECOMMERCE_DOMAINS = [
  'pinterest.',
  'facebook.com',
  'fb.com',
  'instagram.com',
  'twitter.com',
  'x.com',
  'tiktok.com',
  'youtube.com',
  'youtu.be',
  't.me',
  'telegram.org',
  'linkedin.com',
  'reddit.com',
  'tumblr.com',
  'behance.net',
  'dribbble.com',
  'flickr.com',
  'unsplash.com',
  'shutterstock.com',
  'istockphoto.com',
  'freepik.com',
  'dreamstime.com',
  'alamy.com',
  'canva.com',
  'medium.com',
  'blogspot.com',
  'wordpress.com'
];

/**
 * Verilen URL'in e-ticaret dışı (sosyal medya, blog vb.) bir site olup olmadığını kontrol eder.
 */
function isEcommerceSite(link) {
  if (!link || link === '#') return false;
  try {
    const url = new URL(link);
    const hostname = url.hostname.toLowerCase();
    
    // E-ticaret dışı sitelerden biriyle eşleşiyorsa false döner
    return !NON_ECOMMERCE_DOMAINS.some(domain => hostname.includes(domain));
  } catch {
    return false;
  }
}

/**
 * SerpAPI Google Lens ile görsel arama yapar.
 *
 * Fiyat öncelik sırası:
 *   1. SerpAPI'nin döndürdüğü fiyat (en güvenilir)
 *   2. Ürün sayfasından HTML scraping ile çekilen fiyat
 *   3. Fiyat hâlâ null ise ürün listeden çıkarılır — asla gösterilmez
 *
 * @param {string} imageUrl    - Aranacak görselin public URL'i
 * @param {string} searchQuery - Sonuçları filtrelemek için arama terimi (opsiyonel)
 * @returns {Promise<Array>}   - Yalnızca fiyatı doğrulanmış ürün listesi
 */
export async function searchByImage(imageUrl, searchQuery = '') {
  console.log(`🔍 Google Lens araması başlatılıyor: ${imageUrl} (Sorgu: "${searchQuery}")`);

  try {
    const response = await getJson({
      engine: 'google_lens',
      url: imageUrl,
      api_key: process.env.SERPAPI_API_KEY,
      hl: 'tr',
      country: 'tr',
      auto_crop: true,
      ...(searchQuery ? { q: searchQuery } : {})
    });

    const visualMatches = response.visual_matches ?? [];
    console.log(`✅ ${visualMatches.length} görsel eşleşme bulundu`);

    // E-ticaret dışı platformları (Facebook, Instagram, Pinterest vb.) en baştan ele
    const ecommerceMatches = visualMatches.filter(match => isEcommerceSite(match.link));
    console.log(`🧹 Filtreleme sonrası: ${ecommerceMatches.length} e-ticaret eşleşmesi kaldı`);

    // İlk 100 sonucu normalize et
    const results = ecommerceMatches.slice(0, 100).map((match, index) => ({
      position: index + 1,
      title: match.title || 'Başlık yok',
      link: match.link || '#',
      source: match.source || 'Bilinmeyen kaynak',
      sourceIcon: match.source_icon ?? null,
      thumbnail: match.thumbnail ?? null,
      image: match.image ?? match.thumbnail ?? null,
      price: parseSerpPrice(match.price), // null olabilir
      inStock: match.in_stock ?? null,
      rating: match.rating ?? null,
      reviews: match.reviews ?? null,
    }));

    // --- 2. KATMAN: SerpAPI fiyatı null olan ilk 40 sonuç için scraping ---
    const toScrape = results.slice(0, 40).filter(r => r.price === null);

    if (toScrape.length > 0) {
      console.log(`⏱️ SerpAPI fiyatı eksik ${toScrape.length} ürün için web kazıması başlatılıyor...`);

      await Promise.all(
        toScrape.map(async (item) => {
          const scrapedPrice = await fetchPriceFromWeb(item.link);
          if (scrapedPrice) {
            item.price = scrapedPrice.replace(/\*/g, '').trim();
            console.log(`💰 Fiyat çekildi [${item.source}]: ${item.price}`);
          } else {
            console.warn(`⚠️ Fiyat çekilemedi, listeden çıkarılıyor: ${item.link}`);
          }
        })
      );
    }

    // --- FİLTRELEME: Fiyatı null olan tüm ürünleri listeden çıkar ---
    const pricedResults = results.filter(r => r.price !== null);

    // Pozisyonları yeniden numaralandır
    pricedResults.forEach((item, index) => {
      item.position = index + 1;
    });

    // Özet log
    const removed = results.length - pricedResults.length;
    console.log(`📊 Özet → Toplam: ${results.length} | Fiyatlı: ${pricedResults.length} | Çıkarılan: ${removed}`);

    return pricedResults;
  } catch (error) {
    console.error('❌ SerpAPI hatası:', error.message);
    throw new Error(`Google Lens araması başarısız: ${error.message}`);
  }
}