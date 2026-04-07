import { NextResponse } from 'next/server';
import { summarizeText } from '@/lib/hf';

export async function POST(req: Request) {
  try {
    const { text } = await req.json();

    if (!text) {
      return NextResponse.json({ error: 'No text provided' }, { status: 400 });
    }

    const summary = await summarizeText(text);
    
    // Split into bullets for better student consumption
    const bullets = summary
      .split('.')
      .map((s: string) => s.trim())
      .filter((s: string) => s.length > 5);

    return NextResponse.json({ summary, bullets });
  } catch (error: any) {
    console.error('API Summarize Error:', error);
    return NextResponse.json({ error: 'Failed to summarize' }, { status: 500 });
  }
}
