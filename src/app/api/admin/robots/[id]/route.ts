import { NextResponse } from "next/server";
import { supabaseServer } from "@/lib/supabase/server";
import { deleteRobot } from "@/lib/repos/robots";

export async function DELETE(
  _req: Request,
  ctx: { params: Promise<{ id: string }> }
) {
  const { id } = await ctx.params;
  const db = supabaseServer();
  await deleteRobot(db, id);
  return NextResponse.json({ ok: true });
}
