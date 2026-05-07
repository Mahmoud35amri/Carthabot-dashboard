import { NextResponse } from "next/server";
import { isChallenge } from "@/lib/challenges";
import { supabaseServer } from "@/lib/supabase/server";
import { listRobotsByChallenge } from "@/lib/repos/robots";
import { getTournament } from "@/lib/repos/tournaments";
import { listRoundsByTournament } from "@/lib/repos/rounds";
import { listMatchesByRoundIds } from "@/lib/repos/matches";

export const dynamic = "force-dynamic";

export async function GET(
  _req: Request,
  ctx: { params: Promise<{ challenge: string }> }
) {
  const { challenge } = await ctx.params;
  if (!isChallenge(challenge)) {
    return NextResponse.json({ error: "unknown challenge" }, { status: 404 });
  }
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
  const currentMatch = matches.find((m) => m.status === "live") ?? null;
  return NextResponse.json({
    tournament,
    rounds,
    matches,
    robots,
    currentMatch
  });
}
