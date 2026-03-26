const { ProxyClient } = require("../lib/proxy-client");

async function execute(config, args) {
  const amount = parseFloat(args);
  if (isNaN(amount) || amount <= 0) {
    return "Usage: /reivo budget <amount>\nExample: /reivo budget 50";
  }

  const client = new ProxyClient(config.reivo.api_key);
  const result = await client.setBudget(amount);
  return `Monthly budget set to $${result.budget.monthly_cap}`;
}

module.exports = { execute, description: "Set monthly budget cap" };
