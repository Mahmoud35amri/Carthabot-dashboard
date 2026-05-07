import { notFound } from "next/navigation";
import Link from "next/link";
import { CHALLENGE_META, isChallenge } from "@/lib/challenges";
import ChallengeBadge from "@/components/ChallengeBadge";
import { supabaseServer } from "@/lib/supabase/server";
import { listRobotsByChallenge } from "@/lib/repos/robots";
import { getTournament } from "@/lib/repos/tournaments";
import { listRoundsByTournament } from "@/lib/repos/rounds";
import { listMatchesByRoundIds } from "@/lib/repos/matches";
import DrawClient from "./DrawClient";

export const dynamic = "force-dynamic";

export default async function DrawPage({
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
      <header className="mb-6 flex items-center justify-between gap-3">
        <div>
          <Link
            href="/admin"
            className="text-xs uppercase tracking-widest text-white/50 hover:text-neon-cyan"
          >
            ← Mission Control
          </Link>
          <div className="mt-1 flex items-center gap-3">
            <h1 className="font-display text-3xl font-bold uppercase tracking-tight">
              {meta.label} · Draw
            </h1>
            <ChallengeBadge meta={meta} />
          </div>
        </div>
      </header>
      <DrawClient
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
