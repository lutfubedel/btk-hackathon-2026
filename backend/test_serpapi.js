import { getJson } from 'serpapi';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.resolve(__dirname, '../.env') });

async function testSerpApi() {
  try {
    const imageUrl = "https://images.unsplash.com/photo-1576566588028-4147f3842f27?q=80&w=1000&auto=format&fit=crop"; // A t-shirt/sweater image
    console.log(`🔍 Testing SerpAPI with image: ${imageUrl}`);

    const response = await getJson({
      engine: 'google_lens',
      url: imageUrl,
      api_key: process.env.SERPAPI_API_KEY,
      hl: 'tr',
      country: 'tr',
    });

    const visualMatches = response.visual_matches || [];
    console.log(`Found ${visualMatches.length} matches.`);

    // Print the first 5 matches to see what fields they have
    for (let i = 0; i < Math.min(5, visualMatches.length); i++) {
      const match = visualMatches[i];
      console.log(`\nMatch #${i + 1}:`);
      console.log(`Title: ${match.title}`);
      console.log(`Source: ${match.source}`);
      console.log(`Price Field:`, match.price);
      console.log(`Full Match JSON:`, JSON.stringify(match, null, 2));
    }

  } catch (error) {
    console.error("Error:", error);
  }
}

testSerpApi();
