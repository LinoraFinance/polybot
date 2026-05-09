const { Telegraf, Markup } = require("telegraf");
const crypto = require("crypto");
const path = require("path");
const { botToken, adminId, adminUsername, supportUsername, addresses } = require("./config");
const { plans } = require("./plans");
const { addPending, updatePending } = require("./storage");

const bot = new Telegraf(botToken);
const userState = new Map();

const assets = {
  start: path.join(__dirname, "..", "assets", "start.png"),
  plans: path.join(__dirname, "..", "assets", "plans.png"),
  how: path.join(__dirname, "..", "assets", "how_it_works.png"),
  setup: path.join(__dirname, "..", "assets", "setup_guide.png"),
  software: path.join(__dirname, "..", "assets", "software_info.png"),
  support: path.join(__dirname, "..", "assets", "support.png")
};

const userCommands = [
  { command: "start", description: "Open main menu" },
  { command: "menu", description: "Open menu again" },
  { command: "buy", description: "Buy Polybot access" },
  { command: "plans", description: "Compare access plans" },
  { command: "how", description: "How Polybot works" },
  { command: "ai", description: "AI advantage" },
  { command: "setup", description: "Setup guide" },
  { command: "software", description: "Software info" },
  { command: "support", description: "Contact support" },
  { command: "commands", description: "Show all commands" }
];


async function installUserMenu(ctx = null) {
  try {
    await bot.telegram.setMyCommands(userCommands, {
      scope: { type: "default" }
    });

    await bot.telegram.callApi("setChatMenuButton", {
      menu_button: { type: "commands" }
    });

    console.log("Telegram user command menu installed.");
    return true;
  } catch (error) {
    console.error("Failed to install Telegram command menu:", error.message);

    if (ctx) {
      await ctx.reply(`Command menu setup failed: ${error.message}`);
    }

    return false;
  }
}

function isAdminConfigured() {
  return adminId && !String(adminId).includes("PASTE_");
}

async function notifyAdmin(ctx, text, extra = {}) {
  if (!isAdminConfigured()) {
    console.log("Admin notification skipped: ADMIN_ID is not configured. Admin username:", adminUsername);
    return false;
  }

  try {
    await ctx.telegram.sendMessage(adminId, text, {
      parse_mode: "HTML",
      disable_web_page_preview: true,
      ...extra
    });
    return true;
  } catch (error) {
    console.error("Admin notification failed:", error.message);
    return false;
  }
}

async function sendPhotoSection(ctx, imagePath, text, keyboard) {
  // Telegram photo captions have a short limit.
  // Send the image first, then send the full text with buttons as a separate message.
  await ctx.replyWithPhoto({ source: imagePath });

  return ctx.reply(text, {
    parse_mode: "HTML",
    disable_web_page_preview: true,
    ...keyboard
  });
}

async function answerAndSend(ctx, imagePath, text, keyboard) {
  if (ctx.updateType === "callback_query") {
    await ctx.answerCbQuery();
  }
  return sendPhotoSection(ctx, imagePath, text, keyboard);
}



function mainMenu() {
  return Markup.inlineKeyboard([
    [Markup.button.callback("💳 Buy Access", "buy")],
    [Markup.button.callback("📊 Plans", "plans_info"), Markup.button.callback("⚙️ How It Works", "how")],
    [Markup.button.callback("🧠 AI Advantage", "ai_advantage"), Markup.button.callback("🛠️ Setup Guide", "setup")],
    [Markup.button.callback("🖥️ Software Info", "software"), Markup.button.callback("🎧 Support", "support")]
  ]);
}

function backMenu() {
  return Markup.inlineKeyboard([[Markup.button.callback("← Back", "menu")]]);
}

function buyMenu() {
  return Markup.inlineKeyboard([
    [Markup.button.callback("◈ Core — $200", "plan:core")],
    [Markup.button.callback("◆ Edge — $600", "plan:edge")],
    [Markup.button.callback("✦ Prime — $1500", "plan:prime")],
    [Markup.button.callback("♛ Lifetime — $5000", "plan:lifetime")],
    [Markup.button.callback("📈 Compare Plans", "plans_info")],
    [Markup.button.callback("← Back", "menu")]
  ]);
}

