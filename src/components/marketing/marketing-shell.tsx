import Link from "next/link";

import { SynetraLogo } from "@/components/brand/synetra-logo";
import { Button } from "@/components/ui/button";
import { getAuthSession } from "@/lib/auth";
import { marketingNavigation } from "@/lib/marketing-content";

export async function MarketingShell({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getAuthSession();

  return (
    <main className="relative min-h-screen overflow-hidden bg-background text-foreground">
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute left-[-8%] top-[-12%] h-[28rem] w-[28rem] rounded-full bg-[#67e3ff]/14 blur-3xl" />
        <div className="absolute right-[-10%] top-[-2%] h-[26rem] w-[26rem] rounded-full bg-[#8a6cff]/14 blur-3xl" />
        <div className="absolute left-[30%] top-[34%] h-[18rem] w-[18rem] rounded-full bg-[#3158ff]/8 blur-3xl" />
      </div>

      <div className="relative mx-auto flex min-h-screen w-full max-w-[1380px] flex-col px-5 py-6 sm:px-8 lg:px-10">
        <header className="flex flex-col gap-4 rounded-[30px] border border-white/80 bg-white/70 px-5 py-4 shadow-[0_20px_50px_-32px_rgba(18,27,79,0.25)] backdrop-blur lg:flex-row lg:items-center lg:justify-between">
          <div className="flex items-center justify-between gap-4">
            <Link href="/">
              <SynetraLogo compact />
            </Link>
          </div>

          <nav className="flex flex-wrap gap-2 lg:justify-center">
            {marketingNavigation.map((item) => (
              <Button key={item.href} asChild variant="ghost" className="rounded-full">
                <Link href={item.href}>{item.label}</Link>
              </Button>
            ))}
          </nav>

          <div className="flex flex-wrap gap-3">
            <Button asChild variant="ghost">
              <Link href="/login">Sign in</Link>
            </Button>
            <Button asChild>
              <Link href={session ? "/dashboard" : "/login"}>
                {session ? "Open command center" : "Request access"}
              </Link>
            </Button>
          </div>
        </header>

        <div className="flex-1 py-8 lg:py-10">{children}</div>

        <footer className="mt-10 rounded-[30px] border border-white/80 bg-white/72 px-6 py-8 shadow-[0_20px_50px_-32px_rgba(18,27,79,0.2)] backdrop-blur">
          <div className="grid gap-8 lg:grid-cols-[1.1fr_0.9fr_0.9fr_0.9fr]">
            <div className="space-y-4">
              <SynetraLogo compact />
              <p className="max-w-sm text-sm leading-7 text-muted-foreground">
                Synetra is a behavioral health operations platform built to connect scheduling,
                documentation, authorizations, billing readiness, and compliance in one system.
              </p>
            </div>

            <div className="space-y-3">
              <p className="text-sm font-semibold text-foreground">Platform</p>
              <div className="flex flex-col gap-2 text-sm text-muted-foreground">
                <Link href="/features">Features</Link>
                <Link href="/solutions">Who We Serve</Link>
                <Link href="/pricing">Pricing</Link>
              </div>
            </div>

            <div className="space-y-3">
              <p className="text-sm font-semibold text-foreground">Resources</p>
              <div className="flex flex-col gap-2 text-sm text-muted-foreground">
                <Link href="/resources">Resources</Link>
                <Link href="/faq">FAQ</Link>
                <Link href="/about">About</Link>
              </div>
            </div>

            <div className="space-y-3">
              <p className="text-sm font-semibold text-foreground">Legal</p>
              <div className="flex flex-col gap-2 text-sm text-muted-foreground">
                <Link href="/legal/privacy">Privacy</Link>
                <Link href="/legal/terms">Terms</Link>
                <Link href="/login">Product access</Link>
              </div>
            </div>
          </div>
        </footer>
      </div>
    </main>
  );
}
