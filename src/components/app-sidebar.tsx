"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  CalendarDays,
  ClipboardList,
  ClipboardPen,
  BarChart3,
  Files,
  FolderKanban,
  LayoutDashboard,
  ShieldAlert,
  UsersRound,
  Users,
} from "lucide-react";

import { SynetraLogo, SynetraMark } from "@/components/brand/synetra-logo";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

const roleLabels: Record<string, string> = {
  "Platform Admin": "Administrador de plataforma",
  "Revenue Operations": "Operaciones de ingresos",
  TCM: "Care manager / TCM",
};

const navigation = [
  { href: "/dashboard", label: "Panel", icon: LayoutDashboard },
  { href: "/clients", label: "Clientes", icon: UsersRound },
  { href: "/cases", label: "Casos", icon: ClipboardList },
  { href: "/groups", label: "Grupos", icon: Users },
  { href: "/calendar", label: "Calendario", icon: CalendarDays },
  { href: "/documents", label: "Documentos", icon: FolderKanban },
  { href: "/forms", label: "Formularios", icon: Files },
  { href: "/progress-notes", label: "Notas", icon: ClipboardPen },
  { href: "/compliance", label: "Cumplimiento", icon: ShieldAlert },
  { href: "/reports", label: "Reportes", icon: BarChart3 },
];

