/**
 * Reivo SDK — Cut your AI API costs in half with one line of code.
 *
 * @example
 * ```ts
 * import { Reivo } from 'reivo';
 *
 * const r = new Reivo({ apiKey: 'rv_...' });
 * const client = await r.openai();
 * ```
 */

const PROXY_BASE = 'https://proxy.reivo.dev';

export interface ReivoOptions {
  /** Your Reivo API key (rv_...). */
  apiKey: string;
  /** Optional session ID for grouping requests. */
  sessionId?: string;
  /** Optional agent ID for per-agent tracking. */
  agentId?: string;
  /** Override the proxy URL (for self-hosted deployments). */
  baseUrl?: string;
}

export class Reivo {
  readonly apiKey: string;
  readonly sessionId?: string;
  readonly agentId?: string;
  readonly baseUrl: string;

  constructor(options: ReivoOptions) {
    if (!options.apiKey.startsWith('rv_')) {
      throw new Error("API key must start with 'rv_'. Get one at https://reivo.dev/settings");
    }

    this.apiKey = options.apiKey;
    this.sessionId = options.sessionId;
    this.agentId = options.agentId;
    this.baseUrl = (options.baseUrl ?? PROXY_BASE).replace(/\/+$/, '');
  }

  private extraHeaders(): Record<string, string> {
    const headers: Record<string, string> = {};
    if (this.sessionId) headers['x-session-id'] = this.sessionId;
    if (this.agentId) headers['x-agent-id'] = this.agentId;
    return headers;
  }

  /**
   * Create an OpenAI client routed through Reivo.
   *
   * @example
   * ```ts
   * const client = await new Reivo({ apiKey: 'rv_...' }).openai();
   * const resp = await client.chat.completions.create({
   *   model: 'gpt-4o',
   *   messages: [{ role: 'user', content: 'Hello' }],
   * });
   * ```
   */
  async openai(options?: Record<string, unknown>) {
    let mod: { default?: new (opts: Record<string, unknown>) => unknown; OpenAI?: new (opts: Record<string, unknown>) => unknown };
    try {
      mod = await import('openai');
    } catch {
      throw new Error('Install the openai package: npm install openai');
    }
    const OpenAI = mod.default ?? mod.OpenAI;
    if (!OpenAI) throw new Error('Could not resolve OpenAI constructor from openai package');

    const extra = this.extraHeaders();
    const defaultHeaders = { ...extra, ...(options?.defaultHeaders as Record<string, string>) };
    const { defaultHeaders: _, ...rest } = options ?? {};

    return new OpenAI({
      apiKey: this.apiKey,
      baseURL: `${this.baseUrl}/openai/v1`,
      defaultHeaders,
      ...rest,
    });
  }

  /**
   * Create an Anthropic client routed through Reivo.
   *
   * @example
   * ```ts
   * const client = await new Reivo({ apiKey: 'rv_...' }).anthropic();
   * const resp = await client.messages.create({
   *   model: 'claude-sonnet-4-20250514',
   *   max_tokens: 1024,
   *   messages: [{ role: 'user', content: 'Hello' }],
   * });
   * ```
   */
  async anthropic(options?: Record<string, unknown>) {
    let mod: { default?: new (opts: Record<string, unknown>) => unknown; Anthropic?: new (opts: Record<string, unknown>) => unknown };
    try {
      mod = await import('@anthropic-ai/sdk');
    } catch {
      throw new Error('Install the Anthropic SDK: npm install @anthropic-ai/sdk');
    }
    const Anthropic = mod.default ?? mod.Anthropic;
    if (!Anthropic) throw new Error('Could not resolve Anthropic constructor from @anthropic-ai/sdk');

    const extra = this.extraHeaders();
    const defaultHeaders = { ...extra, ...(options?.defaultHeaders as Record<string, string>) };
    const { defaultHeaders: _, ...rest } = options ?? {};

    return new Anthropic({
      apiKey: this.apiKey,
      baseURL: `${this.baseUrl}/anthropic`,
      defaultHeaders,
      ...rest,
    });
  }

  /**
   * Create a Google GenAI client routed through Reivo.
   *
   * @example
   * ```ts
   * const client = await new Reivo({ apiKey: 'rv_...' }).google();
   * const resp = await client.models.generateContent({
   *   model: 'gemini-2.5-flash',
   *   contents: 'Hello',
   * });
   * ```
   */
  async google(options?: Record<string, unknown>) {
    let mod: { GoogleGenAI?: new (opts: Record<string, unknown>) => unknown; default?: new (opts: Record<string, unknown>) => unknown };
    try {
      mod = await import('@google/genai');
    } catch {
      throw new Error('Install the @google/genai package: npm install @google/genai');
    }
    const GoogleGenAI = mod.GoogleGenAI ?? mod.default;
    if (!GoogleGenAI) throw new Error('Could not resolve GoogleGenAI constructor from @google/genai');

    const extra = this.extraHeaders();
    const httpOptions = (options?.httpOptions as Record<string, unknown>) ?? {};
    if (Object.keys(extra).length > 0) {
      httpOptions.headers = { ...extra, ...(httpOptions.headers as Record<string, string>) };
    }
    const { httpOptions: _, ...rest } = options ?? {};

    return new GoogleGenAI({
      apiKey: this.apiKey,
      httpOptions,
      ...rest,
    });
  }
}
