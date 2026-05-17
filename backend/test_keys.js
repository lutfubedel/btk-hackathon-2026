import { GoogleGenAI } from '@google/genai';
import dotenv from 'dotenv';

dotenv.config({ path: '../.env' });

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

try {
  const response = await ai.models.generateContent({
    model: 'gemini-2.5-flash',
    contents: 'Hello',
  });
  console.log("SUCCESS!");
  const part = response.candidates[0].content.parts[0];
  console.log("Part keys:", Object.keys(part));
  console.log("Part JSON:", JSON.stringify(part, null, 2));
} catch (error) {
  console.error("FAILED! Error:", error.message);
}
