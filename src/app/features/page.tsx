import Link from "next/link";

import { MarketingPageHero } from "@/components/marketing/marketing-page-hero";
import { MarketingShell } from "@/components/marketing/marketing-shell";
import { Button, tactilePressClassName } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { featureHighlights } from "@/lib/marketing-content";

export default async function FeaturesPage() {
  return (
    <MarketingShell>
      <div className="space-y-6">
        <MarketingPageHero
          eyebrow="Funciones"
          title="Una plataforma organizada alrededor de la realidad operativa."
          description="Synetra conecta programacion, documentacion, autorizaciones, facturacion y cumplimiento para que cada senal operativa permanezca unida al registro que la genera."
        />

        <div className="grid gap-4 lg:grid-cols-2">
          {featureHighlights.map((item) => (
            <Card key={item.title} className="bg-white/78">
              <CardContent className="space-y-4 p-6">
                <div className="space-y-2">
                  <h2 className="text-2xl font-semibold tracking-tight text-foreground">
                    {item.title}
                  </h2>
                  <p className="text-sm leading-7 text-muted-foreground">{item.description}</p>
                </div>
                <div className="space-y-2">
                  {item.bullets.map((bullet) => (
                    <p key={bullet} className="rounded-[20px] border border-border bg-white/72 px-4 py-3 text-sm text-foreground">
                      {bullet}
                    </p>
                  ))}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <Card className="bg-white/78">
          <CardContent className="flex flex-col gap-4 p-6 lg:flex-row lg:items-center lg:justify-between">
            <div className="space-y-2">
              <p className="text-sm font-semibold text-foreground">
                Ve la arquitectura del producto en accion
              </p>
              <p className="text-sm leading-7 text-muted-foreground">
                Recorre el command center, las paginas de caso, la capa de programacion y el flujo de validacion.
              </p>
            </div>
            <div className="flex flex-wrap gap-3">
              <Button asChild className={`hover:brightness-[1.03] ${tactilePressClassName}`}>
                <Link href="/contacto">Solicitar demo</Link>
              </Button>
              <Button asChild variant="outline" className={`hover:brightness-[1.02] ${tactilePressClassName}`}>
                <Link href="/pricing">Ver enfoque de precios</Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </MarketingShell>
  );
}
