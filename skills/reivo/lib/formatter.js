function formatStatus(data) {
  const lines = [
    "Reivo Daily Report",
    `\u251c\u2500\u2500 Today: ${data.requests} requests routed`,
  ];

  const routingEntries = Object.entries(data.routing);
  routingEntries.forEach(([model, info], i) => {
    const prefix = i < routingEntries.length - 1 ? "\u2502   \u251c\u2500\u2500" : "\u2502   \u2514\u2500\u2500";
    const name = model.charAt(0).toUpperCase() + model.slice(1);
    lines.push(`${prefix} ${info.pct}% \u2192 ${name}\t($${info.cost.toFixed(2)})`);
  });

  lines.push(`\u251c\u2500\u2500 Quality: ${data.quality.score} (target: ${data.quality.target})`);
  lines.push(`\u251c\u2500\u2500 Budget: $${data.budget.used}/$${data.budget.cap} (${data.budget.pct}%)`);
  lines.push(`\u251c\u2500\u2500 Routing: ${data.routingEnabled ? "ON" : "OFF"} (${data.routingMode})`);
  lines.push(`\u2514\u2500\u2500 Without Reivo: $${data.withoutReivo.toFixed(2)} today`);
  lines.push(`    \u2192 Saved: $${data.savedToday.toFixed(2)} today ($${data.savedMonth.toFixed(2)} this month)`);

  return lines.join("\n");
}

function formatMonthly(data) {
  const lines = [
    `Reivo Monthly Report (${data.month})`,
    `\u251c\u2500\u2500 Requests: ${data.totalRequests}`,
    `\u251c\u2500\u2500 Total Cost: $${data.totalCost.toFixed(2)}`,
  ];

  const routingEntries = Object.entries(data.routing);
  lines.push("\u251c\u2500\u2500 Routing Breakdown:");
  routingEntries.forEach(([model, info], i) => {
    const prefix = i < routingEntries.length - 1 ? "\u2502   \u251c\u2500\u2500" : "\u2502   \u2514\u2500\u2500";
    const name = model.charAt(0).toUpperCase() + model.slice(1);
    lines.push(`${prefix} ${info.pct}% \u2192 ${name}\t($${info.cost.toFixed(2)})`);
  });

  lines.push(`\u251c\u2500\u2500 Quality: avg ${data.quality.avg} (min: ${data.quality.min}, target: ${data.quality.target})`);
  lines.push(`\u251c\u2500\u2500 Peak Day: ${data.peakDay.date} ($${data.peakDay.cost.toFixed(2)})`);
  lines.push(`\u251c\u2500\u2500 Budget: $${data.budget.used.toFixed(2)}/$${data.budget.cap} ($${data.budget.remaining.toFixed(2)} remaining)`);
  lines.push(`\u2514\u2500\u2500 Without Reivo: $${data.withoutReivo.toFixed(2)}`);
  lines.push(`    \u2192 Saved: $${data.saved.toFixed(2)} this month`);

  return lines.join("\n");
}

module.exports = { formatStatus, formatMonthly };
