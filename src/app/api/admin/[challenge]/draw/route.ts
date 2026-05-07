import { NextResponse } from "next/server";
import { z } from "zod";
import { isChallenge } from "@/lib/challenges";
import { supabaseServer } from "@/lib/supabase/server";
import { generateInitialDraw } from "@/lib/services/tournament";

const Body = z
  .object({ seed: z.string().trim().min(1).max(40).optional() })
  .optional();

export async function POST(
  req: Request,
  ctx: { params: Promise<{ challenge: string }> }
) {
  const { challenge } = await ctx.params;
  if (!isChallenge(challenge)) {
    return NextResponse.json({ error: "unknown challenge" }, { status: 404 });
  }
  let body: unknown = undefined;
  try {
    if (req.headers.get("content-length")) body = await req.json();
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
  const db = supabaseServer();
  try {
    const result = await generateInitialDraw(db, challenge, parsed.data?.seed);
    return NextResponse.json(result);
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "draw failed";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
