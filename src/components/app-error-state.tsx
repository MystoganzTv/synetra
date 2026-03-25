import Link from "next/link";
import { AlertTriangle, RefreshCcw } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

export function AppErrorState({
  title,
  description,
  primaryHref = "/dashboard",
  primaryLabel = "Volver al panel",
}: {
  title: string;
  description: string;
  primaryHref?: string;
  primaryLabel?: string;
}) {
  return (
    <div className="flex min-h-[60vh] items-center justify-center py-10">
      <Card className="w-full max-w-2xl overflow-hidden border-none bg-[linear-gradient(145deg,rgba(255,255,255,0.9)_0%,rgba(244,247,255,0.98)_100%)] shadow-[0_30px_80px_-42px_rgba(25,38,104,0.3)]">
        <CardContent className="space-y-6 px-8 py-8">
          <div className="inline-flex h-14 w-14 items-center justify-center rounded-3xl bg-rose-50 text-rose-600">
            <AlertTriangle className="h-7 w-7" />
          </div>
          <div className="space-y-3">
            <p className="text-xs uppercase tracking-[0.32em] text-muted-foreground">
              Datos no disponibles
            </p>
            <h1 className="text-3xl font-semibold tracking-tight text-foreground">{title}</h1>
            <p className="text-sm leading-7 text-muted-foreground">{description}</p>
          </div>
          <div className="flex flex-wrap gap-3">
            <Button asChild>
              <Link href={primaryHref}>{primaryLabel}</Link>
            </Button>
            <Button asChild variant="outline">
              <Link href="/reports">
                <RefreshCcw className="h-4 w-4" />
                Abrir reportes
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
