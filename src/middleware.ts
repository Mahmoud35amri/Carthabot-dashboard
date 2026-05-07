import { NextResponse, type NextRequest } from "next/server";
import { jwtVerify } from "jose";

const COOKIE_NAME = "carthabot_admin";

async function verify(token: string | undefined): Promise<boolean> {
  if (!token) return false;
  const s = process.env.JWT_SECRET;
  if (!s) return false;
  try {
    const { payload } = await jwtVerify(token, new TextEncoder().encode(s));
    return payload.role === "admin";
  } catch {
    return false;
  }
}

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  const isAdminPage = pathname.startsWith("/admin");
  const isAdminApi =
    pathname.startsWith("/api/admin") &&
    !pathname.startsWith("/api/admin/login");

  if (!isAdminPage && !isAdminApi) {
    return NextResponse.next();
  }

  const ok = await verify(req.cookies.get(COOKIE_NAME)?.value);
  if (ok) return NextResponse.next();

  if (isAdminApi) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }
  const url = req.nextUrl.clone();
  url.pathname = "/login";
  url.searchParams.set("from", pathname);
  return NextResponse.redirect(url);
}

export const config = {
  matcher: ["/admin/:path*", "/api/admin/:path*"]
};
