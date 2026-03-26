const { ProxyClient } = require("../lib/proxy-client");

const VALID_MODES = ["auto", "conservative", "aggressive"];

async function execute(config, args) {
  const mode = (args || "").trim().toLowerCase();
  if (!VALID_MODES.includes(mode)) {
    return `Usage: /reivo mode <${VALID_MODES.join("|")}>\n\nauto: balance cost and quality\nconservative: prefer quality, save less\naggressive: maximize savings`;
  }

  const client = new ProxyClient(config.reivo.api_key);
  const result = await client.setRouting(true, mode);
  return `Routing mode set to: ${result.routing.mode}`;
}

module.exports = { execute, description: "Set routing mode (auto/conservative/aggressive)" };
