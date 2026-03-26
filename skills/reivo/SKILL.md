---
name: reivo
description: >
  Proxy for LLM APIs that reduces costs 40-60% by routing each request to the cheapest model
  that maintains output quality. Tracks spending per session and agent, enforces budget limits,
  detects agent loops, and auto-stops runaway agents. Supports OpenAI, Anthropic, and Google.
  Install by changing the base URL — no SDK or code changes required.
triggers:
  - cost too high
  - spending too much
  - budget limit
  - save money on API
  - reduce token cost
  - agent loop
  - runaway agent
  - model routing
  - cheaper model
  - optimize cost
  - API bill
  - how much am I spending
  - which model should I use
  - GPT-4o too expensive
  - Claude too expensive
  - switch to cheaper model
  - cost per session
  - monthly budget
  - token usage
  - overspending
categories:
  - cost-optimization
  - budget-management
  - model-routing
  - agent-safety
homepage: https://reivo.dev
requirements:
  - Reivo account (free at reivo.dev)
  - At least one LLM provider API key (OpenAI, Anthropic, or Google)
tags:
  - llm
  - proxy
  - cost
  - routing
  - budget
  - safety
---

# Reivo — LLM Cost Optimizer

## What it does

- Routes each LLM request to the cheapest model that can handle it (40-60% cost reduction)
- Tracks cost per session, agent, and model in real time
- Enforces budget limits — blocks requests when the limit is reached
- Detects agent loops using prompt hashing and similarity analysis — auto-stops runaway agents
- Works with OpenAI, Anthropic, and Google via a single base URL change

## Commands

| Command | Description |
|---------|-------------|
| `/reivo status` | Today's cost, routing decisions, and quality report |
| `/reivo month` | Monthly cost analysis and savings report |
| `/reivo on` | Enable Smart Routing |
| `/reivo off` | Disable Smart Routing |
| `/reivo budget <amount>` | Set monthly budget cap in USD |
| `/reivo mode <mode>` | Change routing mode: `auto`, `conservative`, `aggressive` |
| `/reivo share` | Generate a shareable savings report image |

### /reivo status output

```
Reivo Daily Report
├── Today: 342 requests routed
│   ├── 71% → Haiku    ($0.82)
│   ├── 22% → Sonnet   ($3.40)
│   └──  7% → Opus     ($2.10)
├── Quality score: 97.8%
├── Budget used: $6.32 / $100 (month)
├── Pace: on track (projected: $84/month)
└── Without Reivo: $14.20 today
    → Saved: $7.88 today ($127.40 this month)
```

## Setup

1. Sign up at [reivo.dev](https://reivo.dev) and generate an API key
2. Add this to your config:

```yaml
reivo:
  api_key: "rv_your_reivo_key"
  routing:
    enabled: true
    mode: "auto"
  budget:
    monthly_cap: 100
    pace_control: true
  quality:
    min_score: 0.95
    auto_fallback: true
  notifications:
    daily_report: true
    loop_alert: true
    budget_warning: true
```

3. Run `/reivo status` to confirm

## Configuration

| Key | Type | Default | Description |
|-----|------|---------|-------------|
| `api_key` | string | required | Your Reivo API key (starts with `rv_`) |
| `routing.enabled` | boolean | `true` | Enable/disable Smart Routing |
| `routing.mode` | string | `"auto"` | `auto`, `conservative`, or `aggressive` |
| `budget.monthly_cap` | number | `null` | Monthly spending limit in USD |
| `budget.pace_control` | boolean | `true` | Warn when spending pace exceeds budget projection |
| `quality.min_score` | number | `0.95` | Minimum quality score before auto-fallback to full model |
| `quality.auto_fallback` | boolean | `true` | Automatically retry with full model if quality is low |
| `notifications.daily_report` | boolean | `true` | Send daily cost summary |
| `notifications.loop_alert` | boolean | `true` | Alert when loop is detected |
| `notifications.budget_warning` | boolean | `true` | Alert at 50%, 80%, 100% of budget |

## Requirements

- Reivo account (free tier: 10,000 requests/month)
- At least one LLM provider API key (OpenAI, Anthropic, or Google)

## Links

- Website: https://reivo.dev
- GitHub: https://github.com/tazsat0512/reivo
- Dashboard: https://app.reivo.dev
