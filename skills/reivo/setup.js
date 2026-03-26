const readline = require("readline");
const fs = require("fs");
const path = require("path");

const CONFIG_PATH = path.join(process.cwd(), "config.yaml");
const PROXY_BASE = "https://proxy.reivo.dev";

function prompt(rl, question) {
  return new Promise((resolve) => {
    rl.question(question, (answer) => resolve(answer.trim()));
  });
}

async function validateKey(apiKey) {
  const res = await fetch(`${PROXY_BASE}/health`, {
    headers: { Authorization: `Bearer ${apiKey}` },
  });
  if (!res.ok) {
    throw new Error(`Validation failed: ${res.status} ${res.statusText}`);
  }
  return await res.json();
}

function readExistingConfig() {
  if (!fs.existsSync(CONFIG_PATH)) return "";
  return fs.readFileSync(CONFIG_PATH, "utf-8");
}

function mergeReivoBlock(existing, apiKey) {
  const block = [
    "reivo:",
    `  api_key: "${apiKey}"`,
    "  routing:",
    "    enabled: true",
    '    mode: "auto"',
    "  budget:",
    "    monthly_cap: 100",
    "    pace_control: true",
    "  quality:",
    "    min_score: 0.95",
    "    auto_fallback: true",
    "  notifications:",
    "    daily_report: true",
    "    loop_alert: true",
    "    budget_warning: true",
  ].join("\n");

  if (!existing) return block + "\n";

  // Replace existing reivo block or append
  const reivoStart = existing.indexOf("reivo:");
  if (reivoStart === -1) {
    return existing.trimEnd() + "\n\n" + block + "\n";
  }

  // Find the end of the reivo block (next top-level key or EOF)
  const lines = existing.split("\n");
  let startLine = -1;
  let endLine = lines.length;
  for (let i = 0; i < lines.length; i++) {
    if (lines[i].startsWith("reivo:")) {
      startLine = i;
      continue;
    }
    if (startLine >= 0 && i > startLine && /^\S/.test(lines[i])) {
      endLine = i;
      break;
    }
  }

  const before = lines.slice(0, startLine).join("\n");
  const after = lines.slice(endLine).join("\n");
  const parts = [before, block, after].filter(Boolean);
  return parts.join("\n") + "\n";
}

async function main() {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  try {
    console.log("Reivo Setup\n");

    const apiKey = await prompt(rl, "Enter your Reivo API key (rv_...): ");

    if (!apiKey.startsWith("rv_")) {
      console.error("Error: API key must start with rv_");
      process.exit(1);
    }

    console.log("Validating key...");
    try {
      await validateKey(apiKey);
      console.log("Key validated.");
    } catch (err) {
      console.error(`Error: ${err.message}`);
      process.exit(1);
    }

    const existing = readExistingConfig();
    const updated = mergeReivoBlock(existing, apiKey);
    fs.writeFileSync(CONFIG_PATH, updated, "utf-8");

    console.log(`\nConfig written to ${CONFIG_PATH}`);
    console.log('Run "/reivo status" to check your setup.');
  } finally {
    rl.close();
  }
}

main();
