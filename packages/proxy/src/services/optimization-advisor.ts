import { getModelPricing } from '@reivo/shared';

interface RequestRow {
  promptHash: string;
  model: string;
  inputTokens: number;
  outputTokens: number;
  costUsd: number;
  cachedTokens: number | null;
  hasCacheControl: boolean | null;
  maxTokensSetting: number | null;
  toolCount: number | null;
  toolsUsed: string | null; // JSON array
}

export interface OptimizationTip {
  type: 'cache' | 'max_tokens' | 'unused_tools';
  severity: 'low' | 'medium' | 'high';
  title: string;
  description: string;
  estimatedSavingsUsd: number;
  affectedRequests: number;
}

/**
 * Detect repeated identical prompts that could benefit from caching.
 * Looks for promptHash duplicates and calculates potential savings
 * from Anthropic prompt caching or OpenAI cached_tokens.
 */
export function detectCacheOpportunities(rows: RequestRow[]): OptimizationTip | null {
  // Group by promptHash
  const hashCounts = new Map<string, { count: number; totalInputTokens: number; model: string }>();
  for (const r of rows) {
    const existing = hashCounts.get(r.promptHash);
    if (existing) {
      existing.count++;
      existing.totalInputTokens += r.inputTokens;
    } else {
      hashCounts.set(r.promptHash, {
        count: 1,
        totalInputTokens: r.inputTokens,
        model: r.model,
      });
    }
  }

  // Find duplicates (3+ times)
  let duplicateRequests = 0;
  let potentialSavings = 0;
  for (const [, entry] of hashCounts) {
    if (entry.count < 3) continue;
    const duplicateCount = entry.count - 1; // first request is unavoidable
    duplicateRequests += duplicateCount;
    // Cached input tokens cost ~50% less on most providers
    const pricing = getModelPricing(entry.model);
    const avgInputTokens = entry.totalInputTokens / entry.count;
    potentialSavings +=
      (duplicateCount * avgInputTokens * pricing.inputPerMillion * 0.5) / 1_000_000;
  }

  if (duplicateRequests < 3) return null;

  const severity = potentialSavings > 1 ? 'high' : potentialSavings > 0.1 ? 'medium' : 'low';

  return {
    type: 'cache',
    severity,
    title: 'Enable prompt caching',
    description: `${duplicateRequests} requests used identical prompts. Use Anthropic's cache_control or reduce redundant system prompts to save on input tokens.`,
    estimatedSavingsUsd: Math.round(potentialSavings * 10000) / 10000,
    affectedRequests: duplicateRequests,
  };
}

/**
 * Detect requests where max_tokens is set much higher than actual output.
 * High max_tokens doesn't cost more directly, but indicates the user
 * may not be optimizing their token budget, and some providers
 * reserve capacity for the full max_tokens.
 */
export function detectMaxTokensWaste(rows: RequestRow[]): OptimizationTip | null {
  const withMaxTokens = rows.filter((r) => r.maxTokensSetting && r.maxTokensSetting > 0);
  if (withMaxTokens.length < 5) return null;

  let wasteCount = 0;
  let totalWastedTokens = 0;
  let totalModel = '';

  for (const r of withMaxTokens) {
    const maxTokens = r.maxTokensSetting!;
    const actual = r.outputTokens;
    const usage = actual / maxTokens;

    // If using less than 20% of max_tokens, it's wasteful
    if (usage < 0.2 && maxTokens > 500) {
      wasteCount++;
      totalWastedTokens += maxTokens - actual;
      totalModel = r.model;
    }
  }

  if (wasteCount < 5) return null;

  const ratio = wasteCount / withMaxTokens.length;
  // Estimate: reserving excess capacity can cause higher latency, not direct cost
  // But lowering max_tokens can enable faster responses
  const pricing = getModelPricing(totalModel);
  const potentialSavings = (totalWastedTokens * pricing.outputPerMillion * 0.05) / 1_000_000; // conservative 5% impact

  const severity = ratio > 0.5 ? 'high' : ratio > 0.3 ? 'medium' : 'low';

  return {
    type: 'max_tokens',
    severity,
    title: 'Optimize max_tokens setting',
    description: `${wasteCount} of ${withMaxTokens.length} requests used less than 20% of their max_tokens limit. Lowering max_tokens can reduce latency and improve response times.`,
    estimatedSavingsUsd: Math.round(potentialSavings * 10000) / 10000,
    affectedRequests: wasteCount,
  };
}

/**
 * Detect requests that send tool definitions but never use them.
 * Sending unused tools wastes input tokens (tool schemas are large).
 */
export function detectUnusedTools(rows: RequestRow[]): OptimizationTip | null {
  const withTools = rows.filter((r) => r.toolCount && r.toolCount > 0);
  if (withTools.length < 5) return null;

  let unusedCount = 0;
  let wastedInputTokens = 0;

  for (const r of withTools) {
    const toolsUsedArr: string[] = r.toolsUsed ? JSON.parse(r.toolsUsed) : [];
    if (toolsUsedArr.length === 0) {
      unusedCount++;
      // Estimate ~200 tokens per tool definition
      wastedInputTokens += (r.toolCount ?? 0) * 200;
    }
  }

  if (unusedCount < 5) return null;

  const ratio = unusedCount / withTools.length;
  // Calculate actual cost of wasted input tokens
  let totalSavings = 0;
  for (const r of withTools) {
    const toolsUsedArr: string[] = r.toolsUsed ? JSON.parse(r.toolsUsed) : [];
    if (toolsUsedArr.length === 0) {
      const pricing = getModelPricing(r.model);
      totalSavings += ((r.toolCount ?? 0) * 200 * pricing.inputPerMillion) / 1_000_000;
    }
  }

  const severity = ratio > 0.7 ? 'high' : ratio > 0.4 ? 'medium' : 'low';

  return {
    type: 'unused_tools',
    severity,
    title: 'Remove unused tool definitions',
    description: `${unusedCount} of ${withTools.length} requests with tools never called any. Each tool definition adds ~200 input tokens. Send tools only when the model may need them.`,
    estimatedSavingsUsd: Math.round(totalSavings * 10000) / 10000,
    affectedRequests: unusedCount,
  };
}

/**
 * Run all optimization checks and return tips sorted by severity.
 */
export function analyzeOptimizations(rows: RequestRow[]): OptimizationTip[] {
  const tips: OptimizationTip[] = [];

  const cache = detectCacheOpportunities(rows);
  if (cache) tips.push(cache);

  const maxTokens = detectMaxTokensWaste(rows);
  if (maxTokens) tips.push(maxTokens);

  const tools = detectUnusedTools(rows);
  if (tools) tips.push(tools);

  // Sort: high > medium > low
  const order = { high: 0, medium: 1, low: 2 };
  tips.sort((a, b) => order[a.severity] - order[b.severity]);

  return tips;
}
