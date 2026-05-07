import { NextResponse } from "next/server";
import { isChallenge } from "@/lib/challenges";
import { supabaseServer } from "@/lib/supabase/server";
import { resetTournament } from "@/lib/services/tournament";

export async function POST(
  _req: Request,
  ctx: { params: Promise<{ challenge: string }> }
) {
  const { challenge } = await ctx.params;
  if (!isChallenge(challenge)) {
    return NextResponse.json({ error: "unknown challenge" }, { status: 404 });
  }
  const db = supabaseServer();
  try {
    const tournament = await resetTournament(db, challenge);
    return NextResponse.json({ tournament });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "reset failed";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
