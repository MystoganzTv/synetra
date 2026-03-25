"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";

import { Button } from "@/components/ui/button";

type CTASectionProps = {
  dashboardHref: string;
};

export default function CTASection({ dashboardHref }: CTASectionProps) {
  return (
    <section className="relative overflow-hidden py-20 md:py-28">
      <div className="absolute inset-0 bg-gradient-to-br from-[#121b45] via-[#233f98] to-[#3158ff]" />
      <div className="absolute left-1/2 top-1/2 h-[400px] w-[800px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[#67e3ff]/18 blur-[150px]" />

      <div className="relative mx-auto max-w-3xl px-6 text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <span className="mb-4 inline-block text-xs font-semibold uppercase tracking-[0.2em] text-white/50">
            Empieza hoy
          </span>
          <h2 className="mb-6 text-3xl font-bold tracking-tight text-white md:text-5xl">
            Listo para transformar tu practica ABA?
          </h2>
          <p className="mx-auto mb-10 max-w-xl text-lg text-white/60">
            Unete a cientos de clinicas que ya confian en Synetra para simplificar sus operaciones y
            enfocarse en lo que realmente importa: sus clientes.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Button
              asChild
              size="lg"
              variant="contrast"
              className="h-12 rounded-full px-8 font-medium"
            >
              <Link href={dashboardHref}>
                Agendar demo <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
            <Button
              asChild
              size="lg"
              className="h-12 rounded-full bg-white/18 px-8 font-medium text-white shadow-none hover:bg-white/24"
            >
              <Link href="/login">Contactar ventas</Link>
            </Button>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
