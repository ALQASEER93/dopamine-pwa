#!/usr/bin/env node

import fs from 'fs';
import path from 'path';
import readline from 'readline';
import { generateCode, explainCode, reviewCode, generateDocumentation } from '../src/lib/openai.js';

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

function prompt(question: string): Promise<string> {
  return new Promise((resolve) => {
    rl.question(question, resolve);
  });
}

async function main() {
  const args = process.argv.slice(2);
  const command = args[0];

  if (!process.env.OPENAI_API_KEY) {
    console.error('❌ Error: OPENAI_API_KEY environment variable is not set');
    console.error('Please set your OpenAI API key and try again.');
    process.exit(1);
  }

  try {
    switch (command) {
      case 'generate':
      case 'gen': {
        const description = args.slice(1).join(' ') || (await prompt('📝 Describe the code to generate: '));
        console.log('⏳ Generating code...\n');
        const code = await generateCode({ prompt: description });
        console.log('✅ Generated code:\n');
        console.log(code);
        break;
      }

      case 'explain': {
        let code = args.slice(1).join(' ');
        if (!code) {
          const filePath = await prompt('📄 Enter file path or paste code: ');
          if (fs.existsSync(filePath)) {
            code = fs.readFileSync(filePath, 'utf-8');
          } else {
            code = filePath;
          }
        }
        console.log('⏳ Analyzing code...\n');
        const explanation = await explainCode(code);
        console.log('✅ Explanation:\n');
        console.log(explanation);
        break;
      }

      case 'review': {
        let code = args.slice(1).join(' ');
        if (!code) {
          const filePath = await prompt('📄 Enter file path or paste code: ');
          if (fs.existsSync(filePath)) {
            code = fs.readFileSync(filePath, 'utf-8');
          } else {
            code = filePath;
          }
        }
        console.log('⏳ Reviewing code...\n');
        const review = await reviewCode(code);
        console.log('✅ Review:\n');
        console.log(review);
        break;
      }

      case 'doc':
      case 'document': {
        let code = args.slice(1).join(' ');
        if (!code) {
          const filePath = await prompt('📄 Enter file path or paste code: ');
          if (fs.existsSync(filePath)) {
            code = fs.readFileSync(filePath, 'utf-8');
          } else {
            code = filePath;
          }
        }
        console.log('⏳ Generating documentation...\n');
        const docs = await generateDocumentation(code);
        console.log('✅ Documentation:\n');
        console.log(docs);
        break;
      }

      default:
        console.log(`
🤖 Codex/GPT CLI Tool

Usage:
  npx ts-node scripts/codex.ts <command> [options]

Commands:
  generate <description>    Generate code from a description
  explain <code|file>       Explain code
  review <code|file>        Review code for bugs and improvements
  document <code|file>      Generate documentation

Examples:
  npx ts-node scripts/codex.ts generate "create a React button component"
  npx ts-node scripts/codex.ts explain src/components/Button.tsx
  npx ts-node scripts/codex.ts review src/lib/utils.ts
  npx ts-node scripts/codex.ts document src/lib/firebase.ts

Or run interactively:
  npx ts-node scripts/codex.ts explain
  npx ts-node scripts/codex.ts generate
        `);
    }
  } catch (error: any) {
    console.error('❌ Error:', error?.message || error);
    process.exit(1);
  } finally {
    rl.close();
  }
}

main();
