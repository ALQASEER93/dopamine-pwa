# GPT/Codex Integration Setup

This project now includes OpenAI GPT/Codex integration for code generation, analysis, and documentation.

## Setup

### 1. Get OpenAI API Key

1. Go to [OpenAI API Keys](https://platform.openai.com/api-keys)
2. Create a new API key
3. Copy the key (you'll only see it once)

### 2. Set Environment Variable

Create or update `.env.local` in the project root:

```env
OPENAI_API_KEY=sk-your-api-key-here
```

⚠️ **Important**: Never commit `.env.local` to version control. It's already in `.gitignore`.

### 3. Install Dependencies

```bash
npm install
```

The `openai` package should already be installed.

## Usage

### Via CLI (Local Development)

```bash
# Generate code from a description
npx ts-node scripts/codex.ts generate "create a React button component"

# Explain existing code
npx ts-node scripts/codex.ts explain src/components/Button.tsx
npx ts-node scripts/codex.ts explain <code snippet>

# Review code for bugs and improvements
npx ts-node scripts/codex.ts review src/lib/utils.ts

# Generate documentation
npx ts-node scripts/codex.ts document src/lib/firebase.ts

# Interactive mode (prompts for input)
npx ts-node scripts/codex.ts explain
```

### Via API Routes

#### Generate Code

```bash
curl -X POST http://localhost:3000/api/generate-code \
  -H "Content-Type: application/json" \
  -d '{
    "prompt": "Create a TypeScript function that validates email addresses",
    "maxTokens": 2048,
    "temperature": 0.7,
    "model": "gpt-3.5-turbo"
  }'
```

#### Analyze Code

```bash
curl -X POST http://localhost:3000/api/analyze-code \
  -H "Content-Type: application/json" \
  -d '{
    "code": "function add(a, b) { return a + b; }",
    "action": "explain"
  }'
```

Actions:
- `explain` - Explain what the code does
- `review` - Find bugs and suggest improvements
- `document` - Generate JSDoc documentation

### Via TypeScript/JavaScript

```typescript
import { generateCode, explainCode, reviewCode, generateDocumentation } from '@/lib/openai';

// Generate code
const code = await generateCode({
  prompt: 'Create a React hook for form validation',
  maxTokens: 2048,
  temperature: 0.7,
});

// Explain code
const explanation = await explainCode(code);

// Review code
const review = await reviewCode(code);

// Generate docs
const docs = await generateDocumentation(code);
```

## Files Added

- `src/lib/openai.ts` - OpenAI integration library
- `src/app/api/generate-code/route.ts` - Code generation API endpoint
- `src/app/api/analyze-code/route.ts` - Code analysis API endpoint
- `scripts/codex.ts` - CLI tool for local development

## Pricing

- Requests use the OpenAI API, which has pricing based on tokens used
- See [OpenAI Pricing](https://openai.com/pricing) for current rates
- Start with `gpt-3.5-turbo` (cheaper) before switching to `gpt-4`

## Troubleshooting

### "OPENAI_API_KEY environment variable is not set"

Make sure you've set the environment variable in `.env.local`:

```env
OPENAI_API_KEY=sk-your-key-here
```

### Rate Limiting

If you hit rate limits, OpenAI will return a 429 error. Wait a moment and try again.

### Insufficient Funds

Add credits to your OpenAI account at https://platform.openai.com/account/billing/overview

## Examples

### Generate a React Component

```bash
npx ts-node scripts/codex.ts generate "Create a reusable React dropdown component with TypeScript"
```

### Review Existing Code

```bash
npx ts-node scripts/codex.ts review src/lib/mongodb.ts
```

### Understand Complex Logic

```bash
npx ts-node scripts/codex.ts explain src/app/api/visits/route.ts
```

## Next Steps

- Integrate into VS Code extension for in-editor code generation
- Add code generation UI component to the app
- Create automated documentation generation pipeline
- Build AI-powered code review workflow