function plansInfoMenu() {
  return Markup.inlineKeyboard([
    [Markup.button.callback("◈ Core Details", "plan_info:core"), Markup.button.callback("◆ Edge Details", "plan_info:edge")],
    [Markup.button.callback("✦ Prime Details", "plan_info:prime"), Markup.button.callback("♛ Lifetime Details", "plan_info:lifetime")],
    [Markup.button.callback("💳 Buy Access", "buy")],
    [Markup.button.callback("← Back", "menu")]
  ]);
}


function coinNetworkHint(coin) {
  const hints = {
    SOL: "Solana",
    ETH: "Ethereum / ERC20",
    TON: "TON",
    BTC: "Bitcoin",
    TRX: "TRON / TRC20",
    BNB: "BNB Chain / BEP20"
  };

  return hints[coin] || coin;
}

function coinPaymentLabel(coin) {
  const labels = {
    SOL: "SOL",
    ETH: "ETH / USDT ERC20",
    TON: "TON",
    BTC: "BTC",
    TRX: "USDT",
    BNB: "BNB / USDT BEP20"
  };

  return labels[coin] || coin;
}

function paymentCoinsMenu(planId) {
  return Markup.inlineKeyboard([
    [Markup.button.callback("◎ SOL", `pay:${planId}:SOL`), Markup.button.callback("◇ ETH", `pay:${planId}:ETH`)],
    [Markup.button.callback("✦ TON", `pay:${planId}:TON`), Markup.button.callback("₿ BTC", `pay:${planId}:BTC`)],
    [Markup.button.callback("💵 USDT", `pay:${planId}:TRX`), Markup.button.callback("⬡ BNB", `pay:${planId}:BNB`)],
    [Markup.button.callback("← Back", `plan:${planId}`)]
  ]);
}

function paymentAddressMenu(planId) {
  return Markup.inlineKeyboard([
    [Markup.button.callback("✅ I PAID", `paid:${planId}`)],
    [Markup.button.callback("↺ Choose Another Method", `payment:${planId}`)],
    [Markup.button.callback("← Back", `plan:${planId}`)]
  ]);
}

function planKeyboard(planId) {
  return Markup.inlineKeyboard([
    [Markup.button.callback("💳 Continue to Payment", `payment:${planId}`)],
    [Markup.button.callback("← Back to Buy Access", "buy")]
  ]);
}

function startText() {
  return `<b>Polybot</b> — AI-powered desktop trading software for Polymarket 5-minute markets.

The main advantage of Polybot is its <b>AI execution layer</b> built around OpenClaw-style local agents.

5-minute markets move fast. By the time a manual trader opens the chart, checks price, decides, and clicks, the edge can already be gone.

Polybot is built to help with that.

<b>What the AI layer helps with:</b>
• Scans BTC / ETH / SOL 5-minute markets
• Reads fast market conditions and routing signals
• Checks YES / NO pricing, liquidity, timing, and edge quality
• Helps filter weak entries before execution
• Supports structured Paper Mode testing
• Supports Live Mode execution with your connected wallet
• Tracks fills, PnL, win rate, and trade history
• Applies risk controls, position sizing, and exposure checks

<b>Why OpenClaw matters:</b>
OpenClaw is a local-first AI agent gateway. That means the AI layer can run around your own software environment instead of being just a simple web bot.


`;
}

function buyText() {
  return `<b>Buy Access</b>

Choose a plan and continue to payment.

Higher plans include more connected bot-workers, stronger algorithm tiers, faster scanning, and better execution speed.

Start with Paper Mode first if you want to test the software before using Live Mode.`;
}

function plansText() {
  return `<b>Plans Overview</b>

The plans are not just different time limits. They also change how much AI-powered processing is connected to your Polybot setup.

<b>Core</b> — 1 day
For testing the software, dashboard, Paper Mode, and AI-assisted workflow.

<b>Edge</b> — 7 days
More connected bot-workers, faster scanning, and a stronger algorithm tier.

<b>Prime</b> — 30 days
The strongest monthly setup with priority processing and the Pro AI execution package.

<b>Lifetime</b>
Long-term access with the full bot-worker package, Elite algorithm tier, and core updates.

`;
}

