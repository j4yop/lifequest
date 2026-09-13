# Life Quest

Turn your real life into a role-playing game. Complete real-world quests, level up your character, build streaks, and spend your hard-earned gold in the guild shop — all backed by a secure, server-authoritative progression engine.

**Live app:** https://lifequest-ivory.vercel.app

![Life Quest](public/og-image.png)

## Stack

- **Next.js 16** (App Router, TypeScript, Tailwind CSS v4)
- **Supabase** — Postgres, Auth (email + password), Row Level Security, and atomic server-side RPCs that make the progression engine cheat-proof
- **Motion** for spring animations, **Zustand** for client state, **React Hook Form + Zod** for validation

## Features

- **Server-authoritative progression engine** — XP, gold, attribute gains, streaks, crit rolls, gear grants, and level-ups are computed and applied inside a single atomic Postgres function (`complete_task`). The client never computes rewards; it can't cheat.
- **Non-linear leveling** — `xpNeeded(n) = round(100 × n^1.5)`. Every level costs more than the last.
- **Six attributes** — Strength, Intellect, Vitality, Discipline, Charisma, Craft. Quests are tagged with an attribute; completing them levels that stat.
- **D20 crit rolls** — every quest completion rolls a d20 server-side. A natural 20 doubles XP and gold, counts on your profile, and fires a crit banner + metal sting.
- **Paper-doll hero** — a layered SVG avatar with six gear slots (one per attribute: weapon, tome, armor, helm, cloak, instrument). Attribute levels 3/6/10 auto-grant visible tier-1/2/3 gear, drawn on the doll.
- **World map with fog-of-war** — the Sunken Road: eight zones with lore, unlocked by total character level (1 → 18). Locked zones stay under fog.
- **Daily adventurer's chest** — one claim per UTC day: streak-scaled gold plus a weighted loot roll (badges, consumables, frames, titles).
- **Streaks** — consecutive active days, tracked server-side in UTC. A Streak Freeze item protects one missed day.
- **Guild shop economy** — earn gold, buy avatar frames, titles, badges, themes, and streak protection.
- **Full CRUD quests** — create, read, update, delete, complete, and reopen quests; five difficulty tiers.
- **Auth & isolation** — Supabase Auth with Row Level Security on every table. You only ever see your own data.
- **Ledgerlight UI** — a scribe's parchment-and-ink theme: wax-seal accents, medieval-pigment rarity ramp (umber → verdigris → cobalt → carmine → gold leaf), Silkscreen + Atkinson Hyperlegible + VT323 type, chiptune fanfares (WebAudio, no audio files), XP orbs, level-up and crit celebrations. Respects `prefers-reduced-motion`.

## Getting started

### 1. Clone and install

```bash
git clone <repo-url>
cd lifequest
npm install
```

### 2. Start Supabase locally (requires Docker)

```bash
npx supabase start          # starts Postgres, Auth (GoTrue), and Studio on http://127.0.0.1:54323
npx supabase migration up   # apply the schema, RLS policies, and RPCs
npm run db:seed              # optional: demo character sheet + shop catalog
```

The `supabase start` output (or `npx supabase status`) prints the local anon key — create `.env.local` with:

```
NEXT_PUBLIC_SUPABASE_URL=http://127.0.0.1:54321
NEXT_PUBLIC_SUPABASE_ANON_KEY=<your local publishable/anon key>
SUPABASE_SERVICE_ROLE_KEY=<your local secret key>
```

(Or skip Docker entirely and point `.env.local` at a cloud Supabase project — see below.)

### 3. Run the app

```bash
npm run dev
```

Open http://localhost:3000, sign up, and start questing.

### Using cloud Supabase instead

1. Create a project at https://supabase.com/dashboard
2. Grab the project URL, anon key, and service role key from Project Settings → API
3. Put them in `.env.local` (copy `.env.example`)
4. Run `npx supabase db push` to apply migrations to the cloud project

### 4. Production build

```bash
npm run build
```

## Project structure

```
src/
  app/            # App Router pages (landing, auth, quests, shop)
  components/     # JRPG-styled UI components
  lib/            # Supabase clients, game math, types
supabase/
  migrations/     # Schema, RLS policies, RPCs (the "backend")
  seed.sql        # Shop catalog + demo data
```

## How the anti-cheat engine works

All game logic lives in Postgres. `complete_task(task_id)`:

1. Locks the quest row and verifies it belongs to the caller and is not already completed
2. Pays out tier-based XP and gold to the profile
3. Adds attribute XP and resolves attribute level-ups
4. Rolls the profile level while XP covers the next threshold (`100 × level^1.5`)
5. Updates the streak (same UTC day = unchanged, yesterday = +1, other = reset to 1, with streak-freeze support)
6. Inserts an activity-log row

All in one transaction, invoked through PostgREST as an RPC. The browser only displays what the server computed.

## Video walkthrough

See `docs/WALKTHROUGH.md` for the 90–180 second demo script used in the submission video.

## License

MIT
