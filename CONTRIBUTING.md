# Contributing to Reivo

Thanks for your interest in contributing to Reivo.

## Development Setup

### Prerequisites

- Node.js >= 20
- [pnpm](https://pnpm.io/) 9+
- [Cloudflare Workers](https://workers.cloudflare.com/) account (for proxy)
- [Turso](https://turso.tech/) account (for database)

### Getting Started

```bash
git clone https://github.com/tazsat0512/reivo.git
cd reivo
pnpm install

# Copy environment variables
cp .env.example .env
# Edit .env with your credentials
```

### Running Locally

```bash
# Proxy (Cloudflare Workers dev server)
pnpm dev:proxy

# Dashboard (Next.js dev server)
pnpm dev:dashboard

# Build shared package (required before proxy/dashboard)
cd packages/shared && pnpm build
```

### Running Tests

```bash
# All proxy tests (70+ tests)
cd packages/proxy && npx vitest run

# Specific test file
cd packages/proxy && npx vitest run test/services/cost-calculator.test.ts

# Type check
cd packages/proxy && npx tsc --noEmit
cd packages/dashboard && npx tsc --noEmit
```

### Linting

```bash
pnpm lint          # check
pnpm lint:fix      # auto-fix
```

## Project Structure

```
reivo/
├── packages/
│   ├── shared/      # Types, pricing table (32 models), constants
│   ├── proxy/       # Cloudflare Workers + Hono
│   │   ├── src/
│   │   │   ├── routes/        # OpenAI, Anthropic, Google route handlers
│   │   │   ├── middleware/    # Auth, budget-guard, request-logger
│   │   │   ├── providers/    # Provider-specific URL/header/usage logic
│   │   │   ├── services/     # Cost calculator, loop detector, router, notifier
│   │   │   └── db/           # Turso client, Drizzle schema, migrations
│   │   └── test/             # Vitest tests + fixtures
│   └── dashboard/   # Next.js 15 + Clerk + tRPC + Recharts
│       ├── app/
│       │   ├── (auth)/       # Sign-in/sign-up (Clerk)
│       │   ├── (dashboard)/  # Overview, sessions, agents, loops, settings, billing
│       │   ├── privacy/      # Privacy Policy
│       │   └── terms/        # Terms of Service
│       └── lib/
│           ├── trpc/         # tRPC server (all dashboard API routes)
│           └── kv-sync.ts    # Sync user settings to Cloudflare KV
├── skills/
│   ├── reivo/               # OpenClaw skill package
│   └── reivo-claude-code/   # Claude Code skill
└── .github/
    ├── ISSUE_TEMPLATE/
    └── workflows/ci.yml
```

## Key Patterns

- **Path-based routing**: `/openai/v1/*`, `/anthropic/v1/*`, `/google/v1beta/*`
- **Auth**: `Authorization: Bearer rv_...` → SHA-256 hash → KV lookup
- **Async pipeline**: `waitUntil()` for post-response DB writes, budget sync, loop detection
- **Budget state**: Cloudflare KV (sync reads <5ms), Turso (source of truth)
- **Loop detection**: Hash match (sync) + TF-IDF cosine similarity (async)

## How to Contribute

### Reporting Bugs

Open an issue using the **Bug Report** template. Include:
- Steps to reproduce
- Expected vs actual behavior
- Environment details (OS, Node version, provider)

### Suggesting Features

Open an issue using the **Feature Request** template.

### Submitting Pull Requests

1. Fork the repo and create a branch from `main`
2. Make your changes
3. Run tests: `cd packages/proxy && npx vitest run`
4. Run type checks: `cd packages/proxy && npx tsc --noEmit`
5. Write clear commit messages
6. Open a PR with a description of your changes

### Code Style

- TypeScript for all code
- Hono for proxy routes, tRPC for dashboard API
- Biome for linting and formatting
- Keep PRs focused — one feature or fix per PR

## Areas We Need Help With

- **Framework integrations** — LangChain, CrewAI, AutoGen callbacks/plugins
- **SDK packages** — Python and JavaScript client libraries
- **Smart Routing improvements** — Better complexity signals, ML-based routing
- **Provider support** — Mistral, Cohere, and other LLM providers
- **Documentation** — Self-hosting guides, API reference improvements
- **Testing** — Integration and E2E tests

## Skill Development

The `skills/` directory contains OpenClaw and Claude Code skill packages. To develop skills:

```bash
cd skills/reivo
node setup.js           # Interactive setup
node commands/status.js # Test status command
```

See `skills/reivo/SKILL.md` for the full command reference.

## Questions?

Open an issue or email [hello@reivo.dev](mailto:hello@reivo.dev).
