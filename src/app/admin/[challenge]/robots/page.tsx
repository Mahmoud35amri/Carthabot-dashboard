import { notFound } from "next/navigation";
import Link from "next/link";
import { CHALLENGE_META, isChallenge } from "@/lib/challenges";
import ChallengeBadge from "@/components/ChallengeBadge";
import { supabaseServer } from "@/lib/supabase/server";
import { listRobotsByChallenge } from "@/lib/repos/robots";
import { listClubs } from "@/lib/repos/clubs";
import RobotsClient from "./RobotsClient";

export const dynamic = "force-dynamic";

export default async function RobotsPage({
  params
}: {
  params: Promise<{ challenge: string }>;
}) {
  const { challenge } = await params;
  if (!isChallenge(challenge)) notFound();
  const meta = CHALLENGE_META[challenge];

  const db = supabaseServer();
  const [robots, clubs] = await Promise.all([
    listRobotsByChallenge(db, challenge),
    listClubs(db)
  ]);

  return (
    <div>
      <header className="mb-8 flex flex-wrap items-center justify-between gap-3">
        <div>
          <Link
            href="/admin"
            className="text-xs uppercase tracking-widest text-white/50 hover:text-neon-cyan"
          >
            ← Mission Control
          </Link>
          <div className="mt-1 flex items-center gap-3">
            <h1 className="font-display text-3xl font-bold uppercase tracking-tight">
              {meta.label}
            </h1>
            <ChallengeBadge meta={meta} />
          </div>
          <p className="mt-1 text-sm text-white/60">
            Register every robot competing in this challenge.
          </p>
        </div>
        <div className="flex gap-3 text-xs uppercase tracking-widest">
          <Link
            href={`/admin/${challenge}/draw`}
            className="rounded border border-white/15 bg-black/40 px-3 py-2 hover:border-neon-magenta/60 hover:text-neon-magenta"
          >
            Draw →
          </Link>
          <Link
            href={`/admin/${challenge}/matches`}
            className="rounded border border-white/15 bg-black/40 px-3 py-2 hover:border-neon-gold/60 hover:text-neon-gold"
          >
            Matches →
          </Link>
        </div>
      </header>
      <RobotsClient
        challenge={challenge}
        initialRobots={robots}
        initialClubs={clubs}
      />
    </div>
  );
}
