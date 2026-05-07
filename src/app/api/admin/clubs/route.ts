import { NextResponse } from "next/server";
import { z } from "zod";
import { supabaseServer } from "@/lib/supabase/server";
import { getOrCreateClub, listClubs } from "@/lib/repos/clubs";

const Body = z.object({ name: z.string().trim().min(1).max(80) });

export async function GET() {
  const db = supabaseServer();
  const clubs = await listClubs(db);
  return NextResponse.json({ clubs });
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
  const club = await getOrCreateClub(db, parsed.data.name);
  return NextResponse.json({ club });
}
