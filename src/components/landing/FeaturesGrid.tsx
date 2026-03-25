"use client";

import { motion } from "framer-motion";
import { BarChart3, Calendar, FileText, Shield, Smartphone, Users } from "lucide-react";

const features = [
  {
    icon: BarChart3,
    label: "RECOLECCION DE DATOS",
    title: "Validacion en tiempo real",
    description: "Sesiones, autorizaciones y notas se verifican antes de que los reclamos avancen.",
  },
  {
    icon: Calendar,
    label: "PROGRAMACION",
    title: "Calendario operativo",
    description: "Vistas semanales y diarias mantienen la entrega del servicio visible en todo el equipo.",
  },
  {
    icon: FileText,
    label: "DOCUMENTACION",
    title: "Notas y planes de tratamiento",
    description: "Plantillas personalizables y colaboracion en equipo para una documentacion eficiente.",
  },
  {
    icon: Shield,
    label: "CUMPLIMIENTO",
    title: "HIPAA y seguridad",
    description: "Datos encriptados en transito y en reposo con controles de acceso seguros.",
  },
  {
    icon: Smartphone,
    label: "MOVIL",
    title: "Diseno mobile-first",
    description: "Accede desde web, iOS y Android. Funciona rapido y natural en cualquier dispositivo.",
  },
  {
    icon: Users,
    label: "EQUIPO",
    title: "Disenado para ABA",
    description: "Creado pensando en BCBAs y RBTs para un flujo clinico suave e intuitivo.",
  },
];

export default function FeaturesGrid() {
  return (
    <section id="features" className="relative overflow-hidden py-20 md:py-28">
      <div className="absolute inset-0 bg-[linear-gradient(180deg,_rgba(255,255,255,0)_0%,_rgba(99,102,241,0.035)_40%,_rgba(255,255,255,0)_100%)]" />
      <div className="mx-auto max-w-7xl px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mb-16 text-center"
        >
          <span className="mb-4 inline-block text-xs font-semibold uppercase tracking-[0.22em] text-primary">
            Enfocate en tus clientes
          </span>
          <h2 className="mb-4 text-3xl font-bold tracking-tight text-foreground md:text-4xl lg:text-[3.1rem]">
            Todo lo que tu practica ABA necesita para operar sin friccion
          </h2>
          <p className="mx-auto max-w-3xl text-lg leading-8 text-muted-foreground">
            Una plataforma segura y moderna construida para las realidades de ABA para que los equipos
            pasen menos tiempo en administracion y mas tiempo entregando terapia.
          </p>
        </motion.div>

        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {features.map((feature, index) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.08 }}
              className="group relative overflow-hidden rounded-[1.75rem] border border-[#e9ebfb] bg-white p-6 transition-all duration-300 hover:-translate-y-1 hover:border-primary/18 hover:shadow-[0_34px_90px_-48px_rgba(49,88,255,0.38)]"
            >
              <div className="absolute inset-x-0 top-0 h-px bg-[linear-gradient(90deg,_transparent,_rgba(123,47,255,0.4),_transparent)] opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
              <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/8 transition-colors group-hover:bg-primary/14">
                <feature.icon className="h-5 w-5 text-primary" />
              </div>
              <span className="mb-2 block text-[10px] font-semibold uppercase tracking-[0.18em] text-primary/60">
                {feature.label}
              </span>
              <h3 className="mb-3 text-xl font-semibold tracking-tight text-foreground">{feature.title}</h3>
              <p className="text-[0.96rem] leading-7 text-muted-foreground">{feature.description}</p>
              <div className="mt-6 inline-flex items-center rounded-full bg-[#f5f6ff] px-3 py-1.5 text-xs font-medium text-primary/85">
                Operacion conectada
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
