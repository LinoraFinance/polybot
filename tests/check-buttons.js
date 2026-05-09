const fs = require("fs");
const path = require("path");

const botFile = fs.readFileSync(path.join(__dirname, "..", "src", "bot.js"), "utf8");

const expected = [
  'bot.action("menu"',
  'bot.action("buy"',
  'bot.action("plans_info"',
  'bot.action("how"',
  'bot.action("ai_advantage"',
  'bot.action("setup"',
  'bot.action("software"',
  'bot.action("support"',
  'bot.action("payment_help"',
  'bot.action(/^download:',
  'bot.action(/^plan_info:',
  'bot.action(/^plan:',
  'bot.action(/^payment:',
  'bot.action(/^pay:',
  'bot.action(/^paid:',
  'bot.action(/^admin_approve:',
  'bot.action(/^admin_reject:'
];

const missing = expected.filter((item) => !botFile.includes(item));

if (missing.length) {
  console.error("Missing expected handlers:");
  for (const item of missing) console.error(`- ${item}`);
  process.exit(1);
}

console.log("Button callback check passed.");
