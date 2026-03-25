"use client";

import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import { ArrowRight, Play } from "lucide-react";

import { Button } from "@/components/ui/button";

type HeroSectionProps = {
  heroImage: string;
  heroWidth: number;
  heroHeight: number;
  dashboardHref: string;
};

export default function HeroSection({
  heroImage,
  heroWidth,
  heroHeight,
  dashboardHref,
}: HeroSectionProps) {
  return (
    <section className="relative overflow-hidden pb-20 pt-28 md:pb-28 md:pt-36">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,_rgba(103,227,255,0.12),_transparent_26%),radial-gradient(circle_at_top_right,_rgba(123,47,255,0.14),_transparent_28%),linear-gradient(180deg,_#ffffff_0%,_#f7f8fe_56%,_#f5f6fd_100%)]" />
      <div className="absolute right-[-4%] top-16 h-[34rem] w-[34rem] rounded-full bg-primary/6 blur-3xl" />
      <div className="absolute bottom-[-10%] left-[-4%] h-[24rem] w-[24rem] rounded-full bg-[#00f5d4]/8 blur-3xl" />

      <div className="relative mx-auto max-w-7xl px-6">
        <div className="grid items-center gap-14 lg:grid-cols-[0.96fr_1.04fr] lg:gap-18">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7 }}
          >
            <div className="mb-7 inline-flex items-center gap-2 rounded-full border border-primary/10 bg-white/90 px-4 py-2 shadow-[0_20px_60px_-38px_rgba(49,88,255,0.45)] backdrop-blur">
              <span className="h-2 w-2 rounded-full bg-[#00f5d4]" />
              <span className="text-[0.72rem] font-semibold uppercase tracking-[0.22em] text-primary">
                Software ABA todo en uno
              </span>
            </div>
            <h1 className="mb-6 max-w-[12ch] text-4xl font-bold leading-[1.02] tracking-tight text-foreground md:text-5xl lg:text-[4.4rem]">
              Operaciones ABA claras, facturables y listas para crecer.
            </h1>
            <p className="mb-9 max-w-xl text-lg leading-relaxed text-muted-foreground md:text-[1.2rem] md:leading-9">
              Synetra conecta programacion, documentacion, autorizaciones, facturacion y cumplimiento
              en una sola capa operativa para que tu equipo vea riesgos antes de que afecten ingresos.
            </p>

            <div className="flex flex-wrap gap-4">
              <Button
                asChild
                size="lg"
                className="h-12 rounded-full px-8 text-sm font-medium gap-2 shadow-[0_24px_60px_-28px_rgba(49,88,255,0.6)]"
              >
                <Link href="/contacto">
                  Agendar demo <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
              <Button
                asChild
                size="lg"
                variant="outline"
                className="h-12 rounded-full border-border/60 bg-white/75 px-8 text-sm font-medium gap-2 shadow-[0_20px_45px_-36px_rgba(17,24,39,0.45)] backdrop-blur"
              >
                <Link href={dashboardHref}>
                  <Play className="h-4 w-4" /> Ver producto
                </Link>
              </Button>
            </div>

            <div className="mt-10 grid gap-4 sm:grid-cols-3">
              {[
                ["98%+", "cobro limpio"],
                ["Tiempo real", "alertas operativas"],
                ["1 sistema", "equipo sincronizado"],
              ].map(([value, label]) => (
                <div
                  key={label}
                  className="rounded-2xl border border-white/70 bg-white/80 px-4 py-4 shadow-[0_24px_60px_-42px_rgba(15,23,42,0.35)] backdrop-blur"
                >
                  <p className="text-lg font-semibold tracking-tight text-foreground">{value}</p>
                  <p className="mt-1 text-sm text-muted-foreground">{label}</p>
                </div>
              ))}
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 40 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.7, delay: 0.2 }}
            className="relative"
          >
            <div className="relative overflow-hidden rounded-[2rem] border border-white/70 bg-white shadow-[0_48px_120px_-48px_rgba(49,88,255,0.38)]">
              <Image
                src={heroImage}
                alt="Synetra dashboard"
                width={heroWidth}
                height={heroHeight}
                className="h-auto w-full"
                priority
              />
            </div>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.6 }}
              className="absolute -bottom-6 -left-2 rounded-2xl border border-white/70 bg-white/94 p-4 shadow-[0_30px_90px_-44px_rgba(15,23,42,0.45)] backdrop-blur md:-left-6"
            >
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-green-100">
                  <span className="text-sm font-bold text-green-600">98%</span>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Tasa de cobro</p>
                  <p className="text-sm font-semibold text-foreground">Mejor en la industria</p>
                </div>
              </div>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, y: -16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.45, delay: 0.5 }}
              className="absolute -right-2 top-6 hidden rounded-2xl border border-white/18 bg-[#1e2a7d]/92 px-5 py-4 text-white shadow-[0_30px_80px_-44px_rgba(49,88,255,0.7)] backdrop-blur md:block"
            >
              <p className="text-[0.68rem] uppercase tracking-[0.22em] text-white/55">Facturacion lista</p>
              <p className="mt-2 text-3xl font-semibold tracking-tight">$1,658</p>
              <p className="mt-1 text-sm text-white/70">claims ready o en vuelo</p>
            </motion.div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
