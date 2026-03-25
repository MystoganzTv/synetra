import Link from "next/link";
import { redirect } from "next/navigation";
import { LockKeyhole, ShieldCheck, Sparkles } from "lucide-react";

import { LoginForm } from "@/components/auth/login-form";
import { SynetraLogo } from "@/components/brand/synetra-logo";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
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
              Acceso seguro de operadores
            </p>
            <h1 className="max-w-2xl text-5xl font-semibold tracking-tight text-foreground">
              Entra al centro operativo de Synetra.
            </h1>
            <p className="max-w-2xl text-lg leading-8 text-muted-foreground">
              Accede a programación, operaciones de clientes, validación de sesiones,
              preparación de facturación y colas de cumplimiento desde una sola superficie.
            </p>
          </div>

          <div className="grid gap-4 sm:grid-cols-3">
            <div className="rounded-[24px] border border-border bg-white/76 p-5">
              <ShieldCheck className="h-5 w-5 text-primary" />
              <p className="mt-3 font-semibold text-foreground">Rutas protegidas</p>
              <p className="mt-2 text-sm leading-6 text-muted-foreground">
                Los módulos internos quedan protegidos detrás de una sesión firmada.
              </p>
            </div>
            <div className="rounded-[24px] border border-border bg-white/76 p-5">
              <LockKeyhole className="h-5 w-5 text-primary" />
              <p className="mt-3 font-semibold text-foreground">Sesión persistente</p>
              <p className="mt-2 text-sm leading-6 text-muted-foreground">
                El ingreso y la salida ya se comportan como un flujo real de producto.
              </p>
            </div>
            <div className="rounded-[24px] border border-border bg-white/76 p-5">
              <Sparkles className="h-5 w-5 text-primary" />
              <p className="mt-3 font-semibold text-foreground">
                {showDemoAccess ? "Listo para demo" : "Acceso real"}
              </p>
              <p className="mt-2 text-sm leading-6 text-muted-foreground">
                {showDemoAccess
                  ? "Usa los accesos de demostración mientras habilitamos la capa completa de identidad."
                  : "Ingresa con una cuenta real respaldada por la base de datos de este workspace."}
              </p>
            </div>
          </div>
        </div>

        <Card className="relative z-10 overflow-hidden border-none bg-[linear-gradient(145deg,rgba(255,255,255,0.82)_0%,rgba(248,250,255,0.94)_100%)] shadow-[0_30px_80px_-42px_rgba(25,38,104,0.3)]">
          <CardHeader className="px-7 pt-7 sm:px-8 sm:pt-8">
            <CardTitle className="text-2xl">Iniciar sesión</CardTitle>
            <CardDescription>
              {showDemoAccess
                ? "Usa un perfil de demostración para entrar al producto."
                : "Usa tu cuenta operativa de Synetra para entrar al producto."}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6 px-7 pb-7 sm:px-8 sm:pb-8">
            <LoginForm error={error} showDemoAccess={showDemoAccess} demoUsers={demoUsers} />
          </CardContent>
        </Card>
      </div>
    </main>
  );
}
