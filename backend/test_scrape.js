import https from 'https';

async function fetchPrice(url) {
  return new Promise((resolve) => {
    https.get(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
      }
    }, (res) => {
      let data = '';
      res.on('data', (chunk) => {
        data += chunk;
        // Stop early if we find a price to save memory/time
        if (data.length > 500000) res.destroy(); // 500kb max
      });

      res.on('end', () => {
        // Try to find og:price:amount
        const ogPriceMatch = data.match(/<meta\s+property="og:price:amount"\s+content="([^"]+)"/i) || 
                             data.match(/<meta\s+name="product:price:amount"\s+content="([^"]+)"/i) ||
                             data.match(/"price"\s*:\s*(\d+(\.\d{1,2})?)/);
        
        const currencyMatch = data.match(/<meta\s+property="og:price:currency"\s+content="([^"]+)"/i) || ["", "TL"];

        if (ogPriceMatch) {
          resolve(`${ogPriceMatch[1]} ${currencyMatch[1]}`);
        } else {
          resolve(null);
        }
      });
      res.on('error', () => resolve(null));
    }).on('error', () => resolve(null));
  });
}

async function test() {
  const url = "https://events.anythinklibraries.org/event/5865866"; // A URL from our SerpApi test
  const url2 = "https://haaken.qodeinteractive.com/masonry-category/";
  console.log("Fetching...", url);
  console.log("Price:", await fetchPrice(url));
  
  console.log("Fetching...", url2);
  console.log("Price:", await fetchPrice(url2));
}

test();
