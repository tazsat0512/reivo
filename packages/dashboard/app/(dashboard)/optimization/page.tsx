'use client';

import {
  AlertTriangle,
  ArrowLeft,
  CheckCircle2,
  Database,
  Lightbulb,
  Settings2,
  Wrench,
} from 'lucide-react';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '../../../components/ui/card';
import { Skeleton } from '../../../components/ui/skeleton';
import { trpc } from '../../../lib/trpc/client';
import { formatCost } from '../../../lib/utils';

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
        <div className="space-y-4">
          {tips.map((tip) => {
            const Icon = tipIcons[tip.type];
            return (
              <Card key={tip.type} className={severityColors[tip.severity]}>
                <CardContent className="flex items-start gap-4 pt-6">
                  <div className="rounded-lg bg-background p-2 shadow-sm">
                    <Icon className="h-5 w-5 text-muted-foreground" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <h3 className="font-semibold">{tip.title}</h3>
                      <span
                        className={`rounded-full px-2 py-0.5 text-xs font-medium ${severityBadge[tip.severity]}`}
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
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
