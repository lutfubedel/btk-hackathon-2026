import { GoogleGenAI } from '@google/genai';
import dotenv from 'dotenv';

dotenv.config({ path: '../.env' });

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

try {
  const response = await ai.models.generateContent({
    model: 'gemini-3.1-flash-image-preview',
    contents: 'A red circle',
  });
  console.log("SUCCESS!");
  const part = response.candidates[0].content.parts[0];
  console.log("Part keys:", Object.keys(part));
  if (part.inlineData) {
    console.log("Found inlineData!");
    console.log("inlineData keys:", Object.keys(part.inlineData));
  }
  if (part.inline_data) {
    console.log("Found inline_data!");
    console.log("inline_data keys:", Object.keys(part.inline_data));
  }
  console.log("Part JSON:", JSON.stringify(part, null, 2).substring(0, 500));
} catch (error) {
  console.error("FAILED! Error:", error.message);
}
