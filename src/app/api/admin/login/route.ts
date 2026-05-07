import { NextResponse } from "next/server";
import { z } from "zod";
import { issueAdminCookie, setAdminCookie } from "@/lib/auth";

const Body = z.object({ password: z.string().min(1) });

export async function POST(req: Request) {
  const expected = process.env.ADMIN_PASSWORD;
  if (!expected) {
    return NextResponse.json(
      { error: "ADMIN_PASSWORD not configured" },
      { status: 500 }
    );
  }
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "invalid JSON" }, { status: 400 });
  }
  const parsed = Body.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "invalid body" }, { status: 400 });
  }
  if (parsed.data.password !== expected) {
    return NextResponse.json({ error: "invalid credentials" }, { status: 401 });
  }
  const token = await issueAdminCookie();
  await setAdminCookie(token);
  return NextResponse.json({ ok: true });
}
