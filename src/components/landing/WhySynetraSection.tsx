"use client";

import { motion } from "framer-motion";

const items = [
  {
    label: "Jerarquia conectada",
    title: "Cliente → Caso → Servicio → Sesion",
    description: "Todo conectado en una estructura logica que refleja tu flujo real de trabajo.",
  },
  {
    label: "Control diario",
    title: "Validacion, alertas y colas de accion",
    description: "Surfea riesgos y toma accion con herramientas de monitoreo en tiempo real.",
  },
  {
    label: "Preparacion de facturacion",
    title: "En vivo",
    description: "Verifica el estado de preparacion de facturacion antes de enviar reclamos.",
    isHighlight: true,
  },
  {
    label: "Centro de comando",
    title: "Construido para ti",
    description: "Paneles personalizados que muestran exactamente lo que tu equipo necesita ver.",
    isHighlight: true,
  },
  {
    label: "Programacion",
    title: "Interactiva",
    description: "Agenda semanal y diaria para sesiones con visibilidad del equipo completo.",
    isHighlight: true,
  },
  {
    label: "Plataforma completa",
    title: "Todo en un solo lugar",
    description: "Datos, programacion, facturacion y cumplimiento unificados en una plataforma.",
  },
];

export default function WhySynetraSection() {
  return (
    <section className="relative overflow-hidden py-20 md:py-28">
      <div className="absolute inset-0 bg-gradient-to-br from-[hsl(234,40%,15%)] via-[hsl(250,50%,20%)] to-[hsl(234,60%,25%)]" />
      <div className="absolute right-0 top-0 h-[500px] w-[500px] rounded-full bg-primary/20 blur-[120px]" />
      <div className="absolute bottom-0 left-0 h-[400px] w-[400px] rounded-full bg-[#00f5d4]/15 blur-[100px]" />

      <div className="relative mx-auto max-w-7xl px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mb-16 text-center"
        >
          <span className="mb-4 inline-block text-xs font-semibold uppercase tracking-[0.2em] text-white/60">
            Por que las practicas eligen Synetra
          </span>
          <h2 className="mb-4 text-3xl font-bold tracking-tight text-white md:text-4xl">
            Claridad operativa sin perder el hilo clinico
          </h2>
          <p className="mx-auto max-w-2xl text-white/60">
            Construido alrededor de la jerarquia real de entrega de cuidados, para que cada alerta,
            nota y reclamo se mantenga anclado al servicio que lo creo.
          </p>
        </motion.div>

        <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          {items.map((item, index) => (
            <motion.div
              key={item.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.08 }}
              className={`rounded-2xl border p-6 backdrop-blur-sm ${
                item.isHighlight
                  ? "border-white/10 bg-gradient-to-br from-primary/20 to-[#00f5d4]/12"
                  : "border-white/10 bg-white/5"
              }`}
            >
              <span className="mb-2 block text-[10px] font-semibold uppercase tracking-[0.15em] text-white/40">
                {item.label}
              </span>
              <h3 className="mb-2 text-xl font-bold text-white">{item.title}</h3>
              <p className="text-sm leading-relaxed text-white/55">{item.description}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
