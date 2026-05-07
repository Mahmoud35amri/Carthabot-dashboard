import { notFound } from "next/navigation";
import Link from "next/link";
import { CHALLENGE_META, isChallenge } from "@/lib/challenges";
import ChallengeBadge from "@/components/ChallengeBadge";
import { supabaseServer } from "@/lib/supabase/server";
import { listRobotsByChallenge } from "@/lib/repos/robots";
import { getTournament } from "@/lib/repos/tournaments";
import { listRoundsByTournament } from "@/lib/repos/rounds";
import { listMatchesByRoundIds } from "@/lib/repos/matches";
import MatchesClient from "./MatchesClient";

export const dynamic = "force-dynamic";

export default async function MatchesPage({
  params
}: {
  params: Promise<{ challenge: string }>;
}) {
  const { challenge } = await params;
  if (!isChallenge(challenge)) notFound();
  const meta = CHALLENGE_META[challenge];

  const db = supabaseServer();
  const [robots, tournament] = await Promise.all([
    listRobotsByChallenge(db, challenge),
    getTournament(db, challenge)
  ]);
  const rounds = await listRoundsByTournament(db, tournament.id);
  const matches = await listMatchesByRoundIds(
    db,
    rounds.map((r) => r.id)
  );

  return (
    <div>
      <header className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <div>
          <Link
            href="/admin"
            className="text-xs uppercase tracking-widest text-white/50 hover:text-neon-cyan"
          >
            ← Mission Control
          </Link>
          <div className="mt-1 flex items-center gap-3">
            <h1 className="font-display text-3xl font-bold uppercase tracking-tight">
              {meta.label} · Matches
            </h1>
            <ChallengeBadge meta={meta} />
          </div>
        </div>
        <Link
          href={`/bracket/${challenge}`}
          target="_blank"
          className="rounded border border-white/15 bg-black/40 px-3 py-2 text-xs uppercase tracking-widest hover:border-neon-cyan/60 hover:text-neon-cyan"
        >
          Public Bracket ↗
        </Link>
      </header>
      <MatchesClient
        challenge={challenge}
        meta={meta}
        robots={robots}
        tournament={tournament}
        rounds={rounds}
        matches={matches}
      />
    </div>
  );
}
