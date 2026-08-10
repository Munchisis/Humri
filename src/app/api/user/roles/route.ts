import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { z } from "zod";
import { authOptions } from "@/lib/auth";
import { connectDB } from "@/lib/db";
import User from "@/models/User";

const Schema = z.object({
  action: z.enum(["grant_lawyer", "revoke_lawyer"]),
});

export async function PATCH(req: NextRequest) {
  const session = await getServerSession(authOptions);
  const roles: string[] = (session?.user as any)?.roles ?? [(session?.user as any)?.role];
  if (!session || !roles.includes("admin")) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const body   = await req.json();
  const parsed = Schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid action." }, { status: 400 });
  }

  await connectDB();

  const user = await User.findById(session.user.id);
  if (!user) return NextResponse.json({ error: "User not found." }, { status: 404 });

  const currentRoles: string[] = user.roles ?? [user.role];

  if (parsed.data.action === "grant_lawyer") {
    if (!currentRoles.includes("lawyer")) {
      user.roles = [...currentRoles, "lawyer"] as typeof user.roles;
    }
    // Ensure lawyer profile fields are prompted
  } else {
    user.roles = currentRoles.filter(r => r !== "lawyer") as typeof user.roles;
  }

  await user.save();

  return NextResponse.json({
    message: parsed.data.action === "grant_lawyer"
      ? "Lawyer role granted. You can now access the lawyer portal."
      : "Lawyer role revoked.",
    roles: user.roles,
  });
}

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorised" }, { status: 401 });

  await connectDB();
  const user = await User.findById(session.user.id).select("roles role name email");
  if (!user) return NextResponse.json({ error: "User not found." }, { status: 404 });

  return NextResponse.json({
    roles: user.roles ?? [user.role],
    name:  user.name,
    email: user.email,
  });
}
