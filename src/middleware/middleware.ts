import { NextRequest, NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";

export async function middleware(req: NextRequest) {
  const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
  const { pathname } = req.nextUrl;

  const roles: string[] = (token?.roles as string[]) ?? (token?.role ? [token.role as string] : []);
  const isAdmin  = roles.includes("admin");
  const isLawyer = roles.includes("lawyer");
  const isAuth   = !!token;

  // ── Admin routes ──────────────────────────────────────────────────────────
  if (pathname.startsWith("/admin")) {
    if (!isAdmin) {
      return NextResponse.redirect(new URL("/auth/login", req.url));
    }
    return NextResponse.next();
  }

  // ── Lawyer routes ─────────────────────────────────────────────────────────
  if (pathname.startsWith("/lawyer")) {
    // Admins with lawyer role OR pure lawyers can access
    if (!isAuth) {
      return NextResponse.redirect(new URL("/auth/login", req.url));
    }
    if (!isLawyer && !isAdmin) {
      return NextResponse.redirect(new URL("/auth/login", req.url));
    }
    return NextResponse.next();
  }

  // ── API: admin-only routes ────────────────────────────────────────────────
  if (pathname.startsWith("/api/admin")) {
    if (!isAdmin) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }
    return NextResponse.next();
  }

  // ── API: lawyer routes (admins with lawyer role can also access) ──────────
  if (
    pathname.startsWith("/api/lawyer") ||
    pathname.startsWith("/api/messages") ||
    pathname.startsWith("/api/user")
  ) {
    if (!isAuth) {
      return NextResponse.json({ error: "Unauthorised" }, { status: 401 });
    }
    return NextResponse.next();
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/admin/:path*",
    "/lawyer/:path*",
    "/api/admin/:path*",
    "/api/lawyer/:path*",
    "/api/messages/:path*",
    "/api/user/:path*",
  ],
};
