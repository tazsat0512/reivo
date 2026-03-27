/**
 * Re-sync all users to Cloudflare KV with encrypted provider keys.
 * Run from project root: npx tsx scripts/resync-kv.ts
 *
 * Requires env vars from packages/dashboard/.env.local:
 *   DATABASE_URL, DATABASE_AUTH_TOKEN, ENCRYPTION_KEY,
 *   CF_ACCOUNT_ID, CF_KV_NAMESPACE_ID, CF_API_TOKEN
 */

import { createHash } from 'node:crypto';
import { createClient } from '@libsql/client';
import { drizzle } from 'drizzle-orm/libsql';
import { integer, real, sqliteTable, text } from 'drizzle-orm/sqlite-core';

// Minimal schema
const users = sqliteTable('users', {
  id: text('id').primaryKey(),
  email: text('email').notNull(),
  apiKeyHash: text('api_key_hash'),
  providerKeysEncrypted: text('provider_keys_encrypted').notNull().default('{}'),
  budgetLimitUsd: real('budget_limit_usd'),
  slackWebhookUrl: text('slack_webhook_url'),
  plan: text('plan').notNull().default('free'),
  requestCount: integer('request_count').notNull().default(0),
  requestCountResetAt: integer('request_count_reset_at').notNull().default(0),
  routingEnabled: integer('routing_enabled').notNull().default(0),
  routingMode: text('routing_mode').notNull().default('auto'),
});

// AES-256-GCM encryption (same as dashboard)
async function decrypt(ciphertext: string): Promise<string> {
  const keyHex = process.env.ENCRYPTION_KEY!;
  const buf = Buffer.from(ciphertext, 'base64');
  const iv = buf.subarray(0, 12);
  const tag = buf.subarray(buf.length - 16);
  const data = buf.subarray(12, buf.length - 16);

  const keyBuf = Buffer.from(keyHex, 'hex');
  const cryptoKey = await crypto.subtle.importKey('raw', keyBuf, 'AES-GCM', false, ['decrypt']);

  const combined = new Uint8Array(data.length + tag.length);
  combined.set(data);
  combined.set(tag, data.length);

  const decrypted = await crypto.subtle.decrypt({ name: 'AES-GCM', iv }, cryptoKey, combined);
  return new TextDecoder().decode(decrypted);
}

async function encrypt(plaintext: string): Promise<string> {
  const keyHex = process.env.ENCRYPTION_KEY!;
  const keyBuf = Buffer.from(keyHex, 'hex');
  const cryptoKey = await crypto.subtle.importKey('raw', keyBuf, 'AES-GCM', false, ['encrypt']);
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const encoded = new TextEncoder().encode(plaintext);
  const encrypted = await crypto.subtle.encrypt({ name: 'AES-GCM', iv }, cryptoKey, encoded);

  const encBuf = Buffer.from(encrypted);
  const result = Buffer.concat([Buffer.from(iv), encBuf]);
  return result.toString('base64');
}

const CF_API_BASE = 'https://api.cloudflare.com/client/v4';

async function kvPut(key: string, value: string): Promise<void> {
  const accountId = process.env.CF_ACCOUNT_ID!;
  const namespaceId = process.env.CF_KV_NAMESPACE_ID!;
  const apiToken = process.env.CF_API_TOKEN!;

  const url = `${CF_API_BASE}/accounts/${accountId}/storage/kv/namespaces/${namespaceId}/values/${encodeURIComponent(key)}`;
  const res = await fetch(url, {
    method: 'PUT',
    headers: { Authorization: `Bearer ${apiToken}`, 'Content-Type': 'text/plain' },
    body: value,
  });

  if (!res.ok) {
    const body = await res.text();
    throw new Error(`KV PUT failed: ${res.status} ${body}`);
  }
}

async function main() {
  // Load env from dashboard .env.local
  const fs = await import('node:fs');
  const envContent = fs.readFileSync('packages/dashboard/.env.local', 'utf-8');
  for (const line of envContent.split('\n')) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;
    const eqIdx = trimmed.indexOf('=');
    if (eqIdx === -1) continue;
    const key = trimmed.slice(0, eqIdx);
    const value = trimmed.slice(eqIdx + 1);
    if (!process.env[key]) process.env[key] = value;
  }

  const required = [
    'DATABASE_URL',
    'DATABASE_AUTH_TOKEN',
    'ENCRYPTION_KEY',
    'CF_ACCOUNT_ID',
    'CF_KV_NAMESPACE_ID',
    'CF_API_TOKEN',
  ];
  for (const key of required) {
    if (!process.env[key]) {
      console.error(`Missing env var: ${key}`);
      process.exit(1);
    }
  }

  const client = createClient({
    url: process.env.DATABASE_URL!,
    authToken: process.env.DATABASE_AUTH_TOKEN!,
  });
  const db = drizzle(client);

  const allUsers = await db.select().from(users);
  console.log(`Found ${allUsers.length} users`);

  for (const user of allUsers) {
    if (!user.apiKeyHash) {
      console.log(`  [SKIP] ${user.email}: no API key`);
      continue;
    }

    // Decrypt provider keys, extract defaults, re-encrypt as flat map
    let encryptedForKV = '{}';
    try {
      if (user.providerKeysEncrypted && user.providerKeysEncrypted !== '{}') {
        const parsed = JSON.parse(await decrypt(user.providerKeysEncrypted));
        const flat: Record<string, string> = {};
        for (const provider of ['openai', 'anthropic', 'google'] as const) {
          const val = parsed[provider];
          if (typeof val === 'string') {
            flat[provider] = val;
          } else if (Array.isArray(val)) {
            const def = val.find((k: Record<string, unknown>) => k.isDefault);
            const first = val[0] as Record<string, unknown> | undefined;
            const entry = def ?? first;
            if (entry && typeof entry.key === 'string') {
              flat[provider] = entry.key;
            }
          }
        }
        encryptedForKV = await encrypt(JSON.stringify(flat));
      }
    } catch (err) {
      console.log(`  [WARN] ${user.email}: decrypt failed, using empty keys`);
      encryptedForKV = '{}';
    }

    const record = {
      id: user.id,
      apiKeyHash: user.apiKeyHash,
      providerKeysEncrypted: encryptedForKV,
      budgetLimitUsd: user.budgetLimitUsd,
      budgetAction: 'block',
      slackWebhookUrl: user.slackWebhookUrl ?? undefined,
      plan: user.plan ?? 'free',
      requestCount: user.requestCount ?? 0,
      requestCountResetAt: user.requestCountResetAt ?? 0,
      routingEnabled: user.routingEnabled ? true : false,
      routingMode: user.routingMode ?? 'auto',
    };

    await kvPut(`key:${user.apiKeyHash}`, JSON.stringify(record));
    console.log(`  [OK] ${user.email}: synced to KV (key:${user.apiKeyHash.slice(0, 8)}...)`);
  }

  console.log('Done!');
  process.exit(0);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
