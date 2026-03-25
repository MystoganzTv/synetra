import { MarketingPageHero } from "@/components/marketing/marketing-page-hero";
import { MarketingShell } from "@/components/marketing/marketing-shell";
import { Card, CardContent } from "@/components/ui/card";

export default async function TermsPage() {
  return (
    <MarketingShell>
      <div className="space-y-6">
        <MarketingPageHero
          eyebrow="Terminos"
          title="Resumen de terminos de uso de Synetra."
          description="Esta pagina completa la arquitectura publica del sitio, pero debe revisarse y aprobarse legalmente antes de utilizarse como lenguaje contractual definitivo."
        />

        <Card className="bg-white/78">
          <CardContent className="space-y-5 p-6 text-sm leading-8 text-muted-foreground">
            <p>
              El sitio publico de Synetra debe incluir terminos que definan uso aceptable,
              expectativas de acceso, limitaciones, propiedad intelectual y condiciones generales
              de la plataforma.
            </p>
            <p>
              Por ahora esta pagina funciona como resumen informativo. Antes de usarla con clientes
              reales debe sustituirse por una version legal final revisada para produccion.
            </p>
          </CardContent>
        </Card>
      </div>
    </MarketingShell>
  );
}
