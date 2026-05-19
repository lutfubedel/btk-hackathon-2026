import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';
import { inpaintImageWithImagen } from './services/imagenService.js';

dotenv.config({ path: '../.env' });

async function run() {
  console.log('Project ID:', process.env.GOOGLE_CLOUD_PROJECT_ID);
  
  // Create a 1024x1024 mock base64 white canvas as base image
  const dummyBase64 = 'iVBORw0KGgoAAAANSUhEUgAABAAAAAQAAQMAAABf1619AAAABlBMVEUAAAD///+l2Z/dAAAACXBIWXMAAA7EAAAOxAGVKw4bAAAADUlEQVR4nGGEgAMBAAABAAEBt1VPAAAAAElFTkSuQmCC';
  const dummyMask = 'iVBORw0KGgoAAAANSUhEUgAABAAAAAQAAQMAAABf1619AAAABlBMVEUAAAD///+l2Z/dAAAACXBIWXMAAA7EAAAOxAGVKw4bAAAADUlEQVR4nGGEgAMBAAABAAEBt1VPAAAAAElFTkSuQmCC';
  
  try {
    const res = await inpaintImageWithImagen('a red ball', dummyBase64, dummyMask);
    console.log('Success! Image received of length:', res.imageBase64.length);
  } catch (err) {
    console.error('Inpaint Test Error:', err);
  }
}

run();
