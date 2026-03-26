'use client';

import { Card, CardContent } from '../../../components/ui/card';
import { Skeleton } from '../../../components/ui/skeleton';
import { trpc } from '../../../lib/trpc/client';
import { formatDate } from '../../../lib/utils';

function LoopsSkeleton() {
  return (
    <div className="space-y-8">
      <div>
        <Skeleton className="h-9 w-40" />
        <Skeleton className="mt-2 h-5 w-64" />
      </div>
      <Card>
        <CardContent className="p-0">
          <div className="p-4 space-y-4">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="flex items-center gap-4">
                <Skeleton className="h-5 w-32" />
                <Skeleton className="h-5 w-24" />
                <Skeleton className="h-5 w-20" />
                <Skeleton className="h-5 w-28" />
                <Skeleton className="h-5 w-12 ml-auto" />
                <Skeleton className="h-5 w-12" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default function LoopsPage() {
  const { data, isLoading } = trpc.getLoopHistory.useQuery({ limit: 50 });

  if (isLoading) {
    return <LoopsSkeleton />;
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold">Loop Detection</h1>
        <p className="text-muted-foreground">History of detected agent loops</p>
      </div>

      <Card>
        <CardContent className="p-0">
          <table className="w-full">
            <thead>
              <tr className="border-b text-left text-sm text-muted-foreground">
                <th className="p-4">Detected At</th>
                <th className="p-4">Session</th>
                <th className="p-4">Agent</th>
                <th className="p-4">Prompt Hash</th>
                <th className="p-4 text-right">Match Count</th>
                <th className="p-4 text-right">Similarity</th>
              </tr>
            </thead>
            <tbody>
              {data?.map((loop) => (
                <tr key={loop.id} className="border-b hover:bg-muted/50">
                  <td className="p-4 text-sm">{formatDate(loop.detectedAt)}</td>
                  <td className="p-4 font-mono text-sm">{loop.sessionId?.slice(0, 12) ?? 'N/A'}</td>
                  <td className="p-4 text-sm">{loop.agentId ?? 'Unknown'}</td>
                  <td className="p-4 font-mono text-sm text-muted-foreground">
                    {loop.promptHash.slice(0, 16)}...
                  </td>
                  <td className="p-4 text-right text-sm font-medium">{loop.matchCount}</td>
                  <td className="p-4 text-right text-sm">{loop.similarity?.toFixed(3) ?? 'N/A'}</td>
                </tr>
              ))}
              {data?.length === 0 && (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-muted-foreground">
                    No loops detected yet. This is good!
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </CardContent>
      </Card>
    </div>
  );
}
