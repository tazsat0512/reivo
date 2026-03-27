"""Tests for the Reivo client."""

import pytest

from reivo import Reivo


def test_invalid_api_key():
    with pytest.raises(ValueError, match="rv_"):
        Reivo("sk-invalid-key")


def test_valid_api_key():
    r = Reivo("rv_test123")
    assert r.api_key == "rv_test123"
    assert r.base_url == "https://proxy.reivo.dev"


def test_custom_base_url():
    r = Reivo("rv_test123", base_url="https://my-proxy.example.com/")
    assert r.base_url == "https://my-proxy.example.com"


def test_extra_headers_empty():
    r = Reivo("rv_test123")
    assert r._extra_headers() == {}


def test_extra_headers_session_and_agent():
    r = Reivo("rv_test123", session_id="s1", agent_id="a1")
    headers = r._extra_headers()
    assert headers == {"x-session-id": "s1", "x-agent-id": "a1"}


def test_openai_client():
    r = Reivo("rv_test123", session_id="s1")
    client = r.openai()
    assert str(client.base_url) == "https://proxy.reivo.dev/openai/v1/"
    assert client.api_key == "rv_test123"


def test_anthropic_client():
    r = Reivo("rv_test123")
    client = r.anthropic()
    assert str(client.base_url).rstrip("/") == "https://proxy.reivo.dev/anthropic"
    assert client.api_key == "rv_test123"


def test_openai_preserves_extra_kwargs():
    r = Reivo("rv_test123")
    client = r.openai(timeout=30.0)
    assert client.timeout == 30.0


def test_version():
    from reivo import __version__
    assert __version__ == "0.1.0"
