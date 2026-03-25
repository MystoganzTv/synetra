import { MarketingPageHero } from "@/components/marketing/marketing-page-hero";
import { MarketingShell } from "@/components/marketing/marketing-shell";
import { Card, CardContent } from "@/components/ui/card";
import { resourceCollections } from "@/lib/marketing-content";

export default async function ResourcesPage() {
  return (
    <MarketingShell>
      <div className="space-y-6">
        <MarketingPageHero
          eyebrow="Recursos"
          title="Recursos y material comercial que fortalecen la conversacion de compra."
          description="Un sitio serio necesita mas que un hero bonito. Necesita guias, explicaciones de workflow, notas de implementacion y material que eduque al comprador."
        />

        <div className="grid gap-4">
          {resourceCollections.map((collection) => (
            <Card key={collection.title} className="bg-white/78">
              <CardContent className="space-y-4 p-6">
                <div className="space-y-2">
                  <h2 className="text-2xl font-semibold tracking-tight text-foreground">
                    {collection.title}
                  </h2>
                  <p className="text-sm leading-7 text-muted-foreground">
                    {collection.description}
                  </p>
                </div>
                <div className="grid gap-3 md:grid-cols-3">
                  {collection.items.map((item) => (
                    <div key={item} className="rounded-[22px] border border-border bg-white/72 p-5">
                      <p className="font-semibold text-foreground">{item}</p>
                      <p className="mt-2 text-sm leading-7 text-muted-foreground">
                        Pensado para que el sitio publico se sienta como una categoria seria y no como un one-pager improvisado.
                      </p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </MarketingShell>
  );
}
