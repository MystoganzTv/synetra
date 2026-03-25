import { MarketingPageHero } from "@/components/marketing/marketing-page-hero";
import { MarketingShell } from "@/components/marketing/marketing-shell";
import { Card, CardContent } from "@/components/ui/card";

export default async function PrivacyPage() {
  return (
    <MarketingShell>
      <div className="space-y-6">
        <MarketingPageHero
          eyebrow="Privacidad"
          title="Resumen de privacidad de Synetra."
          description="Esta pagina resume de forma general como deberia comunicarse el tratamiento de informacion del sitio y del producto. Debe revisarse y aprobarse legalmente antes de uso contractual."
        />

        <Card className="bg-white/78">
          <CardContent className="space-y-5 p-6 text-sm leading-8 text-muted-foreground">
            <p>
              Synetra esta orientado a operaciones de salud conductual. La politica publica de
              privacidad debe explicar que informacion se recopila, como se utiliza y como pueden
              ejercerse solicitudes relacionadas con privacidad y datos.
            </p>
            <p>
              Antes de utilizar esta pagina como documento definitivo para onboarding real, debe
              sustituirse por una politica revisada que refleje practicas reales de datos, servicios
              de terceros, metodos de contacto y politicas de retencion.
            </p>
          </CardContent>
        </Card>
      </div>
    </MarketingShell>
  );
}
