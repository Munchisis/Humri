import type { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { connectDB } from "@/lib/db";
import User, { IUserDocument } from "@/models/User";

// Comma-separated list of admin emails from .env.local
// e.g. ADMIN_EMAILS=admin@humri.org,example@gmail.com
function getAdminEmails(): string[] {
  return (process.env.ADMIN_EMAILS ?? "")
    .split(",")
    .map((e) => e.trim().toLowerCase())
    .filter(Boolean);
}

const SHORT_SESSION = 60 * 60 * 24; // 1 day  — default (not "remembered")
const LONG_SESSION = 60 * 60 * 24 * 30; // 30 days — "remember me" checked

// A precomputed bcrypt hash with no corresponding real password. Compared
// against on the "user not found" path so that branch takes roughly the same
// time as a real password check — otherwise response timing alone reveals
// whether an email is registered, even with an identical error message.
const DUMMY_HASH =
  "$2a$12$CwTycUXWue0Thq9StjUM0uJ8O8G4/9Vp/6l4E9L2h3q3z8yJZ4h5S";

const GENERIC_CREDENTIALS_ERROR = "Incorrect email or password.";

export const authOptions: NextAuthOptions = {
  session: {
    strategy: "jwt",
    maxAge: LONG_SESSION, // ceiling — actual expiry enforced via token.exp below
  },

  pages: {
    signIn: "/auth/login",
    error: "/auth/login",
  },

  providers: [
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
        rememberMe: { label: "Remember me", type: "text" }, // "true" | "false" string
      },

      async authorize(credentials) {
        if (!credentials?.email || !credentials.password) {
          throw new Error("Please enter your email and password.");
        }

        const email = credentials.email.toLowerCase();
        const adminEmails = getAdminEmails();
        const isAdminEmail = adminEmails.includes(email);

        // Known, intentional auth failures (bad password, pending approval,
        // etc.) throw plain Error with a message that's safe to show as-is —
        // those pass straight through the outer catch below unchanged.
        // Anything else (DB connection drops, DNS failures, unexpected
        // exceptions) gets caught and replaced with a generic message so
        // infrastructure details never reach the client.
        try {
          await connectDB();

          // Fetch user with password (select: false in schema)
          let user = await User.findOne({ email }).select("+password");

          if (!user) {
            // Run a dummy compare so this branch takes comparable time to the
            // real-user path below — prevents timing-based email enumeration.
            await bcrypt.compare(credentials.password, DUMMY_HASH);
            throw new Error(GENERIC_CREDENTIALS_ERROR);
          }

          const isValid = await user.comparePassword(credentials.password);
          if (!isValid) {
            throw new Error(GENERIC_CREDENTIALS_ERROR);
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
              "Your account is pending approval. You will receive an email once an admin approves your registration.",
            );
          }

          return {
            id: user!._id.toString(),
            name: user!.name,
            email: user!.email,
            role: user!.role,
            isApproved: user!.isApproved,
            emailVerified: user!.emailVerified,
            // pass through as a string so it survives the credentials round-trip
            rememberMe: credentials.rememberMe === "true",
          } as never;
        } catch (err) {
          // Our own intentional errors carry a message we've already vetted
          // as safe to show — let those through unchanged.
          const knownMessages = [
            GENERIC_CREDENTIALS_ERROR,
            "Please enter your email and password.",
          ];
          if (
            err instanceof Error &&
            (knownMessages.includes(err.message) ||
              err.message.startsWith("Your account is pending approval"))
          ) {
            throw err;
          }

          // Anything else — DB connection errors, DNS failures, driver
          // exceptions — gets logged server-side and replaced with a generic
          // message before it can reach the client.
          console.error("[AUTH] Unexpected error during authorize():", err);
          throw new Error(
            "Something went wrong signing you in. Please try again in a moment.",
          );
        }
      },
    }),
  ],

  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        const u = user as unknown as {
          id: string;
          role: string;
          isApproved: boolean;
          emailVerified: boolean;
          rememberMe: boolean;
        };
        token.id = u.id;
        token.role = u.role as never;
        token.isApproved = u.isApproved;
        token.emailVerified = u.emailVerified;

        // Set a custom expiry based on rememberMe — short session unless checked
        const maxAge = u.rememberMe ? LONG_SESSION : SHORT_SESSION;
        token.exp = Math.floor(Date.now() / 1000) + maxAge;
      }
      return token;
    },

    async session({ session, token }) {
      if (token) {
        session.user.id = token.id;
        session.user.role = token.role;
        session.user.isApproved = token.isApproved;
        (session.user as Record<string, unknown>).emailVerified =
          token.emailVerified;
      }
      return session;
    },
  },
};

export async function verifyLawyerApproved(
  session: { user: { role?: string; id?: string } } | null | undefined,
) {
  if (!session || session.user.role !== "lawyer") {
    return false;
  }

  await connectDB();
  const lawyer = await User.findById(session.user.id)
    .select("isApproved")
    .lean();
  return !!lawyer?.isApproved;
}
