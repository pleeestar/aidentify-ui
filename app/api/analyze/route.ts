//app/api/analyze/route.ts
import { NextResponse } from 'next/server';
import fs from 'fs/promises';
import path from 'path';

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;
    const scene = formData.get('scene') as string;
    const mode = formData.get('mode') as string;
    const value = formData.get('value') as string | null;
    const rect = formData.get('rect') as string | null;

    // Log for debugging
    console.log('Received:', { file: file?.name, scene, mode, value, rect });

    // Read local dummy image
    const imagePath = path.join(process.cwd(), 'public', 'dummy.jpg');
    const imageBuffer = await fs.readFile(imagePath);
    const dummyImage = new Blob([imageBuffer], { type: 'image/jpeg' });
    
    // Simulate danger value
    const danger = Math.floor(Math.random() * 100); // Random danger value (0-100)

    // Create response with dummy image and danger header
    return new NextResponse(dummyImage, {
      headers: {
        'Content-Type': 'image/jpeg',
        'x-danger': danger.toString(),
      },
    });
  } catch (error) {
    console.error('Error processing request:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}