# TokenScope

**The only AI proxy with built-in guardrails.**

TokenScope is a proxy-based service that visualizes AI agent token consumption and auto-stops runaway agents. Change one base URL — that's it.

## Features

- **Cost Visibility** — Real-time cost tracking across OpenAI, Anthropic, and Google. Per-session, per-agent, and per-model breakdowns.
- **Budget Guardrails** — Set spending limits with alerts at 50%, 80%, and 100%. Requests are automatically blocked when exceeded.
- **Loop Detection** — Detects agents stuck in repetitive loops using prompt hashing and TF-IDF cosine similarity. Auto-stops runaway agents.
- **Anomaly Detection** — EWMA-based anomaly detection flags unusual spending patterns.
- **Slack Alerts** — Get notified for budget warnings, loop detection, and anomalies.

## Quick Start

### 1. Sign up

Create a free account at [tokenscope-dashboard.vercel.app](https://tokenscope-dashboard.vercel.app).

### 2. Generate an API key

Go to **Settings** and click "Generate API Key". Copy the key — it's only shown once.

### 3. Add your provider key

In **Settings**, add your OpenAI, Anthropic, or Google API key. Start with just one.

### 4. Change your base URL

```python
# Before
client = Anthropic()

# After
client = Anthropic(
    base_url="https://tokenscope-proxy.tazoelab.workers.dev/anthropic/v1",
    api_key="ts_your_tokenscope_key"
)
```

```typescript
// Before
const client = new Anthropic();

// After
const client = new Anthropic({
  baseURL: "https://tokenscope-proxy.tazoelab.workers.dev/anthropic/v1",
  apiKey: "ts_your_tokenscope_key",
});
```

```bash
# curl
curl https://tokenscope-proxy.tazoelab.workers.dev/anthropic/v1/messages \
  -H "Authorization: Bearer ts_your_tokenscope_key" \
  -H "anthropic-version: 2023-06-01" \
  -H "Content-Type: application/json" \
  -d '{"model":"claude-sonnet-4-20250514","max_tokens":100,"messages":[{"role":"user","content":"Hello"}]}'
```

### Supported Providers

| Provider | Base URL |
|----------|----------|
| OpenAI | `https://tokenscope-proxy.tazoelab.workers.dev/openai/v1` |
| Anthropic | `https://tokenscope-proxy.tazoelab.workers.dev/anthropic/v1` |
| Google | `https://tokenscope-proxy.tazoelab.workers.dev/google/v1beta` |

## Architecture

```
Your App → TokenScope Proxy (Cloudflare Workers) → AI Provider
                ↓
         Turso DB (logging)
                ↓
         Dashboard (Next.js on Vercel)
```

- **Proxy**: Cloudflare Workers + Hono — edge-deployed, <30ms overhead
- **Database**: Turso (libSQL) — serverless SQLite
- **Dashboard**: Next.js 15 + Tailwind + shadcn/ui on Vercel
- **Auth**: Clerk
- **Payments**: Stripe

## Self-Hosting

See [docs/self-host.md](docs/self-host.md) for self-hosting instructions.

## Pricing

| Plan | Price | Requests/month |
|------|-------|---------------|
| Free | $0 | 10,000 |
| Pro | $49/mo | 100,000 |

## License

MIT
