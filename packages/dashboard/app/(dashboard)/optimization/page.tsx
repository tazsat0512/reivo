'use client';

import { CheckCircle2, Database, Settings2, Wrench } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../../../components/ui/card';
import { Skeleton } from '../../../components/ui/skeleton';
import { trpc } from '../../../lib/trpc/client';
import { formatCost, formatNumber } from '../../../lib/utils';

const tipIcons = {
  cache: Database,
  max_tokens: Settings2,
  unused_tools: Wrench,
};

const severityColors = {
  high: 'border-red-500/30 bg-red-500/5',
  medium: 'border-yellow-500/30 bg-yellow-500/5',
  low: 'border-blue-500/30 bg-blue-500/5',
};

const severityBadge = {
  high: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
  medium: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400',
  low: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
};

function CacheDetails({
  details,
}: {
  details: {
    model: string;
    agents: string;
    duplicateCount: number;
    avgInputTokens: number;
    totalCostUsd: number;
  }[];
}) {
  return (
    <div className="mt-4 overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b text-left text-muted-foreground">
            <th className="pb-2 pr-4 font-medium">Agent</th>
            <th className="pb-2 pr-4 font-medium">Model</th>
            <th className="pb-2 pr-4 text-right font-medium">Repeats</th>
            <th className="pb-2 pr-4 text-right font-medium">Avg Input Tokens</th>
            <th className="pb-2 text-right font-medium">Total Cost</th>
          </tr>
        </thead>
        <tbody>
          {details.map((d, i) => (
            <tr key={i} className="border-b border-border/50">
              <td className="py-2 pr-4">
                <code className="rounded bg-muted px-1.5 py-0.5 text-xs">{d.agents}</code>
              </td>
              <td className="py-2 pr-4">
                <code className="rounded bg-muted px-1.5 py-0.5 text-xs">{d.model}</code>
              </td>
              <td className="py-2 pr-4 text-right font-medium">{d.duplicateCount}x</td>
              <td className="py-2 pr-4 text-right">{formatNumber(d.avgInputTokens)}</td>
              <td className="py-2 text-right">{formatCost(d.totalCostUsd)}</td>
            </tr>
          ))}
        </tbody>
      </table>
      <p className="mt-3 text-xs text-muted-foreground">
        These prompts are sent repeatedly. Consider using Anthropic&apos;s cache_control, or
        restructure your system prompt to avoid sending the same content.
      </p>
    </div>
  );
}

