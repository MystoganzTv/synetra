"use client";

import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import { Menu, X } from "lucide-react";
import { useState } from "react";

import { Button } from "@/components/ui/button";

import SynetraLogo from "./synetra-logo";

const links = [
  { label: "Funciones", href: "#features" },
  { label: "Facturacion", href: "#billing" },
  { label: "Testimonios", href: "#testimonials" },
  { label: "Plataforma", href: "#platform" },
];

type NavbarProps = {
  dashboardHref: string;
  signedIn: boolean;
};

export default function Navbar({ dashboardHref, signedIn }: NavbarProps) {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <nav className="fixed left-0 right-0 top-0 z-50 border-b border-border/50 bg-white/80 backdrop-blur-xl">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6">
        <Link href="/" className="flex items-center gap-2">
          <SynetraLogo size={32} />
          <span className="text-lg font-bold tracking-widest text-foreground">SYNETRA</span>
        </Link>

        <div className="hidden items-center gap-8 md:flex">
          {links.map((link) => (
            <a
              key={link.label}
              href={link.href}
              className="text-sm text-muted-foreground transition-colors hover:text-foreground"
            >
              {link.label}
            </a>
          ))}
        </div>

        <div className="hidden items-center gap-3 md:flex">
          <Button asChild variant="ghost" size="sm" className="text-muted-foreground">
            <Link href="/login">{signedIn ? "Abrir panel" : "Iniciar sesion"}</Link>
          </Button>
          <Button asChild size="sm" className="rounded-full px-5">
            <Link href={signedIn ? dashboardHref : "/contacto"}>
              {signedIn ? "Ir al dashboard" : "Agendar demo"}
            </Link>
          </Button>
        </div>

        <button className="p-2 md:hidden" onClick={() => setMobileOpen((open) => !open)}>
          {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden border-b border-border bg-white md:hidden"
          >
            <div className="space-y-3 px-6 py-4">
              {links.map((link) => (
                <a
                  key={link.label}
                  href={link.href}
                  className="block text-sm text-muted-foreground hover:text-foreground"
                  onClick={() => setMobileOpen(false)}
                >
                  {link.label}
                </a>
              ))}
              <div className="flex flex-col gap-2 pt-3">
                <Button asChild variant="outline" size="sm" className="w-full">
                  <Link href="/login">{signedIn ? "Abrir panel" : "Iniciar sesion"}</Link>
                </Button>
                <Button asChild size="sm" className="w-full rounded-full">
                  <Link href={signedIn ? dashboardHref : "/contacto"}>
                    {signedIn ? "Ir al dashboard" : "Agendar demo"}
                  </Link>
                </Button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
}
