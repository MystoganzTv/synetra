"use client";

import Image from "next/image";
import { motion } from "framer-motion";
import { CheckCircle, Clock, ShieldCheck, TrendingUp } from "lucide-react";

const stats = [
  { icon: TrendingUp, value: "98%+", label: "Tasa de cobro" },
  { icon: Clock, value: "8 dias", label: "Pago en tan solo" },
  { icon: ShieldCheck, value: "<1%", label: "Tasa de denegacion" },
];

type BillingSectionProps = {
  billingImage: string;
  billingWidth: number;
  billingHeight: number;
};

export default function BillingSection({
  billingImage,
  billingWidth,
  billingHeight,
}: BillingSectionProps) {
  return (
    <section id="billing" className="relative overflow-hidden bg-[#f8f8fe] py-20 md:py-28">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,_rgba(103,227,255,0.14),_transparent_30%),radial-gradient(circle_at_bottom_right,_rgba(123,47,255,0.12),_transparent_32%)]" />

      <div className="relative mx-auto max-w-7xl px-6">
        <div className="grid items-center gap-12 lg:grid-cols-[1.02fr_0.98fr] lg:gap-20">
          <motion.div
            initial={{ opacity: 0, x: -40 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="order-2 lg:order-1"
          >
            <div className="overflow-hidden rounded-[2rem] border border-white/70 bg-white shadow-[0_40px_110px_-48px_rgba(49,88,255,0.35)]">
              <Image
                src={billingImage}
                alt="Facturacion automatizada en Synetra"
                width={billingWidth}
                height={billingHeight}
                className="h-auto w-full"
              />
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 40 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="order-1 lg:order-2"
          >
            <span className="mb-5 inline-block text-xs font-semibold uppercase tracking-[0.22em] text-primary">
              Facturacion integrada
            </span>
            <h2 className="mb-5 max-w-[12ch] text-4xl font-bold tracking-tight text-foreground md:text-5xl">
              Cobra rapido por tu gran trabajo
            </h2>
            <p className="mb-10 max-w-2xl text-lg leading-relaxed text-muted-foreground md:text-[1.55rem] md:leading-[1.65]">
              La herramienta de reclamos integrada de Synetra hace que la facturacion ABA sea
              increiblemente sencilla. Enfocate en entregar terapia mientras Synetra impulsa los
              resultados financieros.
            </p>

            <div className="mb-10 grid gap-4 sm:grid-cols-3">
              {stats.map((stat) => (
                <div
                  key={stat.label}
                  className="rounded-[1.6rem] border border-[#ecebfd] bg-white px-5 py-6 text-center shadow-[0_30px_70px_-50px_rgba(49,88,255,0.35)]"
                >
                  <div className="mx-auto mb-4 flex h-11 w-11 items-center justify-center rounded-full bg-primary/7">
                    <stat.icon className="h-5 w-5 text-primary" />
                  </div>
                  <p className="text-[2.15rem] font-bold tracking-tight text-foreground">{stat.value}</p>
                  <p className="mt-2 text-sm text-muted-foreground">{stat.label}</p>
                </div>
              ))}
            </div>

            <div className="space-y-4">
              {[
                "Reclamos automatizados y seguimiento en tiempo real",
                "Prevencion de errores con verificaciones pre-envio",
                "Reembolsos mas rapidos y menos denegaciones",
              ].map((item) => (
                <div key={item} className="flex items-start gap-3.5">
                  <div className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full border border-primary/20 bg-white shadow-sm">
                    <CheckCircle className="h-5 w-5 text-primary" />
                  </div>
                  <span className="text-lg leading-8 text-foreground">{item}</span>
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
