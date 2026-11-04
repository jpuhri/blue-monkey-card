# Blue Monkey Card™ — FINAL S-Hanging Real Monkey
**First Use: Oct 29, 2026 — Spring Branch, TX 78070 (Comal County)**
**Owner: John Patrick Uhri — Security Service FCU Member — 20336 State Hwy 46 W, Bulverde, TX 78070**

### ™ Common Law Trademark Lock
- Mark: **BLUE MONKEY CARD™** in Class 36 (secured credit card issuing) + Class 9 (mobile app)
- First use anywhere & in commerce: Oct 29, 2026
- Location: Spring Branch / Bulverde, Texas
- Status: ™ use now, file USPTO Intent-to-Use $350/class after Delaware C-Corp (Stripe Atlas $500)
- Search: No live filing in Class 36 financial as of Oct 2026. Live marks exist in other classes (supplements, beverage) — not conflicting. File as BLUE MONKEY CARD in Class 36 + 9.
- Proof: This GitHub repo + web.archive.org archive + Vercel deploy = timestamped proof.

### Design — FINAL S-Hanging Real Monkey (Not Mouse) v5.0 — Nov 4, 2026
**This is THE final card approved by founder.**

- **Monkey:** Real monkey proportions — small rounded ears (not big mouse ears), long arms, black hands/feet, curly spiral tail, capuchin face with slight muzzle, blue fur #2D7FF9, white chest patch, green vine with leaves. Holding banana.
- **Why S:** Middle letter of V I S A, balanced, centered. Best for metal polish flex.
- **VISA Placement:** V I S A as separate white tiles 52x52px, 10px gap, 7px radius, top-center y=28. Monkey vine hooked on S tile. S redrawn on top so monkey appears gripping S.
- **Colors:** Deep navy #0A2A8A background (Pantone 2728 C #2D7FF9 for marketing), banana chip #FFD60A, white outline 3mm + soft glow blur for pop, VISA blue #0033A0.
- **Size:** CR80 85.6mm x 53.98mm + 3.175mm bleed = 1032x664 @ 300 DPI, rounded 3.18mm.
- **Chip:** Banana yellow rounded rectangle 90x68 top-left.
- **Finish Metal:** Brushed matte blue PVD + mirror polished monkey + white outline + green vine enamel + yellow banana, 18g stainless 0.8mm (CompoSecure $25-35).
- **Finish Plastic:** Blue PVC same art $1.20 (CPI).

### Product Choice — Metal vs Plastic
| Type | Product ID | Cost You | Customer Pays | Ships | Lithic Type |
|------|------------|----------|---------------|-------|-------------|
| **Plastic** | `blue_monkey_plastic_s_hanging` | $1.20 CPI | $0 FREE with $200 deposit | 5 days | VIRTUAL + PHYSICAL |
| **Metal** | `blue_monkey_metal_s_hanging` | $25-35 CompoSecure | $49 one-time OR FREE if deposit >= $1000 for 3 months | 10 days | PHYSICAL |

**Do customers pay?** No for plastic (low barrier), Yes $49 for metal (flex). Start with plastic only for first 100 cards, add metal after Lead Bank traction.

### Files In This Repo
```
/card-art/FINAL_S_Hanging_2026-11-04/
  Front_S_Hanging_FINAL.png — 1032x664 @300DPI, white glow outline, S-hanging real monkey
  Back_S_Hanging_FINAL.png
  blue_monkey_real_monkey_transparent.png — Transparent mascot (real monkey not mouse)
  old_mouse_monkey_transparent.png — Archived old mouse-like version
  spec.json — Full specs for CompoSecure/Lithic

/backend/server.js — Lithic native, supports cardType PLASTIC/METAL, Lead Bank FBO
/ios/ContentView.swift — SwiftUI with Metal/Plastic toggle + S-hanging design
/ios/BlueMonkeyCardApp.swift — @main fixed (no AppDelegate)
```

### Backend — server.js
```bash
POST /api/signup { email, name } → KYC APPROVED (Persona mock)
POST /api/deposit { userId, amountCents: 30000, cardType: "METAL" } → Creates Lithic card
  PLASTIC → VIRTUAL instantly, product_id blue_monkey_plastic_s_hanging
  METAL → PHYSICAL, product_id blue_monkey_metal_s_hanging, shipping address required
GET /api/cards/:userId
POST /api/webhooks/lithic — transaction.created → Bananas 1 per $1
```

### iOS App — Xcode Fix
- DELETED AppDelegate.swift + SceneDelegate.swift (only ONE @main allowed)
- Added import Combine to ContentView.swift — fixes 7x init(wrappedValue:) errors
- Team: John Patrick Uhri, Bundle: com.bluemonkeycard.app.uhri
- Runs on blue phone + simulators, no white screen

### Next Steps — In Order
1. **Push this repo to GitHub** (this commit = trademark lock)
2. Archive GitHub URL on web.archive.org
3. Deploy backend server.js to Fly.io / Render
4. Create 2 card products in Lithic dashboard using Front PNG
5. Apply Lead Bank via Lithic Request Production Access (email template in /docs)
6. Open business checking at Security Service FCU 20336 Hwy 46 W Bulverde (bring EIN after Stripe Atlas)
7. File Delaware C-Corp via Stripe Atlas $500
8. File USPTO ITU $350/class for BLUE MONKEY CARD
9. Order plastic sample (100 units $120) → then metal sample

### Cash Flow
- Plastic user $500 spend → $6 interchange - $1.20 card = $4.80 profit month 1
- Metal user $49 + $500 spend → $49 - $30 + $6 = $25 profit month 1
- Float on FBO deposits 4% split, 200 users ~ $1k/month

**Built:** Spring Branch, TX — Security Service FCU — Lithic + Lead Bank — S-Hanging Real Monkey — Nov 4 2026

Ooo-ooo! Blue is swinging from S! 🐒💳🔩
