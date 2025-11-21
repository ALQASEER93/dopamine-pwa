import { NextRequest, NextResponse } from 'next/server';
import { explainCode, reviewCode, generateDocumentation } from '../../../lib/openai';

export async function POST(request: NextRequest) {
  try {
    const { code, action } = await request.json();

    if (!code || typeof code !== 'string') {
      return NextResponse.json(
        { error: 'Invalid request: code is required and must be a string' },
        { status: 400 }
      );
    }

    let result: string;

    switch (action) {
      case 'explain':
        result = await explainCode(code);
        break;
      case 'review':
        result = await reviewCode(code);
        break;
      case 'document':
        result = await generateDocumentation(code);
        break;
      default:
        return NextResponse.json(
          { error: 'Invalid action. Must be: explain, review, or document' },
          { status: 400 }
        );
    }

    return NextResponse.json({ result, success: true });
  } catch (error: any) {
    console.error('Code analysis error:', error);
    return NextResponse.json(
      { error: error?.message || 'Code analysis failed' },
      { status: 500 }
    );
  }
}
