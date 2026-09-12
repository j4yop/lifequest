# Life Quest — Walkthrough Video Script (90–180 seconds)

Total target: **~2:20 (140s)**. Record at 1920×1080. Follow this shot list exactly — every judge requirement is covered.

| # | Time | Action | What to say / show |
|---|------|--------|--------------------|
| 1 | 0:00–0:08 | Show landing page (https://lifequest-ivory.vercel.app) | "Traditional to-do lists feel like chores. Life Quest turns your real tasks into an RPG — with server-backed stats you can't cheat." |
| 2 | 0:08–0:22 | Click "Create Your Character" → fill hero name, email, password → "Begin Adventure" | "Signup creates your character — a profile, six attributes, and a starter badge, all bootstrapped by a database trigger." |
| 3 | 0:22–0:35 | Quest board loads; point at character card (level, gold, streak, XP bar) and attribute panel | "Your character sheet: level, gold, streak, and six attributes from Strength to Craft. Every level costs more XP than the last — a real non-linear curve." |
| 4 | 0:35–0:50 | Click "New Quest" → type "Go to the gym" → pick Hard + Strength → "Post Quest" | "Post a quest with a difficulty tier and the attribute it trains. Hard pays 100 XP and 45 gold." |
| 5 | 0:50–1:05 | Click the sword button on the quest → fanfare + XP orbs + toast | "Completing triggers the victory fanfare — XP orbs fly, gold hits your purse. All rewards are computed inside one atomic Postgres transaction, so the client can't cheat." |
| 6 | 1:05–1:20 | Add 2 more quick quests; complete an EPIC one → Level Up overlay appears → "Continue" | "Epic quests push you over the threshold — level up! Strength leveled too. This is the instant gratification to-do lists never give you." |
| 7 | 1:20–1:35 | **REFRESH THE PAGE (F5)** — board reloads with same level, gold, streak, quests | "A full page refresh — level 2, 100 gold, streak intact, quests exactly as left. Everything persists in a real Postgres database, synced across devices." |
| 8 | 1:35–1:50 | Navigate to Shop → scroll catalog (titles, frames, themes, streak freeze) | "Gold buys titles, avatar frames, themes, and streak protection. An economy with MMO rarity colors." |
| 9 | 1:50–2:05 | Resize browser to mobile width; show responsive layout | "Fully responsive — the whole board works on mobile, navigable by keyboard, screen-reader friendly." |
| 10 | 2:05–2:15 | Sign out → login page | "Sign out and back in — your legend persists. Life Quest: turn your life into an RPG. Link in the repo." |

## Judge requirements covered

- ✅ User signup/login — shots 2, 10
- ✅ Adding/completing a task — shots 4–6
- ✅ Leveling up process — shot 6
- ✅ Page refresh proving DB persistence — shot 7
- ✅ Bonus: economy/shop, responsive, anti-cheat mention

## Recording tips

- Use OBS or Xbox Game Bar (Win+G), 1080p, ~30fps → lands well under 100MB.
- Do one practice run first; the streak/gold numbers will differ on your real account — that's fine, or use a fresh email.
- Keep the cursor moving slowly; pause 0.5s after each click so cuts are clean.
- Export as MP4 (H.264), aim for 2:00–2:20.
