import { describe, expect, it } from 'vitest';
import {
  analyzeOptimizations,
  detectCacheOpportunities,
  detectMaxTokensWaste,
  detectUnusedTools,
} from '../../src/services/optimization-advisor.js';

function makeRow(overrides: Record<string, unknown> = {}) {
  return {
    promptHash: 'abc123',
    model: 'gpt-4o',
    inputTokens: 1000,
    outputTokens: 500,
    costUsd: 0.01,
    cachedTokens: null,
    hasCacheControl: null,
    maxTokensSetting: null,
    toolCount: null,
    toolsUsed: null,
    ...overrides,
  };
}

describe('optimization-advisor', () => {
  describe('detectCacheOpportunities', () => {
    it('returns null when no duplicates', () => {
      const rows = Array.from({ length: 10 }, (_, i) => makeRow({ promptHash: `hash-${i}` }));
      expect(detectCacheOpportunities(rows)).toBeNull();
    });

    it('detects repeated prompts (3+ times same hash)', () => {
      const rows = [
        ...Array.from({ length: 5 }, () => makeRow({ promptHash: 'same-hash' })),
        makeRow({ promptHash: 'other-hash' }),
      ];
      const tip = detectCacheOpportunities(rows);
      expect(tip).not.toBeNull();
      expect(tip!.type).toBe('cache');
      expect(tip!.affectedRequests).toBe(4); // 5 - 1 = 4 duplicates
      expect(tip!.estimatedSavingsUsd).toBeGreaterThan(0);
    });

    it('returns null when duplicates are below threshold', () => {
      const rows = [
        makeRow({ promptHash: 'a' }),
        makeRow({ promptHash: 'a' }),
        makeRow({ promptHash: 'b' }),
      ];
      expect(detectCacheOpportunities(rows)).toBeNull();
    });
  });

  describe('detectMaxTokensWaste', () => {
    it('returns null when no max_tokens set', () => {
      const rows = Array.from({ length: 10 }, () => makeRow());
      expect(detectMaxTokensWaste(rows)).toBeNull();
    });

    it('detects low utilization of max_tokens', () => {
      const rows = Array.from({ length: 10 }, () =>
        makeRow({ maxTokensSetting: 4096, outputTokens: 100 }),
      );
      const tip = detectMaxTokensWaste(rows);
      expect(tip).not.toBeNull();
      expect(tip!.type).toBe('max_tokens');
      expect(tip!.affectedRequests).toBe(10);
    });

    it('returns null when utilization is good', () => {
      const rows = Array.from({ length: 10 }, () =>
        makeRow({ maxTokensSetting: 1000, outputTokens: 800 }),
      );
      expect(detectMaxTokensWaste(rows)).toBeNull();
    });
  });

  describe('detectUnusedTools', () => {
    it('returns null when no tools in requests', () => {
      const rows = Array.from({ length: 10 }, () => makeRow());
      expect(detectUnusedTools(rows)).toBeNull();
    });

    it('detects requests with tools that are never called', () => {
      const rows = Array.from({ length: 10 }, () => makeRow({ toolCount: 5, toolsUsed: '[]' }));
      const tip = detectUnusedTools(rows);
      expect(tip).not.toBeNull();
      expect(tip!.type).toBe('unused_tools');
      expect(tip!.affectedRequests).toBe(10);
      expect(tip!.estimatedSavingsUsd).toBeGreaterThan(0);
    });

    it('returns null when tools are being used', () => {
      const rows = Array.from({ length: 10 }, () =>
        makeRow({ toolCount: 3, toolsUsed: '["search","calculate"]' }),
      );
      expect(detectUnusedTools(rows)).toBeNull();
    });
  });

  describe('analyzeOptimizations', () => {
    it('returns empty array when no issues found', () => {
      const rows = Array.from({ length: 3 }, (_, i) => makeRow({ promptHash: `hash-${i}` }));
      expect(analyzeOptimizations(rows)).toEqual([]);
    });

    it('returns multiple tips sorted by severity', () => {
      const rows = [
        // Cache opportunity: 5 identical prompts
        ...Array.from({ length: 5 }, () => makeRow({ promptHash: 'dup' })),
        // Unused tools
        ...Array.from({ length: 10 }, (_, i) =>
          makeRow({ promptHash: `tool-${i}`, toolCount: 8, toolsUsed: '[]' }),
        ),
      ];
      const tips = analyzeOptimizations(rows);
      expect(tips.length).toBeGreaterThanOrEqual(2);
      // Verify sorted by severity (high first)
      for (let i = 1; i < tips.length; i++) {
        const order = { high: 0, medium: 1, low: 2 };
        expect(order[tips[i].severity]).toBeGreaterThanOrEqual(order[tips[i - 1].severity]);
      }
    });
  });
});
