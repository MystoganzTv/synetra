import Link from "next/link";
import {
  CalendarDays,
  CheckCircle2,
  Clock3,
  Mail,
  MessageSquareText,
  Send,
} from "lucide-react";

import { MarketingPageHero } from "@/components/marketing/marketing-page-hero";
import { MarketingShell } from "@/components/marketing/marketing-shell";
import { Button, tactilePressClassName } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

const salesEmail = "ventas@synetra.app";
const calendlyUrl = process.env.CALENDLY_URL ?? process.env.NEXT_PUBLIC_CALENDLY_URL ?? "";

export default async function ContactPage({
  searchParams,
}: {
  searchParams?: Promise<{ submitted?: string; error?: string }>;
}) {
  const params = await (searchParams ?? Promise.resolve({} as { submitted?: string; error?: string }));
  const submitted = params.submitted === "1";
  const invalidSubmission = params.error === "invalid";
  const unavailableSubmission = params.error === "unavailable";

  return (
    <MarketingShell>
      <div className="space-y-6">
        <MarketingPageHero
          eyebrow="Contacto"
          title="Agenda una demo y conversemos sobre tu operación."
          description="Cuéntanos cómo funciona hoy tu práctica y te mostramos cómo Synetra puede conectar programación, documentación, facturación y cumplimiento en un solo flujo operativo."
        />

        <div className="grid gap-4 lg:grid-cols-[1.08fr_0.92fr]">
          <Card className="bg-white/78">
            <CardContent className="space-y-5 p-6">
              {submitted ? (
                <div className="space-y-5">
                  <div className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-100 text-emerald-600">
                    <CheckCircle2 className="h-6 w-6" />
                  </div>
                  <div className="space-y-2">
                    <h2 className="text-2xl font-semibold tracking-tight text-foreground">
                      Tu solicitud ya quedó registrada.
                    </h2>
                    <p className="text-sm leading-7 text-muted-foreground">
                      Gracias por compartir tu contexto. El equipo comercial de Synetra ya tiene
                      tu información y podrá preparar una conversación más útil para tu operación.
                    </p>
                  </div>

                  <div className="grid gap-3 md:grid-cols-2">
                    <div className="rounded-[22px] border border-border bg-white/80 p-4">
                      <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">
                        Siguiente paso
                      </p>
                      <p className="mt-2 font-semibold text-foreground">
                        Revisaremos tu solicitud y prioridades.
                      </p>
                    </div>
                    <div className="rounded-[22px] border border-border bg-white/80 p-4">
                      <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">
                        Tiempo típico
                      </p>
                      <p className="mt-2 font-semibold text-foreground">
                        Respuesta en un día hábil.
                      </p>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-3">
                    {calendlyUrl ? (
                      <Button asChild className={`hover:brightness-[1.03] ${tactilePressClassName}`}>
                        <a href={calendlyUrl} target="_blank" rel="noreferrer">
                          Agendar llamada
                          <CalendarDays className="h-4 w-4" />
                        </a>
                      </Button>
                    ) : (
                      <Button asChild className={`hover:brightness-[1.03] ${tactilePressClassName}`}>
                        <a href={`mailto:${salesEmail}?subject=Seguimiento%20de%20demo%20Synetra`}>
                          Continuar por email
                          <Mail className="h-4 w-4" />
                        </a>
                      </Button>
                    )}
                    <Button
                      asChild
                      variant="outline"
                      className={`hover:brightness-[1.02] ${tactilePressClassName}`}
                    >
                      <Link href="/features">Ver funciones</Link>
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="space-y-5">
                  <div className="space-y-2">
                    <h2 className="text-2xl font-semibold tracking-tight text-foreground">
                      Cuéntanos sobre tu equipo
                    </h2>
                    <p className="text-sm leading-7 text-muted-foreground">
                      Registramos tu interés dentro del sistema para que el seguimiento no dependa
                      solo de correo. Así la demo parte de tu contexto real.
                    </p>
                  </div>

                  {invalidSubmission ? (
                    <div className="rounded-[22px] border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
                      Revisa los campos obligatorios e intenta enviarlo nuevamente.
                    </div>
                  ) : null}

                  {unavailableSubmission ? (
                    <div className="rounded-[22px] border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
                      No pudimos registrar tu solicitud ahora mismo. Intenta de nuevo o escribe a{" "}
                      <a href={`mailto:${salesEmail}`} className="font-semibold underline underline-offset-2">
                        {salesEmail}
                      </a>
                      .
                    </div>
                  ) : null}

                  <form action="/api/contact" method="post" className="space-y-4">
                    <div className="grid gap-4 md:grid-cols-2">
                      <div className="space-y-2">
                        <label htmlFor="fullName" className="text-sm font-medium text-foreground">
                          Nombre completo
                        </label>
                        <Input id="fullName" name="fullName" placeholder="Ana Martínez" required />
                      </div>
                      <div className="space-y-2">
                        <label htmlFor="workEmail" className="text-sm font-medium text-foreground">
                          Email de trabajo
                        </label>
                        <Input
                          id="workEmail"
                          name="workEmail"
                          type="email"
                          placeholder="ana@tuclinica.com"
                          required
                        />
                      </div>
                    </div>

                    <div className="grid gap-4 md:grid-cols-2">
                      <div className="space-y-2">
                        <label htmlFor="organization" className="text-sm font-medium text-foreground">
                          Organización
                        </label>
                        <Input
                          id="organization"
                          name="organization"
                          placeholder="Clínica Horizonte ABA"
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <label htmlFor="role" className="text-sm font-medium text-foreground">
                          Cargo
                        </label>
                        <Input id="role" name="role" placeholder="Directora de operaciones" />
                      </div>
                    </div>

                    <div className="grid gap-4 md:grid-cols-2">
                      <div className="space-y-2">
                        <label htmlFor="phone" className="text-sm font-medium text-foreground">
                          Teléfono
                        </label>
                        <Input id="phone" name="phone" placeholder="+1 (555) 555-0199" />
                      </div>
                      <div className="space-y-2">
                        <label htmlFor="teamSize" className="text-sm font-medium text-foreground">
                          Tamaño del equipo
                        </label>
                        <Input id="teamSize" name="teamSize" placeholder="25-50 personas" />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <label htmlFor="message" className="text-sm font-medium text-foreground">
                        Qué quieres resolver
                      </label>
                      <Textarea
                        id="message"
                        name="message"
                        placeholder="Queremos mejorar visibilidad operativa, autorizaciones y preparación de facturación."
                        className="min-h-32"
                        required
                      />
                    </div>

                    <div className="flex flex-wrap gap-3">
                      <Button type="submit" className={`hover:brightness-[1.03] ${tactilePressClassName}`}>
                        Enviar solicitud
                        <Send className="h-4 w-4" />
                      </Button>
                      <Button
                        asChild
                        variant="outline"
                        className={`hover:brightness-[1.02] ${tactilePressClassName}`}
                      >
                        <Link href="/features">Ver funciones</Link>
                      </Button>
                    </div>
                  </form>
                </div>
              )}
            </CardContent>
          </Card>

          <Card className="bg-white/78">
            <CardContent className="space-y-5 p-6">
              <h2 className="text-2xl font-semibold tracking-tight text-foreground">
                Qué cubrimos en la demo
              </h2>

              <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-1">
                {[
                  {
                    icon: CalendarDays,
                    title: "Programación y capacidad",
                    body: "Cómo se ordenan agenda, servicios, equipos y prioridades del día.",
                  },
                  {
                    icon: MessageSquareText,
                    title: "Documentación y cumplimiento",
                    body: "Qué bloquea notas, firmas, formularios y revisiones operativas.",
                  },
                  {
                    icon: Clock3,
                    title: "Facturación y seguimiento",
                    body: "Qué tan lista está cada sesión para pasar a reclamación sin retrasos.",
                  },
                  {
                    icon: Mail,
                    title: "Implementación",
                    body: "Migración, estructura de datos y plan de arranque según tu operación.",
                  },
                ].map(({ icon: Icon, title, body }) => (
                  <div
                    key={title}
                    className="flex items-start gap-4 rounded-[22px] border border-border bg-white/80 p-4"
                  >
                    <Icon className="mt-0.5 h-5 w-5 text-primary" />
                    <div>
                      <p className="font-semibold text-foreground">{title}</p>
                      <p className="mt-1 text-sm leading-6 text-muted-foreground">{body}</p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="rounded-[22px] border border-border bg-accent/40 p-4 text-sm leading-7 text-muted-foreground">
                {calendlyUrl ? (
                  <>
                    Si prefieres saltar directo a agenda, usa{" "}
                    <a
                      href={calendlyUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="font-medium text-primary hover:underline"
                    >
                      nuestro enlace de calendario
                    </a>
                    .
                  </>
                ) : (
                  <>
                    Si ya sabes que quieres avanzar, también puedes escribir a{" "}
                    <a href={`mailto:${salesEmail}`} className="font-medium text-primary hover:underline">
                      {salesEmail}
                    </a>
                    .
                  </>
                )}{" "}
                Si ya tienes acceso al producto, entra por{" "}
                <Link href="/login" className="font-medium text-primary hover:underline">
                  iniciar sesión
                </Link>
                .
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </MarketingShell>
  );
}
