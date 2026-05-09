const plans = {
  core: {
    id: "core",
    name: "Core",
    duration: "1 Day",
    price: "$200",
    short: "Good for testing Polybot before going bigger.",
    openClawBots: "1 connected bot-worker",
    algorithm: "Standard algorithm tier",
    includes: [
      "PC / Mac software access",
      "1 connected bot-worker",
      "Standard algorithm tier",
      "Paper + Live mode",
      "Basic support",
      "Setup guide"
    ]
  },
  edge: {
    id: "edge",
    name: "Edge",
    duration: "7 Days",
    price: "$600",
    short: "For active users who want stronger execution and faster processing.",
    openClawBots: "2 connected bot-workers",
    algorithm: "Advanced algorithm tier",
    includes: [
      "PC / Mac software access",
      "2 connected bot-workers",
      "Advanced algorithm tier",
      "Faster scanning",
      "Paper + Live mode",
      "Priority support",
      "Setup guide"
    ]
  },
  prime: {
    id: "prime",
    name: "Prime",
    duration: "30 Days",
    price: "$1500",
    short: "For serious users who want the strongest monthly setup.",
    openClawBots: "4 connected bot-workers",
    algorithm: "Pro algorithm tier",
    includes: [
      "PC / Mac software access",
      "4 connected bot-workers",
      "Pro algorithm tier",
      "Fastest scanning",
      "Priority processing",
      "Paper + Live mode",
      "Priority support"
    ]
  },
  lifetime: {
    id: "lifetime",
    name: "Lifetime",
    duration: "Lifetime Access",
    price: "$5000",
    short: "Long-term access with the strongest Polybot package.",
    openClawBots: "Full bot-worker package",
    algorithm: "Elite algorithm tier",
    includes: [
      "PC / Mac software access",
      "Full bot-worker package",
      "Elite algorithm tier",
      "All core updates",
      "Paper + Live mode",
      "Priority support",
      "Setup guide"
    ]
  }
};

module.exports = { plans };
