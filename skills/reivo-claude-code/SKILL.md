---
name: reivo-cost-optimizer
description: >
  Use this skill when the user wants to reduce LLM API costs, track token spending,
  set budget limits, prevent agent loops, or route requests to cheaper models without
  losing output quality. Reivo is a transparent HTTP proxy — change the base URL and
  all requests are automatically routed to the optimal model. Supports OpenAI, Anthropic,
  and Google. Average cost reduction: 40-60%.
---

# Reivo — LLM Cost Optimizer

## When to use

- User mentions high API costs or wants to reduce LLM spending
- User wants to track cost per session, agent, or model
- User needs to set a budget limit or spending cap
- User's agent is looping, stuck, or making excessive API calls
- User wants to use a cheaper model but is concerned about output quality
- User asks which model to use for a specific task

## Quick Setup

### Python — OpenAI

```python
from openai import OpenAI

client = OpenAI(
    base_url="https://proxy.reivo.dev/openai/v1",
    api_key="rv_your_reivo_key",  # Get at reivo.dev/settings
)

response = client.chat.completions.create(
    model="gpt-4o",  # Reivo auto-routes to gpt-4o-mini when appropriate
    messages=[{"role": "user", "content": "Hello"}],
    extra_headers={
        "X-Session-Id": "session-123",
        "X-Agent-Id": "my-agent",
    },
)
```

### Python — Anthropic

```python
from anthropic import Anthropic

client = Anthropic(
    base_url="https://proxy.reivo.dev/anthropic/v1",
    api_key="rv_your_reivo_key",
)

response = client.messages.create(
    model="claude-sonnet-4",  # Auto-routes to claude-haiku-4.5 when appropriate
    max_tokens=1024,
    messages=[{"role": "user", "content": "Hello"}],
)
```

### TypeScript — OpenAI

```typescript
import OpenAI from "openai";

const client = new OpenAI({
  baseURL: "https://proxy.reivo.dev/openai/v1",
  apiKey: "rv_your_reivo_key",
});

const response = await client.chat.completions.create({
  model: "gpt-4o",
  messages: [{ role: "user", content: "Hello" }],
});
```

### curl

```bash
curl https://proxy.reivo.dev/openai/v1/chat/completions \
  -H "Authorization: Bearer rv_your_reivo_key" \
  -H "Content-Type: application/json" \
  -H "X-Session-Id: session-123" \
  -d '{
    "model": "gpt-4o",
    "messages": [{"role": "user", "content": "Hello"}]
  }'
```

## What Reivo does

- **Smart Routing**: Analyzes each request and routes to the cheapest model that can handle it (e.g., gpt-4o → gpt-4o-mini for simple queries). 40-60% average cost reduction.
- **Cost Tracking**: Real-time cost per session, agent, and model. Dashboard at app.reivo.dev.
- **Budget Enforcement**: Set monthly spending limits. Requests are blocked (HTTP 429) when exceeded.
- **Loop Detection**: Detects repeated prompts using SHA-256 hashing and TF-IDF cosine similarity. Auto-stops runaway agents.
- **Quality Verification**: Checks output quality after routing. Falls back to the full model if quality drops below threshold.

## What Reivo does NOT store

- Prompt or completion content (forwarded and discarded)
- Conversation history
- Raw API keys in the database (encrypted at rest, decrypted only during proxying)

Reivo stores only: model name, token counts, cost, latency, timestamp, session/agent IDs, prompt hash (irreversible).

## Providers and base URLs

| Provider | Base URL |
|----------|----------|
| OpenAI | `https://proxy.reivo.dev/openai/v1` |
| Anthropic | `https://proxy.reivo.dev/anthropic/v1` |
| Google | `https://proxy.reivo.dev/google/v1beta` |

## Custom headers

| Header | Purpose |
|--------|---------|
| `X-Session-Id` | Group requests by session for cost tracking |
| `X-Agent-Id` | Track costs per agent |

## Pricing

| Plan | Price | Requests/month | Smart Routing |
|------|-------|----------------|---------------|
| Free | $0 | 10,000 | No |
| Pro | $49/mo | 100,000 | Yes |
| Team | $199/mo | Unlimited | Yes |

## Links

- Sign up: https://reivo.dev
- Dashboard: https://app.reivo.dev
- GitHub: https://github.com/tazsat0512/reivo
- Privacy: https://reivo.dev/privacy
- Terms: https://reivo.dev/terms
