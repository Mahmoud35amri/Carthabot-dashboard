import Image from "next/image";
import Link from "next/link";
import { CHALLENGE_LIST } from "@/lib/challenges";
import ChallengeBadge from "@/components/ChallengeBadge";

export default function HomePage() {
  return (
    <main className="mx-auto max-w-6xl px-6 py-16">
      <header className="mb-12 text-center">
        <div className="flex justify-center">
          <Image
            src="/brand/logo.svg"
            alt="Carthabot · Galactic Arena"
            width={480}
            height={120}
            className="h-24 w-auto drop-shadow-[0_0_25px_rgba(0,240,255,0.35)] md:h-32"
            priority
          />
        </div>
        <h1 className="mt-8 font-display text-5xl font-black uppercase tracking-tight md:text-7xl">
          Welcome,
          <br />
          <span className="bg-gradient-to-r from-neon-cyan via-white to-neon-magenta bg-clip-text text-transparent">
            Pilot.
          </span>
        </h1>
        <p className="mx-auto mt-6 max-w-xl text-white/70">
          Five challenges. One arena. Track the draw, the bracket, and the
          live match — in real time.
        </p>
        <div className="mt-8 flex justify-center gap-3 text-sm">
          <Link
            href="/schedule"
            className="rounded-md border border-neon-cyan/50 bg-black/40 px-4 py-2 font-display uppercase tracking-widest text-neon-cyan hover:bg-neon-cyan/10"
          >
            Live Schedule
          </Link>
          <Link
            href="/admin"
            className="rounded-md border border-white/20 bg-black/30 px-4 py-2 font-display uppercase tracking-widest text-white/70 hover:bg-white/10"
          >
            Admin Console
          </Link>
        </div>
      </header>

      <section className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3">
        {CHALLENGE_LIST.map((c) => (
          <Link
            key={c.id}
            href={`/bracket/${c.id}`}
            className="glass group relative overflow-hidden p-6 transition-all duration-200 hover:border-neon-cyan/60 hover:shadow-neon"
          >
            <div className="absolute -right-12 -top-12 h-40 w-40 rounded-full bg-gradient-to-br from-neon-cyan/10 to-neon-magenta/10 blur-2xl transition-opacity group-hover:opacity-60" />
            <div className="relative">
              <ChallengeBadge meta={c} size="sm" />
              <h2 className="mt-4 font-display text-2xl font-bold uppercase tracking-wide">
                {c.label}
              </h2>
              <p className="mt-2 text-sm text-white/60">{c.tagline}</p>
              <div className="mt-6 flex items-center justify-between text-xs uppercase tracking-widest text-white/50">
                <span>
                  Group size: <span className="text-white/80">{c.groupSize}</span>
                </span>
                <span className="text-neon-cyan/80">View bracket →</span>
              </div>
            </div>
          </Link>
        ))}
      </section>

      <footer className="mt-16 text-center text-xs uppercase tracking-widest text-white/40">
        Carthabot · Galactic Arena · Tournament Control
      </footer>
    </main>
  );
}
