import { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { connectDB } from "@/lib/db";
import User from "@/models/User";

const ADMIN_EMAILS = (process.env.ADMIN_EMAILS ?? "")
  .split(",")
  .map((e) => e.trim().toLowerCase())
  .filter(Boolean);

export const authOptions: NextAuthOptions = {
  session: { strategy: "jwt" },
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
        rememberMe: { label: "Remember", type: "text" },
      },
      async authorize(credentials, req) {
        if (!credentials?.email || !credentials?.password) return null;

        try {
          await connectDB();

          let user: any = await User.findOne({
            email: credentials.email.toLowerCase(),
          }).select("+password");

          if (!user) return null;

          const valid = await user.comparePassword(credentials.password);
          if (!valid) return null;

          // ── Determine roles ──────────────────────────────────────────────────
          const isAdminEmail = ADMIN_EMAILS.includes(user.email.toLowerCase());

          // Build the roles array: always start from what's stored
          let roles: string[] =
            Array.isArray(user.roles) && user.roles.length > 0
              ? [...user.roles]
              : [user.role || "lawyer"];

          // Whitelisted email → ensure admin is in roles
          if (isAdminEmail && !roles.includes("admin")) {
            roles.push("admin");
          }

          // Primary role: admin takes precedence if present
          const primaryRole = roles.includes("admin") ? "admin" : "lawyer";

          // Persist any role changes back to DB
          if (
            primaryRole !== user.role ||
            JSON.stringify(roles.sort()) !==
              JSON.stringify((user.roles ?? []).slice().sort())
          ) {
            await User.findByIdAndUpdate(user._id, {
              role: primaryRole,
              roles: roles,
            });
          }

          // Admins are always approved
          if (primaryRole === "admin" && !user.isApproved) {
            await User.findByIdAndUpdate(user._id, { isApproved: true });
          }

          if (!user.isApproved && primaryRole !== "admin") return null;

          return {
            id: user._id.toString(),
            name: user.name,
            email: user.email,
            role: primaryRole,
            roles,
            isApproved: user.isApproved,
            emailVerified: user.emailVerified,
            rememberMe: credentials.rememberMe === "true",
          };
        } catch (error: any) {
          // Log full technical details in server logs
          console.error("Database or Auth Error during sign-in:", error);

          // Throwing a clean custom error key prevents NextAuth from leaking raw Mongo messages
          throw new Error("DatabaseError");
        }
      },
    }),
  ],

  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = (user as any).role;
        token.roles = (user as any).roles ?? [(user as any).role];
        token.emailVerified = (user as any).emailVerified;
        // Remember me: 30 days vs 1 day
        if ((user as any).rememberMe) {
          token.exp = Math.floor(Date.now() / 1000) + 30 * 24 * 60 * 60;
        }
      }
      return token;
    },
    async session({ session, token }) {
      if (token && session.user) {
        (session.user as any).id = token.id;
        (session.user as any).role = token.role;
        (session.user as any).roles = token.roles ?? [token.role];
        (session.user as any).emailVerified = token.emailVerified;
      }
      return session;
    },
  },
};
