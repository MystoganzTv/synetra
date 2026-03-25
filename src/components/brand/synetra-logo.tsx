import { useId } from "react";

import { cn } from "@/lib/utils";

type SynetraMarkProps = {
  className?: string;
};

export function SynetraMark({ className }: SynetraMarkProps) {
  const gradientA = useId();
  const gradientB = useId();
  const glow = useId();

  return (
    <svg
      viewBox="0 0 40 40"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={cn("h-10 w-10 shrink-0", className)}
      aria-hidden="true"
    >
      <defs>
        <linearGradient id={gradientA} x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#00F5D4" />
          <stop offset="100%" stopColor="#7B2FFF" />
        </linearGradient>
        <linearGradient id={gradientB} x1="100%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#F72585" />
          <stop offset="100%" stopColor="#7B2FFF" />
        </linearGradient>
        <filter id={glow}>
          <feGaussianBlur stdDeviation="1.2" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>

      <ellipse
        cx="20"
        cy="20"
        rx="17"
        ry="7"
        stroke={`url(#${gradientA})`}
        strokeWidth="1.8"
        fill="none"
        filter={`url(#${glow})`}
        transform="rotate(-30 20 20)"
      />
      <ellipse
        cx="20"
        cy="20"
        rx="17"
        ry="7"
        stroke={`url(#${gradientB})`}
        strokeWidth="1.8"
        fill="none"
        filter={`url(#${glow})`}
        transform="rotate(30 20 20)"
      />
      <ellipse
        cx="20"
        cy="20"
        rx="17"
        ry="7"
        stroke={`url(#${gradientA})`}
        strokeWidth="1.5"
        fill="none"
        filter={`url(#${glow})`}
        transform="rotate(90 20 20)"
        opacity="0.65"
      />

      <circle cx="20" cy="20" r="2.6" fill="white" filter={`url(#${glow})`} />
      <circle cx="20" cy="20" r="1.5" fill="#00F5D4" />
      <circle cx="20" cy="3" r="1.5" fill="#00F5D4" filter={`url(#${glow})`} />
      <circle cx="20" cy="37" r="1.5" fill="#7B2FFF" filter={`url(#${glow})`} />
      <circle cx="3" cy="20" r="1.5" fill="#F72585" filter={`url(#${glow})`} />
      <circle cx="37" cy="20" r="1.5" fill="#00F5D4" filter={`url(#${glow})`} />
    </svg>
  );
}

export function SynetraWordmark({
  className,
  inverse = false,
}: {
  className?: string;
  inverse?: boolean;
}) {
  return (
    <span
      className={cn(
        "select-none font-semibold uppercase leading-none tracking-[0.16em]",
        inverse ? "text-white" : "text-[#182454]",
        className,
      )}
    >
      Synetra
    </span>
  );
}

export function SynetraLogo({
  className,
  inverse = false,
  compact = false,
}: {
  className?: string;
  inverse?: boolean;
  compact?: boolean;
}) {
  return (
    <div className={cn("inline-flex items-center gap-3", className)} aria-label="Synetra">
      <SynetraMark className={compact ? "h-9 w-9" : "h-10 w-10"} />
      <SynetraWordmark
        inverse={inverse}
        className={compact ? "text-[2rem] sm:text-[2.1rem]" : "text-[2.1rem] sm:text-[2.3rem]"}
      />
    </div>
  );
}
