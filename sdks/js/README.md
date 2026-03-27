# Reivo JavaScript SDK

Cut your AI API costs in half with one line of code.

## Install

```bash
npm install reivo
```

## Quick Start

```typescript
import { Reivo } from 'reivo';

const r = new Reivo({ apiKey: 'rv_your_api_key' });

// OpenAI
const openai = r.openai();
const resp = await openai.chat.completions.create({
  model: 'gpt-4o',
  messages: [{ role: 'user', content: 'Hello' }],
});

// Anthropic
const anthropic = r.anthropic();
const resp = await anthropic.messages.create({
  model: 'claude-sonnet-4-20250514',
  max_tokens: 1024,
  messages: [{ role: 'user', content: 'Hello' }],
});

// Google
const google = r.google();
const resp = await google.models.generateContent({
  model: 'gemini-2.5-flash',
  contents: 'Hello',
});
```

## Session & Agent Tracking

```typescript
const r = new Reivo({
  apiKey: 'rv_your_api_key',
  sessionId: 'session-123',
  agentId: 'my-agent',
});
```

## Self-Hosted

```typescript
const r = new Reivo({
  apiKey: 'rv_...',
  baseUrl: 'https://your-proxy.example.com',
});
```

## Get Your API Key

Sign up at [reivo.dev](https://reivo.dev) and generate a key in Settings.

## License

MIT
