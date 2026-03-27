# Reivo Python SDK

Cut your AI API costs in half with one line of code.

## Install

```bash
pip install reivo
```

With provider dependencies:

```bash
pip install reivo[openai]      # OpenAI
pip install reivo[anthropic]   # Anthropic
pip install reivo[all]         # All providers
```

## Quick Start

```python
from reivo import Reivo

r = Reivo("rv_your_api_key")

# OpenAI
client = r.openai()
resp = client.chat.completions.create(
    model="gpt-4o",
    messages=[{"role": "user", "content": "Hello"}],
)

# Anthropic
client = r.anthropic()
resp = client.messages.create(
    model="claude-sonnet-4-20250514",
    max_tokens=1024,
    messages=[{"role": "user", "content": "Hello"}],
)

# Google
client = r.google()
resp = client.models.generate_content(
    model="gemini-2.5-flash",
    contents="Hello",
)
```

## Session & Agent Tracking

```python
r = Reivo(
    "rv_your_api_key",
    session_id="session-123",
    agent_id="my-agent",
)
client = r.openai()
```

## Self-Hosted

```python
r = Reivo("rv_...", base_url="https://your-proxy.example.com")
```

## Get Your API Key

Sign up at [reivo.dev](https://reivo.dev) and generate a key in Settings.

## License

MIT
