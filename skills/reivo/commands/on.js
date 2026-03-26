const { ProxyClient } = require("../lib/proxy-client");

async function execute(config) {
  const client = new ProxyClient(config.reivo.api_key);
  const result = await client.setRouting(true);
  return `Routing enabled (mode: ${result.routing.mode})`;
}

module.exports = { execute, description: "Enable smart routing" };
