const { ProxyClient } = require("../lib/proxy-client");
const { generateShareImage } = require("../lib/share-image");

async function execute(config) {
  const client = new ProxyClient(config.reivo.api_key);
  const data = await client.getStatus();
  return generateShareImage(data);
}

module.exports = { execute, description: "Generate shareable cost report image" };
