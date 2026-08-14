import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { z } from "zod";
import { authOptions } from "@/lib/auth";
import { connectDB } from "@/lib/db";
import Matter from "@/models/Matter";

const NoteSchema = z.object({
  content: z.string().min(3, "Note must be at least 3 characters").max(1000),
});

export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } },
) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: "Unauthorised" }, { status: 401 });
  }

  const body = await req.json();
  const parsed = NoteSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.errors[0].message },
      { status: 400 },
    );
  }

  await connectDB();

  const matter = await Matter.findById(params.id);
  if (!matter) {
    return NextResponse.json({ error: "Matter not found." }, { status: 404 });
  }

  if (
    session.user.role === "lawyer" &&
    matter.assignedLawyer?.toString() !== session.user.id
  ) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  matter.notes.push({
    author: session.user.id as unknown as (typeof matter.notes)[0]["author"],
    authorName: session.user.name ?? "Unknown",
    content: parsed.data.content,
    createdAt: new Date(),
  });

  await matter.save();

  return NextResponse.json({
    message: "Note added successfully.",
    note: matter.notes[matter.notes.length - 1],
  });
}
