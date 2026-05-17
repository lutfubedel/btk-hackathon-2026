import { GoogleGenAI } from '@google/genai';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.resolve(__dirname, '../.env') });

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

async function listModels() {
  try {
    console.log("Listing models...");
    const response = await ai.models.list();
    console.log("Iterating...");
    for await (const m of response) {
      if (m.name.includes("image") || m.name.includes("imagen") || m.name.includes("flash") || m.name.includes("pro")) {
        console.log(`- ${m.name}`);
      }
    }
  } catch (err) {
    console.error("Failed to list models:", err.message);
  }
}

listModels();
