"""Reivo client — thin wrapper that points official SDKs to the Reivo proxy."""

from __future__ import annotations

from typing import Any

PROXY_BASE = "https://proxy.reivo.dev"


class Reivo:
    """Create provider clients that route through the Reivo proxy.

    Args:
        api_key: Your Reivo API key (rv_...).
        session_id: Optional session ID for grouping requests.
        agent_id: Optional agent ID for per-agent tracking.
        base_url: Override the proxy URL (for self-hosted deployments).
    """

    def __init__(
        self,
        api_key: str,
        *,
        session_id: str | None = None,
        agent_id: str | None = None,
        base_url: str = PROXY_BASE,
    ) -> None:
        if not api_key.startswith("rv_"):
            raise ValueError("API key must start with 'rv_'. Get one at https://reivo.dev/settings")

        self.api_key = api_key
        self.session_id = session_id
        self.agent_id = agent_id
        self.base_url = base_url.rstrip("/")

    def _extra_headers(self) -> dict[str, str]:
        headers: dict[str, str] = {}
        if self.session_id:
            headers["x-session-id"] = self.session_id
        if self.agent_id:
            headers["x-agent-id"] = self.agent_id
        return headers

    def openai(self, **kwargs: Any) -> Any:
        """Create an OpenAI client routed through Reivo.

        Returns:
            openai.OpenAI instance.

        Example:
            client = Reivo("rv_...").openai()
            resp = client.chat.completions.create(
                model="gpt-4o",
                messages=[{"role": "user", "content": "Hello"}],
            )
        """
        try:
            from openai import OpenAI
        except ImportError:
            raise ImportError("Install the openai package: pip install openai")

        extra = self._extra_headers()
        default_headers = {**extra, **kwargs.pop("default_headers", {})}

        return OpenAI(
            api_key=self.api_key,
            base_url=f"{self.base_url}/openai/v1",
            default_headers=default_headers,
            **kwargs,
        )

    def anthropic(self, **kwargs: Any) -> Any:
        """Create an Anthropic client routed through Reivo.

        Returns:
            anthropic.Anthropic instance.

        Example:
            client = Reivo("rv_...").anthropic()
            resp = client.messages.create(
                model="claude-sonnet-4-20250514",
                max_tokens=1024,
                messages=[{"role": "user", "content": "Hello"}],
            )
        """
        try:
            from anthropic import Anthropic
        except ImportError:
            raise ImportError("Install the anthropic package: pip install anthropic")

        extra = self._extra_headers()
        default_headers = {**extra, **kwargs.pop("default_headers", {})}

        return Anthropic(
            api_key=self.api_key,
            base_url=f"{self.base_url}/anthropic",
            default_headers=default_headers,
            **kwargs,
        )

    def google(self, **kwargs: Any) -> Any:
        """Create a Google GenAI client routed through Reivo.

        Returns:
            google.genai.Client instance.

        Example:
            client = Reivo("rv_...").google()
            resp = client.models.generate_content(
                model="gemini-2.5-flash",
                contents="Hello",
            )
        """
        try:
            from google import genai
        except ImportError:
            raise ImportError(
                "Install the google-genai package: pip install google-genai"
            )

        extra = self._extra_headers()
        http_options = kwargs.pop("http_options", {})
        if extra:
            existing = http_options.get("headers", {})
            http_options["headers"] = {**extra, **existing}

        return genai.Client(
            api_key=self.api_key,
            http_options=http_options,
            **kwargs,
        )
