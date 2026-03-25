import Link from "next/link";
import { redirect } from "next/navigation";
import { ArrowRight, LockKeyhole, ShieldCheck, Sparkles } from "lucide-react";

import { SynetraLogo } from "@/components/brand/synetra-logo";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { isDemoModeEnabled } from "@/lib/data-source";
import { getAuthSession, getDemoUsers } from "@/lib/auth";

export default async function LoginPage({
  searchParams,
}: {
  searchParams?: Promise<{ error?: string }>;
}) {
  const [session, params] = await Promise.all([
    getAuthSession(),
    searchParams ?? Promise.resolve({} as { error?: string }),
  ]);

  if (session) {
    redirect("/dashboard");
  }

  const error = params.error === "invalid_credentials";
  const showDemoAccess = isDemoModeEnabled();
  const demoUsers = showDemoAccess ? getDemoUsers() : [];

  return (
    <main className="relative min-h-screen overflow-hidden bg-background text-foreground">
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute left-[-8%] top-[-10%] h-[28rem] w-[28rem] rounded-full bg-[#67e3ff]/18 blur-3xl" />
        <div className="absolute right-[-6%] top-[10%] h-[26rem] w-[26rem] rounded-full bg-[#8a6cff]/18 blur-3xl" />
      </div>

      <div className="relative mx-auto grid min-h-screen w-full max-w-[1380px] items-center gap-8 px-5 py-8 sm:px-8 lg:grid-cols-[1.02fr_0.98fr] lg:px-10">
        <div className="relative z-0 space-y-8">
          <Link href="/" className="inline-flex max-w-full">
            <SynetraLogo compact className="max-w-full" />
          </Link>

          <div className="space-y-4">
            <p className="text-xs font-medium uppercase tracking-[0.34em] text-muted-foreground">
              Secure operator access
            </p>
            <h1 className="max-w-2xl text-5xl font-semibold tracking-tight text-foreground">
              Sign in to the Synetra command center.
            </h1>
            <p className="max-w-2xl text-lg leading-8 text-muted-foreground">
              Access scheduling, client operations, session validation, billing readiness, and compliance queues from a single operating surface.
            </p>
          </div>

          <div className="grid gap-4 sm:grid-cols-3">
            <div className="rounded-[24px] border border-border bg-white/76 p-5">
              <ShieldCheck className="h-5 w-5 text-primary" />
              <p className="mt-3 font-semibold text-foreground">Protected routes</p>
              <p className="mt-2 text-sm leading-6 text-muted-foreground">
                Internal modules are gated behind a signed session cookie.
              </p>
            </div>
            <div className="rounded-[24px] border border-border bg-white/76 p-5">
              <LockKeyhole className="h-5 w-5 text-primary" />
              <p className="mt-3 font-semibold text-foreground">Session-based</p>
              <p className="mt-2 text-sm leading-6 text-muted-foreground">
                Login and logout already behave like a real app flow.
              </p>
            </div>
            <div className="rounded-[24px] border border-border bg-white/76 p-5">
              <Sparkles className="h-5 w-5 text-primary" />
              <p className="mt-3 font-semibold text-foreground">
                {showDemoAccess ? "Demo-ready" : "Acceso real"}
              </p>
              <p className="mt-2 text-sm leading-6 text-muted-foreground">
                {showDemoAccess
                  ? "Use the provided access profiles while we wire a full identity layer."
                  : "Sign in with a database-backed operator account for this workspace."}
              </p>
            </div>
          </div>
        </div>

        <Card className="relative z-10 overflow-hidden border-none bg-[linear-gradient(145deg,rgba(255,255,255,0.82)_0%,rgba(248,250,255,0.94)_100%)] shadow-[0_30px_80px_-42px_rgba(25,38,104,0.3)]">
          <CardHeader className="px-7 pt-7 sm:px-8 sm:pt-8">
            <CardTitle className="text-2xl">Login</CardTitle>
            <CardDescription>
              {showDemoAccess
                ? "Use a demo operator profile to enter the product."
                : "Use your Synetra operator account to enter the product."}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6 px-7 pb-7 sm:px-8 sm:pb-8">
            <form action="/api/auth/login" method="post" className="space-y-4">
              <div className="space-y-2">
                <label htmlFor="email" className="text-sm font-medium text-foreground">
                  Email
                </label>
                <Input id="email" name="email" type="email" placeholder="admin@synetra.app" required />
              </div>
              <div className="space-y-2">
                <label htmlFor="password" className="text-sm font-medium text-foreground">
                  Password
                </label>
                <Input id="password" name="password" type="password" placeholder="Enter password" required />
              </div>

              {error ? (
                <div className="rounded-[20px] border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
                  {showDemoAccess
                    ? "The email or password is incorrect for this demo workspace."
                    : "The email or password is incorrect for this workspace."}
                </div>
              ) : null}

              <Button type="submit" size="lg" className="h-12 w-full rounded-2xl">
                Sign in
                <ArrowRight className="h-4 w-4" />
              </Button>
            </form>

            {showDemoAccess ? (
              <div className="rounded-[24px] border border-border bg-accent/50 p-5">
                <p className="text-xs uppercase tracking-[0.24em] text-muted-foreground">
                  Demo access
                </p>
                <div className="mt-4 space-y-3">
                  {demoUsers.map((user) => (
                    <div key={user.email} className="rounded-[20px] border border-border bg-white/80 p-4">
                      <p className="font-semibold text-foreground">{user.role}</p>
                      <p className="mt-1 text-sm text-muted-foreground">{user.name}</p>
                      <p className="mt-3 text-sm text-foreground">{user.email}</p>
                      <p className="text-sm text-foreground">
                        {user.email === "admin@synetra.app" ? "SynetraDemo!" : "SynetraOps!"}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="rounded-[24px] border border-border bg-accent/50 p-5">
                <p className="text-xs uppercase tracking-[0.24em] text-muted-foreground">
                  Workspace access
                </p>
                <p className="mt-3 text-sm leading-7 text-muted-foreground">
                  If you need an account or credential reset, contact your Synetra workspace administrator.
                </p>
              </div>
            )}

            <p className="text-sm font-medium text-foreground/72">
              Need the public overview instead?{" "}
              <Link
                href="/"
                className="font-semibold text-primary underline decoration-primary/30 underline-offset-4 transition-colors hover:text-primary/80"
              >
                Back to landing page
              </Link>
            </p>
          </CardContent>
        </Card>
      </div>
    </main>
  );
}
