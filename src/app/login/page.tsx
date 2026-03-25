import Link from "next/link";
import { redirect } from "next/navigation";
import { ArrowLeft, ArrowRight, LockKeyhole, ShieldCheck, Sparkles } from "lucide-react";

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

              <Button
                type="submit"
                size="lg"
                className="h-12 w-full cursor-pointer rounded-2xl bg-[linear-gradient(180deg,#4060ff_0%,#2c49d8_100%)] shadow-[0_16px_32px_-18px_rgba(36,63,178,0.75),inset_0_1px_0_rgba(255,255,255,0.24)] transition-[transform,box-shadow,filter] duration-150 hover:-translate-y-0.5 hover:brightness-[1.03] hover:shadow-[0_20px_36px_-18px_rgba(36,63,178,0.82),inset_0_1px_0_rgba(255,255,255,0.26)] active:translate-y-[2px] active:scale-[0.992] active:brightness-95 active:shadow-[0_8px_18px_-14px_rgba(20,34,87,0.8),inset_0_4px_10px_rgba(15,27,88,0.34)]"
              >
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

            <Link
              href="/"
              className="flex items-center justify-center gap-2 rounded-[18px] border border-[#cdd9ff] bg-[#eef3ff] px-4 py-3 text-sm font-semibold text-[#1b2b67] transition-colors hover:border-[#b8c8ff] hover:bg-[#e6edff] hover:text-[#142257]"
            >
              <ArrowLeft className="h-4 w-4" />
              Volver al inicio
            </Link>
          </CardContent>
        </Card>
      </div>
    </main>
  );
}
