import { GoogleGenAI } from '@google/genai';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: '../.env' });

console.log("Testing API Key:", process.env.GEMINI_API_KEY);

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

try {
  const response = await ai.models.generateContent({
    model: 'gemini-3.1-flash-image-preview',
    contents: 'Koyu mavi gövdeli bir kalem resmi üret',
  });
  console.log("SUCCESS!");
  console.log("Response Keys:", Object.keys(response));
  console.log("Candidates Type:", typeof response.candidates);
  console.log("First Candidate Keys:", Object.keys(response.candidates[0]));
  console.log("Content Keys:", Object.keys(response.candidates[0].content));
  console.log("Parts Length:", response.candidates[0].content.parts.length);
  console.log("First Part Keys:", Object.keys(response.candidates[0].content.parts[0]));
  if (response.candidates[0].content.parts[0].inlineData) {
    console.log("inlineData exists!");
    console.log("inlineData keys:", Object.keys(response.candidates[0].content.parts[0].inlineData));
  } else {
    console.log("NO inlineData!");
  }
} catch (error) {
  console.error("FAILED! Error:", error.message);
}
