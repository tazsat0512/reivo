'use client';

import { useState } from 'react';
import { Button } from '../../../components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '../../../components/ui/card';
import { Input } from '../../../components/ui/input';
import { Label } from '../../../components/ui/label';
import { Skeleton } from '../../../components/ui/skeleton';
import { useToast } from '../../../components/ui/toast';
import { trpc } from '../../../lib/trpc/client';

function SettingsSkeleton() {
  return (
    <div className="space-y-8">
      <div>
        <Skeleton className="h-9 w-28" />
        <Skeleton className="mt-2 h-5 w-56" />
      </div>
      {Array.from({ length: 4 }).map((_, i) => (
        <Card key={i}>
          <CardHeader>
            <Skeleton className="h-6 w-32" />
            <Skeleton className="h-4 w-64" />
          </CardHeader>
          <CardContent>
            <Skeleton className="h-10 w-full max-w-md" />
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

export default function SettingsPage() {
  const { data: settings, isLoading } = trpc.getSettings.useQuery();
  const { data: providerStatus } = trpc.getProviderKeyStatus.useQuery();
  const utils = trpc.useUtils();
  const { toast } = useToast();

  const generateApiKey = trpc.generateApiKey.useMutation({
    onSuccess: () => utils.getSettings.invalidate(),
    onError: () => toast({ title: 'Failed to generate API key', variant: 'destructive' }),
  });
  const updateSettings = trpc.updateSettings.useMutation({
    onSuccess: () => {
      utils.getSettings.invalidate();
      utils.getProviderKeyStatus.invalidate();
      toast({ title: 'Settings saved' });
    },
    onError: () => toast({ title: 'Failed to save settings', variant: 'destructive' }),
  });

  const [newApiKey, setNewApiKey] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [budgetLimit, setBudgetLimit] = useState<string>('');
  const [slackUrl, setSlackUrl] = useState<string>('');
  const [providerKeys, setProviderKeys] = useState({
    openai: '',
    anthropic: '',
    google: '',
  });
  const [showConfirm, setShowConfirm] = useState(false);

  if (isLoading) {
    return <SettingsSkeleton />;
  }

  const handleGenerateKey = async () => {
    const result = await generateApiKey.mutateAsync();
    setNewApiKey(result.apiKey);
    setCopied(false);
    setShowConfirm(false);
  };

  const handleCopyKey = async () => {
    if (newApiKey) {
      await navigator.clipboard.writeText(newApiKey);
      setCopied(true);
      toast({ title: 'API key copied to clipboard' });
    }
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold">Settings</h1>
        <p className="text-muted-foreground">Configure your TokenScope proxy</p>
      </div>

      {/* API Key */}
      <Card>
        <CardHeader>
          <CardTitle>API Key</CardTitle>
          <CardDescription>
            Use this key as your Authorization bearer token when calling the proxy
          </CardDescription>
        </CardHeader>
        <CardContent>
          {newApiKey ? (
            <div className="space-y-3">
              <div className="rounded-md border border-yellow-500/50 bg-yellow-500/10 p-4">
                <p className="text-sm font-medium text-yellow-600 mb-2">
                  This key will only be shown once. Copy it now!
                </p>
                <div className="flex items-center gap-3">
                  <code className="flex-1 rounded bg-muted px-3 py-2 font-mono text-sm break-all">
                    {newApiKey}
                  </code>
                  <Button onClick={handleCopyKey} size="sm">
                    {copied ? 'Copied!' : 'Copy'}
                  </Button>
                </div>
              </div>
              <p className="text-sm text-muted-foreground">
                Set your base URL to{' '}
                <code className="font-mono">https://proxy.tokenscope.dev/anthropic/v1</code> and
                use this key as the bearer token.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              <div className="flex items-center gap-4">
                <code className="rounded bg-muted px-3 py-2 font-mono text-sm">
                  {settings?.apiKeyHash
                    ? `ts_****${settings.apiKeyHash.slice(-8)}`
                    : 'No key generated'}
                </code>
              </div>
              {showConfirm ? (
                <div className="flex items-center gap-3">
                  <p className="text-sm text-destructive">
                    {settings?.apiKeyHash
                      ? 'This will invalidate your current key. Continue?'
                      : 'Generate a new API key?'}
                  </p>
                  <Button
                    onClick={handleGenerateKey}
                    disabled={generateApiKey.isPending}
                    size="sm"
                  >
                    {generateApiKey.isPending ? 'Generating...' : 'Confirm'}
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => setShowConfirm(false)}>
                    Cancel
                  </Button>
                </div>
              ) : (
                <Button onClick={() => setShowConfirm(true)}>
                  {settings?.apiKeyHash ? 'Regenerate Key' : 'Generate API Key'}
                </Button>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Provider API Keys */}
      <Card>
        <CardHeader>
          <CardTitle>Provider API Keys</CardTitle>
          <CardDescription>
            Enter your API keys for the providers you want to proxy. Keys are encrypted at rest.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {(['openai', 'anthropic', 'google'] as const).map((provider) => (
              <div key={provider} className="flex items-center gap-4">
                <Label className="w-24 capitalize">{provider}</Label>
                <div className="flex flex-1 items-center gap-2">
                  <Input
                    type="password"
                    placeholder={
                      providerStatus?.[provider]
                        ? '••••••••••••  (key is set)'
                        : 'Not configured'
                    }
                    value={providerKeys[provider]}
                    onChange={(e) =>
                      setProviderKeys((prev) => ({ ...prev, [provider]: e.target.value }))
                    }
                  />
                  {providerStatus?.[provider] && (
                    <span className="text-xs text-green-600 font-medium whitespace-nowrap">
                      Active
                    </span>
                  )}
                </div>
              </div>
            ))}
            <Button
              onClick={() => {
                const keys: Record<string, string | null> = {};
                for (const [p, v] of Object.entries(providerKeys)) {
                  if (v) keys[p] = v;
                }
                if (Object.keys(keys).length === 0) return;
                updateSettings.mutate(
                  { providerKeys: keys },
                  {
                    onSuccess: () => setProviderKeys({ openai: '', anthropic: '', google: '' }),
                  },
                );
              }}
              disabled={
                updateSettings.isPending || !Object.values(providerKeys).some((v) => v)
              }
            >
              {updateSettings.isPending ? 'Saving...' : 'Save Keys'}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Budget Limit */}
      <Card>
        <CardHeader>
          <CardTitle>Budget Limit</CardTitle>
          <CardDescription>
            Set a monthly spending limit. Requests will be blocked when exceeded.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <span className="text-muted-foreground">$</span>
              <Input
                type="number"
                placeholder={settings?.budgetLimitUsd?.toString() ?? 'No limit'}
                value={budgetLimit}
                onChange={(e) => setBudgetLimit(e.target.value)}
                className="w-32"
                step="0.01"
                min="0"
              />
            </div>
            <Button
              onClick={() => {
                updateSettings.mutate({
                  budgetLimitUsd: budgetLimit ? parseFloat(budgetLimit) : null,
                });
              }}
            >
              Save
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Slack Notifications */}
      <Card>
        <CardHeader>
          <CardTitle>Slack Notifications</CardTitle>
          <CardDescription>
            Get alerts for budget warnings, loop detection, and anomalies
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4">
            <Input
              type="url"
              placeholder={settings?.slackWebhookUrl ?? 'https://hooks.slack.com/services/...'}
              value={slackUrl}
              onChange={(e) => setSlackUrl(e.target.value)}
              className="flex-1"
            />
            <Button
              onClick={() => {
                updateSettings.mutate({
                  slackWebhookUrl: slackUrl || null,
                });
              }}
            >
              Save
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