function howText() {
  return `<b>How Polybot Works</b>

Polybot combines desktop software, OpenClaw-style AI agents, and Telegram access.

<b>Process:</b>
1. <b>Market Scan</b> — watches BTC / ETH / SOL 5-minute markets
2. <b>AI Strategy Check</b> — the AI layer reviews edge, timing, liquidity, routing signals, and market conditions
3. <b>Execution</b> — opens trades based on your selected mode and settings
4. <b>Trade Tracking</b> — records fills, YES / NO pricing, size, status, PnL, and net result
5. <b>Risk Controls</b> — helps limit exposure with position rules, stop conditions, and safety checks

The point is not random automation.
The point is an AI-assisted execution workflow that reacts faster than manual trading and keeps the process structured.`;
}

function setupText() {
  return `<b>Setup Guide</b>

1. Choose your access plan
2. Send payment
3. Press <b>I PAID</b>
4. Send your transaction hash
5. Wait for payment confirmation
6. Receive your activation key
7. Download Polybot for PC / Mac
8. Start in Paper Mode
9. Switch to Live Mode when ready

Support is available if you need help with payment, setup, or activation.`;
}

function softwareText() {
  return `<b>Software Info</b>

Polybot is not a website.

It is AI-powered desktop software for:
• Windows PC
• Mac

The app runs locally on your machine. The Telegram bot is only used for access, payments, support, and activation flow.

<b>OpenClaw-based AI layer:</b>
• Local-first AI agent workflow
• Market condition analysis
• Strategy and signal filtering
• Execution pipeline support
• Risk and exposure checks
• Faster structured decision flow

<b>Included inside the software:</b>
• Market scanner
• Paper Mode
• Live Mode
• Strategy dashboard
• Risk controls
• Trade history
• PnL and win-rate tracking
• Activation key system`;
}

function supportText() {
  return `<b>Support</b>

Need help with payment, setup, activation, or access?

Support: ${supportUsername}

For payment issues, send your transaction hash and the plan you selected.`;
}


function aiText() {
  return `<b>AI Advantage</b>

Polybot’s main advantage is the artificial intelligence layer built around OpenClaw-style local agents.

OpenClaw is designed as a self-hosted AI gateway: it connects chat apps like Telegram to AI agents, tools, sessions, memory, and workflows running on your own machine or server.

Polybot uses this idea for trading software.

<b>What this means inside Polybot:</b>
• The bot does not only display buttons
• The AI layer helps read market conditions
• It checks timing, liquidity, pricing, and edge quality
• It supports the execution pipeline
• It helps filter low-quality entries
• It works with Paper Mode before Live Mode
• It keeps trading more structured and less emotional

<b>Simple version:</b>
Manual trader = slow reaction, emotions, missed windows.

Polybot + AI layer = faster scan, structured checks, controlled execution, and risk-aware workflow.

`;
}

function planInfoText(plan) {
  const extra = {
    core: "Best for a first test. You can open the software, understand the dashboard, test Paper Mode, and see how the workflow feels.",
    edge: "Better for active users. More connected processing gives faster scanning and stronger execution compared to Core.",
    prime: "Best monthly setup. Built for users who want the strongest regular access, faster scanning, and priority processing.",
    lifetime: "Best for long-term users. Full package access, strongest algorithm tier, and future core updates."
  }[plan.id];

  return `<b>${plan.name} — ${plan.duration}</b>
Price: <b>${plan.price}</b>

${extra}

<b>Connected Bot-Workers:</b>
${plan.openClawBots}

<b>AI / Algorithm Tier:</b>
${plan.algorithm}

<b>Includes:</b>
${plan.includes.map((item) => `• ${item}`).join("\n")}`;
}

function planText(plan) {
  return `<b>${plan.name} Access — ${plan.price}</b>

${plan.short}

<b>Duration:</b> ${plan.duration}
<b>Connected Bot-Workers:</b> ${plan.openClawBots}
<b>AI / Algorithm Tier:</b> ${plan.algorithm}

<b>What you get:</b>
${plan.includes.map((item) => `• ${item}`).join("\n")}

Press <b>Continue to Payment</b> to select a crypto payment method.

`;
}

