import { NextResponse } from "next/server";
import { isChallenge } from "@/lib/challenges";
import { supabaseServer } from "@/lib/supabase/server";
import { generateNextRound } from "@/lib/services/tournament";

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
    const result = await generateNextRound(db, challenge);
    return NextResponse.json(result);
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "next-round failed";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
