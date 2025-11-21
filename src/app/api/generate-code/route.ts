import { NextRequest, NextResponse } from 'next/server';
import { generateCode } from '../../../lib/openai';

export async function POST(request: NextRequest) {
  try {
    const { prompt, maxTokens = 2048, temperature = 0.7, model = 'gpt-3.5-turbo' } = await request.json();

    if (!prompt || typeof prompt !== 'string') {
      return NextResponse.json(
        { error: 'Invalid request: prompt is required and must be a string' },
        { status: 400 }
      );
    }

    const code = await generateCode({
      prompt,
      maxTokens,
      temperature,
      model,
    });

    return NextResponse.json({ code, success: true });
  } catch (error: any) {
    console.error('Code generation error:', error);
    return NextResponse.json(
      { error: error?.message || 'Code generation failed' },
      { status: 500 }
    );
  }
}