export function AppSidebar({
  summary,
  user,
}: {
  summary: {
    activeClients: number;
    unsignedNotes: number;
    expiringAuthorizations: number;
    claimsOnHold: number;
    openCompliance: number;
  };
  user: {
    name: string;
    role: string;
    email: string;
  };
}) {
  const pathname = usePathname();

  return (
    <>
      <div className="sticky top-0 z-30 border-b border-border bg-white/80 px-4 py-4 backdrop-blur lg:hidden">
        <div className="flex items-center justify-between gap-3">
          <div className="flex min-w-0 items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-[#1f2e68] bg-[radial-gradient(circle_at_32%_30%,rgba(93,231,255,0.18),transparent_32%),linear-gradient(145deg,#08133d_0%,#0e1e61_60%,#162f90_100%)] shadow-lg shadow-[#1a2466]/20">
              <SynetraMark className="h-7 w-7" />
            </div>
            <div>
              <p className="text-[11px] uppercase tracking-[0.28em] text-muted-foreground">
                Capa operativa
              </p>
              <h1 className="text-base font-semibold text-foreground">
                Operaciones
              </h1>
            </div>
          </div>
          <Badge variant="success">{summary.activeClients} clientes activos</Badge>
        </div>
        <div className="mt-4 flex gap-2 overflow-x-auto pb-1">
          {navigation.map(({ href, label, icon: Icon }) => {
            const isActive =
              pathname === href || (href !== "/dashboard" && pathname.startsWith(href));

            return (
              <Link
                key={href}
                href={href}
                className={cn(
                  "flex items-center gap-2 rounded-full border px-4 py-2 text-sm font-medium whitespace-nowrap transition-colors",
                  isActive
                    ? "border-[#243fb2] bg-[linear-gradient(135deg,#172454_0%,#2540b8_52%,#355cff_100%)] !text-white shadow-lg shadow-[#243fb2]/30 [&_*]:!text-white"
                    : "border-border bg-white/75 text-muted-foreground hover:border-[#cfdbff] hover:bg-[#ebf0ff] hover:text-[#132257]",
                )}
              >
                <Icon className="h-4 w-4" />
                {label}
              </Link>
            );
          })}
        </div>
      </div>

      <aside className="hidden w-[310px] shrink-0 self-start border-r border-b border-border bg-sidebar/90 px-6 py-7 backdrop-blur lg:flex lg:min-h-screen lg:flex-col">
        <div className="space-y-3">
          <div className="overflow-hidden rounded-[28px] border border-[#1f2e68] bg-[radial-gradient(circle_at_24%_38%,rgba(91,231,255,0.16),transparent_26%),radial-gradient(circle_at_68%_38%,rgba(226,121,255,0.16),transparent_28%),linear-gradient(145deg,#071238_0%,#0d1c57_55%,#152f93_100%)] px-5 py-5 shadow-[0_22px_40px_-28px_rgba(27,41,102,0.65)]">
            <SynetraLogo inverse compact className="max-w-full justify-start" />
          </div>
          <div>
            <p className="text-xs uppercase tracking-[0.34em] text-muted-foreground">
              Capa operativa
            </p>
            <h1 className="mt-2 text-2xl font-semibold tracking-tight text-foreground">
              Operaciones de salud conductual
            </h1>
            <p className="mt-2 text-sm leading-6 text-muted-foreground">
              Programación inteligente, documentación, preparación de facturación y cumplimiento dentro de una sola capa operativa.
            </p>
          </div>
        </div>

        <div className="mt-8 flex flex-1 flex-col">
          <nav className="space-y-2">
            {navigation.map(({ href, label, icon: Icon }) => {
              const isActive =
                pathname === href || (href !== "/dashboard" && pathname.startsWith(href));

              return (
                <Link
                  key={href}
                  href={href}
                  className={cn(
                  "flex items-center justify-between rounded-2xl px-4 py-3 text-sm font-medium transition-all",
                  isActive
                    ? "bg-[linear-gradient(135deg,#172454_0%,#2540b8_55%,#355cff_100%)] !text-white shadow-lg shadow-[#243fb2]/30 [&_*]:!text-white"
                    : "text-muted-foreground hover:bg-[#ebf0ff] hover:text-[#132257] hover:shadow-[0_14px_32px_-22px_rgba(36,63,178,0.38)]",
                )}
              >
                  <span className="flex items-center gap-3">
                    <Icon className="h-4 w-4" />
                    {label}
                  </span>
                  {href === "/clients" ? (
                    <span className="text-xs">{summary.activeClients}</span>
                  ) : null}
                </Link>
              );
            })}
          </nav>

          <div className="mt-20 h-px w-full bg-border/90" />

          <div className="mt-8 rounded-[28px] border border-border bg-white/82 p-5 shadow-[0_18px_45px_-30px_rgba(21,31,84,0.22)]">
            <p className="text-xs uppercase tracking-[0.28em] text-muted-foreground">
              Estado del flujo
            </p>
            <div className="mt-4 space-y-4 text-sm">
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Notas sin firma</span>
                <span className="font-semibold text-foreground">
                  {summary.unsignedNotes}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Autorizaciones en riesgo</span>
                <span className="font-semibold text-foreground">
                  {summary.expiringAuthorizations}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Reclamos en espera</span>
                <span className="font-semibold text-foreground">
                  {summary.claimsOnHold}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Cumplimiento abierto</span>
                <span className="font-semibold text-foreground">
                  {summary.openCompliance}
                </span>
              </div>
            </div>
          </div>

          <div className="mt-5 rounded-[28px] border border-[#1d2f83] bg-[linear-gradient(145deg,#09123a_0%,#132a85_62%,#314ff0_100%)] px-5 py-6 text-primary-foreground shadow-[0_18px_45px_-32px_rgba(22,35,98,0.58)]">
            <p className="text-sm font-semibold">Base lista para producción</p>
            <p className="mt-2 text-sm leading-6 text-primary-foreground/80">
              Esquema respaldado por Prisma, jerarquía realista de salud conductual y estructura de rutas lista para flujos operativos reales.
            </p>
          </div>

          <div className="mt-5 rounded-[28px] border border-border bg-white/82 p-5 shadow-[0_18px_45px_-30px_rgba(21,31,84,0.18)]">
            <p className="text-xs uppercase tracking-[0.24em] text-muted-foreground">
              Sesión activa
            </p>
            <p className="mt-3 text-sm font-semibold text-foreground">{user.name}</p>
            <p className="mt-1 text-sm text-muted-foreground">
              {roleLabels[user.role] ?? user.role}
            </p>
            <p className="mt-1 text-sm text-muted-foreground">{user.email}</p>
            <form action="/api/auth/logout" method="post" className="mt-4">
              <button
                type="submit"
                className="w-full rounded-2xl border border-border bg-accent px-4 py-2.5 text-sm font-semibold text-accent-foreground transition-colors hover:bg-accent/80"
              >
                Cerrar sesión
              </button>
            </form>
          </div>
        </div>
      </aside>
    </>
  );
}
