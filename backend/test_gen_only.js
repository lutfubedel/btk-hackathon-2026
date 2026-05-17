import { GoogleGenAI } from '@google/genai';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.resolve(__dirname, '../.env') });

console.log("Key length:", process.env.GEMINI_API_KEY ? process.env.GEMINI_API_KEY.length : 0);

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

async function test() {
  try {
    console.log("1. Testing text generation...");
    const textResponse = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: 'Hello',
    });
    console.log("Text success:", textResponse.text);

    console.log("2. Testing image generation with gemini-2.5-flash-image...");
    const imageResponse = await ai.models.generateContent({
      model: 'gemini-2.5-flash-image',
      contents: 'Red sweater',
    });
    console.log("Image success!", Object.keys(imageResponse));
  } catch (err) {
    console.error("Test failed:", err.message);
  }
}

test();
