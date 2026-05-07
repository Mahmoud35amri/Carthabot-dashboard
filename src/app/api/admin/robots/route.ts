import { NextResponse } from "next/server";
import { z } from "zod";
import { CHALLENGES } from "@/lib/challenges";
import { supabaseServer } from "@/lib/supabase/server";
import { getOrCreateClub } from "@/lib/repos/clubs";
import { createRobot, listAllRobots, listRobotsByChallenge } from "@/lib/repos/robots";

const Body = z.object({
  name: z.string().trim().min(1).max(80),
  club: z.string().trim().min(1).max(80),
  challenge: z.enum(CHALLENGES)
});

export async function GET(req: Request) {
  const url = new URL(req.url);
  const challenge = url.searchParams.get("challenge");
  const db = supabaseServer();
  if (challenge && (CHALLENGES as readonly string[]).includes(challenge)) {
    const robots = await listRobotsByChallenge(db, challenge as never);
    return NextResponse.json({ robots });
  }
  const robots = await listAllRobots(db);
  return NextResponse.json({ robots });
}

export async function POST(req: Request) {
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
  const db = supabaseServer();
  const club = await getOrCreateClub(db, parsed.data.club);
  try {
    const robot = await createRobot(db, {
      name: parsed.data.name,
      club_id: club.id,
      challenge: parsed.data.challenge
    });
    return NextResponse.json({ robot, club });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "create failed";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
