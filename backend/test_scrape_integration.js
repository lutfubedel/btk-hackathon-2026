import { searchByImage } from './services/serpApiService.js';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.resolve(__dirname, '../.env') });

async function testScraping() {
  const imageUrl = "https://images.unsplash.com/photo-1576566588028-4147f3842f27?q=80&w=1000&auto=format&fit=crop";
  const results = await searchByImage(imageUrl);
  
  console.log("\n--- SCRAPED RESULTS WITH PRICES ---");
  const withPrices = results.filter(r => r.price !== 'Fiyat Yok');
  withPrices.forEach((r, i) => {
    console.log(`${i+1}. ${r.title} - Fiyat: ${r.price} - Kaynak: ${r.source}`);
  });
  console.log(`Total items with price: ${withPrices.length} out of ${results.length}`);
}

testScraping();
