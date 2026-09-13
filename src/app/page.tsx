"use client";

import Link from "next/link";
import {
  Sword,
  Flame,
  ArrowRight,
  TreasureChest,
  LockSimple,
  MapTrifold,
  DiceFive,
  PersonArmsSpread,
} from "@phosphor-icons/react";

/** Landing hero visual — a real miniature of the actual game card. */
function HeroCardPreview() {
  return (
    <div className="jrpg-window jrpg-rivets relative w-full max-w-sm rotate-[-1.5deg] p-1.5">
      <div className="rounded-lg bg-window-deep/70 p-5">
        <p className="pixel-text text-[10px] text-gold">Character</p>

        <div className="mt-4 flex items-center gap-3">
          <div className="flex h-14 w-14 items-center justify-center rounded-full border-2 border-window-border bg-window">
            <Sword size={26} weight="duotone" className="text-gold" aria-hidden="true" />
          </div>
          <div className="flex-1">
            <p className="pixel-text text-[11px] text-ink">Aerith</p>
            <p className="text-xs text-ink-dim font-body">Wanderer</p>
            <div className="mt-1.5 flex gap-3 text-[11px]">
              <span className="text-gold tabular-nums font-bold">1,240g</span>
              <span className="text-rarity-epic tabular-nums font-bold">12d streak</span>
            </div>
          </div>
          <span className="pixel-text self-start rounded-[6px] border-2 border-gold-deep bg-window-deep px-1.5 py-1 text-[11px] text-gold">
            7
          </span>
        </div>

        <div className="mt-4">
          <div className="mb-1 flex justify-between text-[10px] text-ink-faint tabular-nums">
            <span className="pixel-text">Next Level</span>
            <span>140 / 264 XP</span>
          </div>
          <div className="stat-bar-track h-3">
            <div className="stat-bar-fill" style={{ width: "53%", background: "var(--color-gold)" }} />
          </div>
        </div>

        <ul className="mt-4 space-y-2.5">
          {[
            { label: "Strength", pct: 68, color: "var(--color-str)" },
            { label: "Intellect", pct: 41, color: "var(--color-int)" },
            { label: "Discipline", pct: 82, color: "var(--color-dis)" },
          ].map((s) => (
            <li key={s.label}>
              <div className="mb-0.5 flex justify-between text-[10px] text-ink-dim">
                <span>{s.label}</span>
              </div>
              <div className="stat-bar-track h-1.5">
                <div className="stat-bar-fill" style={{ width: `${s.pct}%`, background: s.color }} />
              </div>
            </li>
          ))}
        </ul>

        <p className="cursor-blink mt-4 text-center pixel-text text-[9px] text-gold">
          ▶ Level Up!
        </p>
      </div>
    </div>
  );
}