bot.start(async (ctx) => {
  await installUserMenu();
  await ctx.reply("Menu updated.", Markup.removeKeyboard());
  return answerAndSend(ctx, assets.start, startText(), mainMenu());
});

bot.command("hidekeyboard", async (ctx) => {
  await ctx.reply("Bottom keyboard removed.", Markup.removeKeyboard());
});

bot.command("menu", async (ctx) => {
  await installUserMenu(ctx);
  await ctx.reply("Menu updated.", Markup.removeKeyboard());
  return answerAndSend(ctx, assets.start, startText(), mainMenu());
});

bot.command("commands", async (ctx) => {
  await installUserMenu(ctx);

  return ctx.reply(`<b>Available commands</b>

/start — Open main menu
/buy — Buy Polybot access
/plans — Compare access plans
/how — How Polybot works
/ai — AI advantage
/setup — Setup guide
/software — Software info
/support — Contact support

If the Telegram Menu button is not visible on desktop, type / or use these commands directly.`, {
    parse_mode: "HTML"
  });
});

bot.command("buy", (ctx) => answerAndSend(ctx, assets.plans, buyText(), buyMenu()));
bot.command("plans", (ctx) => answerAndSend(ctx, assets.plans, plansText(), plansInfoMenu()));
bot.command("software", (ctx) => answerAndSend(ctx, assets.software, softwareText(), Markup.inlineKeyboard([
  [Markup.button.callback("🪟 Download for PC", "download:pc")],
  [Markup.button.callback(" Download for Mac", "download:mac")],
  [Markup.button.callback("← Back", "menu")]
])));

bot.command("support", (ctx) => answerAndSend(ctx, assets.support, supportText(), Markup.inlineKeyboard([
  [Markup.button.url("🎧 Contact Support", `https://t.me/${supportUsername.replace("@", "")}`)],
  [Markup.button.callback("💬 Payment Help", "payment_help")],
  [Markup.button.callback("← Back", "menu")]
])));

bot.command("help", (ctx) => answerAndSend(ctx, assets.support, supportText(), Markup.inlineKeyboard([
  [Markup.button.url("🎧 Contact Support", `https://t.me/${supportUsername.replace("@", "")}`)],
  [Markup.button.callback("← Back", "menu")]
])));
bot.command("how", (ctx) => answerAndSend(ctx, assets.how, howText(), Markup.inlineKeyboard([
  [Markup.button.callback("🛠️ Setup Guide", "setup")],
  [Markup.button.callback("💳 Buy Access", "buy")],
  [Markup.button.callback("← Back", "menu")]
])));
bot.command("ai", (ctx) => answerAndSend(ctx, assets.how, aiText(), Markup.inlineKeyboard([
  [Markup.button.callback("⚙️ How It Works", "how")],
  [Markup.button.callback("💳 Buy Access", "buy")],
  [Markup.button.callback("← Back", "menu")]
])));

bot.command("setup", (ctx) => answerAndSend(ctx, assets.setup, setupText(), Markup.inlineKeyboard([
  [Markup.button.callback("💳 Buy Access", "buy")],
  [Markup.button.url("Support", `https://t.me/${supportUsername.replace("@", "")}`)],
  [Markup.button.callback("← Back", "menu")]
])));

bot.command("admin", async (ctx) => {
  await ctx.reply(`<b>Admin status</b>

Configured: <b>${isAdminConfigured() ? "YES" : "NO"}</b>
Admin ID: <code>${adminId || "not set"}</code>
Display admin: ${adminUsername}
Support: ${supportUsername}`, { parse_mode: "HTML" });
});

bot.action("menu", (ctx) => answerAndSend(ctx, assets.start, startText(), mainMenu()));
bot.action("buy", (ctx) => answerAndSend(ctx, assets.plans, buyText(), buyMenu()));
bot.action("plans_info", (ctx) => answerAndSend(ctx, assets.plans, plansText(), plansInfoMenu()));
bot.action("how", (ctx) => answerAndSend(ctx, assets.how, howText(), Markup.inlineKeyboard([
  [Markup.button.callback("🛠️ Setup Guide", "setup")],
  [Markup.button.callback("💳 Buy Access", "buy")],
  [Markup.button.callback("← Back", "menu")]
])));

