import { notFound } from "next/navigation";
import Link from "next/link";
import { CHALLENGE_META, isChallenge } from "@/lib/challenges";
import ChallengeBadge from "@/components/ChallengeBadge";
import BracketView from "./BracketView";

export default async function PublicBracketPage({
  params
}: {
  params: Promise<{ challenge: string }>;
}) {
  const { challenge } = await params;
  if (!isChallenge(challenge)) notFound();
  const meta = CHALLENGE_META[challenge];

  return (
    <main className="mx-auto max-w-7xl px-6 py-10">
      <header className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <div>
          <Link
            href="/"
            className="text-xs uppercase tracking-widest text-white/50 hover:text-neon-cyan"
          >
            ← Galactic Arena
          </Link>
          <div className="mt-1 flex items-center gap-3">
            <h1 className="font-display text-3xl font-bold uppercase tracking-tight md:text-5xl">
              {meta.label}
            </h1>
            <ChallengeBadge meta={meta} size="lg" />
          </div>
          <p className="mt-2 text-white/60">{meta.tagline}</p>
        </div>
        <Link
          href="/schedule"
          className="rounded border border-white/15 bg-black/40 px-3 py-2 text-xs uppercase tracking-widest hover:border-neon-cyan/60 hover:text-neon-cyan"
        >
          Live Schedule ↗
        </Link>
      </header>

      <BracketView challenge={challenge} />
    </main>
  );
}
