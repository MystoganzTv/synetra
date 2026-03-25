import { AppSidebar } from "@/components/app-sidebar";
import { requireAuthSession } from "@/lib/auth";
import { getSidebarSummary } from "@/lib/data";

export const dynamic = "force-dynamic";

export default async function AppLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const session = await requireAuthSession();
  const summary = await getSidebarSummary();

  return (
    <div className="min-h-screen lg:flex">
      <AppSidebar
        summary={summary}
        user={{
          name: session.name,
          role: session.role,
          email: session.email,
        }}
      />
      <main className="relative flex-1 px-4 pb-10 pt-4 sm:px-6 lg:px-10 lg:py-8">
        <div className="pointer-events-none absolute inset-0 overflow-hidden">
          <div className="absolute left-[-10%] top-[-12%] h-80 w-80 rounded-full bg-[#67e3ff]/18 blur-3xl" />
          <div className="absolute right-[4%] top-[6%] h-64 w-64 rounded-full bg-[#7d6bff]/16 blur-3xl" />
        </div>
        <div className="relative mx-auto w-full max-w-[1500px]">{children}</div>
      </main>
    </div>
  );
}
