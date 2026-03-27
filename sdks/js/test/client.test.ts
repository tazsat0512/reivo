import { describe, expect, it } from 'vitest';
import { Reivo } from '../src/index';

describe('Reivo', () => {
  it('rejects invalid API key', () => {
    expect(() => new Reivo({ apiKey: 'sk-invalid' })).toThrow('rv_');
  });

  it('accepts valid API key', () => {
    const r = new Reivo({ apiKey: 'rv_test123' });
    expect(r.apiKey).toBe('rv_test123');
    expect(r.baseUrl).toBe('https://proxy.reivo.dev');
  });

  it('strips trailing slash from base URL', () => {
    const r = new Reivo({ apiKey: 'rv_test123', baseUrl: 'https://my-proxy.com/' });
    expect(r.baseUrl).toBe('https://my-proxy.com');
  });

  it('returns empty extra headers when no session/agent', () => {
    const r = new Reivo({ apiKey: 'rv_test123' });
    // @ts-expect-error accessing private method for testing
    expect(r.extraHeaders()).toEqual({});
  });

  it('includes session and agent in extra headers', () => {
    const r = new Reivo({ apiKey: 'rv_test123', sessionId: 's1', agentId: 'a1' });
    // @ts-expect-error accessing private method for testing
    expect(r.extraHeaders()).toEqual({ 'x-session-id': 's1', 'x-agent-id': 'a1' });
  });

  it('creates OpenAI client with correct base URL', async () => {
    const r = new Reivo({ apiKey: 'rv_test123' });
    const client = (await r.openai()) as { baseURL: string; apiKey: string };
    expect(client.baseURL).toBe('https://proxy.reivo.dev/openai/v1');
    expect(client.apiKey).toBe('rv_test123');
  });

  it('creates Anthropic client with correct base URL', async () => {
    const r = new Reivo({ apiKey: 'rv_test123' });
    const client = (await r.anthropic()) as { baseURL: string; apiKey: string };
    expect(client.baseURL).toBe('https://proxy.reivo.dev/anthropic');
    expect(client.apiKey).toBe('rv_test123');
  });
});
