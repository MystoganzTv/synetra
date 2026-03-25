"use client";

import { motion } from "framer-motion";
import { Quote, Star } from "lucide-react";

const testimonials = [
  {
    quote:
      "Nuestra empresa ha ahorrado tiempo valioso a traves del software de facturacion de Synetra. Recomiendo este producto a cualquiera que busque un software eficiente, intuitivo y preciso.",
    name: "Chris Siegel",
    company: "Comfortable Living",
    role: "Director",
  },
  {
    quote:
      "Synetra nos permitio simplificar flujos de trabajo complejos, recuperar tiempo perdido en tareas administrativas y liberar al personal para enfocarse en el cuidado del cliente.",
    name: "Crescent Bloom",
    company: "Crescent Bloom Consulting",
    role: "Fundadora",
  },
  {
    quote:
      "La transicion a Synetra fue increiblemente suave. El equipo de soporte estuvo con nosotros en cada paso y ahora el equipo puede enfocarse completamente en la terapia.",
    name: "Gold Standard",
    company: "Gold Standard ABA",
    role: "Director Clinico",
  },
];

export default function TestimonialsSection() {
  return (
    <section id="testimonials" className="py-20 md:py-28">
      <div className="mx-auto max-w-7xl px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mb-16 text-center"
        >
          <span className="mb-4 inline-block text-xs font-semibold uppercase tracking-[0.2em] text-primary">
            Testimonios
          </span>
          <h2 className="text-3xl font-bold tracking-tight text-foreground md:text-4xl">
            Confiado por clinicas ABA en todo el pais
          </h2>
        </motion.div>

        <div className="grid gap-6 md:grid-cols-3">
          {testimonials.map((testimonial, index) => (
            <motion.div
              key={testimonial.name}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              className="relative rounded-2xl border border-border/50 bg-card p-6"
            >
              <Quote className="absolute right-6 top-6 h-8 w-8 text-primary/10" />
              <div className="mb-4 flex gap-1">
                {Array.from({ length: 5 }).map((_, starIndex) => (
                  <Star key={starIndex} className="h-4 w-4 fill-primary text-primary" />
                ))}
              </div>
              <p className="mb-6 text-sm leading-relaxed text-muted-foreground">
                &quot;{testimonial.quote}&quot;
              </p>
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
                  <span className="text-sm font-semibold text-primary">
                    {testimonial.name.charAt(0)}
                  </span>
                </div>
                <div>
                  <p className="text-sm font-semibold text-foreground">{testimonial.name}</p>
                  <p className="text-xs text-muted-foreground">{testimonial.company}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