bot.action("ai_advantage", (ctx) => answerAndSend(ctx, assets.how, aiText(), Markup.inlineKeyboard([
  [Markup.button.callback("⚙️ How It Works", "how")],
  [Markup.button.callback("💳 Buy Access", "buy")],
  [Markup.button.callback("← Back", "menu")]
])));

bot.action("setup", (ctx) => answerAndSend(ctx, assets.setup, setupText(), Markup.inlineKeyboard([
  [Markup.button.callback("💳 Buy Access", "buy")],
  [Markup.button.url("Support", `https://t.me/${supportUsername.replace("@", "")}`)],
  [Markup.button.callback("← Back", "menu")]
])));
bot.action("software", (ctx) => answerAndSend(ctx, assets.software, softwareText(), Markup.inlineKeyboard([
  [Markup.button.callback("🪟 Download for PC", "download:pc")],
  [Markup.button.callback(" Download for Mac", "download:mac")],
  [Markup.button.callback("← Back", "menu")]
])));
bot.action("support", (ctx) => answerAndSend(ctx, assets.support, supportText(), Markup.inlineKeyboard([
  [Markup.button.url("🎧 Contact Support", `https://t.me/${supportUsername.replace("@", "")}`)],
  [Markup.button.callback("💬 Payment Help", "payment_help")],
  [Markup.button.callback("← Back", "menu")]
])));

bot.action("payment_help", async (ctx) => {
  await ctx.answerCbQuery();
  return ctx.reply(`<b>Payment Help</b>

If you paid but did not receive access:

1. Press <b>I PAID</b>
2. Send your transaction hash
3. Wait for confirmation

Support: ${supportUsername}`, {
    parse_mode: "HTML",
    ...Markup.inlineKeyboard([
      [Markup.button.url("🎧 Contact Support", `https://t.me/${supportUsername.replace("@", "")}`)],
      [Markup.button.callback("Back", "support")]
    ])
  });
});

bot.action(/^download:(.+)$/, async (ctx) => {
  await ctx.answerCbQuery();
  const platform = ctx.match[1] === "mac" ? "Mac" : "PC";

  return ctx.reply(`<b>Download for ${platform}</b>

Download access is delivered after payment confirmation and activation key delivery.

Support: ${supportUsername}`, {
    parse_mode: "HTML",
    ...Markup.inlineKeyboard([
      [Markup.button.callback("💳 Buy Access", "buy")],
      [Markup.button.url("Support", `https://t.me/${supportUsername.replace("@", "")}`)],
      [Markup.button.callback("Back", "software")]
    ])
  });
});

bot.action(/^plan_info:(.+)$/, async (ctx) => {
  await ctx.answerCbQuery();
  const planId = ctx.match[1];
  const plan = plans[planId];

  if (!plan) return ctx.reply("Plan not found.");

  return ctx.reply(planInfoText(plan), {
    parse_mode: "HTML",
    ...Markup.inlineKeyboard([
      [Markup.button.callback(`💳 Buy ${plan.name}`, `plan:${planId}`)],
      [Markup.button.callback("← Back to Plans", "plans_info")]
    ])
  });
});

bot.action(/^plan:(.+)$/, async (ctx) => {
  await ctx.answerCbQuery();
  const planId = ctx.match[1];
  const plan = plans[planId];

  if (!plan) {
    return ctx.reply("Plan not found.", buyMenu());
  }

  return ctx.reply(planText(plan), {
    parse_mode: "HTML",
    disable_web_page_preview: true,
    ...planKeyboard(planId)
  });
});

bot.action(/^payment:(.+)$/, async (ctx) => {
  await ctx.answerCbQuery();
  const planId = ctx.match[1];
  const plan = plans[planId];

  if (!plan) {
    return ctx.reply("Plan not found.", buyMenu());
  }

  return ctx.reply(`<b>${plan.name} Access — ${plan.price}</b>

Choose a payment method below: SOL, ETH, TON, BTC, USDT, or BNB.

Select a payment method first.

After you choose a network, the bot will show the wallet address and the <b>I PAID</b> button.`, {
    parse_mode: "HTML",
    ...paymentCoinsMenu(planId)
  });
});

