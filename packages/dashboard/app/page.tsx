import { auth } from '@clerk/nextjs/server';
import Link from 'next/link';
import { redirect } from 'next/navigation';

export default async function LandingPage() {
  const { userId } = await auth();
  if (userId) redirect('/overview');

  return (
    <div className="min-h-screen bg-background">
      {/* Hero */}
      <header className="border-b">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
              <span className="text-sm font-bold text-primary-foreground">TS</span>
            </div>
            <span className="text-lg font-semibold">TokenScope</span>
          </div>
          <div className="flex items-center gap-4">
            <Link href="/sign-in" className="text-sm text-muted-foreground hover:text-foreground">
              Sign in
            </Link>
            <Link
              href="/sign-up"
              className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"
            >
              Get Started Free
            </Link>
          </div>
        </div>
      </header>

      <main>
        {/* Hero Section */}
        <section className="mx-auto max-w-4xl px-6 py-24 text-center">
          <h1 className="text-5xl font-bold tracking-tight">
            Don&apos;t just watch your AI burn money.
            <br />
            <span className="text-primary">Stop it.</span>
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-lg text-muted-foreground">
            TokenScope is a proxy that visualizes AI agent token consumption and auto-stops runaway
            agents. Change one line of code — your base URL — and get full cost visibility with
            built-in guardrails.
          </p>
          <div className="mt-10 flex items-center justify-center gap-4">
            <Link
              href="/sign-up"
              className="rounded-md bg-primary px-6 py-3 text-sm font-medium text-primary-foreground hover:bg-primary/90"
            >
              Start Free — No Credit Card
            </Link>
            <a
              href="https://github.com/tazsat0512/tokenscope"
              target="_blank"
              rel="noopener noreferrer"
              className="rounded-md border px-6 py-3 text-sm font-medium hover:bg-accent"
            >
              View on GitHub
            </a>
          </div>
        </section>

        {/* How It Works */}
        <section className="border-t bg-muted/30 py-20">
          <div className="mx-auto max-w-5xl px-6">
            <h2 className="text-center text-3xl font-bold">One line change. Full visibility.</h2>
            <p className="mt-4 text-center text-muted-foreground">
              Replace your AI provider&apos;s base URL with TokenScope&apos;s proxy URL. That&apos;s
              it.
            </p>

            <div className="mt-12 overflow-hidden rounded-lg border bg-card">
              <div className="flex border-b text-sm">
                <span className="border-r px-4 py-2 text-muted-foreground">Before</span>
                <span className="px-4 py-2 font-medium text-primary">After</span>
              </div>
              <pre className="overflow-x-auto p-6 text-sm">
                <code>
                  {`// Before
const client = new Anthropic({
  baseURL: "https://api.anthropic.com"
});

// After — just change the base URL
const client = new Anthropic({
  baseURL: "https://tokenscope-proxy.tazoelab.workers.dev/anthropic/v1",
  apiKey: "ts_your_tokenscope_key"
});`}
                </code>
              </pre>
            </div>
          </div>
        </section>

        {/* Features */}
        <section className="py-20">
          <div className="mx-auto max-w-5xl px-6">
            <h2 className="text-center text-3xl font-bold">Observe + Defend</h2>
            <p className="mt-4 text-center text-muted-foreground">
              Unlike other tools that only log, TokenScope actively protects your budget.
            </p>

            <div className="mt-12 grid gap-8 md:grid-cols-3">
              <div className="rounded-lg border p-6">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                  <svg className="h-5 w-5 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                </div>
                <h3 className="mt-4 text-lg font-semibold">Cost Visibility</h3>
                <p className="mt-2 text-sm text-muted-foreground">
                  Real-time cost tracking across OpenAI, Anthropic, and Google. See per-session,
                  per-agent, and per-model breakdowns.
                </p>
              </div>

              <div className="rounded-lg border p-6">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                  <svg className="h-5 w-5 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                </div>
                <h3 className="mt-4 text-lg font-semibold">Budget Guardrails</h3>
                <p className="mt-2 text-sm text-muted-foreground">
                  Set spending limits and get alerts at 50%, 80%, and 100%. Requests are
                  automatically blocked when the budget is exceeded.
                </p>
              </div>

              <div className="rounded-lg border p-6">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                  <svg className="h-5 w-5 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                </div>
                <h3 className="mt-4 text-lg font-semibold">Loop Detection</h3>
                <p className="mt-2 text-sm text-muted-foreground">
                  Detects when AI agents get stuck in repetitive loops using prompt hashing and
                  TF-IDF similarity. Auto-stops runaway agents.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Comparison */}
        <section className="border-t bg-muted/30 py-20">
          <div className="mx-auto max-w-4xl px-6">
            <h2 className="text-center text-3xl font-bold">Why TokenScope?</h2>
            <div className="mt-12 overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b">
                    <th className="px-4 py-3 text-left font-medium" />
                    <th className="px-4 py-3 text-center font-medium">Helicone</th>
                    <th className="px-4 py-3 text-center font-medium text-primary">TokenScope</th>
                  </tr>
                </thead>
                <tbody>
                  {[
                    ['Proxy-based (1-line setup)', true, true],
                    ['Cost tracking & analytics', true, true],
                    ['Multi-provider support', true, true],
                    ['Budget limits & auto-block', false, true],
                    ['Loop detection & auto-stop', false, true],
                    ['Anomaly detection (EWMA)', false, true],
                    ['Open source / self-hostable', false, true],
                  ].map(([feature, helicone, ts]) => (
                    <tr key={feature as string} className="border-b">
                      <td className="px-4 py-3">{feature as string}</td>
                      <td className="px-4 py-3 text-center">
                        {helicone ? (
                          <span className="text-green-600">&#10003;</span>
                        ) : (
                          <span className="text-muted-foreground">—</span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-center">
                        {ts ? (
                          <span className="text-green-600 font-semibold">&#10003;</span>
                        ) : (
                          <span className="text-muted-foreground">—</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="py-20">
          <div className="mx-auto max-w-3xl px-6 text-center">
            <h2 className="text-3xl font-bold">Ready to take control?</h2>
            <p className="mt-4 text-muted-foreground">
              Free for up to 10,000 requests/month. No credit card required.
            </p>
            <Link
              href="/sign-up"
              className="mt-8 inline-block rounded-md bg-primary px-8 py-3 text-sm font-medium text-primary-foreground hover:bg-primary/90"
            >
              Get Started Free
            </Link>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t py-8">
        <div className="mx-auto max-w-6xl px-6 text-center text-sm text-muted-foreground">
          &copy; {new Date().getFullYear()} TokenScope. The only AI proxy with built-in guardrails.
        </div>
      </footer>
    </div>
  );
}
