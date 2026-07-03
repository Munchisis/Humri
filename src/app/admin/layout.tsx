import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";
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

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <MobileSidebarWrapper>
        <AdminSidebar user={session.user} />
      </MobileSidebarWrapper>
      <main className="flex-1 min-w-0 p-4 lg:pl-60 lg:p-8 pt-16 lg:pt-8 h-screen overflow-y-auto">
        {children}
      </main>
    </div>
  );
}
