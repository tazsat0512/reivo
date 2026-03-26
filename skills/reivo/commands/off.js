const { ProxyClient } = require("../lib/proxy-client");

async function execute(config) {
  const client = new ProxyClient(config.reivo.api_key);
  await client.setRouting(false);
  return "Routing disabled. All requests pass through without model switching.";
}

module.exports = { execute, description: "Disable smart routing" };