bot.action(/^pay:(.+):(.+)$/, async (ctx) => {
  await ctx.answerCbQuery();
  const planId = ctx.match[1];
  const coin = ctx.match[2];
  const plan = plans[planId];
  const address = addresses[coin] || "Address not configured";

  if (!plan) {
    return ctx.reply("Plan not found.", buyMenu());
  }

  return ctx.reply(`<b>${plan.name} Access — ${plan.price}</b>

Payment method: <b>${coinPaymentLabel(coin)}</b>
Network: <b>${coinNetworkHint(coin)}</b>

Send payment to:

<code>${address}</code>

For USDT, send only USDT on the TRON / TRC20 network.

After payment, press <b>I PAID</b> and send your transaction hash.`, {
    parse_mode: "HTML",
    ...paymentAddressMenu(planId)
  });
});

bot.action(/^paid:(.+)$/, async (ctx) => {
  await ctx.answerCbQuery();
  const planId = ctx.match[1];
  const plan = plans[planId];

  if (!plan) {
    return ctx.reply("Plan not found.", buyMenu());
  }

  userState.set(ctx.from.id, {
    step: "awaiting_tx_hash",
    planId
  });

  const username = ctx.from.username ? `@${ctx.from.username}` : "no username";
  const sent = await notifyAdmin(ctx, `<b>I PAID clicked</b>

User: ${ctx.from.first_name || ""} ${username}
Telegram ID: <code>${ctx.from.id}</code>

Plan: <b>${plan.name}</b>
Price: <b>${plan.price}</b>

Waiting for transaction hash...`);

  const warning = sent ? "" : "\n\nAdmin notification failed. Check ADMIN_ID and make sure admin opened the bot once.";

  return ctx.reply(`<b>Payment confirmation</b>

Plan: <b>${plan.name}</b>
Price: <b>${plan.price}</b>

Please send your transaction hash in the next message.

Once your payment is confirmed, your Polybot access key will be delivered here.

Support: ${supportUsername}${warning}`, {
    parse_mode: "HTML",
    ...Markup.inlineKeyboard([[Markup.button.callback("Cancel", "menu")]])
  });
});


bot.hears("💳 Buy Access", (ctx) => answerAndSend(ctx, assets.plans, buyText(), buyMenu()));
bot.hears("📊 Plans", (ctx) => answerAndSend(ctx, assets.plans, plansText(), plansInfoMenu()));
bot.hears("⚙️ How It Works", (ctx) => answerAndSend(ctx, assets.how, howText(), Markup.inlineKeyboard([
  [Markup.button.callback("🛠️ Setup Guide", "setup")],
  [Markup.button.callback("💳 Buy Access", "buy")],
  [Markup.button.callback("← Back", "menu")]
])));
bot.hears("🧠 AI Advantage", (ctx) => answerAndSend(ctx, assets.how, aiText(), Markup.inlineKeyboard([
  [Markup.button.callback("⚙️ How It Works", "how")],
  [Markup.button.callback("💳 Buy Access", "buy")],
  [Markup.button.callback("← Back", "menu")]
])));
bot.hears("🛠️ Setup Guide", (ctx) => answerAndSend(ctx, assets.setup, setupText(), Markup.inlineKeyboard([
  [Markup.button.callback("💳 Buy Access", "buy")],
  [Markup.button.url("🎧 Support", `https://t.me/${supportUsername.replace("@", "")}`)],
  [Markup.button.callback("← Back", "menu")]
])));
bot.hears("🖥️ Software Info", (ctx) => answerAndSend(ctx, assets.software, softwareText(), Markup.inlineKeyboard([
  [Markup.button.callback("🪟 Download for PC", "download:pc")],
  [Markup.button.callback(" Download for Mac", "download:mac")],
  [Markup.button.callback("← Back", "menu")]
])));
bot.hears("🎧 Support", (ctx) => answerAndSend(ctx, assets.support, supportText(), Markup.inlineKeyboard([
  [Markup.button.url("🎧 Contact Support", `https://t.me/${supportUsername.replace("@", "")}`)],
  [Markup.button.callback("💬 Payment Help", "payment_help")],
  [Markup.button.callback("← Back", "menu")]
])));


