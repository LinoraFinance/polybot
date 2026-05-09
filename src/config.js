require("dotenv").config();

if (!process.env.BOT_TOKEN) {
  console.error("Missing BOT_TOKEN in .env");
  process.exit(1);
}

module.exports = {
  botToken: process.env.BOT_TOKEN,
  adminId: process.env.ADMIN_ID || "",
  adminUsername: process.env.ADMIN_USERNAME || "@Kiisseee",
  supportUsername: process.env.SUPPORT_USERNAME || "@polybotsupp",
  website: process.env.WEBSITE || "",
  addresses: {
    SOL: process.env.SOL_ADDRESS || "PASTE_SOL_ADDRESS",
    ETH: process.env.ETH_ADDRESS || "PASTE_ETH_ADDRESS",
    TON: process.env.TON_ADDRESS || "PASTE_TON_ADDRESS",
    BTC: process.env.BTC_ADDRESS || "PASTE_BTC_ADDRESS",
    TRX: process.env.TRX_ADDRESS || "PASTE_TRX_ADDRESS",
    BNB: process.env.BNB_ADDRESS || "PASTE_BNB_ADDRESS"
  }
};
