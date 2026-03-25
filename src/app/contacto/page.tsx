import Link from "next/link";
import { CalendarDays, Mail, MessageSquareText } from "lucide-react";

import { MarketingPageHero } from "@/components/marketing/marketing-page-hero";
import { MarketingShell } from "@/components/marketing/marketing-shell";
import { Button, tactilePressClassName } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

const salesEmail = "ventas@synetra.app";

export default async function ContactPage() {
  return (
    <MarketingShell>
      <div className="space-y-6">
        <MarketingPageHero
          eyebrow="Contacto"
          title="Agenda una demo y conversemos sobre tu operación."
          description="Si estás evaluando Synetra para tu práctica, podemos ayudarte a revisar flujo clínico, facturación, documentación y visibilidad operativa."
        />

        <div className="grid gap-4 lg:grid-cols-[1.1fr_0.9fr]">
          <Card className="bg-white/78">
            <CardContent className="space-y-5 p-6">
              <div className="space-y-2">
                <h2 className="text-2xl font-semibold tracking-tight text-foreground">
                  Qué cubrimos en la demo
                </h2>
                <p className="text-sm leading-7 text-muted-foreground">
                  Te mostramos cómo Synetra conecta programación, autorizaciones, notas,
                  cumplimiento y preparación de facturación dentro de una sola capa operativa.
                </p>
              </div>

              <div className="grid gap-3 md:grid-cols-2">
                {[
                  "Vista del dashboard y prioridades del día",
                  "Recorrido por clientes, casos y servicios",
                  "Validación de sesiones y billing readiness",
                  "Documentos, formularios y cumplimiento",
                ].map((item) => (
                  <div
                    key={item}
                    className="rounded-[22px] border border-border bg-white/80 px-4 py-4 text-sm text-foreground"
                  >
                    {item}
                  </div>
                ))}
              </div>

              <div className="flex flex-wrap gap-3">
                <Button asChild className={`hover:brightness-[1.03] ${tactilePressClassName}`}>
                  <a href={`mailto:${salesEmail}?subject=Solicitar%20demo%20de%20Synetra`}>
                    Solicitar demo por email
                  </a>
                </Button>
                <Button asChild variant="outline" className={`hover:brightness-[1.02] ${tactilePressClassName}`}>
                  <Link href="/features">Ver funciones</Link>
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white/78">
            <CardContent className="space-y-5 p-6">
              <h2 className="text-2xl font-semibold tracking-tight text-foreground">
                Canales de contacto
              </h2>

              <div className="space-y-3">
                <a
                  href={`mailto:${salesEmail}`}
                  className="flex items-start gap-4 rounded-[22px] border border-border bg-white/80 p-4 transition-colors hover:bg-white"
                >
                  <Mail className="mt-0.5 h-5 w-5 text-primary" />
                  <div>
                    <p className="font-semibold text-foreground">Email comercial</p>
                    <p className="mt-1 text-sm text-muted-foreground">{salesEmail}</p>
                  </div>
                </a>

                <div className="flex items-start gap-4 rounded-[22px] border border-border bg-white/80 p-4">
                  <CalendarDays className="mt-0.5 h-5 w-5 text-primary" />
                  <div>
                    <p className="font-semibold text-foreground">Demo guiada</p>
                    <p className="mt-1 text-sm text-muted-foreground">
                      Coordinamos una sesión enfocada en tu flujo operativo y tus prioridades.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-4 rounded-[22px] border border-border bg-white/80 p-4">
                  <MessageSquareText className="mt-0.5 h-5 w-5 text-primary" />
                  <div>
                    <p className="font-semibold text-foreground">Alcance de implementación</p>
                    <p className="mt-1 text-sm text-muted-foreground">
                      También podemos hablar de migración, estructura de datos y despliegue.
                    </p>
                  </div>
                </div>
              </div>

              <div className="rounded-[22px] border border-border bg-accent/40 p-4 text-sm leading-7 text-muted-foreground">
                Si ya tienes acceso al producto, entra por <Link href="/login" className="font-medium text-primary hover:underline">Iniciar sesión</Link>.
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </MarketingShell>
  );
}
