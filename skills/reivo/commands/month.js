const { ProxyClient } = require("../lib/proxy-client");
const { formatMonthly } = require("../lib/formatter");

async function execute(config) {
  const client = new ProxyClient(config.reivo.api_key);
  const data = await client.getMonthly();
  return formatMonthly(data);
}

module.exports = { execute, description: "Monthly cost and savings summary" };
