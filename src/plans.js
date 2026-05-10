const plans = {
  core: {
    id: "core",
    name: "Core",
    price: "$69",
    short: "Full Polybot access with standard compute power.",
    compute: "1 OpenClaw worker",
    accessLevel: "Full market access",
    markets: "BTC / ETH / SOL 5M markets",
    processing: "Standard scanning and processing",
    support: "Standard support",
    includes: [
      "Web panel access",
      "PC / Mac software access",
      "Paper Mode",
      "Live Mode",
      "BTC / ETH / SOL 5M markets",
      "AI-assisted execution layer",
      "Risk controls",
      "Trade history",
      "PnL dashboard",
      "Setup guide"
    ]
  },
  prime: {
    id: "prime",
    name: "Prime",
    price: "$99",
    short: "Full Polybot access with stronger compute power and faster processing.",
    compute: "3 OpenClaw workers",
    accessLevel: "Full market access",
    markets: "BTC / ETH / SOL 5M markets",
    processing: "Priority scanning and faster processing",
    support: "Priority support",
    includes: [
      "Everything in Core",
      "3 OpenClaw workers",
      "Priority compute power",
      "Faster market scanning",
      "Faster signal processing",
      "Advanced execution workflow",
      "Priority support",
      "Early access to updates"
    ]
  },
  elite: {
    id: "elite",
    name: "Elite",
    price: "$199",
    short: "Full Polybot access with the maximum OpenClaw compute package.",
    compute: "All OpenClaw workers",
    accessLevel: "Full market access",
    markets: "BTC / ETH / SOL 5M markets",
    processing: "Maximum compute power and fastest processing",
    support: "Highest priority support",
    includes: [
      "Everything in Prime",
      "All OpenClaw workers",
      "Maximum compute power",
      "Fastest scanning priority",
      "Fastest signal processing",
      "Full execution workflow",
      "Private setup assistance",
      "Highest priority support",
      "Future modules included"
    ]
  }
};

module.exports = { plans };
