"use client";

import Image from "next/image";
import { AnimatePresence, motion } from "framer-motion";
import { BarChart3, Calendar, DollarSign, FileText, LineChart, Shield } from "lucide-react";
import { useState } from "react";

const tabs = [
  {
    id: "data",
    label: "Datos",
    icon: BarChart3,
    features: [
      "Sincronizacion de datos en tiempo real entre dispositivos",
      "Modo offline y sincronizacion automatica despues",
      "Interfaz mobile-first para velocidad y precision",
      "Validaciones inteligentes para datos confiables",
    ],
  },
  {
    id: "treatment",
    label: "Tratamiento",
    icon: FileText,
    features: [
      "Plantillas personalizables para planes de tratamiento",
      "Planificacion colaborativa con terapeutas",
      "Seguimiento de progreso con insights en tiempo real",
      "Ajustes rapidos basados en datos del cliente",
    ],
  },
  {
    id: "graphing",
    label: "Graficas",
    icon: LineChart,
    features: [
      "Graficas interactivas del progreso del cliente",
      "Reportes personalizados y documentacion",
      "Actualizaciones en tiempo real para decisiones clinicas",
      "Exportacion facil para compartir con stakeholders",
    ],
  },
  {
    id: "scheduling",
    label: "Programacion",
    icon: Calendar,
    features: [
      "Gestion de sesiones con agenda semanal y diaria",
      "Sesiones recurrentes con horarios complejos",
      "Vista de equipo completo en un solo lugar",
      "Alertas automaticas de conflictos de horario",
    ],
  },
  {
    id: "billing",
    label: "Facturacion",
    icon: DollarSign,
    features: [
      "Reclamos automatizados con menos pasos",
      "Seguimiento en tiempo real del estado de reclamos",
      "Prevencion de errores con verificaciones pre-envio",
      "Reportes de ingresos y analisis financiero",
    ],
  },
  {
    id: "compliance",
    label: "Seguridad",
    icon: Shield,
    features: [
      "HIPAA compliant para flujos regulados de salud",
      "Datos encriptados en transito y en reposo",
      "Controles de acceso basados en roles",
      "Auditoria completa de actividad del sistema",
    ],
  },
];

type PlatformSectionProps = {
  dataImage: string;
  dataWidth: number;
  dataHeight: number;
};

export default function PlatformSection({
  dataImage,
  dataWidth,
  dataHeight,
}: PlatformSectionProps) {
  const [activeTab, setActiveTab] = useState("data");
  const activeTabData = tabs.find((tab) => tab.id === activeTab) ?? tabs[0];

  return (
    <section id="platform" className="bg-secondary/30 py-20 md:py-28">
      <div className="mx-auto max-w-7xl px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mb-12 text-center"
        >
          <span className="mb-4 inline-block text-xs font-semibold uppercase tracking-[0.2em] text-primary">
            Plataforma completa
          </span>
          <h2 className="text-3xl font-bold tracking-tight text-foreground md:text-4xl">
            Funciones modernas que impulsan tu practica
          </h2>
        </motion.div>

        <div className="mb-12 flex flex-wrap justify-center gap-2">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 rounded-full px-4 py-2.5 text-sm font-medium transition-all ${
                activeTab === tab.id
                  ? "bg-primary text-primary-foreground shadow-lg shadow-primary/20"
                  : "border border-border/50 bg-card text-muted-foreground hover:text-foreground"
              }`}
            >
              <tab.icon className="h-4 w-4" />
              {tab.label}
            </button>
          ))}
        </div>

        <div className="grid items-center gap-12 lg:grid-cols-2">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="overflow-hidden rounded-2xl border border-border/30 shadow-xl"
          >
            <Image
              src={dataImage}
              alt="Plataforma Synetra"
              width={dataWidth}
              height={dataHeight}
              className="h-auto w-full"
            />
          </motion.div>

          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
            >
              <div className="mb-6 flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10">
                  <activeTabData.icon className="h-6 w-6 text-primary" />
                </div>
                <h3 className="text-xl font-bold text-foreground">{activeTabData.label}</h3>
              </div>
              <ul className="space-y-4">
                {activeTabData.features.map((feature, index) => (
                  <motion.li
                    key={feature}
                    initial={{ opacity: 0, x: 10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.08 }}
                    className="flex items-start gap-3"
                  >
                    <div className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary/10">
                      <div className="h-2 w-2 rounded-full bg-primary" />
                    </div>
                    <span className="text-foreground">{feature}</span>
                  </motion.li>
                ))}
              </ul>
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </section>
  );
}