export default function Home() {
  return (
    <div className="page-field">
      <header className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6">
        <p className="pixel-text text-xs text-gold">
          Life<span className="text-ink">Quest</span>
        </p>
        <div className="flex items-center gap-2.5">
          <Link href="/login" className="btn-jrpg btn-ghost px-4 py-2 text-[10px]">
            Log In
          </Link>
          <Link href="/signup" className="btn-jrpg btn-primary px-4 py-2 text-[10px]">
            Start Free
          </Link>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-4 sm:px-6">
        {/* ——— HERO: split screen ——— */}
        <section className="grid items-center gap-10 py-14 sm:py-20 lg:grid-cols-[1.1fr_0.9fr] lg:gap-16">
          <div>
            <h1 className="pixel-text text-2xl leading-[1.7] text-ink sm:text-3xl sm:leading-[1.7]">
              Your to‑do list
              <br />
              is now a{" "}
              <span className="text-gold">quest board</span>.
            </h1>
            <p className="mt-6 max-w-md text-lg leading-relaxed text-ink-dim font-body">
              Complete real-world tasks to earn XP, level six character
              attributes, keep your streak alive, and spend gold in the guild
              shop. Progress lives on a secure server — you can&apos;t cheat,
              and you can&apos;t lose it.
            </p>
            <div className="mt-8 flex flex-wrap items-center gap-3">
              <Link href="/signup" className="btn-jrpg btn-primary px-6 py-3 text-[11px]">
                Create Your Character
                <ArrowRight size={13} weight="bold" aria-hidden="true" />
              </Link>
              <p className="text-xs text-ink-faint font-body">
                Free · 30 seconds · no card
              </p>
            </div>
          </div>

          <div className="flex justify-center lg:justify-end">
            <HeroCardPreview />
          </div>
        </section>

        {/* ——— How it plays: numbered chapter list ——— */}
        <section className="border-t-2 border-window-border/40 py-14 sm:py-16">
          <h2 className="pixel-text text-center text-sm leading-relaxed text-ink sm:text-base">
            How the game is played
          </h2>
          <ol className="mt-10 grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
            {[
              {
                n: "01",
                title: "Post a quest",
                body: "Gym session, study block, call your mom. Tag it with a difficulty and the attribute it trains.",
                icon: <Sword size={22} weight="duotone" className="text-gold" aria-hidden="true" />,
              },
              {
                n: "02",
                title: "Complete it",
                body: "One tap rolls the d20 — a natural 20 doubles your rewards. XP flies, gold lands, the fanfare plays.",
                icon: <DiceFive size={22} weight="duotone" className="text-gold" aria-hidden="true" />,
              },
              {
                n: "03",
                title: "Grow your hero",
                body: "Six attributes level on real curves — and your paper-doll hero visibly earns better gear as they grow.",
                icon: <PersonArmsSpread size={22} weight="duotone" className="text-gold" aria-hidden="true" />,
              },
              {
                n: "04",
                title: "Walk the world",
                body: "Levels unlock zones on the world map. Streaks fatten your daily chest. Gold buys glory in the shop.",
                icon: <MapTrifold size={22} weight="duotone" className="text-gold" aria-hidden="true" />,
              },
            ].map((step) => (
              <li key={step.n} className="relative">
                <span className="pixel-text text-[10px] text-gold/50">{step.n}</span>
                <div className="mt-3 flex h-11 w-11 items-center justify-center rounded-[8px] border-2 border-window-border bg-window">
                  {step.icon}
                </div>
                <h3 className="pixel-text mt-4 text-[11px] leading-relaxed text-ink">
                  {step.title}
                </h3>
                <p className="mt-2.5 text-sm leading-relaxed text-ink-dim font-body">
                  {step.body}
                </p>
              </li>
            ))}
          </ol>
        </section>

        {/* ——— Feature trio: asymmetric band ——— */}
        <section className="grid gap-6 border-t-2 border-window-border/40 py-14 sm:py-16 lg:grid-cols-3">
          <div className="jrpg-window jrpg-rivets p-6 sm:p-7">
            <TreasureChest size={26} weight="duotone" className="text-gold" aria-hidden="true" />
            <h3 className="pixel-text mt-4 text-[11px] leading-relaxed text-ink">
              Non-linear progression
            </h3>
            <p className="mt-2.5 text-sm leading-relaxed text-ink-dim font-body">
              Each level demands more XP than the last — a real curve that
              makes every level-up feel earned. Attribute stats level on their
              own gentler curve.
            </p>
          </div>
          <div className="jrpg-window p-6 sm:p-7">
            <Flame size={26} weight="duotone" className="text-rarity-epic" aria-hidden="true" />
            <h3 className="pixel-text mt-4 text-[11px] leading-relaxed text-ink">
              Streaks with mercy
            </h3>
            <p className="mt-2.5 text-sm leading-relaxed text-ink-dim font-body">
              Consecutive active days build your streak. Miss a day and a
              Streak Freeze — bought with gold — protects your run.
            </p>
          </div>
          <div className="jrpg-window p-6 sm:p-7">
            <LockSimple size={26} weight="duotone" className="text-rarity-rare" aria-hidden="true" />
            <h3 className="pixel-text mt-4 text-[11px] leading-relaxed text-ink">
              Cheat-proof by design
            </h3>
            <p className="mt-2.5 text-sm leading-relaxed text-ink-dim font-body">
              Rewards are computed inside a single atomic database
              transaction. Your stats live server-side, synced across every
              device you log into.
            </p>
          </div>
        </section>

        {/* ——— Final CTA ——— */}
        <section className="border-t-2 border-window-border/40 py-16 text-center sm:py-20">
          <h2 className="pixel-text text-lg leading-[1.7] text-ink sm:text-xl">
            The board awaits.
          </h2>
          <p className="mx-auto mt-4 max-w-md text-base text-ink-dim font-body">
            Your stats start at level 1. What they become is entirely up to
            what you do today.
          </p>
          <Link href="/signup" className="btn-jrpg btn-primary mt-8 px-8 py-3.5 text-[11px]">
            Begin Adventure
            <ArrowRight size={13} weight="bold" aria-hidden="true" />
          </Link>
        </section>
      </main>

      <footer className="border-t-2 border-window-border/40 py-8">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-3 px-4 text-xs text-ink-faint font-body sm:flex-row sm:px-6">
          <p className="pixel-text text-[9px]">LifeQuest</p>
          <p>Turn your life into an RPG. Built with Next.js + Supabase.</p>
        </div>
      </footer>
    </div>
  );
}
