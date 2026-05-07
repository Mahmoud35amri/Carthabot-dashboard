import { NextResponse } from "next/server";
import { z } from "zod";
import { supabaseServer } from "@/lib/supabase/server";
import { getMatch, updateMatch } from "@/lib/repos/matches";

const Body = z.object({
  winnerIds: z.array(z.string().uuid()).min(1).max(8),
  advanceCount: z.number().int().positive().max(8)
});

export async function POST(
  req: Request,
  ctx: { params: Promise<{ id: string }> }
) {
  const { id } = await ctx.params;
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "invalid JSON" }, { status: 400 });
  }
  const parsed = Body.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.flatten() },
      { status: 400 }
    );
  }
  const { winnerIds, advanceCount } = parsed.data;

  const db = supabaseServer();
  const m = await getMatch(db, id);

  // Validate all winners are participants in the match
  for (const w of winnerIds) {
    if (!m.robot_ids.includes(w)) {
      return NextResponse.json(
        { error: `winner ${w} is not a participant` },
        { status: 400 }
      );
    }
  }
  if (winnerIds.length !== advanceCount) {
    return NextResponse.json(
      {
        error: `winnerIds length (${winnerIds.length}) must equal advanceCount (${advanceCount})`
      },
      { status: 400 }
    );
  }
  if (advanceCount >= m.robot_ids.length) {
    return NextResponse.json(
      { error: "advanceCount must be less than the number of participants" },
      { status: 400 }
    );
  }

  const updated = await updateMatch(db, id, {
    winner_ids: winnerIds,
    advance_count: advanceCount,
    status: "done",
    played_at: new Date().toISOString()
  });
  return NextResponse.json({ match: updated });
}
