import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";
import { connectDB } from "@/lib/db";
import User from "@/models/User";
import { AdminSidebar } from "@/components/admin/AdminSidebar";
import { MobileSidebarWrapper } from "@/components/shared/MobileSidebarWrapper";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getServerSession(authOptions);

  if (!session || session.user.role !== "admin") {
    redirect("/auth/login");
  }

  // The JWT's role is only as fresh as the token — up to 30 days old for a
  // "remember me" session. Re-check against the DB on every request so a
  // demoted/deprovisioned admin loses access immediately, not whenever their
  // token happens to expire.
  await connectDB();
  const currentUser = await User.findById(session.user.id)
    .select("role")
    .lean();
  if (currentUser?.role !== "admin") {
    redirect("/auth/login");
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 ml-4">
      <MobileSidebarWrapper>
        <AdminSidebar user={session.user} />
      </MobileSidebarWrapper>
      <main className="flex-1 min-w-0 p-4 lg:pl-60 lg:p-8 pt-16 lg:pt-8 h-screen overflow-y-auto">
        {children}
      </main>
    </div>
  );
}
