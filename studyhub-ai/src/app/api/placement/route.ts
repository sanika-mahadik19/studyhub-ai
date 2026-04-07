import { NextResponse } from 'next/server';
import axios from 'axios';
import { getDomainForTopic, getStatsForDomain } from '@/lib/placement-lookup';
import { buildPlacementPrompt } from '@/lib/prompts';

const GROQ_API_URL = 'https://api.groq.com/openai/v1/chat/completions';
const GROQ_API_KEY = process.env.GROQ_API_KEY;

export async function POST(req: Request) {
  try {
    const { topic } = await req.json();

    if (!topic) {
      return NextResponse.json({ error: 'No topic provided' }, { status: 400 });
    }

    const domain = getDomainForTopic(topic);
    const stats = getStatsForDomain(domain);
    const prompt = buildPlacementPrompt(topic, stats);

    const response = await axios.post(
      GROQ_API_URL,
      {
        model: 'llama3-8b-8192',
        messages: [
          { role: 'system', content: 'You are a career counselor providing data-backed placement advice.' },
          { role: 'user', content: prompt }
        ],
        max_tokens: 300
      },
      {
        headers: {
          'Authorization': `Bearer ${GROQ_API_KEY}`,
          'Content-Type': 'application/json'
        }
      }
    );

    const tip = response.data.choices[0].message.content;

    return NextResponse.json({ tip, stats });
  } catch (error: any) {
    console.error('API Placement Error:', error);
    return NextResponse.json({ error: 'Failed to generate placement tips' }, { status: 500 });
  }
}
