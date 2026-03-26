'use client';

import Link from 'next/link';
import { useMemo, useState } from 'react';

// Representative models with actual pricing ($/M tokens) and their routing targets
const MODELS = [
  {
    id: 'gpt-4o',
    label: 'GPT-4o',
    provider: 'OpenAI',
    input: 2.5,
    output: 10.0,
    routeTo: 'GPT-4o-mini',
    routeInput: 0.15,
    routeOutput: 0.6,
  },
  {
    id: 'gpt-4.1',
    label: 'GPT-4.1',
    provider: 'OpenAI',
    input: 2.0,
    output: 8.0,
    routeTo: 'GPT-4.1-mini',
    routeInput: 0.4,
    routeOutput: 1.6,
  },
  {
    id: 'claude-sonnet',
    label: 'Claude Sonnet 4',
    provider: 'Anthropic',
    input: 3.0,
    output: 15.0,
    routeTo: 'Claude Haiku',
    routeInput: 0.8,
    routeOutput: 4.0,
  },
  {
    id: 'claude-opus',
    label: 'Claude Opus 4',
    provider: 'Anthropic',
    input: 15.0,
    output: 75.0,
    routeTo: 'Claude Sonnet',
    routeInput: 3.0,
    routeOutput: 15.0,
  },
  {
    id: 'o3',
    label: 'o3',
    provider: 'OpenAI',
    input: 10.0,
    output: 40.0,
    routeTo: 'o3-mini',
    routeInput: 1.1,
    routeOutput: 4.4,
  },
  {
    id: 'gemini-2.5-pro',
    label: 'Gemini 2.5 Pro',
    provider: 'Google',
    input: 1.25,
    output: 10.0,
    routeTo: 'Gemini 2.5 Flash',
    routeInput: 0.15,
    routeOutput: 0.6,
  },
  {
    id: 'gpt-4-turbo',
    label: 'GPT-4 Turbo',
    provider: 'OpenAI',
    input: 10.0,
    output: 30.0,
    routeTo: 'GPT-4o-mini',
    routeInput: 0.15,
    routeOutput: 0.6,
  },
] as const;

// Assume ~30% input, ~70% output token cost ratio (typical for chat/agent usage)
const INPUT_RATIO = 0.3;
const OUTPUT_RATIO = 0.7;
// Routing rate: % of requests that can be safely downgraded
const ROUTE_RATE = 0.65;

function computeSavings(monthlySpend: number, selectedModels: string[]) {
  if (selectedModels.length === 0) return { savings: 0, percent: 0, breakdown: [] };

  // Split spend evenly across selected models
  const perModel = monthlySpend / selectedModels.length;

  const breakdown = selectedModels.map((id) => {
    const m = MODELS.find((x) => x.id === id)!;
    // Weighted average cost per token for this model
    const originalCostPerM = m.input * INPUT_RATIO + m.output * OUTPUT_RATIO;
    const routedCostPerM = m.routeInput * INPUT_RATIO + m.routeOutput * OUTPUT_RATIO;

    // Cost if we route ROUTE_RATE of requests to the cheaper model
    const afterRouting =
      perModel * (1 - ROUTE_RATE) + perModel * ROUTE_RATE * (routedCostPerM / originalCostPerM);
    const saved = perModel - afterRouting;

    return {
      model: m.label,
      routeTo: m.routeTo,
      spend: perModel,
      afterRouting,
      saved,
      percent: perModel > 0 ? Math.round((saved / perModel) * 100) : 0,
    };
  });

  const totalSavings = breakdown.reduce((sum, b) => sum + b.saved, 0);
  const totalPercent = monthlySpend > 0 ? Math.round((totalSavings / monthlySpend) * 100) : 0;

  return { savings: totalSavings, percent: totalPercent, breakdown };
}

