"""Reivo - AI Cost Intelligence SDK.

Cut your AI API costs in half with one line of code.

Usage:
    from reivo import Reivo

    r = Reivo("rv_your_api_key")
    client = r.openai()          # OpenAI-compatible client
    client = r.anthropic()       # Anthropic-compatible client
    client = r.google()          # Google GenAI-compatible client
"""

from reivo.client import Reivo

__all__ = ["Reivo"]
__version__ = "0.1.0"
