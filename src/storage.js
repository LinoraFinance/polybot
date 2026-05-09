const fs = require("fs");
const path = require("path");

const dataDir = path.join(__dirname, "..", "data");
const pendingPath = path.join(dataDir, "pending-payments.json");

function ensureStorage() {
  if (!fs.existsSync(dataDir)) fs.mkdirSync(dataDir, { recursive: true });
  if (!fs.existsSync(pendingPath)) fs.writeFileSync(pendingPath, "[]", "utf8");
}

function readPending() {
  ensureStorage();
  try {
    return JSON.parse(fs.readFileSync(pendingPath, "utf8"));
  } catch {
    return [];
  }
}

function writePending(items) {
  ensureStorage();
  fs.writeFileSync(pendingPath, JSON.stringify(items, null, 2), "utf8");
}

function addPending(payment) {
  const items = readPending();
  items.push(payment);
  writePending(items);
}

function updatePending(id, status) {
  const items = readPending();
  const next = items.map((item) => item.id === id ? { ...item, status } : item);
  writePending(next);
  return next.find((item) => item.id === id);
}

module.exports = {
  addPending,
  updatePending,
  readPending
};