export function SavingsCalculator() {
  const [spend, setSpend] = useState(500);
  const [selected, setSelected] = useState<string[]>(['gpt-4o', 'claude-sonnet']);

  const toggleModel = (id: string) => {
    setSelected((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));
  };

  const { savings, percent, breakdown } = useMemo(
    () => computeSavings(spend, selected),
    [spend, selected],
  );

  return (
    <div className="rounded-xl border-2 border-primary/20 bg-card p-8">
      <h3 className="text-center text-2xl font-bold">How much would you save?</h3>
      <p className="mt-2 text-center text-sm text-muted-foreground">
        Select the models you use and your monthly spend
      </p>

      <div className="mx-auto mt-8 max-w-2xl">
        {/* Model selector */}
        <div>
          <p className="text-sm font-medium">Models you use</p>
          <div className="mt-2 flex flex-wrap gap-2">
            {MODELS.map((m) => (
              <button
                key={m.id}
                type="button"
                onClick={() => toggleModel(m.id)}
                className={`rounded-full px-3 py-1.5 text-xs font-medium transition-colors ${
                  selected.includes(m.id)
                    ? 'bg-primary text-primary-foreground'
                    : 'border bg-background text-muted-foreground hover:bg-accent'
                }`}
              >
                {m.label}
                <span className="ml-1 opacity-60">({m.provider})</span>
              </button>
            ))}
          </div>
        </div>

        {/* Spend slider */}
        <div className="mt-6">
          <p className="text-sm font-medium">Monthly API spend</p>
          <div className="mt-2 flex items-center gap-3">
            <span className="text-lg font-bold text-muted-foreground">$</span>
            <input
              type="range"
              min={50}
              max={10000}
              step={50}
              value={spend}
              onChange={(e) => setSpend(Number(e.target.value))}
              className="h-2 flex-1 cursor-pointer appearance-none rounded-full bg-muted accent-primary"
            />
            <span className="min-w-[80px] text-right text-xl font-bold">
              ${spend.toLocaleString()}
            </span>
          </div>
          <div className="mt-2 flex flex-wrap justify-center gap-2">
            {[100, 500, 1000, 3000, 5000, 10000].map((p) => (
              <button
                key={p}
                type="button"
                onClick={() => setSpend(p)}
                className={`rounded-full px-2.5 py-0.5 text-xs font-medium transition-colors ${
                  spend === p
                    ? 'bg-primary text-primary-foreground'
                    : 'border bg-background text-muted-foreground hover:bg-accent'
                }`}
              >
                ${p.toLocaleString()}
              </button>
            ))}
          </div>
        </div>

        {/* Results */}
        {selected.length > 0 ? (
          <>
            <div className="mt-8 grid gap-4 sm:grid-cols-3">
              <div className="rounded-lg border bg-green-500/5 p-4 text-center">
                <p className="text-xs text-muted-foreground">Monthly Savings</p>
                <p className="mt-1 text-2xl font-bold text-green-600">
                  ${Math.round(savings).toLocaleString()}
                </p>
              </div>
              <div className="rounded-lg border bg-green-500/5 p-4 text-center">
                <p className="text-xs text-muted-foreground">Yearly Savings</p>
                <p className="mt-1 text-2xl font-bold text-green-600">
                  ${Math.round(savings * 12).toLocaleString()}
                </p>
              </div>
              <div className="rounded-lg border bg-green-500/5 p-4 text-center">
                <p className="text-xs text-muted-foreground">Cost Reduction</p>
                <p className="mt-1 text-2xl font-bold text-green-600">{percent}%</p>
              </div>
            </div>

            {/* Breakdown */}
            <div className="mt-4 space-y-2">
              {breakdown.map((b) => (
                <div
                  key={b.model}
                  className="flex items-center justify-between rounded-md border px-3 py-2 text-xs"
                >
                  <div className="flex items-center gap-2">
                    <span className="font-medium">{b.model}</span>
                    <span className="text-muted-foreground">&rarr;</span>
                    <span className="text-green-600">{b.routeTo}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-muted-foreground">
                      ${Math.round(b.spend)}&rarr;${Math.round(b.afterRouting)}
                    </span>
                    <span className="font-semibold text-green-600">-{b.percent}%</span>
                  </div>
                </div>
              ))}
            </div>

            <p className="mt-3 text-center text-[11px] text-muted-foreground">
              Assumes 65% of requests are routable to lighter models. Actual savings depend on task
              complexity. Token cost split: 30% input / 70% output.
            </p>
          </>
        ) : (
          <div className="mt-8 rounded-lg border border-dashed p-6 text-center text-sm text-muted-foreground">
            Select at least one model above to see your estimated savings.
          </div>
        )}

        <div className="mt-6 text-center">
          <Link
            href="/sign-up"
            className="inline-block rounded-md bg-primary px-6 py-2.5 text-sm font-medium text-primary-foreground hover:bg-primary/90"
          >
            Start saving now &mdash; Free
          </Link>
        </div>
      </div>
    </div>
  );
}
