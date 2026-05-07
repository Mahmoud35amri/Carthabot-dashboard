import { NextResponse } from "next/server";
import { isChallenge } from "@/lib/challenges";
import { supabaseServer } from "@/lib/supabase/server";
import { confirmDraw } from "@/lib/services/tournament";

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
    const t = await confirmDraw(db, challenge);
    return NextResponse.json({ tournament: t });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "confirm failed";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
