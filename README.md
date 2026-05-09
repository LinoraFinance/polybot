# Polybot Access Telegram Bot

This version includes 6 section images:

- `assets/start.png` — `/start` and main menu
- `assets/plans.png` — Buy Access / Plans
- `assets/how_it_works.png` — How It Works
- `assets/setup_guide.png` — Setup Guide
- `assets/software_info.png` — Software Info
- `assets/support.png` — Support

## Admin / support

```env
ADMIN_ID=5830879419
ADMIN_USERNAME=@Kiisseee
SUPPORT_USERNAME=@polybotsupp
```

Important: the admin Telegram account must open/start the bot at least once, otherwise Telegram may block private notifications from the bot.

## Commands

- `/start`
- `/buy`
- `/plans`
- `/help`
- `/how`
- `/setup`
- `/admin`

## Local start

1. Install Node.js 18 or newer.
2. Open this folder.
3. Double-click `start_bot.bat`.

The `.bat` installs dependencies automatically if `node_modules` is missing.

## Notes

Crypto addresses are still placeholders in `.env`:

```env
BTC_ADDRESS=PASTE_BTC_ADDRESS
ETH_ADDRESS=PASTE_ETH_ADDRESS
USDT_ADDRESS=PASTE_USDT_ADDRESS
USDC_ADDRESS=PASTE_USDC_ADDRESS
SOL_ADDRESS=PASTE_SOL_ADDRESS
```

Replace them before selling access.


## v6 changes

- `Buy Access` and `Plans` are now different:
  - `Buy Access` opens direct purchase buttons.
  - `Plans` opens plan comparison and plan details.
- `/start` text is more informative and explains the product, use case, and value.
- Added clearer product positioning around speed, structure, Paper Mode, Live Mode, risk controls, and PC/Mac local software.
- Kept risk wording honest: no guaranteed profit or fixed winrate.


## v7 changes

- Added AI Advantage section.
- Added `/ai` command.
- Updated `/start`, Plans, How It Works, and Software Info to explain the OpenClaw-based AI layer.
- Main menu now includes `AI Advantage`.
- Plan text now says `AI / Algorithm Tier`.


## v8 fix

- Fixed Telegram error: `Bad Request: message caption is too long`.
- Images are now sent first.
- Text + buttons are sent as a separate message, so long informational sections work correctly.


## v9 copy update

- Removed buyer-friction disclaimer wording from user-facing bot copy.
- Replaced weak caution language with stronger product-positioning language.


## v10 payment addresses

Added payment buttons and addresses for:

- SOL: `3LYJ3hjBXt8BVRb7Fr1umMpPYSpjkycb2owwu74bstBo`
- ETH: `0x63EA02ca66083Dafe8185057bcA794590eB47d5b`
- TON: `UQDWSi4-3amMlf_x7ojAxzYbWkgT7IR4emnVxZeP4HN3tFhW`
- BTC: `bc1qucl05pg2x3wlsctrxp2pe848ke3t048ruculnm`
- TRX: `TD6yvTxZtqJPgeZr1wehoVR4SegFrbJMNF`
- BNB: `0x485FC537fE915f92455531Eb7fF839FDBC2Bd2eF`

Payment buttons now show SOL / ETH / TON / BTC / TRX / BNB.


## v11 copy cleanup

- Removed: `Polybot uses this idea for trading workflow: AI analysis + local desktop software + Telegram access + manual payment review.`


## v12 payment flow fix

- Removed `I PAID` from the plan details screen.
- Removed `I PAID` from the payment-method selection screen.
- `I PAID` now appears only after the user selects a specific payment method and sees the wallet address.


## v13 USDT TRC20 label fix

- Renamed the TRX payment button to `USDT TRC20`.
- Payment screen now shows:
  - Payment method: `USDT TRC20`
  - Network: `TRON / TRC20`
- TRX address is still used internally as `TRX_ADDRESS`.


## v14 UI polish
- Renamed `USDT TRC20` button to `USDT` while keeping network shown as `TRON / TRC20`.
- Added premium icons to main menu, plan buttons, payment buttons, support, downloads, and navigation buttons.


## v15 Railway ready

Added:

- `railway.json` with `npm start`
- `.gitignore` to avoid committing `.env`, `node_modules`, and local data
- `.env.railway.example` for Railway Variables

Railway deploy notes:

1. Push this folder to GitHub.
2. Railway → New Project → Deploy from GitHub repo.
3. Add Variables from `.env.railway.example`.
4. Use `npm start` as the start command if Railway does not detect it automatically.
5. Stop the local bot before running on Railway, because Telegram polling should not run from two places at once.


## v16 Telegram command menu

Added Telegram user command menu:

- `/start` — Open main menu
- `/buy` — Buy Polybot access
- `/plans` — Compare access plans
- `/how` — How Polybot works
- `/ai` — AI advantage
- `/setup` — Setup guide
- `/software` — Software info
- `/support` — Contact support

`/admin` still exists but is not shown in the public user menu.


## v17 command menu stronger fix

- Command menu is installed at bot startup.
- Command menu is also reinstalled on every `/start`.
- Added `/menu` command.
- Added `/commands` fallback command.
- Note: Telegram Desktop may not always show a blue Menu button immediately. Type `/` or restart Telegram if the button is cached.


## v18 persistent user menu

Telegram Desktop may not always show the blue command Menu button. This version adds a persistent user reply menu with buttons:

- 💳 Buy Access
- 📊 Plans
- ⚙️ How It Works
- 🧠 AI Advantage
- 🛠️ Setup Guide
- 🖥️ Software Info
- 🎧 Support

The menu appears after `/start` or `/menu` and works on desktop/mobile.


## v19 remove bottom keyboard

- Removed persistent bottom reply keyboard.
- Kept Telegram command Menu button.
- `/start` and `/menu` now remove the old bottom keyboard for users who already saw it.
- Added `/hidekeyboard` as a fallback to remove the bottom keyboard manually.