function MaxTokensDetails({
  details,
}: {
  details: {
    agent: string;
    model: string;
    requests: number;
    avgMaxTokens: number;
    avgOutputTokens: number;
    usagePercent: number;
  }[];
}) {
  return (
    <div className="mt-4 overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b text-left text-muted-foreground">
            <th className="pb-2 pr-4 font-medium">Agent</th>
            <th className="pb-2 pr-4 font-medium">Model</th>
            <th className="pb-2 pr-4 text-right font-medium">Requests</th>
            <th className="pb-2 pr-4 text-right font-medium">Avg max_tokens</th>
            <th className="pb-2 pr-4 text-right font-medium">Avg Output</th>
            <th className="pb-2 text-right font-medium">Usage</th>
          </tr>
        </thead>
        <tbody>
          {details.map((d, i) => (
            <tr key={i} className="border-b border-border/50">
              <td className="py-2 pr-4">
                <code className="rounded bg-muted px-1.5 py-0.5 text-xs">{d.agent}</code>
              </td>
              <td className="py-2 pr-4">
                <code className="rounded bg-muted px-1.5 py-0.5 text-xs">{d.model}</code>
              </td>
              <td className="py-2 pr-4 text-right">{d.requests}</td>
              <td className="py-2 pr-4 text-right">{formatNumber(d.avgMaxTokens)}</td>
              <td className="py-2 pr-4 text-right">{formatNumber(d.avgOutputTokens)}</td>
              <td className="py-2 text-right">
                <span className="font-medium text-red-600">{d.usagePercent}%</span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      <p className="mt-3 text-xs text-muted-foreground">
        Set max_tokens closer to the actual output size. For example, if output averages 100 tokens,
        set max_tokens to 200-500 instead of 4096.
      </p>
    </div>
  );
}

function UnusedToolsDetails({
  details,
}: {
  details: {
    agent: string;
    model: string;
    totalRequests: number;
    unusedRequests: number;
    avgToolsSent: number;
    unusedPercent: number;
  }[];
}) {
  return (
    <div className="mt-4 overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b text-left text-muted-foreground">
            <th className="pb-2 pr-4 font-medium">Agent</th>
            <th className="pb-2 pr-4 font-medium">Model</th>
            <th className="pb-2 pr-4 text-right font-medium">Requests</th>
            <th className="pb-2 pr-4 text-right font-medium">Unused</th>
            <th className="pb-2 pr-4 text-right font-medium">Avg Tools Sent</th>
            <th className="pb-2 text-right font-medium">Unused %</th>
          </tr>
        </thead>
        <tbody>
          {details.map((d, i) => (
            <tr key={i} className="border-b border-border/50">
              <td className="py-2 pr-4">
                <code className="rounded bg-muted px-1.5 py-0.5 text-xs">{d.agent}</code>
              </td>
              <td className="py-2 pr-4">
                <code className="rounded bg-muted px-1.5 py-0.5 text-xs">{d.model}</code>
              </td>
              <td className="py-2 pr-4 text-right">{d.totalRequests}</td>
              <td className="py-2 pr-4 text-right">{d.unusedRequests}</td>
              <td className="py-2 pr-4 text-right">{d.avgToolsSent}</td>
              <td className="py-2 text-right">
                <span className="font-medium text-red-600">{d.unusedPercent}%</span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      <p className="mt-3 text-xs text-muted-foreground">
        Only include tools when the model may need them. Each tool definition adds ~200 input tokens
        to every request. Consider routing tool-free prompts without tool definitions.
      </p>
    </div>
  );
}

function TipDetails({ tip }: { tip: { type: string; details: unknown[] } }) {
  if (!tip.details || tip.details.length === 0) return null;

  if (tip.type === 'cache') {
    return <CacheDetails details={tip.details as Parameters<typeof CacheDetails>[0]['details']} />;
  }
  if (tip.type === 'max_tokens') {
    return (
      <MaxTokensDetails
        details={tip.details as Parameters<typeof MaxTokensDetails>[0]['details']}
      />
    );
  }
  if (tip.type === 'unused_tools') {
    return (
      <UnusedToolsDetails
        details={tip.details as Parameters<typeof UnusedToolsDetails>[0]['details']}
      />
    );
  }
  return null;
}

export default function OptimizationPage() {
  const { data, isLoading } = trpc.getOptimizations.useQuery();

  if (isLoading) {
    return (
      <div className="space-y-8">
        <div>
          <Skeleton className="h-9 w-48" />
          <Skeleton className="mt-2 h-5 w-72" />
        </div>
        <div className="grid gap-4 md:grid-cols-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <Card key={i}>
              <CardContent className="pt-6">
                <Skeleton className="h-20 w-full" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  const tips = data?.tips ?? [];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold">Cost Optimization</h1>
        <p className="text-muted-foreground">
          Recommendations based on your last 7 days ({data?.analyzedRequests ?? 0} requests
          analyzed)
        </p>
      </div>

      {/* Summary */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Optimization Tips
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{tips.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Estimated Savings
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {formatCost(data?.totalEstimatedSavingsUsd ?? 0)}
            </div>
            <p className="text-xs text-muted-foreground">per week if optimized</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Affected Requests
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {tips.reduce((sum, t) => sum + t.affectedRequests, 0)}
            </div>
            <p className="text-xs text-muted-foreground">of {data?.analyzedRequests ?? 0} total</p>
          </CardContent>
        </Card>
      </div>

      {/* Tips */}
      {tips.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12 text-center">
            <CheckCircle2 className="mb-4 h-12 w-12 text-green-500" />
            <h3 className="text-lg font-semibold">Looking good!</h3>
            <p className="mt-1 text-sm text-muted-foreground">
              No optimization opportunities detected in the last 7 days.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-6">
          {tips.map((tip) => {
            const Icon = tipIcons[tip.type as keyof typeof tipIcons];
            return (
              <Card
                key={tip.type}
                className={severityColors[tip.severity as keyof typeof severityColors]}
              >
                <CardContent className="pt-6">
                  <div className="flex items-start gap-4">
                    <div className="rounded-lg bg-background p-2 shadow-sm">
                      <Icon className="h-5 w-5 text-muted-foreground" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <h3 className="font-semibold">{tip.title}</h3>
                        <span
                          className={`rounded-full px-2 py-0.5 text-xs font-medium ${severityBadge[tip.severity as keyof typeof severityBadge]}`}
                        >
                          {tip.severity}
                        </span>
                      </div>
                      <p className="mt-1 text-sm text-muted-foreground">{tip.description}</p>
                      <div className="mt-3 flex gap-6 text-sm">
                        <div>
                          <span className="text-muted-foreground">Affected: </span>
                          <span className="font-medium">{tip.affectedRequests} requests</span>
                        </div>
                        {tip.estimatedSavingsUsd > 0 && (
                          <div>
                            <span className="text-muted-foreground">Potential savings: </span>
                            <span className="font-medium text-green-600">
                              {formatCost(tip.estimatedSavingsUsd)}/week
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                  <TipDetails tip={tip} />
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
