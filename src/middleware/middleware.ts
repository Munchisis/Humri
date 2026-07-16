import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import User from "@/models/User";

export default withAuth(
  async function middleware(req) {
    const { token } = req.nextauth;
    const { pathname } = req.nextUrl;

    // No token = redirect to login (handled by withAuth config below)
    if (!token) return NextResponse.redirect(new URL("/auth/login", req.url));

    // Lawyer trying to access admin routes
    if (pathname.startsWith("/admin") && token.role !== "admin") {
      return NextResponse.redirect(new URL("/lawyer", req.url));
    }

    // Admin trying to access lawyer-only routes
    if (pathname.startsWith("/lawyer") && token.role !== "lawyer") {
      return NextResponse.redirect(new URL("/admin", req.url));
    }

    // Lawyer account not yet approved or suspended after login
    if (token.role === "lawyer") {
      await connectDB();
      const lawyer = await User.findById(token.id).select("isApproved").lean();
      if (!lawyer?.isApproved) {
        return NextResponse.redirect(new URL("/auth/pending", req.url));
      }
    }

    return NextResponse.next();
  },
  {
    callbacks: {
      // Only run the middleware function above when a token exists
      authorized: ({ token }) => !!token,
    },
  },
);

// Protect these route prefixes — public routes (/, /submit, /track, /auth/*) are excluded
export const config = {
  matcher: ["/admin/:path*", "/lawyer/:path*"],
};
