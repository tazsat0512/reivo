const { ProxyClient } = require("../lib/proxy-client");
const { formatStatus } = require("../lib/formatter");

async function execute(config) {
  const client = new ProxyClient(config.reivo.api_key);
  const data = await client.getStatus();
  return formatStatus(data);
}

module.exports = { execute, description: "Today's cost, routing, and quality report" };
