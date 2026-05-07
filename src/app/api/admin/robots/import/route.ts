import { NextResponse } from "next/server";
import { z } from "zod";
import Papa from "papaparse";
import { CHALLENGES, isChallenge } from "@/lib/challenges";
import { supabaseServer } from "@/lib/supabase/server";
import { getOrCreateClub } from "@/lib/repos/clubs";
import { createRobot } from "@/lib/repos/robots";

const Row = z.object({
  name: z.string().trim().min(1),
  club: z.string().trim().min(1),
  challenge: z.enum(CHALLENGES)
});

type ImportResult = {
  inserted: number;
  errors: { row: number; message: string }[];
};

export async function POST(req: Request) {
  const text = await req.text();
  if (!text.trim()) {
    return NextResponse.json({ error: "empty body" }, { status: 400 });
  }
  const parsed = Papa.parse<Record<string, string>>(text, {
    header: true,
    skipEmptyLines: true,
    transformHeader: (h) => h.trim().toLowerCase()
  });

  const db = supabaseServer();
  const result: ImportResult = { inserted: 0, errors: [] };

  for (let i = 0; i < parsed.data.length; i++) {
    const raw = parsed.data[i];
    const validated = Row.safeParse({
      name: raw.name,
      club: raw.club,
      challenge: isChallenge(raw.challenge) ? raw.challenge : raw.challenge
    });
    if (!validated.success) {
      result.errors.push({
        row: i + 2, // header is row 1
        message: "invalid row (check name/club/challenge values)"
      });
      continue;
    }
    try {
      const club = await getOrCreateClub(db, validated.data.club);
      await createRobot(db, {
        name: validated.data.name,
        club_id: club.id,
        challenge: validated.data.challenge
      });
      result.inserted += 1;
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "insert failed";
      result.errors.push({ row: i + 2, message });
    }
  }

  return NextResponse.json(result);
}
