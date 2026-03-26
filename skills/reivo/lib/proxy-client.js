const BASE_URL = "https://proxy.reivo.dev";

class ProxyClient {
  constructor(apiKey) {
    this.apiKey = apiKey;
    this.baseUrl = BASE_URL;
  }

  _headers() {
    return {
      Authorization: `Bearer ${this.apiKey}`,
      "Content-Type": "application/json",
    };
  }

  async getStatus() {
    // Stub: returns mock data matching /reivo status format
    return {
      date: new Date().toISOString().slice(0, 10),
      requests: 342,
      routing: {
        haiku: { pct: 71, cost: 0.82 },
        sonnet: { pct: 22, cost: 4.10 },
        opus: { pct: 7, cost: 1.40 },
      },
      totalCost: 6.32,
      withoutReivo: 14.20,
      savedToday: 7.88,
      savedMonth: 127.40,
      quality: { score: 0.97, target: 0.95 },
      budget: { used: 42.10, cap: 100, pct: 42 },
      routingMode: "auto",
      routingEnabled: true,
    };
  }

  async getMonthly() {
    // Stub: returns mock monthly data
    return {
      month: new Date().toISOString().slice(0, 7),
      totalRequests: 8420,
      totalCost: 42.10,
      withoutReivo: 169.50,
      saved: 127.40,
      avgDaily: 1.40,
      peakDay: { date: "2026-03-15", cost: 4.80 },
      routing: {
        haiku: { pct: 68, cost: 12.30 },
        sonnet: { pct: 24, cost: 22.40 },
        opus: { pct: 8, cost: 7.40 },
      },
      quality: { avg: 0.97, min: 0.93, target: 0.95 },
      budget: { cap: 100, used: 42.10, remaining: 57.90 },
    };
  }

  async setRouting(enabled, mode) {
    // Stub: PATCH routing settings
    return {
      routing: {
        enabled: enabled,
        mode: mode || "auto",
      },
      updated: true,
    };
  }

  async setBudget(amount) {
    // Stub: PATCH budget cap
    return {
      budget: {
        monthly_cap: amount,
        updated: true,
      },
    };
  }
}

module.exports = { ProxyClient };
