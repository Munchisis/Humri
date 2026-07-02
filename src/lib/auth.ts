import type { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { connectDB } from "@/lib/db";
import User, { IUserDocument } from "@/models/User";

// Comma-separated list of admin emails from .env.local
// e.g. ADMIN_EMAILS=admin@lexgratis.ng,emuchay@gmail.com
function getAdminEmails(): string[] {
  return (process.env.ADMIN_EMAILS ?? "")
    .split(",")
    .map((e) => e.trim().toLowerCase())
    .filter(Boolean);
}

const SHORT_SESSION = 60 * 60 * 24;       // 1 day  — default (not "remembered")
const LONG_SESSION  = 60 * 60 * 24 * 30;  // 30 days — "remember me" checked

export const authOptions: NextAuthOptions = {
  session: {
    strategy: "jwt",
    maxAge:   LONG_SESSION, // ceiling — actual expiry enforced via token.exp below
  },

  pages: {
    signIn: "/auth/login",
    error:  "/auth/login",
  },

  providers: [
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email:      { label: "Email",    type: "email"    },
        password:   { label: "Password", type: "password" },
        rememberMe: { label: "Remember me", type: "text"  }, // "true" | "false" string
      },

      async authorize(credentials) {
        if (!credentials?.email || !credentials.password) {
          throw new Error("Please enter your email and password.");
        }

        const email         = credentials.email.toLowerCase();
        const adminEmails   = getAdminEmails();
        const isAdminEmail  = adminEmails.includes(email);

        await connectDB();

        // Fetch user with password (select: false in schema)
        let user = await User.findOne({ email }).select("+password");

        if (!user) {
          throw new Error("No account found with that email address.");
        }

        const isValid = await user.comparePassword(credentials.password);
        if (!isValid) {
          throw new Error("Incorrect password. Please try again.");
        }

        // If email is in ADMIN_EMAILS whitelist, auto-promote to admin
        if (isAdminEmail && user.role !== "admin") {
          user = (await User.findOneAndUpdate<IUserDocument>(
            { email },
            { role: "admin", isApproved: true },
            { new: true },
          ).select("+password")) as any;
        }

        // Lawyers not yet approved cannot log in
        if (user!.role === "lawyer" && !user!.isApproved) {
          throw new Error(
            "Your account is pending approval. You will receive an email once an admin approves your registration."
          );
        }

        return {
          id:            user!._id.toString(),
          name:          user!.name,
          email:         user!.email,
          role:          user!.role,
          isApproved:    user!.isApproved,
          emailVerified: user!.emailVerified,
          // pass through as a string so it survives the credentials round-trip
          rememberMe:    credentials.rememberMe === "true",
        } as never;
      },
    }),
  ],

  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        const u = user as unknown as {
          id: string; role: string; isApproved: boolean;
          emailVerified: boolean; rememberMe: boolean;
        };
        token.id            = u.id;
        token.role          = u.role as never;
        token.isApproved    = u.isApproved;
        token.emailVerified = u.emailVerified;

        // Set a custom expiry based on rememberMe — short session unless checked
        const maxAge   = u.rememberMe ? LONG_SESSION : SHORT_SESSION;
        token.exp       = Math.floor(Date.now() / 1000) + maxAge;
      }
      return token;
    },

    async session({ session, token }) {
      if (token) {
        session.user.id            = token.id;
        session.user.role          = token.role;
        session.user.isApproved    = token.isApproved;
        (session.user as Record<string, unknown>).emailVerified = token.emailVerified;
      }
      return session;
    },
  },
};
