import { NextResponse } from "next/server";
import { supabaseServer } from "@/lib/supabase/server";
import { getMatch, updateMatch } from "@/lib/repos/matches";

export async function POST(
  _req: Request,
  ctx: { params: Promise<{ id: string }> }
) {
  const { id } = await ctx.params;
  const db = supabaseServer();
  try {
    const m = await getMatch(db, id);
    if (m.status === "done") {
      return NextResponse.json(
        { error: "match already done" },
        { status: 400 }
      );
    }
    const updated = await updateMatch(db, id, { status: "live" });
    return NextResponse.json({ match: updated });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "start failed";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