bot.on("text", async (ctx) => {
  const state = userState.get(ctx.from.id);

  if (!state || state.step !== "awaiting_tx_hash") return;

  const txHash = ctx.message.text.trim();

  if (txHash.length < 10) {
    return ctx.reply("This transaction hash looks too short. Please send the full transaction hash.");
  }

  const plan = plans[state.planId];
  const paymentId = crypto.randomBytes(8).toString("hex");

  const payment = {
    id: paymentId,
    status: "pending",
    userId: ctx.from.id,
    username: ctx.from.username ? `@${ctx.from.username}` : "",
    firstName: ctx.from.first_name || "",
    planId: state.planId,
    planName: plan.name,
    price: plan.price,
    txHash,
    createdAt: new Date().toISOString()
  };

  addPending(payment);
  userState.delete(ctx.from.id);

  await ctx.reply(`<b>Payment submitted</b>

Your transaction hash was received.

Status: <b>Pending review</b>

You will receive your access key after confirmation.`, { parse_mode: "HTML" });

  const adminText = `<b>New Polybot payment</b>

ID: <code>${payment.id}</code>
User: ${payment.firstName} ${payment.username}
Telegram ID: <code>${payment.userId}</code>

Plan: <b>${payment.planName}</b>
Price: <b>${payment.price}</b>

TX:
<code>${payment.txHash}</code>`;

  await notifyAdmin(ctx, adminText, {
    reply_markup: {
      inline_keyboard: [
        [
          { text: "Approve", callback_data: `admin_approve:${payment.id}:${payment.userId}` },
          { text: "Reject", callback_data: `admin_reject:${payment.id}:${payment.userId}` }
        ]
      ]
    }
  });
});

bot.action(/^admin_approve:([^:]+):(.+)$/, async (ctx) => {
  await ctx.answerCbQuery();

  if (isAdminConfigured() && String(ctx.from.id) !== String(adminId)) {
    return ctx.reply("Admin only.");
  }

  const paymentId = ctx.match[1];
  const userId = ctx.match[2];
  updatePending(paymentId, "approved");

  const key = `POLY-${crypto.randomBytes(4).toString("hex").toUpperCase()}-${crypto.randomBytes(4).toString("hex").toUpperCase()}`;

  await ctx.telegram.sendMessage(userId, `<b>Payment confirmed</b>

Your Polybot access key:

<code>${key}</code>

Download and setup instructions will be sent by support.

Start with Paper Mode first.
Support: ${supportUsername}`, { parse_mode: "HTML" });

  return ctx.editMessageText(`Approved payment ${paymentId}\nAccess key delivered.`, { parse_mode: "HTML" });
});

bot.action(/^admin_reject:([^:]+):(.+)$/, async (ctx) => {
  await ctx.answerCbQuery();

  if (isAdminConfigured() && String(ctx.from.id) !== String(adminId)) {
    return ctx.reply("Admin only.");
  }

  const paymentId = ctx.match[1];
  const userId = ctx.match[2];

  updatePending(paymentId, "rejected");

  await ctx.telegram.sendMessage(userId, `<b>Payment review update</b>

We could not confirm this payment yet.

Please contact support:
${supportUsername}`, { parse_mode: "HTML" });

  return ctx.editMessageText(`Rejected payment ${paymentId}.`, { parse_mode: "HTML" });
});

bot.catch((err, ctx) => {
  console.error(`Bot error for update ${ctx.update.update_id}:`, err);
});

bot.launch().then(async () => {
  console.log("Polybot access bot is running.");
  console.log(`Admin ID: ${adminId || "not set"}`);
  console.log(`Support: ${supportUsername}`);

  await installUserMenu();
});

process.once("SIGINT", () => bot.stop("SIGINT"));
process.once("SIGTERM", () => bot.stop("SIGTERM"));
