import { NextResponse } from 'next/server';
import { askQuestion } from '@/lib/hf';

export async function POST(req: Request) {
  try {
    const { question, context } = await req.json();

    if (!question || !context) {
      return NextResponse.json({ error: 'Question and context are required' }, { status: 400 });
    }

    const result = await askQuestion(question, context);
    
    return NextResponse.json({ 
      answer: result.answer || "I couldn't find a clear answer in your notes.", 
      score: result.score 
    });
  } catch (error: any) {
    console.error('API Ask Error:', error);
    return NextResponse.json({ error: 'Failed to find answer' }, { status: 500 });
  }
}
