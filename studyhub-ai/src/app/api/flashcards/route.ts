import { NextResponse } from 'next/server';
import axios from 'axios';
import { buildFlashcardsPrompt } from '@/lib/prompts';

const GROQ_API_URL = 'https://api.groq.com/openai/v1/chat/completions';
const GROQ_API_KEY = process.env.GROQ_API_KEY;

export async function POST(req: Request) {
  try {
    const { summary } = await req.json();

    if (!summary) {
      return NextResponse.json({ error: 'No summary provided' }, { status: 400 });
    }

    const prompt = buildFlashcardsPrompt(summary);

    const response = await axios.post(
      GROQ_API_URL,
      {
        model: 'llama3-8b-8192',
        messages: [
          { role: 'system', content: 'You are a helpful study assistant that generates JSON flashcards.' },
          { role: 'user', content: prompt }
        ],
        response_format: { type: 'json_object' }
      },
      {
        headers: {
          'Authorization': `Bearer ${GROQ_API_KEY}`,
          'Content-Type': 'application/json'
        }
      }
    );

    const data = JSON.parse(response.data.choices[0].message.content);
    // Ensure we handle different JSON structures from different models
    const cards = data.cards || data.flashcards || data;

    return NextResponse.json({ cards });
  } catch (error: any) {
    console.error('API Flashcards Error:', error);
    return NextResponse.json({ error: 'Failed to generate flashcards' }, { status: 500 });
  }
}
