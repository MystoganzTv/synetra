"use client";

import Link from "next/link";

import SynetraLogo from "./synetra-logo";

export default function Footer() {
  return (
    <footer className="border-t border-border/50 bg-card">
      <div className="mx-auto max-w-7xl px-6 py-12">
        <div className="mb-12 grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
          <div>
            <div className="mb-4 flex items-center gap-2">
              <SynetraLogo size={28} />
              <span className="text-sm font-bold tracking-widest">SYNETRA</span>
            </div>
            <p className="text-sm leading-relaxed text-muted-foreground">
              Plataforma ABA moderna y todo en uno para practicas que quieren crecer.
            </p>
          </div>

          <div>
            <h4 className="mb-4 text-sm font-semibold text-foreground">Producto</h4>
            <ul className="space-y-2.5">
              {[
                { label: "Recoleccion de datos", href: "#features" },
                { label: "Programacion", href: "#platform" },
                { label: "Facturacion", href: "#billing" },
                { label: "Cumplimiento", href: "#platform" },
              ].map((item) => (
                <li key={item.label}>
                  <a href={item.href} className="text-sm text-muted-foreground transition-colors hover:text-foreground">
                    {item.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="mb-4 text-sm font-semibold text-foreground">Empresa</h4>
            <ul className="space-y-2.5">
              {[
                { label: "Sobre nosotros", href: "/about" },
                { label: "Para equipos", href: "/solutions" },
                { label: "Recursos", href: "/resources" },
                { label: "Contacto", href: "/contacto" },
              ].map((item) => (
                <li key={item.label}>
                  <Link href={item.href} className="text-sm text-muted-foreground transition-colors hover:text-foreground">
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="mb-4 text-sm font-semibold text-foreground">Recursos</h4>
            <ul className="space-y-2.5">
              {[
                { label: "Centro de ayuda", href: "/resources" },
                { label: "Documentacion", href: "/resources" },
                { label: "Precios", href: "/pricing" },
                { label: "Privacidad", href: "/legal/privacy" },
              ].map((item) => (
                <li key={item.label}>
                  <Link href={item.href} className="text-sm text-muted-foreground transition-colors hover:text-foreground">
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="flex flex-col items-center justify-between gap-4 border-t border-border/50 pt-8 sm:flex-row">
          <p className="text-xs text-muted-foreground">© 2026 Synetra. Todos los derechos reservados.</p>
          <div className="flex gap-6">
            <Link href="/legal/terms" className="text-xs text-muted-foreground transition-colors hover:text-foreground">
              Terminos
            </Link>
            <Link href="/legal/privacy" className="text-xs text-muted-foreground transition-colors hover:text-foreground">
              Privacidad
            </Link>
            <Link href="/contacto" className="text-xs text-muted-foreground transition-colors hover:text-foreground">
              Contacto
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
