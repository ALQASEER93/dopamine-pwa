import OpenAI from 'openai';

if (!process.env.OPENAI_API_KEY) {
  throw new Error('OPENAI_API_KEY environment variable is not set');
}

export const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export interface CodeGenerationOptions {
  prompt: string;
  model?: string;
  maxTokens?: number;
  temperature?: number;
}

/**
 * Generate code using GPT/Codex
 */
export async function generateCode(options: CodeGenerationOptions): Promise<string> {
  const {
    prompt,
    model = 'gpt-3.5-turbo',
    maxTokens = 2048,
    temperature = 0.7,
  } = options;

  try {
    const response = await openai.chat.completions.create({
      model,
      messages: [
        {
          role: 'system',
          content:
            'You are an expert code generator. Generate clean, well-documented, and production-ready code.',
        },
        {
          role: 'user',
          content: prompt,
        },
      ],
      max_tokens: maxTokens,
      temperature,
    });

    const content = response.choices[0]?.message?.content;
    if (!content) {
      throw new Error('No response from OpenAI API');
    }

    return content;
  } catch (error) {
    console.error('Error generating code:', error);
    throw error;
  }
}

/**
 * Generate code completions
 */
export async function completeCode(options: CodeGenerationOptions): Promise<string> {
  return generateCode({
    ...options,
    model: options.model || 'gpt-3.5-turbo',
  });
}

/**
 * Generate documentation
 */
export async function generateDocumentation(code: string): Promise<string> {
  return generateCode({
    prompt: `Generate comprehensive JSDoc documentation for the following code:\n\n${code}`,
    maxTokens: 1024,
  });
}

/**
 * Explain code
 */
export async function explainCode(code: string): Promise<string> {
  return generateCode({
    prompt: `Explain what this code does in detail:\n\n${code}`,
    maxTokens: 1024,
  });
}

/**
 * Find bugs and suggest fixes
 */
export async function reviewCode(code: string): Promise<string> {
  return generateCode({
    prompt: `Review this code for bugs, performance issues, and best practices. Suggest improvements:\n\n${code}`,
    maxTokens: 2048,
  });
}
